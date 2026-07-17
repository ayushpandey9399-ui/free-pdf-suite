import { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { toast } from "sonner";
import { FileDropzone } from "@/components/FileDropzone";
import { ActionBar } from "@/components/ActionBar";
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

export default function Merge() {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const run = async () => {
    if (files.length < 2) {
      toast.error("Add at least two PDFs to merge.");
      return;
    }
    setLoading(true);
    try {
      const out = await PDFDocument.create();
      for (const f of files) {
        const src = await PDFDocument.load(await f.arrayBuffer(), { ignoreEncryption: true });
        const pages = await out.copyPages(src, src.getPageIndices());
        for (const p of pages) out.addPage(p);
      }
      const bytes = await out.save();
      downloadBlob(bytes, "merged.pdf", "application/pdf");
      toast.success("Merged PDF downloaded");
    } catch (e) {
      console.error(e);
      toast.error(`Merge failed: ${(e as Error).message}`);
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

  return (
    <div>
      <FileDropzone accept="application/pdf" multiple files={[]} onFilesChange={(fs) => setFiles([...files, ...fs])} />
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
      <ActionBar onRun={run} disabled={files.length < 2} loading={loading} label={`Merge ${files.length || ""} PDFs`.trim()} />
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
