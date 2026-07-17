import { useEffect, useState } from "react";
import { isPdfPasswordProtected } from "@/lib/pdfGuard";

/**
 * Detects password-protected PDFs in the given files.
 * Returns the name of the first protected file (if any) and a stable reset callback
 * the tool can call to clear the file selection.
 */
export function usePdfPasswordCheck(
  files: File[],
  clearFiles: () => void,
): { protectedName: string | null; reset: () => void } {
  const [protectedName, setProtectedName] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProtectedName(null);
    if (!files.length) return;
    (async () => {
      for (const f of files) {
        // Only PDFs; skip images or other accepted types.
        if (f.type && !/pdf/i.test(f.type) && !/\.pdf$/i.test(f.name)) continue;
        const locked = await isPdfPasswordProtected(f);
        if (cancelled) return;
        if (locked) {
          setProtectedName(f.name);
          return;
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [files]);

  return {
    protectedName,
    reset: () => {
      setProtectedName(null);
      clearFiles();
    },
  };
}
