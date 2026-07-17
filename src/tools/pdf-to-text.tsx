import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Download } from "lucide-react";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { downloadBlob } from "@/lib/download";

type PageText = { page: number; text: string };

export default function PdfToText() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageText[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => {
    setFiles([]);
    setPages([]);
    setRan(false);
  });

  const fullText = useMemo(
    () =>
      pages
        .map((p) =>
          `--- Page ${p.page} ---\n${p.text.trim() ? p.text : "[No text found on this page]"}`,
        )
        .join("\n\n"),
    [pages],
  );

  const totalChars = useMemo(
    () => pages.reduce((sum, p) => sum + p.text.trim().length, 0),
    [pages],
  );
  const isEmpty = ran && !loading && pages.length > 0 && totalChars < 20;

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    setProgress(0);
    setPages([]);
    setRan(false);
    try {
      const doc = await loadPdfJsDoc(await file.arrayBuffer());
      const collected: PageText[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items
          .map((it) => ("str" in it ? it.str : ""))
          .join(" ");
        collected.push({ page: i, text: pageText });
        setProgress((i / doc.numPages) * 100);
      }
      setPages(collected);
      setRan(true);
      toast.success("Text extracted");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
      setProgress(null);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          <ActionBar
            onRun={run}
            disabled={!files.length}
            loading={loading}
            progress={progress}
            label="Extract Text"
          />
          {isEmpty && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
              <p>
                No text was found in this PDF. It may be a scanned document
                (images only) which requires OCR to extract text — this tool
                doesn&apos;t currently support OCR.
              </p>
            </div>
          )}
          {!isEmpty && pages.length > 0 && (
            <div className="mt-6 space-y-3">
              <Textarea
                value={fullText}
                readOnly
                rows={16}
                className="font-mono text-sm"
              />
              {pages.some((p) => !p.text.trim()) && (
                <p className="text-xs text-muted-foreground">
                  Some pages had no extractable text (marked
                  &ldquo;[No text found on this page]&rdquo;). Those pages may
                  be scanned images and would need OCR.
                </p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(fullText);
                    toast.success("Copied to clipboard");
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" /> Copy
                </Button>
                <Button
                  onClick={() =>
                    downloadBlob(
                      new Blob([fullText], { type: "text/plain" }),
                      `${files[0].name.replace(/\.pdf$/i, "")}.txt`,
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" /> Download .txt
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
