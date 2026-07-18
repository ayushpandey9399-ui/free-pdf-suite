import { StandardFonts } from "pdf-lib";

/**
 * Classify a PDF font (base PostScript name + optional bold/italic flags
 * from pdfjs) into a family, a metric-compatible open twin we can ship
 * from /fonts, and bold/italic. Matching is WORD-BOUNDARY aware so
 * substrings like "book" inside "Gotham-Book" are treated as a weight
 * token, not as a serif family match.
 *
 * Twins we ship (all Apache-2.0 / OFL, redistributable):
 *   arimo    - metric twin of Arial / Helvetica / Liberation Sans
 *   tinos    - metric twin of Times New Roman / Liberation Serif
 *   cousine  - metric twin of Courier New / Liberation Mono
 *   carlito  - metric twin of Calibri
 *   caladea  - metric twin of Cambria
 *   notosans / notoserif - fallbacks for extended-Unicode coverage
 *
 * Family precedence (most specific first): arimo -> tinos -> carlito
 * -> caladea -> cousine -> notoserif (georgia/garamond/palatino/...) ->
 * notosans (unknown / geometric sans like Gotham/Futura/Proxima).
 *
 * Weight tokens (bold=true): bold, black, heavy, semibold, demibold,
 * extrabold, "-b" as a standalone suffix, w600..w900. Light/thin/w100..w300
 * stay regular (we only ship regular + bold).
 *
 * Style tokens (italic=true): italic, oblique, "-it" suffix.
 *
 * Any explicit {bold,italic} flag passed in (from pdfjs commonObjs metadata)
 * OVERRIDES the name-based inference.
 */
export type FontFamily = "serif" | "sans" | "mono";
export type TwinFamily =
  | "arimo"
  | "tinos"
  | "cousine"
  | "carlito"
  | "caladea"
  | "notosans"
  | "notoserif";

export interface FontClassification {
  family: FontFamily;
  twin: TwinFamily;
  bold: boolean;
  italic: boolean;
  /** Nearest Standard-14 face (kept for the WinAnsi fallback path). */
  pdfLibFont: (typeof StandardFonts)[keyof typeof StandardFonts];
  /** CSS font-family string for the on-screen inline editor. */
  cssFamily: string;
}

/** Strip the 6-uppercase-letter subset prefix ("ABCDEF+Arial-BoldMT" -> "Arial-BoldMT"). */
export function stripSubsetPrefix(name: string): string {
  return (name || "").replace(/^[A-Z]{6}\+/, "");
}

/**
 * Normalise a PostScript font name to a whitespace-delimited lowercase form
 * so \b word-boundary regexes are meaningful. Splits CamelCase and treats
 * -, _, and , as spaces. Trailing "MT" / "PS" (Adobe/Monotype markers) are
 * dropped: "Arial-BoldMT" -> " arial bold ".
 */
function normalize(raw: string): string {
  const s = stripSubsetPrefix(raw)
    .replace(/(MT|PS)$/i, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[-_,]+/g, " ")
    .toLowerCase();
  return " " + s.replace(/\s+/g, " ").trim() + " ";
}

// Family regexes - specific brand names first. Note: "book" is deliberately
// NOT listed as a serif token; it is a weight name (Gotham-Book, etc.).
const RE_ARIMO =
  /\b(arial|helvetica|liberation\s*sans|nimbus\s*sans|segoe|verdana|tahoma|roboto|open\s*sans|arimo)\b/;
const RE_TINOS =
  /\b(times|liberation\s*serif|nimbus\s*roman|tinos)\b/;
const RE_CARLITO = /\b(calibri|carlito)\b/;
const RE_CALADEA = /\b(cambria|caladea)\b/;
const RE_COUSINE =
  /\b(courier|consolas|menlo|monaco|mono|monospace|liberation\s*mono|cousine)\b/;
const RE_NOTOSERIF =
  /\b(georgia|garamond|minion|book\s*antiqua|palatino|caslon|baskerville|serif)\b/;

// Weight regex. Includes numeric weights w600..w900 and the "-b" / "-bd"
// suffixes commonly emitted by embedded subsets. "\bb\b" catches a lone "b"
// token after normalization (e.g. "Arial-B" -> " arial b ").
const RE_BOLD =
  /\b(bold|black|heavy|semibold|demibold|extrabold|extra\s*bold|ultra\s*bold|bd|w[6-9]00)\b|\bb\b/;
// Light weights explicitly stay regular.
const RE_LIGHT = /\b(light|thin|hairline|ultralight|extralight|w[1-3]00)\b/;
const RE_ITALIC = /\b(italic|oblique|it)\b/;

export function classifyPdfFont(
  fontName: string | null | undefined,
  flags?: { bold?: boolean; italic?: boolean },
): FontClassification {
  const norm = normalize(fontName || "");

  let twin: TwinFamily;
  let family: FontFamily;
  if (RE_ARIMO.test(norm)) { twin = "arimo"; family = "sans"; }
  else if (RE_TINOS.test(norm)) { twin = "tinos"; family = "serif"; }
  else if (RE_CARLITO.test(norm)) { twin = "carlito"; family = "sans"; }
  else if (RE_CALADEA.test(norm)) { twin = "caladea"; family = "serif"; }
  else if (RE_COUSINE.test(norm)) { twin = "cousine"; family = "mono"; }
  else if (RE_NOTOSERIF.test(norm)) { twin = "notoserif"; family = "serif"; }
  else { twin = "notosans"; family = "sans"; }

  const boldName = RE_BOLD.test(norm) && !RE_LIGHT.test(norm);
  const italicName = RE_ITALIC.test(norm);
  const bold = flags?.bold ?? boldName;
  const italic = flags?.italic ?? italicName;

  let pdfLibFont: FontClassification["pdfLibFont"];
  let cssFamily: string;
  if (family === "serif") {
    pdfLibFont = bold && italic
      ? StandardFonts.TimesRomanBoldItalic
      : bold ? StandardFonts.TimesRomanBold
      : italic ? StandardFonts.TimesRomanItalic
      : StandardFonts.TimesRoman;
    cssFamily = twin === "caladea"
      ? "'Caladea', Cambria, Georgia, serif"
      : "'Tinos', 'Times New Roman', Times, serif";
  } else if (family === "mono") {
    pdfLibFont = bold && italic
      ? StandardFonts.CourierBoldOblique
      : bold ? StandardFonts.CourierBold
      : italic ? StandardFonts.CourierOblique
      : StandardFonts.Courier;
    cssFamily = "'Cousine', Menlo, Consolas, 'Courier New', monospace";
  } else {
    pdfLibFont = bold && italic
      ? StandardFonts.HelveticaBoldOblique
      : bold ? StandardFonts.HelveticaBold
      : italic ? StandardFonts.HelveticaOblique
      : StandardFonts.Helvetica;
    cssFamily = twin === "carlito"
      ? "'Carlito', Calibri, 'Segoe UI', sans-serif"
      : "'Arimo', Helvetica, Arial, sans-serif";
  }

  return { family, twin, bold, italic, pdfLibFont, cssFamily };
}
