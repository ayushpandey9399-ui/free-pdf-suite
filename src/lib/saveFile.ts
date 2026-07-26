/**
 * Tiny, dependency-free replacement for file-saver's saveAs().
 *
 * file-saver is a CommonJS module, so a named `saveAs` import breaks
 * server-side rendering of any route that reaches it. Every browser we
 * support handles the anchor + download attribute path, so we use that.
 */
export function saveAs(data: Blob, filename: string): void {
  if (typeof document === "undefined") return;
  const url = URL.createObjectURL(data);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  // Give the browser a moment to start the download before revoking.
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
