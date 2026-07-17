import {
  DndContext,
  PointerSensor,
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
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
      className={cn(
        "group relative rounded-lg border bg-card p-2 shadow-sm",
        selected && "ring-2 ring-blue-600",
        isDragging && "opacity-60",
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className="block w-full"
        aria-pressed={selected}
      >
        <img src={item.src} alt={item.label} className="w-full h-auto rounded" />
        <div className="mt-1 text-center text-xs text-muted-foreground">{item.label}</div>
      </button>
      {draggable && (
        <div
          {...attributes}
          {...listeners}
          className="absolute top-1 right-1 cursor-grab rounded bg-background/80 px-1.5 py-0.5 text-[10px] font-medium opacity-0 group-hover:opacity-100"
          title="Drag to reorder"
        >
          ⋮⋮
        </div>
      )}
    </div>
  );
}
