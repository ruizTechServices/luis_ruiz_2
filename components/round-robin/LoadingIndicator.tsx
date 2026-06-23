"use client";

import * as React from "react";
import { SUPPORTED_MODELS } from "@/lib/round-robin/constants";

export interface LoadingIndicatorProps {
  model: string;
  elapsedSeconds: number;
  isVisible: boolean;
}

function getModelLabel(id: string) {
  return SUPPORTED_MODELS.find((m) => m.id === id)?.name ?? id;
}

export function LoadingIndicator({
  model,
  elapsedSeconds,
  isVisible,
}: LoadingIndicatorProps) {
  if (!isVisible) return null;

  const label = getModelLabel(model);

  return (
    <div className="mt-3 inline-flex items-center gap-3 rounded-md border bg-muted/60 px-3 py-2 text-sm text-muted-foreground">
      <div>
        <div>
          {label} is thinking ({Math.round(elapsedSeconds)}s)
        </div>
        <div className="text-[11px]">This is taking longer than expected.</div>
      </div>
    </div>
  );
}
