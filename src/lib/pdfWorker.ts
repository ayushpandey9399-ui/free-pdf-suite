// Use the "legacy" build so pdfjs-dist includes core-js polyfills for
// Map.prototype.getOrInsertComputed and other ES2025 features that are
// missing in older Chromium, Firefox, and Safari.
import workerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

type PdfJsModule = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

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

let cached: PdfJsModule | null = null;

/**
 * Load pdfjs on demand. The library is ~1.4 MB of JS, so it must never be part
 * of a page's first paint: call this from an action handler or an effect.
 */
export async function ensurePdfWorker(): Promise<PdfJsModule> {
  if (cached) return cached;
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  cached = pdfjs;
  return pdfjs;
}

export type { PDFDocumentProxy, PDFPageProxy } from "pdfjs-dist";
