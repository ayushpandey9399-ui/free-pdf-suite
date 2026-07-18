/**
 * Sample the background color of a rectangular region on a rendered page
 * canvas, and (optionally) infer the foreground/text color inside it.
 *
 * Background sampling: reads a 1px-thick border of pixels around the rect
 * (top/bottom/left/right edges) and returns the *median* R/G/B of those
 * border samples. The border avoids being fooled by the letter strokes that
 * fall inside the rect.
 *
 * Text-color sampling: scans every pixel inside the rect. Any pixel whose
 * distance to the sampled background exceeds a contrast threshold is treated
 * as "ink"; the median of those ink pixels is returned. Falls back to
 * #000000 when confidence is low (fewer than ~2% of pixels look like ink).
 *
 * All coordinates are in *canvas pixels*.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface RgbAndText {
  background: Rgb;
  text: Rgb;
  /** true when we found enough ink pixels to trust the text color. */
  confident: boolean;
}

const clampInt = (n: number, min: number, max: number) =>
  Math.max(min, Math.min(max, Math.round(n)));

function median(values: number[]): number {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
}

function readRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
): ImageData | null {
  if (w <= 0 || h <= 0) return null;
  try {
    return ctx.getImageData(x, y, w, h);
  } catch {
    return null;
  }
}

export function sampleBackgroundColor(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number },
): Rgb {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return { r: 255, g: 255, b: 255 };

  const x = clampInt(rect.x, 0, canvas.width - 1);
  const y = clampInt(rect.y, 0, canvas.height - 1);
  const w = clampInt(rect.w, 1, canvas.width - x);
  const h = clampInt(rect.h, 1, canvas.height - y);

  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];

  // Sample a 1px border JUST OUTSIDE the rect when possible so we look
  // at page background, not the letter strokes.
  const bx = Math.max(0, x - 1);
  const by = Math.max(0, y - 1);
  const bw = Math.min(canvas.width - bx, w + 2);
  const bh = Math.min(canvas.height - by, h + 2);

  const top = readRect(ctx, bx, by, bw, 1);
  const bot = readRect(ctx, bx, by + bh - 1, bw, 1);
  const lef = readRect(ctx, bx, by, 1, bh);
  const rig = readRect(ctx, bx + bw - 1, by, 1, bh);

  for (const strip of [top, bot, lef, rig]) {
    if (!strip) continue;
    const d = strip.data;
    for (let i = 0; i < d.length; i += 4) {
      rs.push(d[i]);
      gs.push(d[i + 1]);
      bs.push(d[i + 2]);
    }
  }

  if (!rs.length) return { r: 255, g: 255, b: 255 };
  return { r: median(rs), g: median(gs), b: median(bs) };
}

/** Squared distance between two RGB triples (0-255 space). */
function dist2(a: Rgb, r: number, g: number, b: number): number {
  const dr = a.r - r;
  const dg = a.g - g;
  const db = a.b - b;
  return dr * dr + dg * dg + db * db;
}

export function sampleBackgroundAndTextColor(
  canvas: HTMLCanvasElement,
  rect: { x: number; y: number; w: number; h: number },
): RgbAndText {
  const background = sampleBackgroundColor(canvas, rect);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { background, text: { r: 0, g: 0, b: 0 }, confident: false };
  }

  const x = clampInt(rect.x, 0, canvas.width - 1);
  const y = clampInt(rect.y, 0, canvas.height - 1);
  const w = clampInt(rect.w, 1, canvas.width - x);
  const h = clampInt(rect.h, 1, canvas.height - y);

  const img = readRect(ctx, x, y, w, h);
  if (!img) {
    return { background, text: { r: 0, g: 0, b: 0 }, confident: false };
  }

  // Threshold: at least ~60 units of RGB distance from background counts as ink.
  // (Roughly one channel differing by 60, or two channels by ~42.)
  const THRESHOLD_SQ = 60 * 60;
  const rs: number[] = [];
  const gs: number[] = [];
  const bs: number[] = [];
  const data = img.data;
  const total = data.length / 4;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (dist2(background, r, g, b) >= THRESHOLD_SQ) {
      rs.push(r);
      gs.push(g);
      bs.push(b);
    }
  }

  const confident = rs.length >= Math.max(20, total * 0.02);
  if (!confident) {
    return { background, text: { r: 0, g: 0, b: 0 }, confident: false };
  }
  return {
    background,
    text: { r: median(rs), g: median(gs), b: median(bs) },
    confident: true,
  };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => clampInt(n, 0, 255).toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`;
}

export function hexToRgb255(hex: string): Rgb {
  const c = hex.replace("#", "");
  const s = c.length === 3 ? c.split("").map((x) => x + x).join("") : c;
  const n = parseInt(s, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
