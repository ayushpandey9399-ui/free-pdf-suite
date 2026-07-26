import { UploadDropzone } from "@/components/UploadDropzone";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  Download, X, Upload, Loader2, RotateCcw, RotateCw,
  FlipHorizontal2, FlipVertical2, Undo2, Redo2, Crop as CropIcon, Sliders, Check,
} from "lucide-react";
import { saveAs } from "file-saver";
import { guardDecodedSize, isSvgFile } from "@/lib/imageSafety";
import {
  pxSharpen, vignetteFactor, pxGrain, grainNoise, duotoneMap,
  radialDistance, aspectResizeOther, insideRectScale, clampCropRect,
  type CropRect,
} from "@/lib/imageMath";

type Fmt = "jpg" | "png" | "webp";
type DuoKey = "none" | "navy-cream" | "purple-peach" | "teal-gold" | "plum-mint";
type Rot = 0 | 90 | 180 | 270;
type Tab = "adjust" | "geometry";

const DUOTONES: Record<DuoKey, { label: string; shadow: [number, number, number]; highlight: [number, number, number] }> = {
  "none":         { label: "Off",           shadow: [0, 0, 0],     highlight: [255, 255, 255] },
  "navy-cream":   { label: "Navy | Cream",  shadow: [12, 26, 64],  highlight: [255, 240, 210] },
  "purple-peach": { label: "Purple | Peach",shadow: [56, 20, 80],  highlight: [255, 200, 170] },
  "teal-gold":    { label: "Teal | Gold",   shadow: [10, 50, 70],  highlight: [255, 215, 110] },
  "plum-mint":    { label: "Plum | Mint",   shadow: [70, 20, 60],  highlight: [190, 255, 220] },
};

type Adjustments = {
  brightness: number; contrast: number; saturation: number; warmth: number;
  grayscale: number; sepia: number; blur: number;
  sharpen: number; vignette: number; grain: number;
  duotone: DuoKey; duotoneAmount: number;
};

type Geometry = {
  rot: Rot;
  flipH: boolean;
  flipV: boolean;
  straighten: number; // -15..15 degrees, 0.5 step
  crop: CropRect | null; // in geoBase pixel space
};

type Settings = { adj: Adjustments; geom: Geometry };

type PresetKey = "original" | "bw" | "sepia" | "vintage" | "cool" | "punchy" | "soft";
type AspectKey = "free" | "1:1" | "4:3" | "16:9";
const ASPECT_RATIOS: Record<AspectKey, number | null> = {
  "free": null, "1:1": 1, "4:3": 4 / 3, "16:9": 16 / 9,
};

const DEFAULT_ADJ: Adjustments = {
  brightness: 0, contrast: 0, saturation: 0, warmth: 0,
  grayscale: 0, sepia: 0, blur: 0,
  sharpen: 0, vignette: 0, grain: 0,
  duotone: "none", duotoneAmount: 60,
};
const DEFAULT_GEOM: Geometry = { rot: 0, flipH: false, flipV: false, straighten: 0, crop: null };
const DEFAULT_SETTINGS: Settings = { adj: DEFAULT_ADJ, geom: DEFAULT_GEOM };

const PRESETS: Record<PresetKey, { label: string; a: Adjustments }> = {
  original: { label: "Original", a: { ...DEFAULT_ADJ } },
  bw:       { label: "B&W",      a: { ...DEFAULT_ADJ, grayscale: 100, contrast: 5 } },
  sepia:    { label: "Sepia",    a: { ...DEFAULT_ADJ, sepia: 90, contrast: 5, brightness: 3 } },
  vintage:  { label: "Vintage",  a: { ...DEFAULT_ADJ, sepia: 45, warmth: 15, contrast: -8, saturation: -10, brightness: 5, vignette: 25, grain: 12 } },
  cool:     { label: "Cool",     a: { ...DEFAULT_ADJ, warmth: -25, saturation: 10, brightness: 3 } },
  punchy:   { label: "Punchy",   a: { ...DEFAULT_ADJ, contrast: 25, saturation: 25, sharpen: 30 } },
  soft:     { label: "Soft",     a: { ...DEFAULT_ADJ, contrast: -10, brightness: 5, blur: 0.8, saturation: -5 } },
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
  try { return await createImageBitmap(file, { imageOrientation: "from-image" }); }
  catch { return await createImageBitmap(file); }
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

/* -------- Pixel adjustments (export path, cross-browser) -------- */

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
    let r = data[i]; let g = data[i + 1]; let b = data[i + 2];
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
  for (let p = 0; p < 3; p++) { boxBlurH(a, b, w, h, radius); boxBlurV(b, a, w, h, radius); }
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
      dst[o] = sumR / div; dst[o + 1] = sumG / div; dst[o + 2] = sumB / div; dst[o + 3] = sumA / div;
      const xOut = Math.min(w - 1, Math.max(0, x - r));
      const xIn  = Math.min(w - 1, Math.max(0, x + r + 1));
      const iOut = row + xOut * 4; const iIn = row + xIn * 4;
      sumR += src[iIn] - src[iOut];
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
      dst[o] = sumR / div; dst[o + 1] = sumG / div; dst[o + 2] = sumB / div; dst[o + 3] = sumA / div;
      const yOut = Math.min(h - 1, Math.max(0, y - r));
      const yIn  = Math.min(h - 1, Math.max(0, y + r + 1));
      const iOut = (yOut * w + x) * 4; const iIn = (yIn * w + x) * 4;
      sumR += src[iIn] - src[iOut];
      sumG += src[iIn + 1] - src[iOut + 1];
      sumB += src[iIn + 2] - src[iOut + 2];
      sumA += src[iIn + 3] - src[iOut + 3];
    }
  }
}

function applyNewEffectsStack(data: Uint8ClampedArray, w: number, h: number, a: Adjustments): void {
  if (a.duotone !== "none" && a.duotoneAmount > 0) {
    const { shadow, highlight } = DUOTONES[a.duotone];
    for (let i = 0; i < data.length; i += 4) {
      const [r, g, b] = duotoneMap(data[i], data[i + 1], data[i + 2], shadow, highlight, a.duotoneAmount);
      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
  }
  if (a.sharpen > 0) {
    const blurred = boxBlur(data, w, h, 1);
    for (let i = 0; i < data.length; i += 4) {
      data[i]     = pxSharpen(data[i],     blurred[i],     a.sharpen);
      data[i + 1] = pxSharpen(data[i + 1], blurred[i + 1], a.sharpen);
      data[i + 2] = pxSharpen(data[i + 2], blurred[i + 2], a.sharpen);
    }
  }
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
  if (a.grain > 0) {
    for (let i = 0, px = 0; i < data.length; i += 4, px++) {
      const n = grainNoise(px, GRAIN_SEED);
      data[i]     = pxGrain(data[i],     n, a.grain);
      data[i + 1] = pxGrain(data[i + 1], n, a.grain);
      data[i + 2] = pxGrain(data[i + 2], n, a.grain);
    }
  }
}

/* -------- Geometry helpers -------- */

/**
 * Dimensions of the geoBase canvas: source bitmap after rot90 + flip + straighten
 * auto-crop (largest same-aspect axis-aligned rect inside the rotated content).
 */
function geoBaseDims(bmW: number, bmH: number, geom: Geometry): { w: number; h: number } {
  const swap = geom.rot === 90 || geom.rot === 270;
  const Wr = swap ? bmH : bmW;
  const Hr = swap ? bmW : bmH;
  const s = insideRectScale(Wr, Hr, (geom.straighten * Math.PI) / 180);
  return { w: Math.max(1, Math.round(Wr * s)), h: Math.max(1, Math.round(Hr * s)) };
}

/**
 * Draw the geoBase image (rot90 + flip + straighten with inscribed-rect auto-zoom)
 * into `canvas` at the exact dimensions returned by geoBaseDims. Uniform `scale`
 * applies when the caller wants a downscaled preview version.
 */
function drawGeoBase(
  canvas: HTMLCanvasElement,
  bitmap: ImageBitmap,
  geom: Geometry,
  scale: number,
): void {
  const dims = geoBaseDims(bitmap.width, bitmap.height, geom);
  const outW = Math.max(1, Math.round(dims.w * scale));
  const outH = Math.max(1, Math.round(dims.h * scale));
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  // Fill w/ transparent so PNG alpha survives when there is no content.
  ctx.clearRect(0, 0, outW, outH);
  // Compute uniform inscribed-scale s so the drawn image (rotated by straighten)
  // exactly fills the canvas after rotation, leaving no blank corners.
  const swap = geom.rot === 90 || geom.rot === 270;
  const Wr = swap ? bitmap.height : bitmap.width;
  const Hr = swap ? bitmap.width : bitmap.height;
  const a = (geom.straighten * Math.PI) / 180;
  const s = insideRectScale(Wr, Hr, a);
  ctx.save();
  ctx.translate(outW / 2, outH / 2);
  ctx.rotate(a);
  ctx.scale(s * scale, s * scale);
  ctx.rotate((geom.rot * Math.PI) / 180);
  ctx.scale(geom.flipH ? -1 : 1, geom.flipV ? -1 : 1);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);
  ctx.restore();
}

/* -------- Encoding -------- */

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

/* -------- Equality / history -------- */

function eqAdj(a: Adjustments, b: Adjustments): boolean {
  return (
    a.brightness === b.brightness && a.contrast === b.contrast && a.saturation === b.saturation &&
    a.warmth === b.warmth && a.grayscale === b.grayscale && a.sepia === b.sepia && a.blur === b.blur &&
    a.sharpen === b.sharpen && a.vignette === b.vignette && a.grain === b.grain &&
    a.duotone === b.duotone && a.duotoneAmount === b.duotoneAmount
  );
}
function eqCrop(a: CropRect | null, b: CropRect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.x === b.x && a.y === b.y && a.w === b.w && a.h === b.h;
}
function eqGeom(a: Geometry, b: Geometry): boolean {
  return a.rot === b.rot && a.flipH === b.flipH && a.flipV === b.flipV &&
    a.straighten === b.straighten && eqCrop(a.crop, b.crop);
}
function eqSettings(a: Settings, b: Settings): boolean {
  return eqAdj(a.adj, b.adj) && eqGeom(a.geom, b.geom);
}

/* --------------------------------- Component --------------------------------- */

type StageState = {
  handle: "move" | "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
  startX: number; startY: number;
  startCrop: CropRect;
  scale: number; // px per geoBase pixel
  imgW: number; imgH: number;
};

export function PhotoEditorTool() {
  const [file, setFile] = useState<File | null>(null);
  const [bitmap, setBitmap] = useState<ImageBitmap | null>(null);

  const [adj, setAdj] = useState<Adjustments>({ ...DEFAULT_ADJ });
  const [geom, setGeom] = useState<Geometry>({ ...DEFAULT_GEOM });
  const [tab, setTab] = useState<Tab>("adjust");

  // Aspect preset for the crop tab (does not go into history; it constrains new draws).
  const [aspectKey, setAspectKey] = useState<AspectKey>("free");

  const [preset, setPreset] = useState<PresetKey>("original");
  const [comparing, setComparing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [outFmt, setOutFmt] = useState<Fmt>("jpg");
  const [outQuality, setOutQuality] = useState(0.92);
  const [outWidth, setOutWidth] = useState<number | "">("");
  const [outHeight, setOutHeight] = useState<number | "">("");
  const [straightenDragging, setStraightenDragging] = useState(false);

  const [history, setHistory] = useState<Settings[]>([{ adj: { ...DEFAULT_ADJ }, geom: { ...DEFAULT_GEOM } }]);
  const [hIndex, setHIndex] = useState(0);

  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const cropStageRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stageStateRef = useRef<StageState | null>(null);

  // ---- History helpers ----
  const commit = useCallback((nextAdj: Adjustments, nextGeom: Geometry) => {
    setHistory((prev) => {
      const cur = prev[hIndex];
      const nextS: Settings = { adj: { ...nextAdj }, geom: { ...nextGeom, crop: nextGeom.crop ? { ...nextGeom.crop } : null } };
      if (cur && eqSettings(cur, nextS)) return prev;
      const trimmed = prev.slice(0, hIndex + 1);
      trimmed.push(nextS);
      const overflow = Math.max(0, trimmed.length - HISTORY_CAP);
      const capped = overflow ? trimmed.slice(overflow) : trimmed;
      setHIndex(capped.length - 1);
      return capped;
    });
  }, [hIndex]);

  const applySettings = useCallback((s: Settings) => {
    setAdj({ ...s.adj });
    setGeom({ ...s.geom, crop: s.geom.crop ? { ...s.geom.crop } : null });
    setPreset("original");
  }, []);

  const undo = useCallback(() => {
    setHIndex((i) => {
      if (i <= 0) return i;
      const ni = i - 1;
      applySettings(history[ni]);
      return ni;
    });
  }, [history, applySettings]);
  const redo = useCallback(() => {
    setHIndex((i) => {
      if (i >= history.length - 1) return i;
      const ni = i + 1;
      applySettings(history[ni]);
      return ni;
    });
  }, [history, applySettings]);

  // ---- File loading ----
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
      setAdj({ ...DEFAULT_ADJ });
      setGeom({ ...DEFAULT_GEOM });
      setAspectKey("free");
      setPreset("original");
      setTab("adjust");
      setHistory([{ adj: { ...DEFAULT_ADJ }, geom: { ...DEFAULT_GEOM } }]);
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

  // ---- Preview render ----
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !bitmap) return;

    // Compare mode: raw original bitmap (no geometry, no adjustments)
    if (comparing) {
      const scale = Math.min(1, MAX_PREVIEW_DIM / Math.max(bitmap.width, bitmap.height));
      const w = Math.max(1, Math.round(bitmap.width * scale));
      const h = Math.max(1, Math.round(bitmap.height * scale));
      canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = "none";
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(bitmap, 0, 0, w, h);
      return;
    }

    // Draw geoBase (rot+flip+straighten) at preview scale.
    const geoDims = geoBaseDims(bitmap.width, bitmap.height, geom);
    const previewScale = Math.min(1, MAX_PREVIEW_DIM / Math.max(geoDims.w, geoDims.h));

    // For the crop tab, we show the geoBase (uncropped) with an overlay handled in DOM.
    // For the adjust tab, we show the cropped + adjusted result.
    if (tab === "geometry") {
      drawGeoBase(canvas, bitmap, geom, previewScale);
      return;
    }

    // Adjust tab: draw geoBase at preview scale, then apply crop by re-blitting.
    const geoCanvas = document.createElement("canvas");
    drawGeoBase(geoCanvas, bitmap, geom, previewScale);

    const cropSrc = geom.crop
      ? clampCropRect(
          {
            x: geom.crop.x * previewScale,
            y: geom.crop.y * previewScale,
            w: geom.crop.w * previewScale,
            h: geom.crop.h * previewScale,
          },
          geoCanvas.width,
          geoCanvas.height,
        )
      : { x: 0, y: 0, w: geoCanvas.width, h: geoCanvas.height };

    canvas.width = Math.max(1, cropSrc.w);
    canvas.height = Math.max(1, cropSrc.h);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.filter = cssFilterString(adj);
    ctx.drawImage(geoCanvas, cropSrc.x, cropSrc.y, cropSrc.w, cropSrc.h, 0, 0, canvas.width, canvas.height);
    ctx.filter = "none";

    const needsPixel =
      (adj.duotone !== "none" && adj.duotoneAmount > 0) ||
      adj.sharpen > 0 || adj.vignette > 0 || adj.grain > 0;
    if (needsPixel) {
      const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
      applyNewEffectsStack(img.data, canvas.width, canvas.height, adj);
      ctx.putImageData(img, 0, 0);
    }
  }, [bitmap, adj, geom, comparing, tab]);

  // ---- Adjustments API ----
  const applyPreset = (key: PresetKey) => {
    setPreset(key);
    const next = { ...PRESETS[key].a };
    setAdj(next);
    commit(next, geom);
  };
  const resetAll = () => {
    setAdj({ ...DEFAULT_ADJ });
    setGeom({ ...DEFAULT_GEOM });
    setPreset("original");
    setAspectKey("free");
    commit(DEFAULT_ADJ, DEFAULT_GEOM);
  };

  // ---- Geometry actions ----
  const setGeomAndCommit = (updater: (g: Geometry) => Geometry) => {
    setGeom((g) => {
      const next = updater(g);
      commit(adj, next);
      return next;
    });
  };
  const rotate90 = (dir: "left" | "right") => {
    setGeomAndCommit((g) => {
      const delta = dir === "right" ? 90 : 270;
      return { ...g, rot: (((g.rot + delta) % 360) as Rot), crop: null };
    });
  };
  const doFlipH = () => setGeomAndCommit((g) => ({ ...g, flipH: !g.flipH, crop: null }));
  const doFlipV = () => setGeomAndCommit((g) => ({ ...g, flipV: !g.flipV, crop: null }));

  // Straighten: live update without history, commit on release.
  const onStraightenChange = (v: number) => {
    const clamped = Math.max(-15, Math.min(15, v));
    setGeom((g) => ({ ...g, straighten: clamped, crop: null }));
    setPreset("original");
  };
  const onStraightenCommit = (v: number) => {
    const clamped = Math.max(-15, Math.min(15, v));
    commit(adj, { ...geom, straighten: clamped, crop: null });
  };

  // ---- Crop box interaction (crop tab) ----
  const geoDims = useMemo(() => bitmap ? geoBaseDims(bitmap.width, bitmap.height, geom) : { w: 1, h: 1 }, [bitmap, geom]);
  const currentAspect = ASPECT_RATIOS[aspectKey];

  const defaultCropRect = useCallback((W: number, H: number, aspect: number | null): CropRect => {
    if (!aspect) return clampCropRect({ x: W * 0.05, y: H * 0.05, w: W * 0.9, h: H * 0.9 }, W, H);
    let w = W * 0.9;
    let h = w / aspect;
    if (h > H * 0.9) { h = H * 0.9; w = h * aspect; }
    return clampCropRect({ x: (W - w) / 2, y: (H - h) / 2, w, h }, W, H);
  }, []);

  const ensureCrop = useCallback((): CropRect => {
    return geom.crop ?? defaultCropRect(geoDims.w, geoDims.h, currentAspect);
  }, [geom.crop, geoDims, currentAspect, defaultCropRect]);

  const handleAspect = (k: AspectKey) => {
    setAspectKey(k);
    const a = ASPECT_RATIOS[k];
    const next = defaultCropRect(geoDims.w, geoDims.h, a);
    setGeom((g) => ({ ...g, crop: next }));
    // do not commit here: user still sees the crop tab; commit on Apply.
  };

  const onCropPointerDown = (e: React.PointerEvent, handle: StageState["handle"]) => {
    if (!cropStageRef.current || !bitmap) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    const rect = cropStageRef.current.getBoundingClientRect();
    const scale = rect.width / geoDims.w;
    const start = ensureCrop();
    stageStateRef.current = {
      handle, startX: e.clientX, startY: e.clientY,
      startCrop: { ...start }, scale, imgW: geoDims.w, imgH: geoDims.h,
    };
    // Ensure crop exists in state so overlay renders while dragging.
    if (!geom.crop) setGeom((g) => ({ ...g, crop: start }));
  };
  const onCropPointerMove = (e: React.PointerEvent) => {
    const s = stageStateRef.current;
    if (!s) return;
    const dx = (e.clientX - s.startX) / s.scale;
    const dy = (e.clientY - s.startY) / s.scale;
    let { x, y, w, h } = s.startCrop;
    if (s.handle === "move") {
      x += dx; y += dy;
    } else {
      let nx = x, ny = y, nw = w, nh = h;
      if (s.handle.includes("w")) { nx = x + dx; nw = w - dx; }
      if (s.handle.includes("e")) { nw = w + dx; }
      if (s.handle.includes("n")) { ny = y + dy; nh = h - dy; }
      if (s.handle.includes("s")) { nh = h + dy; }
      if (currentAspect) {
        if (s.handle === "n" || s.handle === "s") { nw = nh * currentAspect; nx = x + (w - nw) / 2; }
        else if (s.handle === "e" || s.handle === "w") { nh = nw / currentAspect; ny = y + (h - nh) / 2; }
        else {
          if (Math.abs(dx) > Math.abs(dy)) {
            nh = nw / currentAspect;
            if (s.handle.includes("n")) ny = y + h - nh;
          } else {
            nw = nh * currentAspect;
            if (s.handle.includes("w")) nx = x + w - nw;
          }
        }
      }
      x = nx; y = ny; w = nw; h = nh;
    }
    if (w < 8) w = 8;
    if (h < 8) h = 8;
    const clamped = clampCropRect({ x, y, w, h }, s.imgW, s.imgH);
    setGeom((g) => ({ ...g, crop: clamped }));
  };
  const onCropPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as Element).releasePointerCapture?.(e.pointerId);
    if (stageStateRef.current) commit(adj, { ...geom, crop: geom.crop });
    stageStateRef.current = null;
  };

  const applyCrop = () => {
    // ensure a crop exists and commit
    const c = ensureCrop();
    setGeom((g) => ({ ...g, crop: c }));
    commit(adj, { ...geom, crop: c });
    setTab("adjust");
    toast.success("Crop applied");
  };
  const cancelCrop = () => {
    setGeom((g) => ({ ...g, crop: null }));
    setAspectKey("free");
    commit(adj, { ...geom, crop: null });
    setTab("adjust");
  };

  // ---- Keyboard shortcuts ----
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, hIndex, adj, geom]);

  // ---- Export ----
  const finalDims = useMemo(() => {
    if (!bitmap) return { w: 0, h: 0 };
    if (geom.crop) return { w: geom.crop.w, h: geom.crop.h };
    return geoDims;
  }, [bitmap, geom.crop, geoDims]);

  const doExport = useCallback(async () => {
    if (!bitmap || !file) return;
    setExporting(true);
    try {
      // 1) Draw full-resolution geoBase
      const geoCanvas = document.createElement("canvas");
      drawGeoBase(geoCanvas, bitmap, geom, 1);

      // 2) Apply crop (full-res)
      const crop = geom.crop
        ? clampCropRect(geom.crop, geoCanvas.width, geoCanvas.height)
        : { x: 0, y: 0, w: geoCanvas.width, h: geoCanvas.height };
      const cropCanvas = document.createElement("canvas");
      cropCanvas.width = crop.w;
      cropCanvas.height = crop.h;
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) throw new Error("Canvas not supported");
      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = "high";
      cropCtx.drawImage(geoCanvas, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);

      // 3) Determine output dimensions (aspect from cropped image)
      let targetW = crop.w;
      let targetH = crop.h;
      if (typeof outWidth === "number" && outWidth > 0) {
        targetW = Math.max(1, Math.floor(outWidth));
        targetH = aspectResizeOther(crop.w, crop.h, "w", targetW);
      } else if (typeof outHeight === "number" && outHeight > 0) {
        targetH = Math.max(1, Math.floor(outHeight));
        targetW = aspectResizeOther(crop.w, crop.h, "h", targetH);
      }
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(cropCanvas, 0, 0, targetW, targetH);

      // 4) Apply adjustments + effects on full-res pixels
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
  }, [bitmap, file, adj, geom, outFmt, outQuality, preset, outWidth, outHeight]);

  const startOver = () => {
    if (bitmap) bitmap.close?.();
    setBitmap(null);
    setFile(null);
    setAdj({ ...DEFAULT_ADJ });
    setGeom({ ...DEFAULT_GEOM });
    setPreset("original");
    setAspectKey("free");
    setTab("adjust");
    setHistory([{ adj: { ...DEFAULT_ADJ }, geom: { ...DEFAULT_GEOM } }]);
    setHIndex(0);
    setOutWidth("");
    setOutHeight("");
  };

  const canUndo = hIndex > 0;
  const canRedo = hIndex < history.length - 1;

  const upscaling = useMemo(() => {
    if (!bitmap) return false;
    if (typeof outWidth === "number" && outWidth > finalDims.w) return true;
    if (typeof outHeight === "number" && outHeight > finalDims.h) return true;
    return false;
  }, [bitmap, outWidth, outHeight, finalDims]);

  if (!file || !bitmap) {
    return (
      <div className="mx-auto max-w-2xl">
        <UploadDropzone
          accept={ACCEPT}
          buttonLabel="Select photo"
          hint="or drop a JPG, PNG, or WebP photo here"
          onFiles={(files) => onSelect(files as FileList)}
          accent="#8B5CF6"
        />
      </div>
    );
  }

  // ---- Overlays ----
  const cropBoxRect = geom.crop ?? defaultCropRect(geoDims.w, geoDims.h, currentAspect);
  const cropStyle = (r: CropRect) => ({
    left: `${(r.x / geoDims.w) * 100}%`,
    top: `${(r.y / geoDims.h) * 100}%`,
    width: `${(r.w / geoDims.w) * 100}%`,
    height: `${(r.h / geoDims.h) * 100}%`,
  });

  return (
    <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      {/* Preview */}
      <div className="rounded-xl bg-[#0f0f14] p-4">
        <div className="relative flex items-center justify-center overflow-hidden rounded-lg" style={{ minHeight: 280 }}>
          {tab === "geometry" && !comparing ? (
            <div
              ref={cropStageRef}
              className="relative inline-block max-h-[68vh] max-w-full select-none"
              style={{ aspectRatio: `${geoDims.w} / ${geoDims.h}`, width: "min(100%, 900px)" }}
            >
              <canvas
                ref={previewCanvasRef}
                className="block h-full w-full rounded"
                style={{ background: "#000" }}
              />
              {/* Straighten grid overlay */}
              {straightenDragging && (
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {[0,1,2,3,4,5,6,7,8].map((i) => (
                      <div key={i} className="border border-white/25" />
                    ))}
                  </div>
                </div>
              )}
              {/* Dim outside crop */}
              <div className="pointer-events-none absolute inset-0" aria-hidden>
                <svg width="100%" height="100%" className="absolute inset-0">
                  <defs>
                    <mask id="crop-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <rect
                        x={`${(cropBoxRect.x / geoDims.w) * 100}%`}
                        y={`${(cropBoxRect.y / geoDims.h) * 100}%`}
                        width={`${(cropBoxRect.w / geoDims.w) * 100}%`}
                        height={`${(cropBoxRect.h / geoDims.h) * 100}%`}
                        fill="black"
                      />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask="url(#crop-mask)" />
                </svg>
              </div>
              {/* Crop box */}
              <div
                className="absolute cursor-move border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
                style={cropStyle(cropBoxRect)}
                onPointerDown={(e) => onCropPointerDown(e, "move")}
                onPointerMove={onCropPointerMove}
                onPointerUp={onCropPointerUp}
              >
                {/* Rule of thirds */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {[0,1,2,3,4,5,6,7,8].map((i) => (
                      <div key={i} className="border border-white/40" />
                    ))}
                  </div>
                </div>
                {/* Handles */}
                {(["nw","n","ne","e","se","s","sw","w"] as const).map((h) => (
                  <span
                    key={h}
                    onPointerDown={(e) => { e.stopPropagation(); onCropPointerDown(e, h); }}
                    onPointerMove={onCropPointerMove}
                    onPointerUp={onCropPointerUp}
                    className={`absolute h-3 w-3 rounded-full border border-black bg-white ${handleClass(h)}`}
                    style={{ touchAction: "none" }}
                  />
                ))}
              </div>
            </div>
          ) : (
            <canvas
              ref={previewCanvasRef}
              className="max-h-[70vh] max-w-full rounded"
              style={{ background: "#000" }}
            />
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[13px] text-white/80">
          <div>
            <span className="font-semibold text-white">{file.name}</span>
            <span className="ml-2 text-white/60">{finalDims.w} x {finalDims.h}</span>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={undo} disabled={!canUndo} title="Undo (Ctrl/Cmd+Z)"
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20 disabled:opacity-40">
              <Undo2 size={14} /> Undo
            </button>
            <button type="button" onClick={redo} disabled={!canRedo} title="Redo (Ctrl/Cmd+Shift+Z)"
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20 disabled:opacity-40">
              <Redo2 size={14} /> Redo
            </button>
            <button type="button"
              onMouseDown={() => setComparing(true)} onMouseUp={() => setComparing(false)} onMouseLeave={() => setComparing(false)}
              onTouchStart={() => setComparing(true)} onTouchEnd={() => setComparing(false)}
              className="rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">
              Hold to compare
            </button>
            <button type="button" onClick={resetAll}
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">
              <RotateCcw size={14} /> Reset
            </button>
            <button type="button" onClick={startOver}
              className="inline-flex items-center gap-1 rounded-md bg-white/10 px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-white/20">
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
        {/* Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl border border-[#ececef] bg-white p-1">
          <button
            type="button"
            onClick={() => setTab("adjust")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
              tab === "adjust" ? "bg-[#8B5CF6] text-white" : "text-[#4B5563] hover:bg-[#f5f3ff]"
            }`}
          >
            <Sliders size={14} /> Adjust
          </button>
          <button
            type="button"
            onClick={() => setTab("geometry")}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[13px] font-semibold transition ${
              tab === "geometry" ? "bg-[#8B5CF6] text-white" : "text-[#4B5563] hover:bg-[#f5f3ff]"
            }`}
          >
            <CropIcon size={14} /> Crop and Rotate
          </button>
        </div>

        {tab === "geometry" ? (
          <>
            {/* Rotate / flip */}
            <div className="space-y-3 rounded-xl border border-[#ececef] bg-white p-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Rotate and flip</h3>
              <div className="flex flex-wrap gap-2">
                <GeomBtn onClick={() => rotate90("left")} icon={<RotateCcw size={14} />} label="90 left" />
                <GeomBtn onClick={() => rotate90("right")} icon={<RotateCw size={14} />} label="90 right" />
                <GeomBtn onClick={doFlipH} icon={<FlipHorizontal2 size={14} />} label="Mirror" />
                <GeomBtn onClick={doFlipV} icon={<FlipVertical2 size={14} />} label="Flip vertical" />
              </div>
            </div>

            {/* Straighten */}
            <div className="space-y-3 rounded-xl border border-[#ececef] bg-white p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Straighten</h3>
                <span className="tabular-nums text-[12px] text-[#4B5563]">{geom.straighten.toFixed(1)}°</span>
              </div>
              <input
                type="range"
                min={-15}
                max={15}
                step={0.5}
                value={geom.straighten}
                onPointerDown={() => setStraightenDragging(true)}
                onPointerUp={() => setStraightenDragging(false)}
                onPointerCancel={() => setStraightenDragging(false)}
                onChange={(e) => onStraightenChange(parseFloat(e.target.value))}
                onMouseUp={(e) => onStraightenCommit(parseFloat((e.target as HTMLInputElement).value))}
                onTouchEnd={(e) => onStraightenCommit(parseFloat((e.target as HTMLInputElement).value))}
                className="w-full accent-[#8B5CF6]"
              />
              <p className="text-[11px] text-[#6B7280]">Auto-zoom keeps the frame full: no blank corners at any angle.</p>
            </div>

            {/* Crop */}
            <div className="space-y-3 rounded-xl border border-[#ececef] bg-white p-4">
              <h3 className="text-[13px] font-semibold uppercase tracking-wide text-[#6B7280]">Crop</h3>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(ASPECT_RATIOS) as AspectKey[]).map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleAspect(k)}
                    className={`rounded-full border px-3 py-1.5 text-[12px] font-semibold transition ${
                      aspectKey === k
                        ? "border-[#8B5CF6] bg-[#8B5CF6] text-white"
                        : "border-[#e5e7eb] bg-white text-[#4B5563] hover:border-[#8B5CF6]/50"
                    }`}
                  >
                    {k === "free" ? "Free" : k}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={applyCrop}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-md bg-[#8B5CF6] px-3 py-2 text-[13px] font-semibold text-white hover:bg-[#7c3aed]"
                >
                  <Check size={14} /> Apply crop
                </button>
                <button
                  type="button"
                  onClick={cancelCrop}
                  className="rounded-md border border-[#e5e7eb] bg-white px-3 py-2 text-[13px] font-semibold text-[#4B5563] hover:border-[#8B5CF6]/50"
                >
                  Clear crop
                </button>
              </div>
              <p className="text-[11px] text-[#6B7280]">Drag inside the box to move it, drag a corner or edge to resize.</p>
            </div>
          </>
        ) : (
          <>
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
                        commit(next, geom);
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
                  <Slider label="Duotone amount" value={adj.duotoneAmount} min={0} max={100} step={1} unit="%"
                    onChange={(v) => { setAdj((a) => ({ ...a, duotoneAmount: v })); setPreset("original"); }}
                    onCommit={(v) => commit({ ...adj, duotoneAmount: v }, geom)}
                    onReset={() => { const n = { ...adj, duotoneAmount: 60 }; setAdj(n); commit(n, geom); }} />
                </div>
              )}
            </div>

            <div className="space-y-4 rounded-xl border border-[#ececef] bg-white p-4">
              <Slider label="Brightness" value={adj.brightness} min={-100} max={100} step={1}
                onChange={(v) => { setAdj((a) => ({ ...a, brightness: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, brightness: v }, geom)}
                onReset={() => { const n = { ...adj, brightness: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Contrast" value={adj.contrast} min={-100} max={100} step={1}
                onChange={(v) => { setAdj((a) => ({ ...a, contrast: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, contrast: v }, geom)}
                onReset={() => { const n = { ...adj, contrast: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Saturation" value={adj.saturation} min={-100} max={100} step={1}
                onChange={(v) => { setAdj((a) => ({ ...a, saturation: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, saturation: v }, geom)}
                onReset={() => { const n = { ...adj, saturation: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Warmth" value={adj.warmth} min={-60} max={60} step={1} unit="°"
                onChange={(v) => { setAdj((a) => ({ ...a, warmth: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, warmth: v }, geom)}
                onReset={() => { const n = { ...adj, warmth: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Grayscale" value={adj.grayscale} min={0} max={100} step={1} unit="%"
                onChange={(v) => { setAdj((a) => ({ ...a, grayscale: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, grayscale: v }, geom)}
                onReset={() => { const n = { ...adj, grayscale: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Sepia" value={adj.sepia} min={0} max={100} step={1} unit="%"
                onChange={(v) => { setAdj((a) => ({ ...a, sepia: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, sepia: v }, geom)}
                onReset={() => { const n = { ...adj, sepia: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Blur" value={adj.blur} min={0} max={8} step={0.1} unit="px"
                onChange={(v) => { setAdj((a) => ({ ...a, blur: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, blur: v }, geom)}
                onReset={() => { const n = { ...adj, blur: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Sharpen" value={adj.sharpen} min={0} max={100} step={1} unit="%"
                onChange={(v) => { setAdj((a) => ({ ...a, sharpen: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, sharpen: v }, geom)}
                onReset={() => { const n = { ...adj, sharpen: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Vignette" value={adj.vignette} min={0} max={100} step={1} unit="%"
                onChange={(v) => { setAdj((a) => ({ ...a, vignette: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, vignette: v }, geom)}
                onReset={() => { const n = { ...adj, vignette: 0 }; setAdj(n); commit(n, geom); }} />
              <Slider label="Grain" value={adj.grain} min={0} max={100} step={1} unit="%"
                onChange={(v) => { setAdj((a) => ({ ...a, grain: v })); setPreset("original"); }}
                onCommit={(v) => commit({ ...adj, grain: v }, geom)}
                onReset={() => { const n = { ...adj, grain: 0 }; setAdj(n); commit(n, geom); }} />
            </div>
          </>
        )}

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
            <Slider label="Quality" value={Math.round(outQuality * 100)}
              min={40} max={100} step={1} unit="%"
              onChange={(v) => setOutQuality(v / 100)}
              onCommit={() => { /* not part of undo/redo */ }}
              onReset={() => setOutQuality(0.92)} />
          )}
          <div>
            <div className="mb-1 text-[13px] font-semibold text-[#1F2937]">Export size</div>
            <div className="flex items-center gap-2">
              <input
                type="number" min={1} placeholder={String(finalDims.w)} value={outWidth}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value)));
                  setOutWidth(v);
                  if (typeof v === "number") setOutHeight(aspectResizeOther(finalDims.w, finalDims.h, "w", v));
                  else setOutHeight("");
                }}
                className="w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-[13px]"
              />
              <span className="text-[12px] text-[#6B7280]">x</span>
              <input
                type="number" min={1} placeholder={String(finalDims.h)} value={outHeight}
                onChange={(e) => {
                  const v = e.target.value === "" ? "" : Math.max(1, Math.floor(Number(e.target.value)));
                  setOutHeight(v);
                  if (typeof v === "number") setOutWidth(aspectResizeOther(finalDims.w, finalDims.h, "h", v));
                  else setOutWidth("");
                }}
                className="w-full rounded-md border border-[#e5e7eb] px-2 py-1.5 text-[13px]"
              />
              <button type="button" onClick={() => { setOutWidth(""); setOutHeight(""); }}
                className="text-[11px] font-semibold text-[#8B5CF6] hover:underline">
                reset
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[#6B7280]">Aspect ratio locked to the cropped image. Leave blank to keep full size.</p>
            {upscaling && (
              <p className="mt-1 text-[11px] text-[#b45309]">Heads up: upscaling cannot add detail the source does not have.</p>
            )}
          </div>
          <button type="button" onClick={() => void doExport()} disabled={exporting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#8B5CF6] px-4 py-2.5 text-[14px] font-semibold text-white hover:bg-[#7c3aed] disabled:opacity-60">
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Exporting" : `Download ${outFmt.toUpperCase()}`}
          </button>
          <p className="text-[12px] text-[#6B7280]">Exports at full resolution unless you set an export size. Your photo never leaves your device.</p>
        </div>
      </div>
    </div>
  );
}

function GeomBtn({ onClick, icon, label }: { onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button type="button" onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-md border border-[#e5e7eb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#4B5563] hover:border-[#8B5CF6]/50">
      {icon} {label}
    </button>
  );
}

function handleClass(h: "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw"): string {
  switch (h) {
    case "nw": return "-top-1.5 -left-1.5 cursor-nwse-resize";
    case "n":  return "-top-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize";
    case "ne": return "-top-1.5 -right-1.5 cursor-nesw-resize";
    case "e":  return "top-1/2 -right-1.5 -translate-y-1/2 cursor-ew-resize";
    case "se": return "-bottom-1.5 -right-1.5 cursor-nwse-resize";
    case "s":  return "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize";
    case "sw": return "-bottom-1.5 -left-1.5 cursor-nesw-resize";
    case "w":  return "top-1/2 -left-1.5 -translate-y-1/2 cursor-ew-resize";
  }
}

function Slider({
  label, value, min, max, step, unit, onChange, onCommit, onReset,
}: {
  label: string; value: number; min: number; max: number; step: number; unit?: string;
  onChange: (v: number) => void; onCommit: (v: number) => void; onReset: () => void;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[13px]">
        <span className="font-semibold text-[#1F2937]">{label}</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-[#4B5563]">
            {step < 1 ? value.toFixed(1) : Math.round(value)}{unit ?? ""}
          </span>
          <button type="button" onClick={onReset} className="text-[11px] font-semibold text-[#8B5CF6] hover:underline">
            reset
          </button>
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        onMouseUp={(e) => onCommit(parseFloat((e.target as HTMLInputElement).value))}
        onTouchEnd={(e) => onCommit(parseFloat((e.target as HTMLInputElement).value))}
        onKeyUp={(e) => onCommit(parseFloat((e.target as HTMLInputElement).value))}
        className="w-full accent-[#8B5CF6]"
      />
    </div>
  );
}
