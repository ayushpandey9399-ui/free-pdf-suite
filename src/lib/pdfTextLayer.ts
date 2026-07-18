import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { classifyPdfFont, type FontFamily } from "./fontMatch";

/**
 * One clickable text SEGMENT (Phase 1.5). A segment is a horizontally
 * contiguous run of text on a single baseline; a table row that visually
 * reads "2 | 2026-27 | Micro" produces THREE segments, not one long line,
 * so each cell can be edited independently.
 *
 * Coordinates are PDF user-space with a top-left origin (y grows downward,
 * matching the on-screen overlay layout used by edit-pdf.tsx).
 *
 * The box (x, y, width, height) is a TIGHT bounding box around the actual
 * glyph run:
 *   left   = x of first glyph's origin
 *   right  = x of last glyph + its advance width
 *   top    = baseline − ascent  (fontSize × 0.80)
 *   bottom = baseline + descent (fontSize × 0.22)
 * Never a fixed-width or full-line rectangle.
 */
export interface EditableLine {
  id: string;
  page: number;
  text: string;
  /** left edge of tight glyph box, PDF units, from left of page. */
  x: number;
  /** top edge of tight glyph box, PDF units, from TOP of page. */
  y: number;
  width: number;
  height: number;
  /** baseline y, PDF units, from TOP of page. */
  baselineY: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  italic: boolean;
  family: FontFamily;
}

const uid = (n: number, i: number, j: number) =>
  `L${n}-${i}-${j}-${Math.random().toString(36).slice(2, 8)}`;

/** Ascent / descent as a fraction of fontSize when the font metric isn't available. */
const ASCENT = 0.80;
const DESCENT = 0.22;

function median(nums: number[]): number {
  if (!nums.length) return 0;
  const s = [...nums].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

/**
 * Extract editable text segments for one page. Non-rotated / non-sheared
 * text only (Phase 1). Two-step grouping:
 *   1. Bucket items by baseline y (existing tolerance).
 *   2. WITHIN each baseline bucket, split into segments wherever the
 *      horizontal gap between adjacent items exceeds
 *      max(1.2 × median gap, 0.6 × fontSize).
 */
export async function extractEditableLines(
  pdfjsDoc: PDFDocumentProxy,
  pageNumber: number,
): Promise<EditableLine[]> {
  const page = await pdfjsDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1, rotation: 0 });
  const pageHeight = viewport.height;

  const content = await page.getTextContent();
  const items = content.items.filter((it): it is TextItem => "str" in it);

  interface Raw {
    str: string;
    x: number;        // left, from LEFT
    baseline: number; // baseline y from TOP
    width: number;    // advance width
    fontSize: number;
    fontName: string;
    bold: boolean;
    italic: boolean;
  }

  const commonObjs = (page as unknown as {
    commonObjs: {
      has: (id: string) => boolean;
      get: (id: string) => { name?: string; bold?: boolean; italic?: boolean } | null;
    };
  }).commonObjs;

  const raws: Raw[] = [];
  for (const it of items) {
    if (!it.str) continue;
    const [a, b, c, d, e, f] = it.transform as [number, number, number, number, number, number];
    if (Math.abs(b) > 0.01 || Math.abs(c) > 0.01) continue; // rotated / sheared
    if (a <= 0 || d <= 0) continue;

    const fontSize = Math.abs(d) || Math.abs(a);
    const baseline = pageHeight - f;
    const width = it.width || (a * it.str.length * 0.5);

    let bold = false;
    let italic = false;
    let realFontName = it.fontName || "";
    try {
      if (commonObjs?.has(it.fontName)) {
        const meta = commonObjs.get(it.fontName);
        if (meta) {
          if (typeof meta.name === "string") realFontName = meta.name;
          if (typeof meta.bold === "boolean") bold = meta.bold;
          if (typeof meta.italic === "boolean") italic = meta.italic;
        }
      }
    } catch { /* font not resolved yet */ }

    raws.push({ str: it.str, x: e, baseline, width, fontSize, fontName: realFontName, bold, italic });
  }

  raws.sort((p, q) => p.baseline - q.baseline || p.x - q.x);

  // Step 1: baseline buckets.
  const buckets: Raw[][] = [];
  for (const r of raws) {
    const last = buckets[buckets.length - 1];
    if (last) {
      const ref = last[last.length - 1];
      const sameLine =
        Math.abs(r.baseline - ref.baseline) <= Math.max(1.5, r.fontSize * 0.25) &&
        Math.abs(r.fontSize - ref.fontSize) <= Math.max(1, ref.fontSize * 0.2);
      if (sameLine) { last.push(r); continue; }
    }
    buckets.push([r]);
  }

  const out: EditableLine[] = [];
  for (let i = 0; i < buckets.length; i++) {
    const bucket = buckets[i];
    // Step 2: split into segments on wide horizontal gaps.
    const gaps: number[] = [];
    for (let k = 1; k < bucket.length; k++) {
      const g = bucket[k].x - (bucket[k - 1].x + bucket[k - 1].width);
      if (g > 0) gaps.push(g);
    }
    const medianGap = gaps.length ? median(gaps) : bucket[0].fontSize * 0.25;

    const segments: Raw[][] = [];
    let cur: Raw[] = [];
    for (let k = 0; k < bucket.length; k++) {
      const r = bucket[k];
      if (cur.length === 0) { cur.push(r); continue; }
      const prev = cur[cur.length - 1];
      const gap = r.x - (prev.x + prev.width);
      const threshold = Math.max(1.2 * medianGap, 0.6 * r.fontSize);
      if (gap > threshold) {
        segments.push(cur);
        cur = [r];
      } else {
        cur.push(r);
      }
    }
    if (cur.length) segments.push(cur);

    for (let j = 0; j < segments.length; j++) {
      const grp = segments[j];

      // Reconstruct text with intra-segment spaces where an item gap looks
      // like whitespace.
      let text = "";
      for (let k = 0; k < grp.length; k++) {
        const g = grp[k];
        if (k > 0) {
          const prev = grp[k - 1];
          const gap = g.x - (prev.x + prev.width);
          if (gap > prev.fontSize * 0.18) text += " ";
        }
        text += g.str;
      }
      text = text.replace(/\s+/g, " ").trim();
      if (!text) continue;

      // Tight bounding box.
      const left = Math.min(...grp.map((g) => g.x));
      const right = Math.max(...grp.map((g) => g.x + g.width));
      const width = Math.max(1, right - left);
      const fontSize = grp[0].fontSize;
      const baselineY = grp[0].baseline;
      const top = baselineY - fontSize * ASCENT;
      const bottom = baselineY + fontSize * DESCENT;
      const height = bottom - top;

      const cls = classifyPdfFont(grp[0].fontName, {
        bold: grp[0].bold,
        italic: grp[0].italic,
      });

      out.push({
        id: uid(pageNumber, i, j),
        page: pageNumber - 1,
        text,
        x: left,
        y: top,
        width,
        height,
        baselineY,
        fontSize,
        fontName: grp[0].fontName,
        bold: cls.bold,
        italic: cls.italic,
        family: cls.family,
      });
    }
  }
  return out;
}
