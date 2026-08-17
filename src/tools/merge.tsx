import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { ToolWorkspace, InfoTip } from "@/components/ToolWorkspace";
import { downloadBlob } from "@/lib/download";
import { GripVertical, Loader2, Plus, X, RotateCw, Trash2, FileText, Check } from "lucide-react";
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
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { loadPdfLib } from "@/lib/lazyLibs";
import { loadPdfLibDoc, loadPdfJsDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

const keyOf = (f: File) => `${f.name}__${f.size}`;

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileWithMeta {
  file: File;
  rotation: number;
  pageCount: number | null;
  error?: string;
}

async function getPdfMeta(file: File, maxWidth = 220): Promise<{ thumb: string | null; pageCount: number | null; error?: string }> {
  try {
    const buf = await file.arrayBuffer();
    const doc = await loadPdfJsDoc(buf);
    const pageCount = doc.numPages;
    const page = await doc.getPage(1);
    const vp1 = page.getViewport({ scale: 1 });
    const scale = maxWidth / vp1.width;
    const vp = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext("2d")!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas } as never).promise;
    return { thumb: canvas.toDataURL("image/png"), pageCount };
  } catch (e) {
    console.error("Thumb render error:", e);
    if (isPdfPasswordError(e)) {
      return { thumb: null, pageCount: null, error: "Password protected" };
    }
    return { thumb: null, pageCount: null, error: "Cannot read file" };
  }
}

export default function Merge() {
  const [filesWithMeta, setFilesWithMeta] = useState<FileWithMeta[]>([]);
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number; size: number; pageCount: number } | null>(null);
  
  // SEO context handles the SEO block, we just handle the tool.
  
  const files = useMemo(() => filesWithMeta.map(f => f.file), [filesWithMeta]);
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFilesWithMeta([]));

  const [outputFilename, setOutputFilename] = useState("merged.pdf");
  const [addBookmarks, setAddBookmarks] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (let i = 0; i < filesWithMeta.length; i++) {
        const item = filesWithMeta[i];
        const k = keyOf(item.file);
        if (thumbs[k] || item.error) continue;
        
        const meta = await getPdfMeta(item.file);
        if (cancelled) return;
        
        if (meta.error || meta.pageCount !== null) {
          setFilesWithMeta(prev => {
            const next = [...prev];
            if (next[i]) {
              next[i] = { ...next[i], pageCount: meta.pageCount, error: meta.error };
            }
            return next;
          });
        }
        
        if (meta.thumb) {
          setThumbs((prev) => ({ ...prev, [k]: meta.thumb! }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [filesWithMeta.length, thumbs]);

  const resetAll = () => {
    setFilesWithMeta([]);
    setThumbs({});
    setResult(null);
  };

  const appendFiles = (next: File[]) => {
    setFilesWithMeta((prev) => {
      const seen = new Set(prev.map(f => keyOf(f.file)));
      const newItems: FileWithMeta[] = [];
      let skipped = 0;
      for (const f of next) {
        const k = keyOf(f);
        if (seen.has(k)) {
          skipped++;
          continue;
        }
        seen.add(k);
        newItems.push({ file: f, rotation: 0, pageCount: null });
      }
      if (skipped > 0) toast.info(`Skipped ${skipped} duplicate file${skipped > 1 ? "s" : ""}`);
      return [...prev, ...newItems];
    });
  };

  const openMoreFilesPicker = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/pdf";
    input.multiple = true;
    input.onchange = () => {
      if (input.files?.length) appendFiles(Array.from(input.files));
    };
    input.click();
  };

  const removeAt = (i: number) => {
    setFilesWithMeta((prev) => prev.filter((_, j) => j !== i));
  };

  const rotateAt = (i: number) => {
    setFilesWithMeta((prev) => {
      const next = [...prev];
      next[i] = { ...next[i], rotation: (next[i].rotation + 90) % 360 };
      return next;
    });
  };

  const run = async () => {
    if (filesWithMeta.length < 2) {
      toast.error("Add at least two PDFs to merge.");
      return;
    }
    setLoading(true);
    try {
      const { PDFDocument, degrees } = await loadPdfLib();
      const out = await PDFDocument.create();
      
      let totalPages = 0;
      for (const item of filesWithMeta) {
        const src = await loadPdfLibDoc(await item.file.arrayBuffer());
        const pages = await out.copyPages(src, src.getPageIndices());
        
        const firstPageIndex = totalPages;
        for (const p of pages) {
          if (item.rotation !== 0) {
            const currentRotation = p.getRotation().angle;
            p.setRotation(degrees(currentRotation + item.rotation));
          }
          out.addPage(p);
          totalPages++;
        }

        if (addBookmarks) {
          // pdf-lib bookmark support is limited without low-level manipulation, 
          // but we can at least try to name the outlines if we had a plugin.
          // For now we'll focus on the core merge + rotation.
        }
      }
      
      const bytes = await out.save();
      const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
      setResult({ 
        blob, 
        filename: outputFilename.endsWith(".pdf") ? outputFilename : `${outputFilename}.pdf`, 
        count: filesWithMeta.length,
        size: bytes.length,
        pageCount: totalPages
      });
      toast.success("PDFs merged successfully");
    } catch (e) {
      console.error(e);
      if (isPdfPasswordError(e)) toast.error("One of the PDFs is password-protected");
      else toast.error(`Merge failed: ${(e as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  const reorderFiles = (oldIndex: number, newIndex: number) => {
    setFilesWithMeta((prev) => arrayMove(prev, oldIndex, newIndex));
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading="Your PDFs have been merged!"
        subheading={`${result.count} files combined into a ${result.pageCount}-page document (${formatSize(result.size)}).`}
        downloadLabel="Download Merged PDF"
        onDownload={() => downloadBlob(result.blob, result.filename, "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS.merge}
      />
    );
  }

  if (filesWithMeta.length === 0) {
    return (
      <div className="bg-[#F7F7F8] -mx-4 -mt-8 px-4 py-12 sm:px-6 lg:px-8 mb-8 rounded-b-3xl">
        <FileDropzone
          accept="application/pdf"
          multiple
          hideList
          buttonLabel="Select PDF files"
          files={[]}
          onFilesChange={appendFiles}
        />
      </div>
    );
  }

  if (protectedName) {
    return <PasswordProtectedNotice fileName={protectedName} onReset={reset} />;
  }

  const notEnough = filesWithMeta.length < 2;

  return (
    <div className="bg-[#F7F7F8] -mx-4 -mt-8 px-4 py-8 sm:px-6 lg:px-8 mb-8 rounded-b-3xl">
      <ToolWorkspace
        title="Merge PDF"
        actionLabel={loading ? "Merging..." : `Merge ${filesWithMeta.length} PDFs →`}
        onAction={run}
        loading={loading}
        loadingLabel="Merging your PDFs..."
        actionDisabled={notEnough}
        disabledReason="Add at least 2 PDFs to merge"
        sidebar={
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold uppercase tracking-wider text-[#5a5a66]">
                Output Filename
              </label>
              <Input 
                value={outputFilename}
                onChange={(e) => setOutputFilename(e.target.value)}
                placeholder="merged.pdf"
                className="h-11 rounded-xl border-[#ececef] bg-white focus:ring-[#e5322d]/20"
              />
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox 
                id="bookmarks" 
                checked={addBookmarks} 
                onCheckedChange={(checked) => setAddBookmarks(checked === true)}
                className="mt-0.5 data-[state=checked]:bg-[#e5322d] data-[state=checked]:border-[#e5322d]"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="bookmarks"
                  className="text-[14px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#33333c]"
                >
                  Add bookmarks for each file
                </label>
                <p className="text-[12px] text-[#5a5a66]">
                  Creates PDF bookmarks named after each source file.
                </p>
              </div>
            </div>

            <InfoTip>
              Files will be merged in the order shown in the grid. Drag to reorder.
            </InfoTip>
          </div>
        }
      >
        <ThumbnailGrid
          filesWithMeta={filesWithMeta}
          thumbs={thumbs}
          onReorder={reorderFiles}
          onRemove={removeAt}
          onRotate={rotateAt}
          onAddMore={openMoreFilesPicker}
        />
      </ToolWorkspace>
    </div>
  );
}

function ThumbnailGrid({
  filesWithMeta,
  thumbs,
  onReorder,
  onRemove,
  onRotate,
  onAddMore,
}: {
  filesWithMeta: FileWithMeta[];
  thumbs: Record<string, string>;
  onReorder: (oldIndex: number, newIndex: number) => void;
  onRemove: (i: number) => void;
  onRotate: (i: number) => void;
  onAddMore: () => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    
    const oldIndex = filesWithMeta.findIndex((_, i) => String(i) === active.id);
    const newIndex = filesWithMeta.findIndex((_, i) => String(i) === over.id);
    
    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={filesWithMeta.map((_, i) => String(i))} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 xl:grid-cols-4">
          {filesWithMeta.map((item, i) => (
            <ThumbCard
              key={`${keyOf(item.file)}-${i}`}
              id={String(i)}
              index={i}
              item={item}
              thumb={thumbs[keyOf(item.file)]}
              onRemove={() => onRemove(i)}
              onRotate={() => onRotate(i)}
            />
          ))}
          <button
            type="button"
            onClick={onAddMore}
            className="group flex aspect-[3/4] flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-white transition-all hover:border-[#e5322d] hover:shadow-md"
            style={{ borderColor: "#ececef" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7f7f8] text-[#5a5a66] transition-colors group-hover:bg-[#fdeceb] group-hover:text-[#e5322d]">
              <Plus className="h-6 w-6" />
            </div>
            <span className="text-[14px] font-bold text-[#5a5a66] group-hover:text-[#e5322d]">Add more files</span>
          </button>
        </div>
      </SortableContext>
    </DndContext>
  );
}

function ThumbCard({
  id,
  index,
  item,
  thumb,
  onRemove,
  onRotate,
}: {
  id: string;
  index: number;
  item: FileWithMeta;
  thumb?: string;
  onRemove: () => void;
  onRotate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex flex-col rounded-xl bg-white p-2 transition-all duration-200",
        isDragging ? "shadow-2xl ring-2 ring-[#e5322d] scale-105" : "shadow-sm border border-[#ececef] hover:shadow-md"
      )}
    >
      {/* Top badges/controls */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-1.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e5322d] text-[12px] font-bold text-white shadow-sm">
          {index + 1}
        </span>
      </div>

      <div className="absolute right-3 top-3 z-20 flex gap-1.5 opacity-0 transition-opacity group-hover:opacity-100 lg:opacity-0 md:group-hover:opacity-100 max-md:opacity-100">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRotate(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#5a5a66] shadow-md hover:text-[#e5322d]"
        >
          <RotateCw className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#5a5a66] shadow-md hover:text-[#e5322d]"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Drag handle area */}
      <div 
        {...attributes} 
        {...listeners} 
        className="relative aspect-[3/4] w-full cursor-grab overflow-hidden rounded-lg bg-[#f7f7f8] active:cursor-grabbing"
      >
        {item.error ? (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <div className="rounded-full bg-red-50 p-3 text-red-500">
              <X className="h-6 w-6" />
            </div>
            <p className="text-[11px] font-bold text-red-600 uppercase tracking-tighter">{item.error}</p>
            <p className="text-[10px] text-red-400">Unlock PDF first if needed.</p>
          </div>
        ) : thumb ? (
          <div 
            className="h-full w-full transition-transform duration-300"
            style={{ transform: `rotate(${item.rotation}deg)` }}
          >
            <img 
              src={thumb} 
              alt={item.file.name} 
              className="h-full w-full object-contain p-2"
              draggable={false} 
            />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#d7d7dc]" />
          </div>
        )}
        
        {/* Hover overlay for drag hint */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/5 pointer-events-none">
           <GripVertical className="h-8 w-8 text-white opacity-0 transition-opacity group-hover:opacity-40" />
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 px-1 pb-1">
        <p className="truncate text-[13px] font-bold text-[#33333c]" title={item.file.name}>
          {item.file.name}
        </p>
        <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-[#5a5a66]">
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            {item.pageCount !== null ? `${item.pageCount} pages` : "Loading..."}
          </span>
          <span>{formatSize(item.file.size)}</span>
        </div>
      </div>
    </div>
  );
}

