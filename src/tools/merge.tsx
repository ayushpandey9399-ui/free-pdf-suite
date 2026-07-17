import { useState } from "react";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
import { ToolSuccessScreen } from "@/components/ToolSuccessScreen";
import { downloadBlob } from "@/lib/download";
import { GripVertical, X } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { PDFDocument } from "pdf-lib";
import { loadPdfLibDoc, isPdfPasswordError } from "@/lib/pdfGuard";
import { PasswordProtectedNotice } from "@/components/PasswordProtectedNotice";
import { usePdfPasswordCheck } from "@/hooks/usePdfPasswordCheck";
import { TOOL_SUGGESTIONS } from "@/tools/suggestions";

export default function Merge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; filename: string; count: number } | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));
  const { protectedName, reset } = usePdfPasswordCheck(files, () => setFiles([]));

  const resetAll = () => {
    setFiles([]);
    setResult(null);
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

  return (
    <div>
      <FileDropzone
        accept="application/pdf"
        multiple
        hideList
        buttonLabel="Select PDF files"
        files={files}
        onFilesChange={(next) =>
          setFiles((prev) => {
            const incoming = next.slice(prev.length);
            const batch = incoming.length ? incoming : next;
            const seen = new Set(prev.map((f) => `${f.name}__${f.size}`));
            const deduped: File[] = [];
            let skipped = 0;
            for (const f of batch) {
              const key = `${f.name}__${f.size}`;
              if (seen.has(key)) {
                skipped++;
                continue;
              }
              seen.add(key);
              deduped.push(f);
            }
            if (skipped > 0) {
              toast.info(`Skipped ${skipped} duplicate file${skipped > 1 ? "s" : ""}`);
            }
            return incoming.length ? [...prev, ...deduped] : deduped;
          })
        }
      />
      {protectedName ? (
        <PasswordProtectedNotice fileName={protectedName} onReset={reset} />
      ) : (
        <>
          {files.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Drag to reorder — top file appears first.</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={files.map((_, i) => String(i))} strategy={verticalListSortingStrategy}>
                  <ul className="space-y-2">
                    {files.map((f, i) => (
                      <SortableRow key={i} id={String(i)} name={f.name} size={f.size} onRemove={() => setFiles(files.filter((_, j) => j !== i))} />
                    ))}
                  </ul>
                </SortableContext>
              </DndContext>
            </div>
          )}
          <ActionBar
            onRun={run}
            disabled={files.length < 2}
            loading={loading}
            label={loading ? "Merging your PDFs…" : `Merge ${files.length || ""} PDFs`.trim()}
          />
        </>
      )}
    </div>
  );
}

function SortableRow({ id, name, size, onRemove }: { id: string; name: string; size: number; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 }}
      className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2"
    >
      <button {...attributes} {...listeners} className="cursor-grab p-1 text-muted-foreground" aria-label="Drag">
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="flex-1 truncate text-sm">{name}</span>
      <span className="text-xs text-muted-foreground">{(size / 1024 / 1024).toFixed(2)} MB</span>
      <Button variant="ghost" size="icon" onClick={onRemove} aria-label={`Remove ${name}`}>
        <X className="h-4 w-4" />
      </Button>
    </li>
  );
}
