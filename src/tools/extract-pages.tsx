import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { PageThumbnails } from "@/components/PageThumbnails";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function ExtractPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setSelected(new Set()); });
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => { setFiles([]); setSelected(new Set()); setResult(null); };
  const toggle = (p: number) => {
    const s = new Set(selected);
    s.has(p) ? s.delete(p) : s.add(p);
    setSelected(s);
  };

  const run = async () => {
    const file = files[0];
    if (!file || !selected.size) return;
    setLoading(true);
    try {
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const indices = [...selected].sort((a, b) => a - b).map((p) => p - 1);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, indices);
      for (const p of pages) out.addPage(p);
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-extracted.pdf`, count: selected.size });
      toast.success(`Extracted ${selected.size} page(s)`);
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Pages extracted successfully!"
        subheading={`${result.count} page(s) saved to a new PDF.`}
        downloadLabel="Download Extracted PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["extract-pages"]}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        files={files}
        onFilesChange={(fs) => { setFiles(fs); setSelected(new Set()); }}
        buttonLabel="Select PDF file"
      />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  const file = files[0];

  return (
    <ToolWorkspace
      title="Extract pages"
      actionLabel={selected.size ? `Extract ${selected.size} page${selected.size === 1 ? "" : "s"}` : "Extract pages"}
      loadingLabel="Extracting pages…"
      onAction={run}
      actionDisabled={!selected.size}
      loading={loading}
      sidebar={
        <>
          <InfoTip>Click page thumbnails to include them in the new PDF.</InfoTip>
          <div
            className="rounded-lg p-3 text-[13px]"
            style={{ backgroundColor: "#fbf6f5", color: "#33333c" }}
          >
            <p className="font-semibold">{selected.size} of {pageCount || "—"} selected</p>
            <p className="mt-0.5 text-[12px]" style={{ color: "#7a7a86" }}>{file.name}</p>
          </div>
          <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />
        </>
      }
    >
      <PageThumbnails file={file} selected={selected} onToggle={toggle} />
    </ToolWorkspace>
  );
}
