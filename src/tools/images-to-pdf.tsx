import { useEffect, useMemo, useRef, useState } from "react";
import { loadPdfLib } from "@/lib/lazyLibs";
import { toast } from "sonner";
import {
  Plus,
  RotateCcw,
  RotateCw,
  X,
  GripVertical,
  ArrowUpAz,
  ArrowDownZa,
  RectangleVertical,
  RectangleHorizontal,
  Move,
  Maximize,
} from "lucide-react";
import { FileDropzone } from "@/components/FileDropzone";
import { ToolWorkspace } from "@/components/ToolWorkspace";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";
import { cn } from "@/lib/utils";
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import JSZip from "jszip";

interface ImgEntry {
  id: string;
  file: File;
  url: string;
  rotation: number; // 0, 90, 180, 270
}

type PageSize = "fit" | "a4" | "letter";
type Orientation = "portrait" | "landscape";
type Margin = "none" | "small" | "large";

export default function ImagesToPdf() {
  const [entries, setEntries] = useState<ImgEntry[]>([]);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [margin, setMargin] = useState<Margin>("none");
  const [mergeAll, setMergeAll] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number; isZip?: boolean } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);

  const idRef = useRef(0);

  const addFiles = (files: File[]) => {
    if (!files.length) return;
    setEntries((prev) => [
      ...prev,
      ...files.map((file) => ({
        id: `img-${++idRef.current}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        url: URL.createObjectURL(file),
        rotation: 0,
      })),
    ]);
  };

  const removeEntry = (id: string) => {
    setEntries((prev) => {
      const entry = prev.find((e) => e.id === id);
      if (entry) URL.revokeObjectURL(entry.url);
      return prev.filter((e) => e.id !== id);
    });
  };

  const rotateEntry = (id: string, direction: "left" | "right") => {
    setEntries((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const add = direction === "right" ? 90 : -90;
        let next = (e.rotation + add) % 360;
        if (next < 0) next += 360;
        return { ...e, rotation: next };
      })
    );
  };

  const sortEntries = () => {
    const nextOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(nextOrder);
    setEntries((prev) => {
      return [...prev].sort((a, b) => {
        const nameA = a.file.name.toLowerCase();
        const nameB = b.file.name.toLowerCase();
        if (nextOrder === "asc") return nameA.localeCompare(nameB);
        return nameB.localeCompare(nameA);
      });
    });
  };

  const resetAll = () => {
    entries.forEach((e) => URL.revokeObjectURL(e.url));
    setEntries([]);
    setPageSize("a4");
    setOrientation("portrait");
    setMargin("none");
    setMergeAll(true);
    setResult(null);
  };

  useEffect(() => {
    return () => {
      entries.forEach((e) => URL.revokeObjectURL(e.url));
    };
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setEntries((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
    setActiveId(null);
  };

  const generatePdf = async (items: ImgEntry[]) => {
    const { PDFDocument, PageSizes, degrees } = await loadPdfLib();
    const pdf = await PDFDocument.create();

    const marginMap = { none: 0, small: 28, large: 70 }; // approx 10mm and 25mm in points
    const m = marginMap[margin];

    for (const item of items) {
      const imgBytes = await item.file.arrayBuffer();
      const extension = item.file.name.split(".").pop()?.toLowerCase();
      
      let img;
      try {
        if (extension === "png") img = await pdf.embedPng(imgBytes);
        else img = await pdf.embedJpg(imgBytes);
      } catch (err) {
        // Fallback to canvas rasterization for problematic formats
        const imgElement = new Image();
        const url = URL.createObjectURL(item.file);
        await new Promise((res, rej) => {
          imgElement.onload = res;
          imgElement.onerror = rej;
          imgElement.src = url;
        });
        const canvas = document.createElement("canvas");
        canvas.width = imgElement.naturalWidth;
        canvas.height = imgElement.naturalHeight;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(imgElement, 0, 0);
        const pngBlob = await new Promise<Blob>((res) => canvas.toBlob(b => res(b!), "image/png"));
        img = await pdf.embedPng(await pngBlob.arrayBuffer());
        URL.revokeObjectURL(url);
      }

      let pageW, pageH;
      if (pageSize === "fit") {
        pageW = img.width + m * 2;
        pageH = img.height + m * 2;
      } else {
        const base = pageSize === "a4" ? PageSizes.A4 : PageSizes.Letter;
        [pageW, pageH] = orientation === "landscape" ? [base[1], base[0]] : [base[0], base[1]];
      }

      const page = pdf.addPage([pageW, pageH]);
      
      const availW = pageW - m * 2;
      const availH = pageH - m * 2;
      const scale = Math.min(availW / img.width, availH / img.height);
      const w = img.width * scale;
      const h = img.height * scale;

      page.drawImage(img, {
        x: (pageW - w) / 2,
        y: (pageH - h) / 2,
        width: w,
        height: h,
        rotate: degrees(item.rotation),
      });
    }

    return await pdf.save();
  };

  const run = async () => {
    if (!entries.length) return;
    setLoading(true);
    try {
      if (mergeAll) {
        const bytes = await generatePdf(entries);
        const blob = new Blob([bytes.buffer], { type: "application/pdf" });
        setResult({ blob, filename: "PDFToolConverter-images.pdf", count: entries.length });
      } else {
        const zip = new JSZip();
        for (const entry of entries) {
          const bytes = await generatePdf([entry]);
          const name = entry.file.name.replace(/\.[^/.]+$/, "") + ".pdf";
          zip.file(name, bytes);
        }
        const blob = await zip.generateAsync({ type: "blob" });
        setResult({ blob, filename: "PDFToolConverter-images.zip", count: entries.length, isZip: true });
      }
      toast.success("Conversion complete!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF. Try smaller images.");
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    return (
      <ToolSuccessScreen
        heading={result.isZip ? "Your ZIP is ready!" : "Your PDF is ready!"}
        subheading={result.isZip 
          ? `Individual PDF files for each of your ${result.count} images have been packaged.` 
          : `${result.count} images have been combined into a professional PDF.`}
        downloadLabel={result.isZip ? "Download ZIP" : "Download PDF"}
        onDownload={() => downloadBlob(result.blob, result.filename, result.isZip ? "application/zip" : "application/pdf")}
        onReset={resetAll}
        suggestedSlugs={TOOL_SUGGESTIONS["images-to-pdf"]}
      />
    );
  }

  if (entries.length === 0) {
    return (
      <FileDropzone
        accept="image/jpeg,image/png,image/webp,image/bmp,image/gif,image/heic"
        multiple
        files={[]}
        onFilesChange={addFiles}
        buttonLabel="Select images"
        hint="or drop images here"
      />
    );
  }

  const activeEntry = activeId ? entries.find((e) => e.id === activeId) : null;

  return (
    <ToolWorkspace
      title="Image to PDF options"
      actionLabel="Convert to PDF"
      loadingLabel="Converting..."
      onAction={run}
      loading={loading}
      sidebar={
        <div className="space-y-8">
          {/* PAGE SIZE */}
          <section>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">Page Size</label>
            <div className="mt-2 flex gap-2">
              {(["fit", "a4", "letter"] as PageSize[]).map((s) => (
                <button
                  key={s}
                  onClick={() => setPageSize(s)}
                  className={cn(
                    "flex-1 rounded-full border px-3 py-2 text-[13px] font-semibold transition-all",
                    pageSize === s 
                      ? "border-[#e5322d] bg-[#e5322d] text-white" 
                      : "border-[#ececef] bg-white text-[#5a5a66] hover:border-[#d1d1d6]"
                  )}
                >
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* ORIENTATION */}
          <section className={cn(pageSize === "fit" && "opacity-40 pointer-events-none")}>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">Orientation</label>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => setOrientation("portrait")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold transition-all",
                  orientation === "portrait" 
                    ? "border-[#e5322d] bg-[#e5322d] text-white" 
                    : "border-[#ececef] bg-white text-[#5a5a66] hover:border-[#d1d1d6]"
                )}
              >
                <RectangleVertical size={14} /> Portrait
              </button>
              <button
                onClick={() => setOrientation("landscape")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 rounded-full border px-3 py-2 text-[13px] font-semibold transition-all",
                  orientation === "landscape" 
                    ? "border-[#e5322d] bg-[#e5322d] text-white" 
                    : "border-[#ececef] bg-white text-[#5a5a66] hover:border-[#d1d1d6]"
                )}
              >
                <RectangleHorizontal size={14} /> Landscape
              </button>
            </div>
          </section>

          {/* MARGIN */}
          <section>
            <label className="text-[11px] font-bold uppercase tracking-wider text-[#8a8a93]">Margin</label>
            <div className="mt-2 flex gap-2">
              {(["none", "small", "large"] as Margin[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setMargin(m)}
                  className={cn(
                    "flex-1 rounded-full border px-3 py-2 text-[13px] font-semibold transition-all",
                    margin === m 
                      ? "border-[#e5322d] bg-[#e5322d] text-white" 
                      : "border-[#ececef] bg-white text-[#5a5a66] hover:border-[#d1d1d6]"
                  )}
                >
                  {m === "none" ? "No margin" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </section>

          {/* MERGE */}
          <section className="pt-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={mergeAll}
                  onChange={(e) => setMergeAll(e.target.checked)}
                />
                <div className={cn(
                  "h-6 w-11 rounded-full transition-colors",
                  mergeAll ? "bg-[#e5322d]" : "bg-[#d1d1d6]"
                )} />
                <div className={cn(
                  "absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform",
                  mergeAll ? "translate-x-5" : "translate-x-0"
                )} />
              </div>
              <span className="text-[14px] font-medium text-[#33333c]">Merge all images in one PDF</span>
            </label>
            <p className="mt-2 text-[12px] leading-relaxed text-[#8a8a93]">
              {mergeAll 
                ? "ON: Download one PDF with all images" 
                : "OFF: Download a ZIP with one PDF per image"}
            </p>
          </section>
        </div>
      }
    >
      <div className="mb-4 flex items-center justify-between">
        <span className="text-[15px] font-medium text-[#5a5a66]">{entries.length} images selected</span>
        <button
          onClick={sortEntries}
          className="flex items-center gap-2 rounded-lg border border-[#ececef] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#5a5a66] hover:border-[#d1d1d6]"
        >
          {sortOrder === "desc" ? <ArrowDownZa size={16} /> : <ArrowUpAz size={16} />}
          Sort by name
        </button>
      </div>

      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={entries.map((e) => e.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pb-20">
            {entries.map((entry) => (
              <SortableImageCard
                key={entry.id}
                entry={entry}
                onRemove={() => removeEntry(entry.id)}
                onRotate={(dir) => rotateEntry(entry.id, dir)}
              />
            ))}
            
            {/* ADD MORE CARD */}
            <button
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.multiple = true;
                input.accept = "image/*";
                input.onchange = (e) => addFiles(Array.from((e.target as HTMLInputElement).files || []));
                input.click();
              }}
              className="group flex aspect-[3/4] flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#d1d5db] bg-white transition-colors hover:border-[#e5322d]"
            >
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#f9fafb] text-[#9ca3af] transition-colors group-hover:bg-[#fdeceb] group-hover:text-[#e5322d]">
                <Plus size={24} />
              </div>
              <span className="text-[14px] font-semibold text-[#5a5a66] group-hover:text-[#e5322d]">Add more images</span>
            </button>
          </div>
        </SortableContext>

        <DragOverlay dropAnimation={{
          sideEffects: defaultDropAnimationSideEffects({
            styles: {
              active: {
                opacity: '0.5',
              },
            },
          }),
        }}>
          {activeEntry ? (
            <div className="w-[200px] pointer-events-none opacity-80">
              <SortableImageCard entry={activeEntry} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </ToolWorkspace>
  );
}

function SortableImageCard({
  entry,
  onRemove,
  onRotate,
}: {
  entry: ImgEntry;
  onRemove?: () => void;
  onRotate?: (dir: "left" | "right") => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: entry.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative flex aspect-[3/4] flex-col overflow-hidden rounded-lg bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] transition-all",
        isDragging && "opacity-50 ring-2 ring-[#e5322d]"
      )}
    >
      {/* IMAGE PREVIEW */}
      <div className="relative flex-1 overflow-hidden bg-[#f9fafb]">
        <img
          src={entry.url}
          alt={entry.file.name}
          className="h-full w-full object-cover transition-transform duration-200"
          style={{ transform: `rotate(${entry.rotation}deg)` }}
        />
        
        {/* DRAG HANDLE */}
        <div 
          {...attributes} 
          {...listeners}
          className="absolute left-2 top-2 z-10 cursor-grab active:cursor-grabbing rounded bg-black/30 p-1 text-white shadow-sm hover:bg-black/50"
        >
          <GripVertical size={16} />
        </div>

        {/* DELETE BUTTON */}
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#e5322d] text-white shadow-sm transition-transform hover:scale-110"
          >
            <X size={14} />
          </button>
        )}

        {/* ROTATE OVERLAY */}
        {onRotate && (
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRotate("left");
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#5a5a66] shadow-md hover:bg-white hover:text-[#e5322d]"
              title="Rotate Left"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRotate("right");
              }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#5a5a66] shadow-md hover:bg-white hover:text-[#e5322d]"
              title="Rotate Right"
            >
              <RotateCw size={16} />
            </button>
          </div>
        )}
      </div>

      {/* INFO STRIP */}
      <div className="border-t border-[#ececef] p-2 bg-white">
        <p className="truncate text-[12px] font-medium text-[#555]" title={entry.file.name}>
          {entry.file.name}
        </p>
        <p className="text-[11px] text-[#888]">{formatSize(entry.file.size)}</p>
      </div>
    </div>
  );
}
