/**
 * scanOcr.ts | Client-side OCR helper for Scan to PDF.
 *
 * Uses tesseract.js with 100% self-hosted assets under /ocr/. The worker,
 * WASM core, and eng.traineddata.gz all come from our own origin. Nothing
 * is uploaded, nothing is fetched from a CDN.
 *
 * One shared worker is created lazily and reused across every page of a
 * single export, then terminated when the export completes, is cancelled,
 * or throws.
 */
import { createWorker, type Worker as TesseractWorker } from "tesseract.js";

export const OCR_BASE = "/ocr";

export interface OcrWord {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number };
}

let workerPromise: Promise<TesseractWorker> | null = null;

/** Create (or return) the shared worker. English only in this pack. */
export async function getOcrWorker(): Promise<TesseractWorker> {
  if (!workerPromise) {
    workerPromise = createWorker("eng", 1, {
      workerPath: `${OCR_BASE}/worker.min.js`,
      corePath: OCR_BASE, // tesseract picks the best -lstm variant from this dir
      langPath: OCR_BASE,
      gzip: true,
      cacheMethod: "none", // rely on HTTP cache, don't touch IndexedDB
      workerBlobURL: false,
    }).catch((err) => {
      workerPromise = null;
      throw err;
    });
  }
  return workerPromise;
}

/** Terminate + reset the shared worker. Safe to call multiple times. */
export async function terminateOcrWorker(): Promise<void> {
  const p = workerPromise;
  workerPromise = null;
  if (!p) return;
  try {
    const w = await p;
    await w.terminate();
  } catch {
    /* ignore | worker never came up */
  }
}

/**
 * OCR a single canvas. Returns filtered word-level results with source
 * coordinates in canvas pixels.
 */
export async function ocrCanvas(canvas: HTMLCanvasElement): Promise<OcrWord[]> {
  const worker = await getOcrWorker();
  const { data } = await worker.recognize(canvas, {}, { blocks: true });
  const out: OcrWord[] = [];
  const blocks = (data as unknown as { blocks?: Array<{ paragraphs?: Array<{ lines?: Array<{ words?: Array<{ text?: string; confidence?: number; bbox?: { x0: number; y0: number; x1: number; y1: number } }> }> }> }> }).blocks;
  if (!blocks) return out;
  for (const b of blocks) {
    for (const p of b.paragraphs ?? []) {
      for (const l of p.lines ?? []) {
        for (const w of l.words ?? []) {
          const txt = (w.text ?? "").trim();
          const conf = w.confidence ?? 0;
          const bb = w.bbox;
          if (!txt || conf < 40 || !bb) continue;
          if (bb.x1 <= bb.x0 || bb.y1 <= bb.y0) continue;
          out.push({ text: txt, confidence: conf, bbox: bb });
        }
      }
    }
  }
  return out;
}

/** Verify the runtime assets can be reached (used by the first-time enable). */
export async function checkOcrAssets(): Promise<boolean> {
  try {
    const r = await fetch(`${OCR_BASE}/worker.min.js`, { method: "HEAD" });
    return r.ok;
  } catch {
    return false;
  }
}
