"use client";

import * as React from "react";
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { cn } from "@/lib/utils";
import { SUPPORTED_MODELS } from "@/lib/round-robin/constants";

export interface TurnOrderConfigProps {
  models: string[];
  turnOrder: string[];
  onOrderChange: (newOrder: string[]) => void;
  disabled: boolean;
}

function getLabel(id: string) {
  return SUPPORTED_MODELS.find((m) => m.id === id)?.name ?? id;
}

interface SortableItemProps {
  id: string;
  index: number;
  disabled: boolean;
}

function SortableItem({ id, index, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 rounded-md border bg-background px-3 py-2 text-sm",
        isDragging && "shadow-md ring-2 ring-primary/40"
      )}
    >
      <button
        type="button"
        className={cn(
          "cursor-grab text-muted-foreground hover:text-foreground",
          disabled && "cursor-default opacity-60"
        )}
        {...attributes}
        {...listeners}
        aria-label="Reorder model"
        disabled={disabled}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="w-6 text-xs text-muted-foreground">{index + 1}.</span>
      <span className="truncate">{getLabel(id)}</span>
    </div>
  );
}

export function TurnOrderConfig({
  models,
  turnOrder,
  onOrderChange,
  disabled,
}: TurnOrderConfigProps) {
  const effectiveOrder = React.useMemo(() => {
    const filtered = turnOrder.filter((id) => models.includes(id));
    if (filtered.length > 0) return filtered;
    return [...models];
  }, [models, turnOrder]);

  const handleDragEnd = (event: DragEndEvent) => {
    if (disabled) return;
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = effectiveOrder.indexOf(active.id as string);
    const newIndex = effectiveOrder.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(effectiveOrder, oldIndex, newIndex);
    onOrderChange(reordered);
  };

  if (effectiveOrder.length === 0) {
    return null;
  }

  if (disabled) {
    return (
      <div className="space-y-2">
        <div className="text-sm font-medium">Turn order</div>
        <div className="space-y-1">
          {effectiveOrder.map((id, index) => (
            <div
              key={id}
              className="flex items-center gap-3 rounded-md border bg-muted/40 px-3 py-2 text-sm"
            >
              <span className="w-6 text-xs text-muted-foreground">
                {index + 1}.
              </span>
              <span className="truncate">{getLabel(id)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium">Turn order</div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext
          items={effectiveOrder}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-1">
            {effectiveOrder.map((id, index) => (
              <SortableItem key={id} id={id} index={index} disabled={disabled} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
