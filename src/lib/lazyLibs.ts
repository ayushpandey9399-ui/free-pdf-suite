/**
 * Lazy loaders for the heavy PDF / archive libraries.
 *
 * Tool pages should ship only their UI shell on first paint. These helpers
 * pull the big dependencies in on demand (first real action) and the browser
 * caches the module afterwards, so repeat calls are instant.
 *
 * `prefetchPdfLibs()` warms the same chunks during idle time once a tool page
 * is interactive, so real users almost never wait for them.
 */

import type JSZipType from "jszip";

type PdfLibModule = typeof import("pdf-lib");
type JSZipCtor = typeof JSZipType;

export function loadPdfLib(): Promise<PdfLibModule> {
  return import("pdf-lib");
}

export async function loadJSZip(): Promise<JSZipCtor> {
  return (await import("jszip")).default;
}

export function loadPdfJs() {
  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

let warmed = false;

/** Warm the heavy chunks in idle time. Safe to call more than once. */
export function prefetchPdfLibs(): void {
  if (warmed || typeof window === "undefined") return;
  warmed = true;
  const run = () => {
    void loadPdfLib().catch(() => {});
  };
  const idle = (window as unknown as {
    requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
  }).requestIdleCallback;
  if (typeof idle === "function") idle(run, { timeout: 2500 });
  else window.setTimeout(run, 1200);
}
