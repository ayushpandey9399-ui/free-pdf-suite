import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, X, Upload, Loader2, RotateCcw } from "lucide-react";
import { saveAs } from "file-saver";
import { guardDecodedSize, isSvgFile } from "@/lib/imageSafety";

type Fmt = "jpg" | "png" | "webp";

type Adjustments = {
  brightness: number; // -100..100
  contrast: number;   // -100..100
  saturation: number; // -100..100
  warmth: number;     // -180..180 (hue rotate degrees, small range recommended)
  grayscale: number;  // 0..100
  sepia: number;      // 0..100
  blur: number;       // 0..8 px
};

type PresetKey = "original" | "bw" | "sepia" | "vintage" | "cool" | "punchy" | "soft";

const DEFAULTS: Adjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  warmth: 0,
  grayscale: 0,
  sepia: 0,
  blur: 0,
};

const PRESETS: Record<PresetKey, { label: string; a: Adjustments }> = {
  original: { label: "Original", a: { ...DEFAULTS } },
  bw:       { label: "B&W",      a: { ...DEFAULTS, grayscale: 100, contrast: 5 } },
  sepia:    { label: "Sepia",    a: { ...DEFAULTS, sepia: 90, contrast: 5, brightness: 3 } },
  vintage:  { label: "Vintage",  a: { ...DEFAULTS, sepia: 45, warmth: 15, contrast: -8, saturation: -10, brightness: 5 } },
  cool:     { label: "Cool",     a: { ...DEFAULTS, warmth: -25, saturation: 10, brightness: 3 } },
  punchy:   { label: "Punchy",   a: { ...DEFAULTS, contrast: 25, saturation: 25 } },
  soft:     { label: "Soft",     a: { ...DEFAULTS, contrast: -10, brightness: 5, blur: 0.8, saturation: -5 } },
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_PREVIEW_DIM = 1200;

function isSupported(f: File): boolean {
  const t = f.type;
  const n = f.name.toLowerCase();
  if (t === "image/jpeg" || t === "image/png" || t === "image/webp") return true;
  return /\.(jpe?g|png|webp)$/i.test(n);
}
function fmtOf(f: File): Fmt {
  const n = f.name.toLowerCase();
  if (n.endsWith(".png") || f.type === "image/png") return "png";
  if (n.endsWith(".webp") || f.type === "image/webp") return "webp";
  return "jpg";
}
function stripExt(n: string): string {
  return n.replace(/\.(jpe?g|png|webp)$/i, "");
}

async function decodeBitmap(file: File): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    return await createImageBitmap(file);
  }
}

function cssFilterString(a: Adjustments): string {
  const parts: string[] = [];
  parts.push(`brightness(${1 + a.brightness / 100})`);
  parts.push(`contrast(${1 + a.contrast / 100})`);
  parts.push(`saturate(${1 + a.saturation / 100})`);
  if (a.warmth) parts.push(`hue-rotate(${a.warmth}deg)`);
  if (a.grayscale) parts.push(`grayscale(${a.grayscale}%)`);
  if (a.sepia) parts.push(`sepia(${a.sepia}%)`);
  if (a.blur) parts.push(`blur(${a.blur}px)`);
  return parts.join(" ");
}

/* -------- Export pixel math (cross-browser, no ctx.filter reliance) -------- */

function applyPixelAdjustments(data: Uint8ClampedArray, a: Adjustments): void {
  const bK = 1 + a.brightness / 100;
  const cK = 1 + a.contrast / 100;
  const sK = 1 + a.saturation / 100;
  const gP = a.grayscale / 100;
  const sepP = a.sepia / 100;
  const hue = (a.warmth * Math.PI) / 180;
  const cH = Math.cos(hue);
  const sH = Math.sin(hue);
  // Hue-rotate matrix per W3C filter spec.
  const m00 = 0.213 + cH * 0.787 - sH * 0.213;
  const m01 = 0.715 - cH * 0.715 - sH * 0.715;
  const m02 = 0.072 - cH * 0.072 + sH * 0.928;
  const m10 = 0.213 - cH * 0.213 + sH * 0.143;
  const m11 = 0.715 + cH * 0.285 + sH * 0.140;
  const m12 = 0.072 - cH * 0.072 - sH * 0.283;
  const m20 = 0.213 - cH * 0.213 - sH * 0.787;
  const m21 = 0.715 - cH * 0.715 + sH * 0.715;
  const m22 = 0.072 + cH * 0.928 + sH * 0.072;

  const doHue = a.warmth !== 0;
  const doGray = gP > 0;
  const doSepia = sepP > 0;

  for (let i = 0; i < data.length; i += 4) {
    let r = data[i];
    let g = data[i + 1];
    let b = data[i + 2];

    // brightness
    r = r * bK;
    g = g * bK;
    b = b * bK;
    // contrast (around 128)
    r = (r - 128) * cK + 128;
    g = (g - 128) * cK + 128;
    b = (b - 128) * cK + 128;
    // saturation via luminance mix
    const L1 = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = L1 + (r - L1) * sK;
    g = L1 + (g - L1) * sK;
    b = L1 + (b - L1) * sK;
    // hue-rotate
    if (doHue) {
      const nr = r * m00 + g * m01 + b * m02;
      const ng = r * m10 + g * m11 + b * m12;
      const nb = r * m20 + g * m21 + b * m22;
      r = nr; g = ng; b = nb;
    }
    // grayscale (mix toward luminance)
    if (doGray) {
      const L2 = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = r * (1 - gP) + L2 * gP;
      g = g * (1 - gP) + L2 * gP;
      b = b * (1 - gP) + L2 * gP;
    }
    // sepia (mix identity toward sepia matrix)
    if (doSepia) {
      const sr = 0.393 * r + 0.769 * g + 0.189 * b;
      const sg = 0.349 * r + 0.686 * g + 0.168 * b;
      const sb = 0.272 * r + 0.534 * g + 0.131 * b;
      r = r * (1 - sepP) + sr * sepP;
      g = g * (1 - sepP) + sg * sepP;
      b = b * (1 - sepP) + sb * sepP;
    }

    data[i]     = r < 0 ? 0 : r > 255 ? 255 : r;
    data[i + 1] = g < 0 ? 0 : g > 255 ? 255 : g;
    data[i + 2] = b < 0 ? 0 : b > 255 ? 255 : b;
    // alpha untouched
  }
}

// Simple separable box blur, 3 passes ~= gaussian.
function boxBlur(src: Uint8ClampedArray, w: number, h: number, r: number): Uint8ClampedArray {
  if (r <= 0) return src;
  const radius = Math.max(1, Math.round(r));
  let a = src;
  let b = new Uint8ClampedArray(src.length);
  for (let p = 0; p < 3; p++) {
    boxBlurH(a, b, w, h, radius);
    boxBlurV(b, a, w, h, radius);
  }
  return a;
}
function boxBlurH(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number) {
  const div = r + r + 1;
  for (let y = 0; y < h; y++) {
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    const row = y * w * 4;
    for (let i = -r; i <= r; i++) {
      const x = Math.min(w - 1, Math.max(0, i));
      const idx = row + x * 4;
      sumR += src[idx]; sumG += src[idx + 1]; sumB += src[idx + 2]; sumA += src[idx + 3];
    }
    for (let x = 0; x < w; x++) {
      const o = row + x * 4;
      dst[o]     = sumR / div;
      dst[o + 1] = sumG / div;
      dst[o + 2] = sumB / div;
      dst[o + 3] = sumA / div;
      const xOut = Math.min(w - 1, Math.max(0, x - r));
      const xIn  = Math.min(w - 1, Math.max(0, x + r + 1));
      const iOut = row + xOut * 4;
      const iIn  = row + xIn * 4;
      sumR += src[iIn]     - src[iOut];
      sumG += src[iIn + 1] - src[iOut + 1];
      sumB += src[iIn + 2] - src[iOut + 2];
      sumA += src[iIn + 3] - src[iOut + 3];
    }
  }
}
function boxBlurV(src: Uint8ClampedArray, dst: Uint8ClampedArray, w: number, h: number, r: number) {
  const div = r + r + 1;
  for (let x = 0; x < w; x++) {
    let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
    for (let i = -r; i <= r; i++) {
      const y = Math.min(h - 1, Math.max(0, i));
      const idx = (y * w + x) * 4;
      sumR += src[idx]; sumG += src[idx + 1]; sumB += src[idx + 2]; sumA += src[idx + 3];
    }
    for (let y = 0; y < h; y++) {
      const o = (y * w + x) * 4;
      dst[o]     = sumR / div;
      dst[o + 1] = sumG / div;
      dst[o + 2] = sumB / div;
      dst[o + 3] = sumA / div;
      const yOut = Math.min(h - 1, Math.max(0, y - r));
      const yIn  = Math.min(h - 1, Math.max(0, y + r + 1));
      const iOut = (yOut * w + x) * 4;
      const iIn  = (yIn * w + x) * 4;
      sumR += src[iIn]     - src[iOut];
      sumG += src[iIn + 1] - src[iOut + 1];
      sumB += src[iIn + 2] - src[iOut + 2];
      sumA += src[iIn + 3] - src[iOut + 3];
    }
  }
}

// Lazy WebP WASM encoder for Safari.
let webpEncoder: ((data: ImageData, opts?: { quality: number }) => Promise<ArrayBuffer>) | null = null;
async function getWebpEncoder() {
  if (webpEncoder) return webpEncoder;
  const mod = await import("@jsquash/webp");
  webpEncoder = mod.encode;
  return webpEncoder;
}
function canvasToBlob(canvas: HTMLCanvasElement, mime: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), mime, quality));
}

async function encodeCanvas(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, fmt: Fmt, quality: number): Promise<Blob> {
  if (fmt === "png") {
    const b = await canvasToBlob(canvas, "image/png");
    if (!b) throw new Error("PNG encode failed");
    return b;
  }
  if (fmt === "jpg") {
    const b = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!b) throw new Error("JPG encode failed");
    return b;
  }
  // webp: try native, fallback to WASM.
  const native = await canvasToBlob(canvas, "image/webp", quality);
  if (native && native.type === "image/webp") return native;
  const encode = await getWebpEncoder();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buf = await encode(imageData, { quality: Math.round(quality * 100) });
  return new Blob([buf], { type: "image/webp" });
}

/* --------------------------------- Component --------------------------------- */

export function PhotoEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);
  const [adj, setAdj] = useState<Adjustments>({ ...DEFAULTS });
  const [preset, setPreset] = useState<PresetKey>("original");
  const [comparing, setComparing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [outFmt, setOutFmt] = useState<Fmt>("jpg");
  const [outQuality, setOutQuality] = useState(0.92);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadFile = useCallback(async (f: File) => {
    if (!isSupported(f) || isSvgFile(f)) {
      toast.error(`"${f.name}" is not a supported image`);
      return;
    }
    try {
      const bm = await decodeBitmap(f);
      guardDecodedSize(bm.width, bm.height);
      if (bitmap) bitmap.close?.();
      setFile(f);
      setBitmap(bm);
      setAdj({ ...DEFAULTS });
      setPreset("original");
      const guessed = fmtOf(f);
      setOutFmt(guessed);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not decode image");
    }
  }, [bitmap]);

  const onSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void loadFile(files[0]);
  };

  // Draw preview canvas whenever image or adjustments change.
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !bitmap) return;
    const scale = Math.min(1, MAX_PREVIEW_DIM / Math.max(bitmap.width, bitmap.height));
    const w = Math.max(1, Math.round(bitmap.width * scale));
    const h = Math.max(1, Math.round(bitmap.height * scale));
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, w, h);
    ctx.filter = comparing ? "none" : cssFilterString(adj);
    ctx.drawImage(bitmap, 0, 0, w, h);
    ctx.filter = "none";
  }, [bitmap, adj, comparing]);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    setAdj({ ...PRESETS[key].a });
  };

  const resetAll = () => {
    setAdj({ ...DEFAULTS });
    setPreset("original");
  };

  const doExport = useCallback(async () => {
    if (!bitmap || !file) return;
    setExporting(true);
    try {
      const w = bitmap.width;
      const h = bitmap.height;
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      // Draw source at full resolution (no ctx.filter for export).
      ctx.drawImage(bitmap, 0, 0);
      const img = ctx.getImageData(0, 0, w, h);
      applyPixelAdjustments(img.data, adj);
      if (adj.blur > 0) {
        const blurred = boxBlur(img.data, w, h, adj.blur);
        img.data.set(blurred);
      }
      ctx.putImageData(img, 0, 0);
      const blob = await encodeCanvas(canvas, ctx, outFmt, outQuality);
      const base = stripExt(file.name) || "photo";
      const suffix = preset !== "original" ? `-${preset}` : "-edit";
      saveAs(blob, `${base}${suffix}.${outFmt}`);
      toast.success("Photo exported");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, [bitmap, file, adj, outFmt, outQuality, preset]);

  const startOver = () => {
    if (bitmap) bitmap.close?.();
    setBitmap(null);
    setFile(null);
    setAdj({ ...DEFAULTS });
    setPreset("original");
  };

  const previewFilter = useMemo(() => (comparing ? "none" : cssFilterString(adj)), [comparing, adj]);
  void previewFilter;

  if (!file || !bitmap) {
    return (
      <div className="mx-auto max-w-2xl">
        <label
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onSelect(e.dataTransfer.files);
          }}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition ${
            dragging ? "border-[#8B5CF6] bg-[#f5f3ff]" : "border-[#e5e7eb] bg-white hover:border-[#8B5CF6]/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => onSelect(e.target.files)}
          />
          <Upload size={36} className="text-[#8B5CF6]" />
          <p className="mt-3 text-[16px] font-semibold text-[#1F2937]">Drop a photo here or click to select</p>
          <p className="mt-1 text-[13px] text-[#6B7280]">JPG, PNG, or WebP, one image at a time</p>
        </label>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      {/* Preview */}
      <div className="rounded-xl bg-[#0f0f14] p-4">
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg" style={{ minHeight: 280 }}>
          <canvas
            ref={previewCanvasRef}
            className="max-h-[70vh] max-w-full rounded"
            style={{ background: "#000" }}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/80">
          <div>
            <span className="font-semibold text-white">{file.name}</span>
            <span className="ml-2 text-white/60">{bitmap.width} x {bitmap.height}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onMouseDown={() => setComparing(true)}
              onMouseUp={() => setComparing(false)}
              onMouseLeave={() => setComparing(false)}
              onTouchStart={() => setComparing(true)}
              onTouchEnd={() => setComparing(false)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20"
            >
              Hold to compare
            </button>
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20"
            >
              <RotateCcw size={14} /> Reset all
            </button>
            <button
              type="button"
              onClick={startOver}
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20"
            >
              <X size={14} /> New image
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-5">
        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Filters</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(PRESETS) as PresetKey[]).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => applyPreset(k)}
                className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                  preset === k
                    ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                    : "border-[#e5e7eb] bg-white text-[#4B5563] hover:border-[#8B5CF6]/50"
                }`}
              >
                {PRESETS[k].label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 rounded-xl border border-[#ececef] bg-white p-4">
          <Slider label="Brightness" value={adj.brightness} min={-100} max={100} step={1}
            onChange={(v) => { setAdj((a) => ({ ...a, brightness: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, brightness: 0 }))} />
          <Slider label="Contrast" value={adj.contrast} min={-100} max={100} step={1}
            onChange={(v) => { setAdj((a) => ({ ...a, contrast: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, contrast: 0 }))} />
          <Slider label="Saturation" value={adj.saturation} min={-100} max={100} step={1}
            onChange={(v) => { setAdj((a) => ({ ...a, saturation: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, saturation: 0 }))} />
          <Slider label="Warmth" value={adj.warmth} min={-60} max={60} step={1} unit="°"
            onChange={(v) => { setAdj((a) => ({ ...a, warmth: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, warmth: 0 }))} />
          <Slider label="Grayscale" value={adj.grayscale} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, grayscale: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, grayscale: 0 }))} />
          <Slider label="Sepia" value={adj.sepia} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, sepia: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, sepia: 0 }))} />
          <Slider label="Blur" value={adj.blur} min={0} max={8} step={0.1} unit="px"
            onChange={(v) => { setAdj((a) => ({ ...a, blur: v })); setPreset("original"); }}
            onReset={() => setAdj((a) => ({ ...a, blur: 0 }))} />
        </div>

        <div className="space-y-3 rounded-xl border border-[#ececef] bg-white p-4">
          <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Export</h3>
          <div className="flex gap-2">
            {(["jpg", "png", "webp"] as Fmt[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setOutFmt(f)}
                className={`flex-1 rounded-md border px-3 py-2 text-[13px] font-semibold uppercase ${
                  outFmt === f
                    ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                    : "border-[#e5e7eb] bg-white text-[#4B5563] hover:border-[#8B5CF6]/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          {outFmt !== "png" && (
            <Slider
              label="Quality"
              value={Math.round(outQuality * 100)}
              min={40}
              max={100}
              step={1}
              unit="%"
              onChange={(v) => setOutQuality(v / 100)}
              onReset={() => setOutQuality(0.92)}
            />
          )}
          <button
            type="button"
            onClick={() => void doExport()}
            disabled={exporting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#8B5CF6] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#7c3aed] disabled:opacity-60"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Exporting" : `Download ${outFmt.toUpperCase()}`}
          </button>
          <p className="text-[12px] text-[#6B7280]">Exports at full original resolution. Your photo never leaves your device.</p>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  onReset,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-[#1F2937]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-[#4B5563]">
            {step < 1 ? value.toFixed(1) : Math.round(value)}{unit ?? ""}
          </span>
          <button
            type="button"
            onClick={onReset}
            className="text-[11px] font-semibold text-[#8B5CF6] hover:underline"
          >
            reset
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-[#8B5CF6]"
      />
    </div>
  );
}
