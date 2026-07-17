import * as pdfjs from "pdfjs-dist";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";

let configured = false;
export function ensurePdfWorker() {
  if (configured) return pdfjs;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  configured = true;
  return pdfjs;
}

export type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
