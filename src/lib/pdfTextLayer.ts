import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { classifyPdfFont, stripSubsetPrefix, type FontFamily, type TwinFamily } from "./fontMatch";
import { hasVerticalRulingInGap } from "./canvasSample";

export interface RulingCanvas {
  canvas: HTMLCanvasElement;
  /** canvas pixels per PDF unit. */
  scale: number;
}

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
  /** Base PostScript name with any "ABCDEF+" subset prefix stripped. */
  fontName: string;
  bold: boolean;
  italic: boolean;
  family: FontFamily;
  /** Metric-compatible open twin chosen for this run (Phase A). */
  twin: TwinFamily;
  /**
   * Column-alignment inference (Fix B5). When multiple segments on
   * different baselines share a near-equal right/left/center edge, they
   * form a column and inherit that alignment. Falls back to `undefined`
   * (i.e. caller decides) when no column pattern is found.
   */
  columnAlign?: "left" | "center" | "right";
  /**
   * Fix B-3 #9: for lines that participate in a column cluster (≥3
   * members) this is the column's anchor edge value in PDF units, so a
   * right/center-aligned edit stays pinned to the shared edge even when
   * the replacement text changes width.
   *   type "right"  → value is the right edge x (median)
   *   type "center" → value is the center x (median)
   *   type "left"   → value is the left edge x (median)
   */
  columnAnchor?: { type: "left" | "center" | "right"; value: number };
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
  ruling?: RulingCanvas | null,
): Promise<EditableLine[]> {
  const page = await pdfjsDoc.getPage(pageNumber);
  // Fix B-2 #2: extract in DISPLAY space (rotation applied) so every UI
  // coordinate is consistent with the rendered preview. Composing the
  // viewport transform with each item's raw transform makes segmentation
  // and cover-rect math identical across /Rotate 0/90/180/270 pages.
  const rotation = (page as unknown as { rotate: number }).rotate ?? 0;
  const viewport = page.getViewport({ scale: 1, rotation });
  const vt = viewport.transform as [number, number, number, number, number, number];

  const content = await page.getTextContent();
  const items = content.items.filter((it): it is TextItem => "str" in it);

  interface Raw {
    str: string;
    x: number;        // display top-origin left
    baseline: number; // display top-origin baseline y
    width: number;    // advance width (display units)
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
  const [va, vb, vc, vd, ve, vf] = vt;
  for (const it of items) {
    if (!it.str) continue;
    const [ta, tb, tc, td, te, tf] = it.transform as [number, number, number, number, number, number];
    // Compose viewport * item = display-space transform. Upright display
    // text has cb ≈ 0, cc ≈ 0, ca > 0 (advances right), cd < 0 (glyph
    // ascent goes UP in top-origin coords). Anything else is rotated /
    // vertical / sheared and we skip it — same policy as before, just
    // now measured in display space instead of unrotated content space.
    const ca = va * ta + vc * tb;
    const cb = vb * ta + vd * tb;
    const cc = va * tc + vc * td;
    const cd = vb * tc + vd * td;
    const ce = va * te + vc * tf + ve;
    const cf = vb * te + vd * tf + vf;
    if (Math.abs(cb) > 0.01 || Math.abs(cc) > 0.01) continue;
    if (ca <= 0) continue;
    const fontSize = Math.abs(cd) || Math.abs(ca);
    if (fontSize <= 0) continue;

    const baseline = cf;
    const width = it.width || (ca * it.str.length * 0.5);

    let bold = false;
    let italic = false;
    let realFontName = it.fontName || "";
    try {
      if (commonObjs?.has(it.fontName)) {
        const meta = commonObjs.get(it.fontName);
        if (meta) {
          if (typeof meta.name === "string") realFontName = stripSubsetPrefix(meta.name);
          if (typeof meta.bold === "boolean") bold = meta.bold;
          if (typeof meta.italic === "boolean") italic = meta.italic;
        }
      }
    } catch { /* font not resolved yet */ }

    raws.push({ str: it.str, x: ce, baseline, width, fontSize, fontName: realFontName, bold, italic });
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

    // Step 2: split into segments. Two kinds of breaks:
    //   (a) an item whose str is only whitespace AND whose advance width
    //       exceeds the per-line break threshold — pdfjs emits these as
    //       "bridge" items across table columns.
    //   (b) a positive gap between adjacent items exceeding the same
    //       threshold (some PDFs omit the bridge item entirely).
    // Threshold per spec: max(1.2 × median space-width, 0.6 × fontSize).
    const spaceWidths: number[] = [];
    for (const r of bucket) {
      if (/^\s+$/.test(r.str)) spaceWidths.push(r.width);
    }
    const gaps: number[] = [];
    for (let k = 1; k < bucket.length; k++) {
      const g = bucket[k].x - (bucket[k - 1].x + bucket[k - 1].width);
      if (g > 0) gaps.push(g);
    }
    const fs0 = bucket[0].fontSize;
    // Proxy for a normal single-word-space glyph. pdfjs collapses inter-cell
    // whitespace into one wide bridge item, so measured medians overshoot;
    // cap at ~0.35em so `1.2 × spaceRef` stays below the 0.6em fallback and
    // any bridge / large gap trips the threshold.
    const capped = (n: number) => Math.min(n, fs0 * 0.35);
    const spaceRef = spaceWidths.length
      ? capped(median(spaceWidths))
      : gaps.length
        ? capped(median(gaps))
        : fs0 * 0.28;
    const threshold = Math.max(1.2 * spaceRef, 0.6 * fs0);


    const segments: Raw[][] = [];
    let cur: Raw[] = [];
    const push = () => { if (cur.length) { segments.push(cur); cur = []; } };
    // Also split at any horizontal gap >= 1.0 x fontSize regardless of the
    // computed threshold - this catches visually-separated borderless labels
    // (e.g. "SINGH ASSOCIATES" and "NAME OF UNIT(S)") that pdfjs emits
    // without a bridge whitespace item.
    const hardSplit = 1.0 * fs0;
    for (let k = 0; k < bucket.length; k++) {
      const r = bucket[k];
      const isSpace = /^\s+$/.test(r.str);
      if (isSpace && r.width > threshold) {
        push();
        continue;
      }
      if (cur.length) {
        const prev = cur[cur.length - 1];
        const gap = r.x - (prev.x + prev.width);
        let split = gap > threshold || gap >= hardSplit;
        // Rule: any detectable vertical ruling between prev and r means
        // they live in different table cells - force a split regardless
        // of gap size. Only inspect real positive gaps.
        if (!split && ruling && gap > 0.5) {
          const s = ruling.scale;
          const yTop = (Math.min(prev.baseline, r.baseline) - fs0 * ASCENT) * s;
          const yBot = (Math.max(prev.baseline, r.baseline) + fs0 * DESCENT) * s;
          const xL = (prev.x + prev.width) * s;
          const xR = r.x * s;
          if (xR - xL >= 1 && hasVerticalRulingInGap(ruling.canvas, xL, xR, yTop, yBot)) {
            split = true;
          }
        }
        if (split) push();
      }
      cur.push(r);
    }
    push();



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
        twin: cls.twin,
      });
    }
  }

  // Vertical de-overlap. Tight boxes (fontSize × 1.02 tall) can collide
  // when the source PDF uses tight leading. For every pair on DIFFERENT
  // baselines whose vertical extents overlap horizontally-adjacent regions,
  // shrink both toward their own baselines so a ≥0.5pt gutter remains.
  // This guarantees clicks always hit the intended line and cover rects
  // never paint over a neighbour's ink.
  const GUTTER = 0.5;
  out.sort((p, q) => p.baselineY - q.baselineY || p.x - q.x);
  for (let i = 0; i < out.length; i++) {
    const A = out[i];
    for (let j = i + 1; j < out.length; j++) {
      const B = out[j];
      if (B.baselineY - A.baselineY > 60) break;
      if (B.baselineY === A.baselineY) continue;
      // horizontal overlap?
      if (A.x + A.width <= B.x || B.x + B.width <= A.x) continue;
      const aBot = A.y + A.height;
      const bTop = B.y;
      if (aBot <= bTop - GUTTER) continue;
      const mid = (aBot + bTop) / 2;
      // Top box (A): pull bottom up, but never above its baseline.
      const newABot = Math.max(A.baselineY, Math.min(aBot, mid - GUTTER / 2));
      A.height = Math.max(1, newABot - A.y);
      // Bottom box (B): push top down, but keep some ascent above baseline.
      const minBTop = B.baselineY - Math.max(1, B.fontSize * 0.2);
      const newBTop = Math.min(minBTop, Math.max(bTop, mid + GUTTER / 2));
      const dy = newBTop - B.y;
      if (dy > 0) {
        B.y = newBTop;
        B.height = Math.max(1, B.height - dy);
      }
    }
  }

  // ---- Fix B5 + Fix B-3 #9: column-alignment inference. Cluster
  // segments across baselines whose right / left / center edges are
  // near-equal (within ~2pt); ≥3 members marks a column. In addition to
  // choosing an alignment we also record the cluster's median edge as
  // `columnAnchor` so right/center-aligned exports can anchor to the
  // shared edge instead of drifting with per-line width.
  const TOL = 2; // PDF units
  const bucket = (v: number) => Math.round(v / TOL);
  const rMap = new Map<number, number[]>();
  const lMap = new Map<number, number[]>();
  const cMap = new Map<number, number[]>();
  const push = (m: Map<number, number[]>, k: number, v: number) => {
    const arr = m.get(k);
    if (arr) arr.push(v);
    else m.set(k, [v]);
  };
  for (const ln of out) {
    push(rMap, bucket(ln.x + ln.width), ln.x + ln.width);
    push(lMap, bucket(ln.x), ln.x);
    push(cMap, bucket(ln.x + ln.width / 2), ln.x + ln.width / 2);
  }
  for (const ln of out) {
    const rArr = rMap.get(bucket(ln.x + ln.width)) ?? [];
    const lArr = lMap.get(bucket(ln.x)) ?? [];
    const cArr = cMap.get(bucket(ln.x + ln.width / 2)) ?? [];
    const rN = rArr.length, lN = lArr.length, cN = cArr.length;
    if (rN >= 3 && rN >= lN && rN >= cN) {
      ln.columnAlign = "right";
      ln.columnAnchor = { type: "right", value: median(rArr) };
    } else if (cN >= 3 && cN > lN) {
      ln.columnAlign = "center";
      ln.columnAnchor = { type: "center", value: median(cArr) };
    } else if (lN >= 3) {
      ln.columnAlign = "left";
      ln.columnAnchor = { type: "left", value: median(lArr) };
    }
  }

  // ---- Fix B-3 #8: baseline-bucket snap. Group lines whose baselines
  // are within max(1.5pt, 0.3 × fontSize) into one visual row and snap
  // each member's baselineY to the row median. Segmentation from A.2
  // is preserved (we never merge lines); only baselineY (and the derived
  // top y) are aligned so edited text sits on one clean baseline.
  {
    const sorted = [...out].sort((a, b) => a.baselineY - b.baselineY);
    const rows: EditableLine[][] = [];
    for (const ln of sorted) {
      const last = rows[rows.length - 1];
      if (last) {
        const ref = last[0];
        const tol = Math.max(1.5, Math.max(ln.fontSize, ref.fontSize) * 0.3);
        if (Math.abs(ln.baselineY - ref.baselineY) <= tol) { last.push(ln); continue; }
      }
      rows.push([ln]);
    }
    for (const row of rows) {
      if (row.length < 2) continue;
      const med = median(row.map((l) => l.baselineY));
      for (const ln of row) {
        const dy = med - ln.baselineY;
        if (dy === 0) continue;
        ln.baselineY = med;
        ln.y += dy;
      }
    }
  }

  return out;
}

