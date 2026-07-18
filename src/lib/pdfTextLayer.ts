import type { PDFDocumentProxy } from "pdfjs-dist";
import type { TextItem } from "pdfjs-dist/types/src/display/api";
import { classifyPdfFont, type FontFamily } from "./fontMatch";

/**
 * One clickable "line" of existing PDF text, in PDF user-space with a
 * top-left origin (y grows downward, matching the on-screen overlay layout
 * used by edit-pdf.tsx).
 */
export interface EditableLine {
  id: string;
  page: number;
  text: string;
  /** left edge, PDF units, from left of page. */
  x: number;
  /** top edge of the line box, PDF units, from TOP of page. */
  y: number;
  width: number;
  height: number;
  /** baseline y, PDF units, from TOP of page (used to render replacement text). */
  baselineY: number;
  fontSize: number;
  fontName: string;
  bold: boolean;
  italic: boolean;
  family: FontFamily;
}

const uid = (n: number, i: number) => `L${n}-${i}-${Math.random().toString(36).slice(2, 8)}`;

/**
 * Extract editable text lines for one page. Non-rotated / non-sheared text
 * only (Phase 1). Groups pdfjs text items into visual lines by baseline y.
 */
export async function extractEditableLines(
  pdfjsDoc: PDFDocumentProxy,
  pageNumber: number,
): Promise<EditableLine[]> {
  const page = await pdfjsDoc.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 1, rotation: 0 });
  const pageHeight = viewport.height;

  // Ensure fonts are resolved so commonObjs lookups return real font metadata.
  const content = await page.getTextContent();
  const items = content.items.filter((it): it is TextItem => "str" in it);

  interface Raw {
    str: string;
    x: number;       // left, from LEFT
    baseline: number; // baseline y from TOP
    top: number;     // top of glyph box, from TOP
    width: number;
    height: number;
    fontSize: number;
    fontName: string;
    bold: boolean;
    italic: boolean;
  }

  const commonObjs = (page as unknown as { commonObjs: { has: (id: string) => boolean; get: (id: string) => { name?: string; bold?: boolean; italic?: boolean } | null } }).commonObjs;

  const raws: Raw[] = [];
  for (const it of items) {
    if (!it.str || !it.str.trim()) continue;
    const [a, b, c, d, e, f] = it.transform as [number, number, number, number, number, number];
    // Reject rotated / sheared runs. Only near-identity orientation allowed.
    if (Math.abs(b) > 0.01 || Math.abs(c) > 0.01) continue;
    if (a <= 0 || d <= 0) continue;

    const fontSize = Math.abs(d) || Math.abs(a);
    const height = Math.max(fontSize, it.height || fontSize);
    // baseline in PDF-native coords is f (from bottom); convert to top-origin:
    const baseline = pageHeight - f;
    const top = baseline - fontSize;
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
    } catch {
      /* commonObjs may throw if font not yet resolved; fall back to name-only */
    }

    raws.push({
      str: it.str,
      x: e,
      baseline,
      top,
      width,
      height,
      fontSize,
      fontName: realFontName,
      bold,
      italic,
    });
  }

  // Sort by baseline then x
  raws.sort((p, q) => p.baseline - q.baseline || p.x - q.x);

  // Group items into lines (baseline within tolerance, same font size bucket).
  const lines: Raw[][] = [];
  for (const r of raws) {
    const last = lines[lines.length - 1];
    if (last) {
      const ref = last[last.length - 1];
      const sameLine =
        Math.abs(r.baseline - ref.baseline) <= Math.max(1.5, r.fontSize * 0.25) &&
        Math.abs(r.fontSize - ref.fontSize) <= Math.max(1, ref.fontSize * 0.2);
      if (sameLine) {
        last.push(r);
        continue;
      }
    }
    lines.push([r]);
  }

  const out: EditableLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const grp = lines[i];
    // Reconstruct string with a space between items whose horizontal gap
    // looks like whitespace.
    let text = "";
    for (let j = 0; j < grp.length; j++) {
      const g = grp[j];
      if (j > 0) {
        const prev = grp[j - 1];
        const gap = g.x - (prev.x + prev.width);
        const avgCh = prev.fontSize * 0.25;
        if (gap > avgCh) text += " ";
      }
      text += g.str;
    }
    text = text.replace(/\s+/g, " ").trim();
    if (!text) continue;

    const x = Math.min(...grp.map((g) => g.x));
    const right = Math.max(...grp.map((g) => g.x + g.width));
    const width = right - x;
    const fontSize = grp[0].fontSize;
    const baselineY = grp[0].baseline;
    const top = Math.min(...grp.map((g) => g.top));
    const height = Math.max(fontSize, baselineY - top + fontSize * 0.25);

    const cls = classifyPdfFont(grp[0].fontName, {
      bold: grp[0].bold,
      italic: grp[0].italic,
    });

    out.push({
      id: uid(pageNumber, i),
      page: pageNumber - 1, // zero-based for the tool
      text,
      x,
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
  return out;
}
