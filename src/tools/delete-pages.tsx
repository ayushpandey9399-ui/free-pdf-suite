import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { PageThumbnails } from "@/components/PageThumbnails";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";

export default function DeletePages() {
  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setSelected(new Set()); });

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
      downloadBlob(await out.save(), `${file.name.replace(/\.pdf$/i, "")}-cleaned.pdf`, "application/pdf");
      toast.success(`Removed ${selected.size} page(s)`);
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={(fs) => { setFiles(fs); setSelected(new Set()); }} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {files[0] && (
            <>
              <p className="mt-6 text-sm text-muted-foreground">Click pages to mark for deletion ({selected.size} selected).</p>
              <PageThumbnails file={files[0]} selected={selected} onToggle={toggle} />
            </>
          )}
          <ActionBar onRun={run} disabled={!files.length || !selected.size} loading={loading} label={`Delete ${selected.size} page(s)`} />
        </>
      )}
    </div>
  );
}
