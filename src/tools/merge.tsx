import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { ArrowRight, GripVertical, Info, Loader2, Plus, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, rectSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PDFDocument } from "pdf-lib";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

const keyOf = (f: File) => `${f.name}__${f.size}`;

async function renderFirstPageThumb(file: File, maxWidth = 220): Promise<string | null> {
  try {
    const buf = await file.arrayBuffer();
    const doc = await loadPdfJsDoc(buf);
    const page = await doc.getPage(1);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = maxWidth / vp1.width;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

export default function Merge() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  // Render a first-page thumbnail per file (once).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const f of files) {
        const k = keyOf(f);
        if (thumbs[k]) continue;
        const url = await renderFirstPageThumb(f);
        if (cancelled) return;
        if (url) setThumbs((prev) => ({ ...prev, [k]: url }));
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const resetAll = () => {
    setFiles([]);
    setThumbs({});
    setResult(null);
  };

  const appendFiles = (next: File[]) => {
    setFiles((prev) => {
      const incoming = next.slice(prev.length);
      const batch = incoming.length ? incoming : next;
      const seen = new Set(prev.map(keyOf));
      const deduped: File[] = [];
      let skipped = 0;
      for (const f of batch) {
        const k = keyOf(f);
        if (seen.has(k)) {
          skipped++;
          continue;
        }
        seen.add(k);
        deduped.push(f);
      }
      if (skipped > 0) toast.info(`Skipped ${skipped} duplicate file${skipped > 1 ? "s" : ""}`);
      return incoming.length ? [...prev, ...deduped] : deduped;
    });
  };

  const openMoreFilesPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.multiple = true;
    input.onchange = () => {
      if (input.files?.length) appendFiles([...files, ...Array.from(input.files)]);
    };
    input.click();
  };

  const removeAt = (i: number) => {
    setFiles((prev) => prev.filter((_, j) => j !== i));
  };

  const run = async () => {
    if (files.length < 2) {
      toast.error("Add at least two PDFs to merge.");
      return;
    }
    setLoading(true);
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await loadPdfLibDoc(await f.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        for (const p of pages) out.addPage(p);
      }
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ blob, filename: "merged.pdf", count: files.length });
      toast.success("PDFs merged");
    } catch (e) {
      console.error(e);
      if (isPdfPasswordError(e)) toast.error("One of the PDFs is password-protected");
      else toast.error(`Merge failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = files.findIndex((_, i) => String(i) === active.id);
    const newIndex = files.findIndex((_, i) => String(i) === over.id);
    setFiles(arrayMove(files, oldIndex, newIndex));
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="PDFs have been merged!"
        subheading={`${result.count} files combined into one document.`}
        downloadLabel="Download Merged PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS.merge}
      />
    );
  }

  // Empty state — keep the current simplified upload UI.
  if (files.length === 0) {
    return (
      <FileDropzone
        accept="application/pdf"
        multiple
        hideList
        buttonLabel="Select PDF files"
        files={files}
        onFilesChange={appendFiles}
      />
    );
  }

  if (protectedName) {
    return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;
  }

  const canRun = files.length >= 2 && !loading;

  return (
    <div className="lg:-mx-8 xl:-mx-16">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* LEFT: file cards */}
        <div className="min-w-0">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={files.map((_, i) => String(i))} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {files.map((f, i) => (
                  <ThumbCard
                    key={keyOf(f) + "-" + i}
                    id={String(i)}
                    index={i}
                    name={f.name}
                    thumb={thumbs[keyOf(f)]}
                    onRemove={() => removeAt(i)}
                  />
                ))}
                <button
                  type="button"
                  onClick={openMoreFilesPicker}
                  className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
                  style={{ borderColor: "#e5d4d3", color: "#7a7a86" }}
                  aria-label="Add more PDFs"
                >
                  <span
                    className="grid h-10 w-10 place-items-center rounded-full text-white"
                    style={{ backgroundColor: "#e5322d" }}
                  >
                    <Plus className="h-5 w-5" />
                  </span>
                  Add more
                </button>
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* RIGHT: sidebar */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div
            className="flex flex-col rounded-2xl bg-white p-5"
            style={{
              border: "1px solid #ececef",
              boxShadow: "0 1px 2px rgba(20,20,43,0.04)",
              minHeight: "clamp(320px, 60vh, 520px)",
            }}
          >
            <h2 className="text-[18px] font-bold" style={{ color: "#33333c" }}>
              Merge PDF
            </h2>
            <div className="mt-3 h-px w-full" style={{ backgroundColor: "#ececef" }} />

            <div
              className="mt-4 flex gap-2.5 rounded-lg p-3 text-[13px]"
              style={{ backgroundColor: "#eef4ff", color: "#254a9e" }}
            >
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>Drag and drop the files to change the merge order.</p>
            </div>

            <div className="flex-1" />

            <button
              type="button"
              onClick={run}
              disabled={!canRun}
              className={cn(
                "mt-6 hidden lg:inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold uppercase text-white transition-all duration-150",
                canRun && "hover:scale-[1.01]",
                !canRun && "cursor-not-allowed",
              )}
              style={{
                backgroundColor: canRun ? "#e5322d" : "#d7d7dc",
                color: canRun ? "#ffffff" : "#8a8a93",
                letterSpacing: "0.04em",
                boxShadow: canRun ? "0 10px 24px -8px rgba(229,50,45,0.55)" : "none",
              }}
              onMouseEnter={(e) => canRun && (e.currentTarget.style.backgroundColor = "#c72620")}
              onMouseLeave={(e) => canRun && (e.currentTarget.style.backgroundColor = "#e5322d")}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Merging…
                </>
              ) : (
                <>
                  Merge PDF <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky action bar */}
      <div
        className="lg:hidden fixed inset-x-0 bottom-0 z-30 border-t bg-white px-4 py-3"
        style={{
          borderColor: "#ececef",
          paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
        }}
      >
        <button
          type="button"
          onClick={run}
          disabled={!canRun}
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-[15px] font-bold uppercase text-white",
            !canRun && "cursor-not-allowed",
          )}
          style={{
            backgroundColor: canRun ? "#e5322d" : "#d7d7dc",
            color: canRun ? "#ffffff" : "#8a8a93",
            letterSpacing: "0.04em",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Merging…
            </>
          ) : (
            <>
              Merge PDF <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
      <div className="lg:hidden h-24" aria-hidden />
    </div>
  );
}

function ThumbCard({
  id,
  index,
  name,
  thumb,
  onRemove,
}: {
  id: string;
  index: number;
  name: string;
  thumb?: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
      }}
      className="group relative flex flex-col rounded-xl bg-white p-2 transition-shadow hover:shadow-md"
    >
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${name}`}
        className="absolute -right-2 -top-2 z-10 grid h-7 w-7 place-items-center rounded-full bg-white text-[#7a7a86] opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:text-[#e5322d]"
        style={{ border: "1px solid #ececef" }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div
        {...attributes}
        {...listeners}
        className="relative aspect-[3/4] cursor-grab overflow-hidden rounded-lg active:cursor-grabbing"
        style={{ border: "1px solid #ececef", backgroundColor: "#f6f4f9" }}
      >
        <span
          className="absolute left-2 top-2 z-10 grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: "#e5322d" }}
        >
          {index + 1}
        </span>
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-contain" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#c8c8d0]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      <p className="mt-2 truncate px-1 text-[12.5px] font-medium" title={name} style={{ color: "#33333c" }}>
        {name}
      </p>
    </div>
  );
}
