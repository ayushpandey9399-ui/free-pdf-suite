// Pure helpers used by the image-tools silo. Kept dependency-free and free
// of DOM/browser types so they can be unit-tested headlessly with `bun test`.

export type ImageExt = "jpg" | "png" | "webp";

/** Extract the extension we should use for the compressor's output file. */
export function outExtension(filename: string): ImageExt {
  const n = filename.toLowerCase();
  if (n.endsWith(".png")) return "png";
  if (n.endsWith(".webp")) return "webp";
  return "jpg";
}

/** Map an extension to the canonical mime type. */
export function mimeFromExt(ext: ImageExt): string {
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  return "image/jpeg";
}

/** Format a byte count as B / KB / MB. */
export function formatBytes(n: number): string {
  if (!Number.isFinite(n) || n < 0) return "0 B";
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(2)} MB`;
}

/**
 * Percent saved after compression. Positive when the output is smaller.
 * Returns 0 for empty inputs. Rounded to the nearest integer.
 */
export function computeSavedPct(originalSize: number, outSize: number): number {
  if (!originalSize || originalSize <= 0) return 0;
  return Math.round(((originalSize - outSize) / originalSize) * 100);
}

/**
 * True when the compressor produced a file at least as big as the input,
 * so callers should fall back to the original bytes ("never inflate").
 */
export function shouldKeepOriginal(originalSize: number, outSize: number): boolean {
  return outSize >= originalSize;
}

/** Clamp a user-entered target-KB value to a safe minimum. */
export function clampTargetKb(v: number): number {
  if (!Number.isFinite(v)) return 5;
  return Math.max(5, Math.floor(v));
}

/** Strip a known raster extension from a filename base. */
export function stripKnownExt(name: string): string {
  return name.replace(/\.(jpe?g|png|webp)$/i, "");
}

/* ================================================================
 * RESIZE MATH
 * ================================================================ */

/** Aspect-lock: given the original dimensions and the edited field, return the other. */
export function aspectLockOther(
  origW: number,
  origH: number,
  changed: "w" | "h",
  value: number,
): number {
  if (!origW || !origH || !Number.isFinite(value) || value <= 0) return 1;
  const ratio = origW / origH;
  if (changed === "w") return Math.max(1, Math.round(value / ratio));
  return Math.max(1, Math.round(value * ratio));
}

/** Percent-mode resize: matches the tool's `Math.max(1, Math.round(dim * p))`. */
export function percentResize(orig: number, percent: number): number {
  const p = Math.max(1, Math.min(400, Number.isFinite(percent) ? percent : 100)) / 100;
  return Math.max(1, Math.round((Number.isFinite(orig) ? orig : 0) * p));
}

/** Clamp resize input dims to at least 1px, floor. */
export function clampResizeDim(v: number): number {
  if (!Number.isFinite(v)) return 1;
  return Math.max(1, Math.floor(v));
}

/* ================================================================
 * CROP MATH
 * ================================================================ */

export interface CropRect { x: number; y: number; w: number; h: number }

/** Mirrors clampCrop in crop-image.tsx: keep the rect inside [0,W]x[0,H], min 1x1. */
export function clampCropRect(c: CropRect, W: number, H: number): CropRect {
  const x = Math.max(0, Math.min(W - 1, Math.round(c.x)));
  const y = Math.max(0, Math.min(H - 1, Math.round(c.y)));
  const w = Math.max(1, Math.min(W - x, Math.round(c.w)));
  const h = Math.max(1, Math.min(H - y, Math.round(c.h)));
  return { x, y, w, h };
}

/** Default centered crop of `pct` of the image. */
export function defaultCenteredCrop(W: number, H: number, pct = 0.8): CropRect {
  const w = Math.round(W * pct);
  const h = Math.round(H * pct);
  return clampCropRect({ x: (W - w) / 2, y: (H - h) / 2, w, h }, W, H);
}

/** Largest rect of the given aspect fitting inside 90% of image, centered. */
export function defaultAspectCrop(W: number, H: number, aspect: number): CropRect {
  let w = W * 0.9;
  let h = w / aspect;
  if (h > H * 0.9) {
    h = H * 0.9;
    w = h * aspect;
  }
  return clampCropRect({ x: (W - w) / 2, y: (H - h) / 2, w, h }, W, H);
}

/* ================================================================
 * ROTATE / FLIP TRANSFORMS
 * ================================================================ */

export type Rotation = 0 | 90 | 180 | 270;
export interface Xform { rotation: Rotation; flipH: boolean; flipV: boolean }
export const IDENTITY_XFORM: Xform = { rotation: 0, flipH: false, flipV: false };

export function rotateBy(x: Xform, deg: 90 | 180 | 270): Xform {
  return { ...x, rotation: (((x.rotation + deg) % 360) as Rotation) };
}
export function flipHorizontal(x: Xform): Xform { return { ...x, flipH: !x.flipH }; }
export function flipVertical(x: Xform): Xform { return { ...x, flipV: !x.flipV }; }
export function isIdentity(x: Xform): boolean {
  return x.rotation === 0 && !x.flipH && !x.flipV;
}
/** Output dims after a rotation: 90/270 swap width & height. */
export function outputDims(w: number, h: number, x: Xform): { w: number; h: number } {
  const swap = x.rotation === 90 || x.rotation === 270;
  return swap ? { w: h, h: w } : { w, h };
}

/* ================================================================
 * WATERMARK MATH
 * ================================================================ */

export type PosKey = "tl" | "tc" | "tr" | "cl" | "cc" | "cr" | "bl" | "bc" | "br";

/** Anchor of watermark content inside canvas (mirrors anchorFor in watermark-image.tsx). */
export function watermarkAnchor(
  pos: PosKey,
  cw: number,
  ch: number,
  contentW: number,
  contentH: number,
  margin: number,
): { x: number; y: number } {
  let x = cw / 2;
  let y = ch / 2;
  const row = pos[0];
  const col = pos[1];
  if (row === "t") y = margin + contentH / 2;
  else if (row === "b") y = ch - margin - contentH / 2;
  if (col === "l") x = margin + contentW / 2;
  else if (col === "r") x = cw - margin - contentW / 2;
  return { x, y };
}

/** Proportional font size = pct% of the min image dimension, min 8px. */
export function watermarkFontPx(imgW: number, imgH: number, pct: number): number {
  return Math.max(8, Math.round((pct / 100) * Math.min(imgW, imgH)));
}
/** Proportional margin in pixels = pct% of min dim. */
export function watermarkMarginPx(imgW: number, imgH: number, pct: number): number {
  return Math.round((pct / 100) * Math.min(imgW, imgH));
}
/** Tile step: at least 40px, else content + 8% of min dim. */
export function watermarkTileStep(minDim: number, contentDim: number): number {
  return Math.max(40, contentDim + minDim * 0.08);
}

/* ================================================================
 * MEME WORD WRAP
 * ================================================================ */

/**
 * Wrap `text` into lines using an injected width measurer. Mirrors the
 * meme-generator wrapLines: paragraphs on newlines, greedy word packing,
 * single overlong words go on their own line rather than being dropped.
 */
export function wrapLines(
  text: string,
  maxWidth: number,
  measure: (s: string) => number,
): string[] {
  const out: string[] = [];
  const paragraphs = text.split(/\r?\n/);
  for (const p of paragraphs) {
    if (!p.trim()) { out.push(""); continue; }
    const words = p.split(/\s+/);
    let line = "";
    for (const w of words) {
      const test = line ? line + " " + w : w;
      if (measure(test) <= maxWidth || !line) {
        line = test;
      } else {
        out.push(line);
        line = w;
      }
    }
    if (line) out.push(line);
  }
  return out;
}

/* ================================================================
 * PHOTO EDITOR PIXEL FORMULAS (single-pixel)
 * ================================================================ */

const clamp8 = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v);

export function pxBrightness(c: number, amount: number): number {
  return clamp8(c * (1 + amount / 100));
}
export function pxContrast(c: number, amount: number): number {
  return clamp8((c - 128) * (1 + amount / 100) + 128);
}
/** Grayscale by amount 0..100. Mix each channel toward Rec.709 luminance. */
export function pxGrayscale(r: number, g: number, b: number, amount: number): [number, number, number] {
  const p = amount / 100;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [clamp8(r * (1 - p) + L * p), clamp8(g * (1 - p) + L * p), clamp8(b * (1 - p) + L * p)];
}
/** Sepia by amount 0..100 (W3C sepia matrix mixed with identity). */
export function pxSepia(r: number, g: number, b: number, amount: number): [number, number, number] {
  const p = amount / 100;
  const sr = 0.393 * r + 0.769 * g + 0.189 * b;
  const sg = 0.349 * r + 0.686 * g + 0.168 * b;
  const sb = 0.272 * r + 0.534 * g + 0.131 * b;
  return [clamp8(r * (1 - p) + sr * p), clamp8(g * (1 - p) + sg * p), clamp8(b * (1 - p) + sb * p)];
}
/** Saturation via luminance mix (-100..+100). */
export function pxSaturate(r: number, g: number, b: number, amount: number): [number, number, number] {
  const k = 1 + amount / 100;
  const L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return [clamp8(L + (r - L) * k), clamp8(L + (g - L) * k), clamp8(L + (b - L) * k)];
}
