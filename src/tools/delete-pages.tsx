import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { PageThumbnails } from "@/components/PageThumbnails";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function DeletePages() {
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; removed: number } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setSelected(new Set()); });
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => {
    setFiles([]);
    setSelected(new Set());
    setResult(null);
  };

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
      const keep = src.getPageIndices().filter((i) => !selected.has(i + 1));
      if (!keep.length) throw new Error("Cannot delete all pages");
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, keep);
      for (const p of pages) out.addPage(p);
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-cleaned.pdf`, removed: selected.size });
      toast.success(`Removed ${selected.size} page(s)`);
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
        heading="Pages removed successfully!"
        subheading={`${result.removed} page(s) removed from your PDF.`}
        downloadLabel="Download Cleaned PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["delete-pages"]}
      />
    );
  }

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={(fs) => { setFiles(fs); setSelected(new Set()); }} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {files[0] && <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />}
          {files[0] && (
            <>
              <p className="mt-6 text-sm text-muted-foreground">Click pages to mark for deletion ({selected.size} selected).</p>
              <PageThumbnails file={files[0]} selected={selected} onToggle={toggle} />
            </>
          )}
          <ActionBar
            onRun={run}
            disabled={!files.length || !selected.size}
            loading={loading}
            label={loading ? "Removing pages…" : `Delete ${selected.size} page(s)`}
          />
        </>
      )}
    </div>
  );
}
