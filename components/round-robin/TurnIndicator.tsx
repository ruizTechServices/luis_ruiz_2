// TurnIndicator.tsx
// Shows whose turn it currently is within the round-robin conversation.

"use client";

import * as React from "react";
import { SUPPORTED_MODELS } from "@/lib/round-robin/constants";
import { cn } from "@/lib/utils";

export interface TurnIndicatorProps {
  currentModel: string;
  turnOrder: string[];
  currentIndex: number;
  currentRound: number;
  status: "active" | "paused" | "awaiting_user" | "completed" | "error";
}

function getModelLabel(id: string) {
  return SUPPORTED_MODELS.find((m) => m.id === id)?.name ?? id;
}

export function TurnIndicator({
  currentModel,
  turnOrder,
  currentIndex,
  currentRound,
  status,
}: TurnIndicatorProps) {
  const modelLabel = currentModel ? getModelLabel(currentModel) : "Unknown model";

  let statusText: string;
  switch (status) {
    case "active":
      statusText = `Round ${currentRound}  – ${modelLabel} is responding`;
      break;
    case "paused":
      statusText = `Round ${currentRound}  – Discussion paused`;
      break;
    case "awaiting_user":
      statusText = `Round ${currentRound}  – Awaiting your input`;
      break;
    case "completed":
      statusText = "Discussion completed";
      break;
    case "error":
      statusText = "A model encountered an error";
      break;
    default:
      statusText = "";
  }

  const effectiveIndex = turnOrder.length > 0 ? currentIndex % turnOrder.length : 0;

  return (
    <div className="border bg-muted/50 rounded-lg px-4 py-3 flex flex-col gap-3">
      <div className="text-sm font-medium">{statusText}</div>
      {turnOrder.length > 0 && (
        <div className="flex flex-wrap gap-2 text-xs">
          {turnOrder.map((id, idx) => {
            const isCurrent = idx === effectiveIndex;
            const label = getModelLabel(id);
            return (
              <div
                key={`${id}-${idx}`}
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-1 rounded-full border",
                  isCurrent
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background/60 text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    isCurrent ? "bg-primary-foreground" : "bg-muted-foreground/70"
                  )}
                  aria-hidden="true"
                />
                <span className="font-semibold">{idx + 1}</span>
                <span className="hidden sm:inline truncate max-w-[9rem]">{label}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
