import { StandardFonts } from "pdf-lib";

/**
 * Classify a PDF font (by name / style flags from pdfjs) into a family +
 * bold/italic + the closest pdf-lib standard font we can embed.
 *
 * Classification table (substring, case-insensitive):
 *   serif : /times|serif|georgia|garamond|cambria|caslon|palatino|book/
 *   mono  : /mono|courier|consolas|menlo|typewriter|source ?code/
 *   sans  : (default)
 *   bold  : /bold|black|heavy|semibold|demibold|extrabold|-b(?![a-z])/
 *   italic: /italic|oblique|-it(?![a-z])/
 *
 * Explicit style flags from pdfjs (bold/italic) win over name inference.
 */
export type FontFamily = "serif" | "sans" | "mono";

export interface FontClassification {
  family: FontFamily;
  bold: boolean;
  italic: boolean;
  pdfLibFont: (typeof StandardFonts)[keyof typeof StandardFonts];
  /** CSS font-family string for the on-screen inline editor. */
  cssFamily: string;
}

const SERIF_RE = /times|serif|georgia|garamond|cambria|caslon|palatino|book/i;
const MONO_RE = /mono|courier|consolas|menlo|typewriter|source ?code/i;
const BOLD_RE = /bold|black|heavy|semibold|demibold|extrabold|-b(?![a-z])/i;
const ITALIC_RE = /italic|oblique|-it(?![a-z])/i;

export function classifyPdfFont(
  fontName: string | null | undefined,
  flags?: { bold?: boolean; italic?: boolean },
): FontClassification {
  const name = (fontName || "").toString();
  const family: FontFamily = MONO_RE.test(name)
    ? "mono"
    : SERIF_RE.test(name)
      ? "serif"
      : "sans";
  const bold = flags?.bold ?? BOLD_RE.test(name);
  const italic = flags?.italic ?? ITALIC_RE.test(name);

  let pdfLibFont: FontClassification["pdfLibFont"];
  let cssFamily: string;
  if (family === "serif") {
    pdfLibFont = bold && italic
      ? StandardFonts.TimesRomanBoldItalic
      : bold
        ? StandardFonts.TimesRomanBold
        : italic
          ? StandardFonts.TimesRomanItalic
          : StandardFonts.TimesRoman;
    cssFamily = "'Times New Roman', Times, serif";
  } else if (family === "mono") {
    pdfLibFont = bold && italic
      ? StandardFonts.CourierBoldOblique
      : bold
        ? StandardFonts.CourierBold
        : italic
          ? StandardFonts.CourierOblique
          : StandardFonts.Courier;
    cssFamily = "Menlo, Consolas, 'Courier New', monospace";
  } else {
    pdfLibFont = bold && italic
      ? StandardFonts.HelveticaBoldOblique
      : bold
        ? StandardFonts.HelveticaBold
        : italic
          ? StandardFonts.HelveticaOblique
          : StandardFonts.Helvetica;
    cssFamily = "Helvetica, Arial, sans-serif";
  }

  return { family, bold, italic, pdfLibFont, cssFamily };
}
