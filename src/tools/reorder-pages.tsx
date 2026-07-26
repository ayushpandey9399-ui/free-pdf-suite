import { useEffect, useState } from "react";
import { loadPdfLib } from "@/lib/lazyLibs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { SortableThumbGrid, type ThumbItem } from "@/components/SortableThumbGrid";
import { renderPdfThumbnails } from "@/lib/thumbnail";
import { downloadBlob } from "@/lib/download";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { LargeFileWarning } from "@/components/LargeFileWarning";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { usePdfStats } from "@/hooks/usePdfStats";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function ReorderPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [items, setItems] = useState<ThumbItem[]>([]);
  const [rendering, setRendering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string } | null>(null);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => { setFiles([]); setItems([]); });
  const { pageCount, fileSize } = usePdfStats(files[0]);

  const resetAll = () => { setFiles([]); setItems([]); setResult(null); };

  useEffect(() => {
    const file = files[0];
    if (!file) { setItems([]); return; }
    let cancelled = false;
    setRendering(true);
    renderPdfThumbnails(file)
      .then((thumbs) => {
        if (cancelled) return;
        setItems(thumbs.map((src, i) => ({ id: `p-${i + 1}`, src, label: `Page ${i + 1}` })));
      })
      .catch((e) => { if (!isPdfPasswordError(e)) toast.error(`Render failed: ${(e as Error).message}`); })
      .finally(() => !cancelled && setRendering(false));
    return () => { cancelled = true; };
  }, [files]);

  const run = async () => {
    const file = files[0];
    if (!file) return;
    setLoading(true);
    try {
      const src = await loadPdfLibDoc(await file.arrayBuffer());
      const order = items.map((it) => parseInt(it.id.replace("p-", ""), 10) - 1);
      const { PDFDocument } = await loadPdfLib();
      const out = await PDFDocument.create();
      const pages = await out.copyPages(src, order);
      for (const p of pages) out.addPage(p);
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: `${file.name.replace(/\.pdf$/i, "")}-reordered.pdf` });
      toast.success("Pages reordered");
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
        heading="Pages reordered!"
        subheading="Your PDF has been rearranged in the new order."
        downloadLabel="Download Reordered PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["reorder-pages"]}
      />
    );
  }

  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        files={files}
        onFilesChange={setFiles}
        buttonLabel="Select PDF file"
      />
    );
  }

  if (protectedName) return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;

  return (
    <ToolWorkspace
      title="Reorder pages"
      actionLabel="Export Reordered PDF"
      loadingLabel="Reordering…"
      onAction={run}
      actionDisabled={!items.length}
      loading={loading}
      sidebar={
        <>
          <InfoTip>Drag the ⋮⋮ handle on each thumbnail to change the page order.</InfoTip>
          <LargeFileWarning pageCount={pageCount} fileSize={fileSize} />
        </>
      }
    >
      {rendering ? (
        <div className="flex items-center justify-center py-14 text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Rendering pages…
        </div>
      ) : (
        <SortableThumbGrid items={items} onReorder={setItems} />
      )}
    </ToolWorkspace>
  );
}
