import type { PDFDocument } from "pdf-lib";
import { loadPdfLib } from "./lazyLibs";
import { ensurePdfWorker, type PDFDocumentProxy } from "./pdfWorker";

export class PdfPasswordError extends Error {
  constructor(message = "This PDF is password-protected.") {
    super(message);
    this.name = "PdfPasswordError";
  }
}

export function isPdfPasswordError(e: unknown): boolean {
  if (!e || typeof e !== "object") return false;
  const err = e as { name?: string; message?: string; code?: number };
  if (err.name === "PdfPasswordError") return true;
  if (err.name === "EncryptedPDFError") return true;
  if (err.name === "PasswordException") return true;
  // pdfjs PasswordException codes: 1 NEED_PASSWORD, 2 INCORRECT_PASSWORD
  if (typeof err.code === "number" && (err.code === 1 || err.code === 2)) return true;
  const msg = (err.message || "").toLowerCase();
  return msg.includes("encrypted") || msg.includes("password");
}

/** Load a PDF with pdf-lib. Throws PdfPasswordError if encrypted. */
export async function loadPdfLibDoc(
  data: ArrayBuffer | Uint8Array,
): Promise<PDFDocument> {
  const { PDFDocument: Doc, EncryptedPDFError } = await loadPdfLib();
  try {
    return await Doc.load(data, { ignoreEncryption: false });
  } catch (e) {
    if (e instanceof EncryptedPDFError || isPdfPasswordError(e)) {
      throw new PdfPasswordError();
    }
    throw e;
  }
}

/** Load a PDF with pdfjs-dist. Throws PdfPasswordError if encrypted. */
export async function loadPdfJsDoc(data: ArrayBuffer | Uint8Array): Promise<PDFDocumentProxy> {
  const pdfjs = await ensurePdfWorker();
  const task = pdfjs.getDocument({ data });
  // Refuse password prompts — surface as our error instead.
  task.onPassword = () => {
    /* no-op — leaving task.promise to reject with PasswordException */
  };
  try {
    return await task.promise;
  } catch (e) {
    if (isPdfPasswordError(e)) throw new PdfPasswordError();
    throw e;
  }
}

/** Quick check: does this file need a password? */
export async function isPdfPasswordProtected(file: File): Promise<boolean> {
  try {
    await loadPdfLibDoc(await file.arrayBuffer());
    return false;
  } catch (e) {
    if (isPdfPasswordError(e)) return true;
    // Other errors (corrupt file etc.) — let the tool surface them normally.
    return false;
  }
}
