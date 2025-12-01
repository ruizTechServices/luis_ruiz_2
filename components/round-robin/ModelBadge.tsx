// ModelBadge.tsx
// Visual identifier for each model participating in the round-robin chat.

"use client";

import * as React from "react";
import { SUPPORTED_MODELS } from "@/lib/round-robin/constants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ModelStatus = "active" | "speaking" | "waiting" | "error" | "unavailable";
type BadgeSize = "sm" | "md" | "lg";

export interface ModelBadgeProps {
  model: string;
  status?: ModelStatus;
  size?: BadgeSize;
}

const STATUS_COLORS: Record<ModelStatus, string> = {
  active: "bg-emerald-500",
  speaking: "bg-blue-500",
  waiting: "bg-muted-foreground/50",
  error: "bg-destructive",
  unavailable: "bg-zinc-500",
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-0.5",
  md: "text-xs px-2.5 py-0.5",
  lg: "text-sm px-3 py-1",
};

export function ModelBadge({ model, status = "active", size = "md" }: ModelBadgeProps) {
  const meta = SUPPORTED_MODELS.find((m) => m.id === model);
  const label = meta?.name ?? model;
  const dotColor = STATUS_COLORS[status] ?? STATUS_COLORS.active;

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex items-center gap-1.5 max-w-full truncate",
        SIZE_CLASSES[size]
      )}
      title={label}
    >
      <span
        className={cn("h-2 w-2 rounded-full shrink-0", dotColor)}
        aria-hidden="true"
      />
      <span className="truncate">{label}</span>
    </Badge>
  );
}
