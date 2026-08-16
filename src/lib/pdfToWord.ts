/**
 * Pure helpers for the PDF to Word tool.
 *
 * This is the only server side tool on the site, so the validation and the
 * error wording live here as plain functions with no DOM and no network,
 * which keeps them easy to unit test.
 */

export const PDF_TO_WORD_ENDPOINT = "https://api.pdftoolconverteronline.com/v1/pdf-to-word";

/** Server side limit for this tool, 25 MB. */
export const PDF_TO_WORD_MAX_BYTES = 25 * 1024 * 1024;

export const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

/** Shown when the client side timeout fires. */
export const PDF_TO_WORD_TIMEOUT_MESSAGE =
  "This file is taking too long. Please try a smaller PDF.";

/** Client side request timeout, 150 seconds. */
export const PDF_TO_WORD_TIMEOUT_MS = 150_000;

/** Builds the multipart body for the conversion request. */
export function buildPdfToWordForm(file: File): FormData {
  const form = new FormData();
  form.append("file", file);
  return form;
}

export type ValidationResult = { ok: true } | { ok: false; message: string };

/** The first five bytes of every valid PDF spell "%PDF-". */
export function hasPdfMagic(header: Uint8Array): boolean {
  const magic = [0x25, 0x50, 0x44, 0x46, 0x2d];
  if (header.length < magic.length) return false;
  return magic.every((b, i) => header[i] === b);
}

/**
 * Client side gate that runs before any upload starts.
 * `header` is the first five bytes of the file.
 */
export function validatePdfSelection(input: {
  name: string;
  size: number;
  header: Uint8Array;
}): ValidationResult {
  const { name, size, header } = input;

  if (size === 0) {
    return { ok: false, message: "That file is empty. Please pick a PDF with content in it." };
  }
  if (!/\.pdf$/i.test(name)) {
    return { ok: false, message: "Please select a PDF file. Only .pdf files can be converted to Word." };
  }
  if (size > PDF_TO_WORD_MAX_BYTES) {
    return { ok: false, message: "That file is over our 25 MB limit for this tool." };
  }
  if (!hasPdfMagic(header)) {
    return { ok: false, message: "That file does not look like a real PDF, so we did not upload it." };
  }
  return { ok: true };
}

/**
 * Maps an HTTP status (or a network failure) to friendly English.
 * Raw JSON and stack traces are never shown to the user.
 */
export function messageForStatus(status: number | "network"): string {
  switch (status) {
    case 413:
      return "This file is larger than 25 MB.";
    case 422:
      return "We could not convert this PDF. It may be scanned, protected or damaged.";
    case 429:
      return "Too many requests. Please wait a minute and try again.";
    case 503:
      return "Our server is busy right now. Please try again in a minute.";
    default:
      return "Something went wrong. Please try again.";
  }
}

/** True when the error state should offer a link to the Unlock PDF tool. */
export function shouldOfferUnlockLink(status: number | "network"): boolean {
  return status === 422;
}

/** foo.pdf becomes foo.docx, anything else just gains .docx. */
export function docxNameFor(pdfName: string): string {
  const base = pdfName.replace(/\.pdf$/i, "");
  return `${base || "document"}.docx`;
}
