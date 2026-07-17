import { loadPdfJsDoc } from "./pdfGuard";

export async function renderPdfThumbnails(file: File, maxWidth = 160): Promise<string[]> {
  const buf = await file.arrayBuffer();
  const doc = await loadPdfJsDoc(buf);
  const out: string[] = [];
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = maxWidth / vp1.width;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
    out.push(canvas.toDataURL("image/png"));
  }
  return out;
}
