import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
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
import { GripVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThumbItem {
  id: string;
  src: string;
  label: string;
}

export function SortableThumbGrid({
  items,
  onReorder,
  selectedIds,
  onToggle,
}: {
  items: ThumbItem[];
  onReorder?: (items: ThumbItem[]) => void;
  selectedIds?: Set<string>;
  onToggle?: (id: string) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
  );

  const handleDragEnd = (e: DragEndEvent) => {
    if (!onReorder) return;
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    onReorder(arrayMove(items, oldIndex, newIndex));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {items.map((item) => (
            <Thumb
              key={item.id}
              item={item}
              draggable={!!onReorder}
              selected={selectedIds?.has(item.id)}
              onToggle={onToggle ? () => onToggle(item.id) : undefined}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function Thumb({
  item,
  draggable,
  selected,
  onToggle,
}: {
  item: ThumbItem;
  draggable: boolean;
  selected?: boolean;
  onToggle?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !draggable,
  });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...(draggable ? attributes : {})}
      {...(draggable ? listeners : {})}
      className={cn(
        "group relative rounded-lg border bg-card p-2 shadow-sm transition-all",
        draggable && "cursor-grab active:cursor-grabbing hover:-translate-y-0.5 hover:shadow-lg touch-none",
        selected && "ring-2 ring-blue-600",
        isDragging && "opacity-60 shadow-xl z-10 ring-2 ring-[#e5322d]",
      )}
    >
      {draggable && (
        <div
          aria-hidden
          className="pointer-events-none absolute top-1.5 left-1/2 -translate-x-1/2 z-10 flex h-7 items-center justify-center gap-0.5 rounded-full bg-white/95 px-2 shadow-sm ring-1 ring-black/10"
          title="Drag to reorder"
        >
          <GripVertical className="h-5 w-5" style={{ color: "#33333c" }} />
        </div>
      )}
      {onToggle ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          onPointerDown={(e) => e.stopPropagation()}
          className="block w-full"
          aria-pressed={selected}
        >
          <img src={item.src} alt={item.label} className="w-full h-auto rounded" draggable={false} />
          <div className="mt-1 text-center text-xs text-muted-foreground">{item.label}</div>
        </button>
      ) : (
        <div className="block w-full">
          <img src={item.src} alt={item.label} className="w-full h-auto rounded pointer-events-none" draggable={false} />
          <div className="mt-1 text-center text-xs text-muted-foreground">{item.label}</div>
        </div>
      )}
    </div>
  );
}

