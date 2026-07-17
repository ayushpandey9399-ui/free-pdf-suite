// Use the "legacy" build so pdfjs-dist includes core-js polyfills for
// Map.prototype.getOrInsertComputed and other ES2025 features that are
// missing in older Chromium, Firefox, and Safari.
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

// Polyfill: pdfjs-dist 6.x uses Map.prototype.getOrInsertComputed (ES2025 stage-3),
// which is missing in Chromium <143, Safari, and older Firefox.
if (typeof Map !== "undefined" && typeof (Map.prototype as unknown as { getOrInsertComputed?: unknown }).getOrInsertComputed !== "function") {
  Object.defineProperty(Map.prototype, "getOrInsertComputed", {
    configurable: true,
    writable: true,
    value: function <K, V>(this: Map<K, V>, key: K, callback: (k: K) => V): V {
      if (this.has(key)) return this.get(key) as V;
      const v = callback(key);
      this.set(key, v);
      return v;
    },
  });
}
if (typeof Map !== "undefined" && typeof (Map.prototype as unknown as { getOrInsert?: unknown }).getOrInsert !== "function") {
  Object.defineProperty(Map.prototype, "getOrInsert", {
    configurable: true,
    writable: true,
    value: function <K, V>(this: Map<K, V>, key: K, value: V): V {
      if (this.has(key)) return this.get(key) as V;
      this.set(key, value);
      return value;
    },
  });
}

let configured = false;
export function ensurePdfWorker() {
  if (configured) return pdfjs;
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  configured = true;
  return pdfjs;
}

export type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
