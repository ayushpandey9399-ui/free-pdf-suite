import { useEffect, useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { SortableThumbGrid, type ThumbItem } from "@/components/SortableThumbGrid";
import { renderPdfThumbnails } from "@/lib/thumbnail";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";

export default function ReorderPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ThumbItem[]>([]);
  const [rendering, setRendering] = useState(false);
  const [loading, setLoading] = useState(false);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setItems([]); });

  useEffect(() => {
    const file = files[0];
    if (!file) {
      setItems([]);
      return;
    }
    let cancelled = false;
    setRendering(true);
    renderPdfThumbnails(file)
      .then((thumbs) => {
        if (cancelled) return;
        setItems(thumbs.map((src, i) => ({ id: `p-${i + 1}`, src, label: `Page ${i + 1}` })));
      })
      .catch((e) => {
        if (!isPdfPasswordError(e)) toast.error(`Render failed: ${(e as Error).message}`);
      })
      .finally(() => !cancelled && setRendering(false));
    return () => {
      cancelled = true;
    };
  }, [files]);

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const order = items.map((it) => parseInt(it.id.replace("p-", ""), 10) - 1);
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, order);
      for (const p of pages) out.addPage(p);
      downloadBlob(await out.save(), `${file.name.replace(/\.pdf$/i, "")}-reordered.pdf`, "application/pdf");
      toast.success("Reordered PDF downloaded");
    } catch (e) {
      if (isPdfPasswordError(e)) toast.error("PDF is password-protected");
      else toast.error(`Failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <FileDropzone accept="application/pdf" files={files} onFilesChange={setFiles} />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {rendering && (
            <div className="mt-6 flex items-center justify-center py-10 text-muted-foreground text-sm">
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Rendering pages…
            </div>
          )}
          {items.length > 0 && (
            <>
              <p className="mt-6 text-sm text-muted-foreground">Drag the ⋮⋮ handle on each thumbnail to reorder.</p>
              <div className="mt-3">
                <SortableThumbGrid items={items} onReorder={setItems} />
              </div>
            </>
          )}
          <ActionBar onRun={run} disabled={!items.length} loading={loading} label="Export Reordered PDF" />
        </>
      )}
    </div>
  );
}
