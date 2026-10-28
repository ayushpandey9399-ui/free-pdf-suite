/**
 * Architecture Notes
 * Why: each tool page shows a short "Limits" note, and every point must be
 * true for that tool. Keeping the rules here (one place, by slug) means a
 * tool that changes behavior only needs one edit, and tests can check it.
 */

/** PDF tools that do not take a PDF as input, so the password point does not apply. */
const NO_PDF_INPUT = new Set(["images-to-pdf", "txt-to-pdf", "scan-to-pdf"]);

/** Tools the limits note is not shown on. Unlock handles passwords itself; PDF to Word is server-based and paused. */
const PDF_SKIP = new Set(["pdf-to-word"]);

/** Image tools that reject images above 100 million decoded pixels (guardDecodedSize in the tool code). */
export const PIXEL_LIMIT_IMAGE_TOOLS = new Set([
  "jpg-to-png",
  "png-to-jpg",
  "webp-to-jpg",
  "webp-to-png",
  "jpg-to-webp",
  "png-to-webp",
  "image-resize",
  "crop-image",
  "rotate-image",
  "watermark-image",
  "meme-generator",
  "photo-editor",
]);

export function pdfToolLimits(slug: string): string[] {
  if (PDF_SKIP.has(slug)) return [];
  const out: string[] = [];
  if (!NO_PDF_INPUT.has(slug) && slug !== "unlock-pdf") {
    out.push("If a PDF is password-protected, use Unlock PDF first.");
  }
  out.push(
    "Very large files depend on your device memory and can be slow or fail, especially on phones. Try smaller files or smaller groups.",
  );
  return out;
}

export function imageToolLimits(slug: string): string[] {
  const out = [
    "Very large images depend on your device memory and can be slow or fail, especially on phones. Try fewer or smaller images.",
  ];
  if (PIXEL_LIMIT_IMAGE_TOOLS.has(slug)) {
    out.push("Images above 100 million pixels are rejected.");
  }
  return out;
}
