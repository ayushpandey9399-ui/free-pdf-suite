import { saveAs } from "@/lib/saveFile";
import { loadJSZip } from "@/lib/lazyLibs";

export function downloadBlob(data: Blob | Uint8Array | ArrayBuffer, filename: string, mime = "application/octet-stream") {
  const blob = data instanceof Blob ? data : new Blob([data as BlobPart], { type: mime });
  saveAs(blob, filename);
}

export async function downloadZip(files: { name: string; data: Blob | Uint8Array }[], zipName: string) {
  const JSZip = await loadJSZip();
  const zip = new JSZip();
  for (const f of files) {
    zip.file(f.name, f.data as Blob);
  }
  const blob = await zip.generateAsync({ type: "blob" });
  saveAs(blob, zipName);
}
