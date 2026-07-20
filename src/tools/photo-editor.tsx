import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, X, Upload, Loader2, RotateCcw, Undo2, Redo2 } from "lucide-react";
import { saveAs } from "file-saver";
import { guardDecodedSize, isSvgFile } from "@/lib/imageSafety";
import {
  pxSharpen,
  vignetteFactor,
  pxGrain,
  grainNoise,
  duotoneMap,
  radialDistance,
  aspectResizeOther,
} from "@/lib/imageMath";

type Fmt = "jpg" | "png" | "webp";
type DuoKey = "none" | "navy-cream" | "purple-peach" | "teal-gold" | "plum-mint";

const DUOTONES: Record<DuoKey, { label: string; shadow: [number, number, number]; highlight: [number, number, number] }> = {
  "none":         { label: "Off",           shadow: [0, 0, 0],     highlight: [255, 255, 255] },
  "navy-cream":   { label: "Navy | Cream",  shadow: [12, 26, 64],  highlight: [255, 240, 210] },
  "purple-peach": { label: "Purple | Peach",shadow: [56, 20, 80],  highlight: [255, 200, 170] },
  "teal-gold":    { label: "Teal | Gold",   shadow: [10, 50, 70],  highlight: [255, 215, 110] },
  "plum-mint":    { label: "Plum | Mint",   shadow: [70, 20, 60],  highlight: [190, 255, 220] },
};

type Adjustments = {
  brightness: number;
  contrast: number;
  saturation: number;
  warmth: number;
  grayscale: number;
  sepia: number;
  blur: number;
  sharpen: number;   // 0..100
  vignette: number;  // 0..100
  grain: number;     // 0..100
  duotone: DuoKey;
  duotoneAmount: number; // 0..100
};

type PresetKey = "original" | "bw" | "sepia" | "vintage" | "cool" | "punchy" | "soft";

const DEFAULTS: Adjustments = {
  brightness: 0, contrast: 0, saturation: 0, warmth: 0,
  grayscale: 0, sepia: 0, blur: 0,
  sharpen: 0, vignette: 0, grain: 0,
  duotone: "none", duotoneAmount: 60,
};

const PRESETS: Record<PresetKey, { label: string; a: Adjustments }> = {
  original: { label: "Original", a: { ...DEFAULTS } },
  bw:       { label: "B&W",      a: { ...DEFAULTS, grayscale: 100, contrast: 5 } },
  sepia:    { label: "Sepia",    a: { ...DEFAULTS, sepia: 90, contrast: 5, brightness: 3 } },
  vintage:  { label: "Vintage",  a: { ...DEFAULTS, sepia: 45, warmth: 15, contrast: -8, saturation: -10, brightness: 5, vignette: 25, grain: 12 } },
  cool:     { label: "Cool",     a: { ...DEFAULTS, warmth: -25, saturation: 10, brightness: 3 } },
  punchy:   { label: "Punchy",   a: { ...DEFAULTS, contrast: 25, saturation: 25, sharpen: 30 } },
  soft:     { label: "Soft",     a: { ...DEFAULTS, contrast: -10, brightness: 5, blur: 0.8, saturation: -5 } },
};

const ACCEPT = ".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp";
const MAX_PREVIEW_DIM = 1200;
const HISTORY_CAP = 50;
const GRAIN_SEED = 0x9e3779b1;

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
    r = r * bK; g = g * bK; b = b * bK;
    r = (r - 128) * cK + 128;
    g = (g - 128) * cK + 128;
    b = (b - 128) * cK + 128;
    const L1 = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    r = L1 + (r - L1) * sK;
    g = L1 + (g - L1) * sK;
    b = L1 + (b - L1) * sK;
    if (doHue) {
      const nr = r * m00 + g * m01 + b * m02;
      const ng = r * m10 + g * m11 + b * m12;
      const nb = r * m20 + g * m21 + b * m22;
      r = nr; g = ng; b = nb;
    }
    if (doGray) {
      const L2 = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      r = r * (1 - gP) + L2 * gP;
      g = g * (1 - gP) + L2 * gP;
      b = b * (1 - gP) + L2 * gP;
    }
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
  }
}

function boxBlur(src: Uint8ClampedArray, w: number, h: number, r: number): Uint8ClampedArray {
  if (r <= 0) return src;
  const radius = Math.max(1, Math.round(r));
  const a = new Uint8ClampedArray(src);
  const b = new Uint8ClampedArray(src.length);
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

/**
 * Apply the "new-effect" stack (duotone, sharpen, vignette, grain) in place.
 * Runs after color/tone/blur have already been baked into `data`.
 */
function applyNewEffectsStack(data: Uint8ClampedArray, w: number, h: number, a: Adjustments): void {
  // Duotone
  if (a.duotone !== "none" && a.duotoneAmount > 0) {
    const { shadow, highlight } = DUOTONES[a.duotone];
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = duotoneMap(data[i], data[i + 1], data[i + 2], shadow, highlight, a.duotoneAmount);
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }
  // Sharpen (unsharp mask): needs a blurred copy of the current state
  if (a.sharpen > 0) {
    const blurred = boxBlur(data, w, h, 1);
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = pxSharpen(data[i],     blurred[i],     a.sharpen);
      data[i + 1] = pxSharpen(data[i + 1], blurred[i + 1], a.sharpen);
      data[i + 2] = pxSharpen(data[i + 2], blurred[i + 2], a.sharpen);
    }
  }
  // Vignette
  if (a.vignette > 0) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const d = radialDistance(x, y, w, h);
        const f = vignetteFactor(d, a.vignette);
        const o = (y * w + x) * 4;
        data[o]     = data[o]     * f;
        data[o + 1] = data[o + 1] * f;
        data[o + 2] = data[o + 2] * f;
      }
    }
  }
  // Grain (deterministic per pixel index, so preview and export match)
  if (a.grain > 0) {
    for (let i = 0, px = 0; i < data.length; i += 4, px++) {
      const n = grainNoise(px, GRAIN_SEED);
      data[i]     = pxGrain(data[i],     n, a.grain);
      data[i + 1] = pxGrain(data[i + 1], n, a.grain);
      data[i + 2] = pxGrain(data[i + 2], n, a.grain);
    }
  }
}

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
  const native = await canvasToBlob(canvas, "image/webp", quality);
  if (native && native.type === "image/webp") return native;
  const encode = await getWebpEncoder();
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const buf = await encode(imageData, { quality: Math.round(quality * 100) });
  return new Blob([buf], { type: "image/webp" });
}

/* --------------------------------- Component --------------------------------- */

function eqAdj(a: Adjustments, b: Adjustments): boolean {
  return (
    a.brightness === b.brightness && a.contrast === b.contrast && a.saturation === b.saturation &&
    a.warmth === b.warmth && a.grayscale === b.grayscale && a.sepia === b.sepia && a.blur === b.blur &&
    a.sharpen === b.sharpen && a.vignette === b.vignette && a.grain === b.grain &&
    a.duotone === b.duotone && a.duotoneAmount === b.duotoneAmount
  );
}

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
  const [outWidth, setOutWidth] = useState<number | "">("");
  const [outHeight, setOutHeight] = useState<number | "">("");
  const [history, setHistory] = useState<Adjustments[]>([{ ...DEFAULTS }]);
  const [hIndex, setHIndex] = useState(0);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Commit current adjustments onto the undo stack.
  const commit = useCallback((next: Adjustments) => {
    setHistory((prev) => {
      const cur = prev[hIndex];
      if (cur && eqAdj(cur, next)) return prev;
      const trimmed = prev.slice(0, hIndex + 1);
      trimmed.push({ ...next });
      const overflow = Math.max(0, trimmed.length - HISTORY_CAP);
      const capped = overflow ? trimmed.slice(overflow) : trimmed;
      setHIndex(capped.length - 1);
      return capped;
    });
  }, [hIndex]);

  const undo = useCallback(() => {
    setHIndex((i) => {
      if (i <= 0) return i;
      const ni = i - 1;
      setAdj({ ...history[ni] });
      setPreset("original");
      return ni;
    });
  }, [history]);

  const redo = useCallback(() => {
    setHIndex((i) => {
      if (i >= history.length - 1) return i;
      const ni = i + 1;
      setAdj({ ...history[ni] });
      setPreset("original");
      return ni;
    });
  }, [history]);

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
      setHistory([{ ...DEFAULTS }]);
      setHIndex(0);
      setOutWidth("");
      setOutHeight("");
      setOutFmt(fmtOf(f));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not decode image");
    }
  }, [bitmap]);

  const onSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    void loadFile(files[0]);
  };

  // Redraw preview whenever bitmap/adjustments/compare change.
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
    if (comparing) {
      ctx.filter = "none";
      ctx.drawImage(bitmap, 0, 0, w, h);
      ctx.filter = "none";
      return;
    }
    ctx.filter = cssFilterString(adj);
    ctx.drawImage(bitmap, 0, 0, w, h);
    ctx.filter = "none";
    const needsPixel =
      (adj.duotone !== "none" && adj.duotoneAmount > 0) ||
      adj.sharpen > 0 || adj.vignette > 0 || adj.grain > 0;
    if (needsPixel) {
      const img = ctx.getImageData(0, 0, w, h);
      applyNewEffectsStack(img.data, w, h, adj);
      ctx.putImageData(img, 0, 0);
    }
  }, [bitmap, adj, comparing]);

  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    const next = { ...PRESETS[key].a };
    setAdj(next);
    commit(next);
  };

  const resetAll = () => {
    setAdj({ ...DEFAULTS });
    setPreset("original");
    commit({ ...DEFAULTS });
  };

  // Keyboard shortcuts: skip when focus is inside an editable input.
  useEffect(() => {
    const isEditable = () => {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
      if (el.isContentEditable) return true;
      return false;
    };
    const onKey = (e: KeyboardEvent) => {
      if (isEditable()) return;
      const meta = e.ctrlKey || e.metaKey;
      if (meta && !e.shiftKey && (e.key === "z" || e.key === "Z")) { e.preventDefault(); undo(); return; }
      if (meta && ((e.shiftKey && (e.key === "z" || e.key === "Z")) || e.key === "y" || e.key === "Y")) { e.preventDefault(); redo(); return; }
      if (!meta && (e.key === " " || e.code === "Space")) { e.preventDefault(); setComparing(true); return; }
      if (!meta && (e.key === "r" || e.key === "R")) { e.preventDefault(); resetAll(); return; }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") setComparing(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKeyUp);
    };
    // resetAll and undo/redo capture latest via closure recreation on state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, hIndex, adj]);

  const doExport = useCallback(async () => {
    if (!bitmap || !file) return;
    setExporting(true);
    try {
      const srcW = bitmap.width;
      const srcH = bitmap.height;
      let targetW = srcW;
      let targetH = srcH;
      if (typeof outWidth === "number" && outWidth > 0) {
        targetW = Math.max(1, Math.floor(outWidth));
        targetH = aspectResizeOther(srcW, srcH, "w", targetW);
      } else if (typeof outHeight === "number" && outHeight > 0) {
        targetH = Math.max(1, Math.floor(outHeight));
        targetW = aspectResizeOther(srcW, srcH, "h", targetH);
      }
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(bitmap, 0, 0, targetW, targetH);
      const img = ctx.getImageData(0, 0, targetW, targetH);
      applyPixelAdjustments(img.data, adj);
      if (adj.blur > 0) {
        const blurred = boxBlur(img.data, targetW, targetH, adj.blur);
        img.data.set(blurred);
      }
      applyNewEffectsStack(img.data, targetW, targetH, adj);
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
  }, [bitmap, file, adj, outFmt, outQuality, preset, outWidth, outHeight]);

  const startOver = () => {
    if (bitmap) bitmap.close?.();
    setBitmap(null);
    setFile(null);
    setAdj({ ...DEFAULTS });
    setPreset("original");
    setHistory([{ ...DEFAULTS }]);
    setHIndex(0);
    setOutWidth("");
    setOutHeight("");
  };

  const canUndo = hIndex > 0;
  const canRedo = hIndex < history.length - 1;

  const upscaling = useMemo(() => {
    if (!bitmap) return false;
    if (typeof outWidth === "number" && outWidth > bitmap.width) return true;
    if (typeof outHeight === "number" && outHeight > bitmap.height) return true;
    return false;
  }, [bitmap, outWidth, outHeight]);

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
    <div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
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
              onClick={undo}
              disabled={!canUndo}
              title="Undo (Ctrl/Cmd+Z)"
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20 disabled:opacity-40"
            >
              <Undo2 size={14} /> Undo
            </button>
            <button
              type="button"
              onClick={redo}
              disabled={!canRedo}
              title="Redo (Ctrl/Cmd+Shift+Z)"
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20 disabled:opacity-40"
            >
              <Redo2 size={14} /> Redo
            </button>
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
              <RotateCcw size={14} /> Reset
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
        <p className="mt-2 text-[11px] text-white/50">
          Shortcuts: Ctrl/Cmd+Z undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo, hold Space to compare, R to reset.
        </p>
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

        <div>
          <h3 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Duotone</h3>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(DUOTONES) as DuoKey[]).map((k) => {
              const d = DUOTONES[k];
              const active = adj.duotone === k;
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    const next = { ...adj, duotone: k };
                    setAdj(next);
                    setPreset("original");
                    commit(next);
                  }}
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                    active ? "border-[#8B5CF6] bg-[#8B5CF6] text-white" : "border-[#e5e7eb] bg-white text-[#4B5563] hover:border-[#8B5CF6]/50"
                  }`}
                >
                  {k !== "none" && (
                    <span className="flex overflow-hidden rounded-sm border border-black/10">
                      <span className="block h-3 w-3" style={{ background: `rgb(${d.shadow.join(",")})` }} />
                      <span className="block h-3 w-3" style={{ background: `rgb(${d.highlight.join(",")})` }} />
                    </span>
                  )}
                  {d.label}
                </button>
              );
            })}
          </div>
          {adj.duotone !== "none" && (
            <div className="mt-3">
              <Slider
                label="Duotone amount"
                value={adj.duotoneAmount}
                min={0} max={100} step={1} unit="%"
                onChange={(v) => { setAdj((a) => ({ ...a, duotoneAmount: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, duotoneAmount: v })}
                onReset={() => { const n = { ...adj, duotoneAmount: 60 }; setAdj(n); commit(n); }}
              />
            </div>
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-[#ececef] bg-white p-4">
          <Slider label="Brightness" value={adj.brightness} min={-100} max={100} step={1}
            onChange={(v) => { setAdj((a) => ({ ...a, brightness: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, brightness: v })}
            onReset={() => { const n = { ...adj, brightness: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Contrast" value={adj.contrast} min={-100} max={100} step={1}
            onChange={(v) => { setAdj((a) => ({ ...a, contrast: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, contrast: v })}
            onReset={() => { const n = { ...adj, contrast: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Saturation" value={adj.saturation} min={-100} max={100} step={1}
            onChange={(v) => { setAdj((a) => ({ ...a, saturation: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, saturation: v })}
            onReset={() => { const n = { ...adj, saturation: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Warmth" value={adj.warmth} min={-60} max={60} step={1} unit="°"
            onChange={(v) => { setAdj((a) => ({ ...a, warmth: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, warmth: v })}
            onReset={() => { const n = { ...adj, warmth: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Grayscale" value={adj.grayscale} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, grayscale: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, grayscale: v })}
            onReset={() => { const n = { ...adj, grayscale: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Sepia" value={adj.sepia} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, sepia: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, sepia: v })}
            onReset={() => { const n = { ...adj, sepia: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Blur" value={adj.blur} min={0} max={8} step={0.1} unit="px"
            onChange={(v) => { setAdj((a) => ({ ...a, blur: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, blur: v })}
            onReset={() => { const n = { ...adj, blur: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Sharpen" value={adj.sharpen} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, sharpen: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, sharpen: v })}
            onReset={() => { const n = { ...adj, sharpen: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Vignette" value={adj.vignette} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, vignette: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, vignette: v })}
            onReset={() => { const n = { ...adj, vignette: 0 }; setAdj(n); commit(n); }} />
          <Slider label="Grain" value={adj.grain} min={0} max={100} step={1} unit="%"
            onChange={(v) => { setAdj((a) => ({ ...a, grain: v })); setPreset("original"); }}
            onCommit={(v) => commit({ ...adj, grain: v })}
            onReset={() => { const n = { ...adj, grain: 0 }; setAdj(n); commit(n); }} />
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
              min={40} max={100} step={1} unit="%"
              onChange={(v) => setOutQuality(v / 100)}
              onCommit={() => { /* not part of undo/redo */ }}
              onReset={() => setOutQuality(0.92)}
            />
          )}
          <div>
            <div className="mb-1 text-[13px] font-semibold text-[#1F2937]">Export size</div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                placeholder={String(bitmap.width)}
                value={outWidth}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value)));
                  setOutWidth(v);
                  if (typeof v === "number") setOutHeight(aspectResizeOther(bitmap.width, bitmap.height, "w", v));
                  else setOutHeight("");
                }}
                className="w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-[13px]"
              />
              <span className="text-[12px] text-[#6B7280]">x</span>
              <input
                type="number"
                min={1}
                placeholder={String(bitmap.height)}
                value={outHeight}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value)));
                  setOutHeight(v);
                  if (typeof v === "number") setOutWidth(aspectResizeOther(bitmap.width, bitmap.height, "h", v));
                  else setOutWidth("");
                }}
                className="w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-[13px]"
              />
              <button
                type="button"
                onClick={() => { setOutWidth(""); setOutHeight(""); }}
                className="text-[11px] font-semibold text-[#8B5CF6] hover:underline"
              >
                reset
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">Aspect ratio locked. Leave blank to keep original size.</p>
            {upscaling && (
              <p className="mt-1 text-[11px] text-[#b45309]">Heads up: upscaling cannot add detail the source does not have.</p>
            )}
          </div>
          <button
            type="button"
            onClick={() => void doExport()}
            disabled={exporting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#8B5CF6] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#7c3aed] disabled:opacity-60"
          >
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Exporting" : `Download ${outFmt.toUpperCase()}`}
          </button>
          <p className="text-[12px] text-[#6B7280]">Exports at full original resolution unless you set an export size. Your photo never leaves your device.</p>
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
  onCommit,
  onReset,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit?: string;
  onChange: (v: number) => void;
  onCommit: (v: number) => void;
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
        onPointerUp={(e) => onCommit(parseFloat((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => onCommit(parseFloat((e.target as HTMLInputElement).value))}
        className="w-full accent-[#8B5CF6]"
      />
    </div>
  );
}
