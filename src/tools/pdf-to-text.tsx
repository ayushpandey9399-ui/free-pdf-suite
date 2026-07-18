import { useMemo, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Copy } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SelectedFileCard } from "@/components/SelectedFileCard";
import { Textarea } from "@/components/ui/textarea";
import { loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

type PageText = { page: number; text: string };

export default function PdfToText() {
  const [files, setFiles] = useState<File[]>([]);
  const [pages, setPages] = useState<PageText[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [ran, setRan] = useState(false);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setPages([]); setRan(false); });
  const { pageCount } = usePdfStats(files[0]);

  const fullText = useMemo(
    () => pages.map((p) => `--- Page ${p.page} ---\n${p.text.trim() ? p.text : "[No text found on this page]"}`).join("\n\n"),
    [pages],
  );
  const totalChars = useMemo(() => pages.reduce((sum, p) => sum + p.text.trim().length, 0), [pages]);
  const isEmpty = ran && !loading && pages.length > 0 && totalChars < 20;
  const hasResult = ran && !loading && pages.length > 0 && !isEmpty;

  const resetAll = () => { setFiles([]); setPages([]); setRan(false); setProgress(null); };

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true); setProgress(0); setPages([]); setRan(false);
    try {
      const doc = await loadPdfJsDoc(await file.arrayBuffer());
      const collected: PageText[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((it) => ("str" in it ? it.str : "")).join(" ");
        collected.push({ page: i, text: pageText });
        setProgress((i / doc.numPages) * 100);
      }
      setPages(collected); setRan(true);
      toast.success("Text extracted");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false); setProgress(null);
    }
  };

  if (hasResult) {
    const filename = `${files[0].name.replace(/\.pdf$/i, "")}.txt`;
    const someMissing = pages.some((p) => !p.text.trim());
    return (
      <ToolSuccessScreen
        heading="Text extracted successfully!"
        subheading={`${totalChars.toLocaleString()} characters across ${pages.length} page${pages.length > 1 ? "s" : ""}.`}
        downloadLabel="Download .txt"
        onDownload={() => downloadBlob(new Blob([fullText], { type: "text/plain" }), filename, "text/plain")}
        secondaryAction={{
          label: "Copy to clipboard",
          icon: <Copy className="h-4 w-4" />,
          onClick: async () => { await navigator.clipboard.writeText(fullText); toast.success("Copied to clipboard"); },
        }}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["pdf-to-text"]}
      >
        <div className="space-y-3">
          <Textarea value={fullText} readOnly rows={16} className="font-mono text-sm" />
          {someMissing && (
            <p className="text-xs text-muted-foreground">
              Some pages had no extractable text (marked &ldquo;[No text found on this page]&rdquo;). Those pages may be scanned images and would need OCR.
            </p>
          )}
        </div>
      </ToolSuccessScreen>
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} buttonLabel="Select PDF file" />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];

  return (
    <ToolWorkspace
      title="PDF to Text"
      actionLabel="Extract Text"
      loadingLabel="Extracting…"
      onAction={run}
      loading={loading}
      progress={progress}
      sidebar={
        <>
          <InfoTip>Extracts plain text from every page. Scanned image-only PDFs will need OCR.</InfoTip>
          {isEmpty && (
            <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <p>No text was found, this PDF may be a scanned document.</p>
            </div>
          )}
        </>
      }
    >
      <SelectedFileCard file={file} pageCount={pageCount} onRemove={resetAll} />
    </ToolWorkspace>
  );
}
