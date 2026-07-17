import { useEffect, useState } from "react";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";

/**
 * Reads a PDF's page count and file size for warning banners.
 * Safely no-ops for password-protected or non-PDF files.
 */
export function usePdfStats(file: File | undefined | null): {
  pageCount: number;
  fileSize: number;
} {
  const [pageCount, setPageCount] = useState(0);
  const [fileSize, setFileSize] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setPageCount(0);
    setFileSize(0);
    if (!file) return;
    setFileSize(file.size);
    (async () => {
      try {
        const doc = await loadPdfJsDoc(await file.arrayBuffer());
        if (!cancelled) setPageCount(doc.numPages);
      } catch (e) {
        if (!isPdfPasswordError(e)) {
          // ignore — tool will surface its own error path
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file]);

  return { pageCount, fileSize };
}
