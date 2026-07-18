import { useEffect, useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { downloadBlob } from "@/lib/download";
import { GripVertical, Loader2, Plus, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { PDFDocument } from "pdf-lib";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";

const keyOf = (f: File) => `${f.name}__${f.size}`;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

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

  const reorderFiles = (oldIndex: number, newIndex: number) => {
    setFiles((prev) => arrayMove(prev, oldIndex, newIndex));
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

  const totalBytes = files.reduce((s, f) => s + f.size, 0);
  const notEnough = files.length < 2;

  return (
    <ToolWorkspace
      title="Merge PDF"
      actionLabel="Merge PDF"
      loadingLabel="Merging…"
      onAction={run}
      loading={loading}
      actionDisabled={notEnough}
      disabledReason="Add at least 2 PDFs to merge"
      sidebar={
        <>
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "#33333c" }}>
              {files.length} {files.length === 1 ? "file" : "files"} · {formatSize(totalBytes)}
            </p>
          </div>

          <SidebarFileList
            files={files}
            onReorder={reorderFiles}
            onRemove={removeAt}
          />

          <InfoTip>Drag files to change the merge order.</InfoTip>
        </>
      }
    >
      {/* Thumbnail grid — shares files state with sidebar list */}
      <ThumbnailGrid
        files={files}
        thumbs={thumbs}
        onReorder={reorderFiles}
        onRemove={removeAt}
        onAddMore={openMoreFilesPicker}
      />
    </ToolWorkspace>
  );
}

/* ============ Thumbnail grid ============ */

function ThumbnailGrid({
  files,
  thumbs,
  onReorder,
  onRemove,
  onAddMore,
}: {
  files: File[];
  thumbs: Record<string, string>;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onRemove: (i: number) => void;
  onAddMore: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(Number(active.id), Number(over.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={files.map((_, i) => String(i))} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {files.map((f, i) => (
            <ThumbCard
              key={keyOf(f) + "-" + i}
              id={String(i)}
              index={i}
              name={f.name}
              thumb={thumbs[keyOf(f)]}
              onRemove={() => onRemove(i)}
            />
          ))}
          <button
            type="button"
            onClick={onAddMore}
            className="flex min-h-[200px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-[13px] font-semibold transition-colors hover:border-[#e5322d] hover:text-[#e5322d]"
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
      {...attributes}
      {...listeners}
      className={cn(
        "group relative flex flex-col rounded-xl bg-white p-2 cursor-grab active:cursor-grabbing touch-none transition-all",
        "hover:-translate-y-0.5 hover:shadow-lg",
        isDragging && "shadow-xl z-10 ring-2 ring-[#e5322d]",
      )}
    >
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Remove ${name}`}
        className="absolute -right-2 -top-2 z-20 grid h-7 w-7 place-items-center rounded-full bg-white text-[#7a7a86] opacity-0 shadow-md transition-opacity group-hover:opacity-100 hover:text-[#e5322d]"
        style={{ border: "1px solid #ececef" }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div
        className="relative min-h-[200px] aspect-[3/4] overflow-hidden rounded-lg"
        style={{ border: "1px solid #ececef", backgroundColor: "#f6f4f9" }}
      >
        <span
          className="absolute left-2 top-2 z-10 grid h-6 min-w-6 place-items-center rounded-full px-1.5 text-[11px] font-bold text-white"
          style={{ backgroundColor: "#e5322d" }}
        >
          {index + 1}
        </span>
        <div
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 z-10 flex h-7 items-center justify-center rounded-full bg-white/95 px-1.5 shadow-sm ring-1 ring-black/10"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" style={{ color: "#33333c" }} />
        </div>
        {thumb ? (
          <img src={thumb} alt="" className="h-full w-full object-contain pointer-events-none" draggable={false} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#c8c8d0]">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        )}
      </div>
      <p
        className="mt-2 truncate px-1 text-[12.5px] font-medium"
        title={name}
        style={{ color: "#33333c" }}
      >
        {name}
      </p>
    </div>
  );
}

/* ============ Sidebar compact ordered list ============ */

function SidebarFileList({
  files,
  onReorder,
  onRemove,
}: {
  files: File[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  onRemove: (i: number) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    onReorder(Number(active.id), Number(over.id));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={files.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
        <ol className="space-y-1.5">
          {files.map((f, i) => (
            <SidebarFileRow
              key={keyOf(f) + "-" + i}
              id={String(i)}
              index={i}
              name={f.name}
              onRemove={() => onRemove(i)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function SidebarFileRow({
  id,
  index,
  name,
  onRemove,
}: {
  id: string;
  index: number;
  name: string;
  onRemove: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
      className={cn(
        "group flex items-center gap-1.5 rounded-md px-1.5 py-1.5 text-[12.5px]",
        "hover:bg-[#f6f4f9]",
        isDragging && "ring-1 ring-[#e5322d] bg-white shadow",
      )}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={`Reorder ${name}`}
        className="cursor-grab active:cursor-grabbing touch-none text-[#c8c8d0] hover:text-[#33333c]"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span className="w-4 shrink-0 text-right font-semibold" style={{ color: "#7a7a86" }}>
        {index + 1}.
      </span>
      <span
        className="min-w-0 flex-1 truncate"
        title={name}
        style={{ color: "#33333c" }}
      >
        {name}
      </span>
      <button
        type="button"
        onClick={onRemove}
        onPointerDown={(e) => e.stopPropagation()}
        aria-label={`Remove ${name}`}
        className="shrink-0 text-[#c8c8d0] opacity-0 transition-opacity hover:text-[#e5322d] group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </li>
  );
}
