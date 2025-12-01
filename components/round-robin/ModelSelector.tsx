// ModelSelector.tsx
// Handles toggling individual models on/off for participation.

"use client";

import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

export interface ModelSelectorProps {
  availableModels: Array<{ id: string; name: string; available: boolean }>;
  selectedModels: string[];
  onSelectionChange: (models: string[]) => void;
  disabled: boolean;
}

export function ModelSelector({
  availableModels,
  selectedModels,
  onSelectionChange,
  disabled,
}: ModelSelectorProps) {
  const handleToggle = (id: string, selectable: boolean) => {
    if (!selectable) return;
    const isSelected = selectedModels.includes(id);
    if (isSelected) {
      if (selectedModels.length <= 1) return; // enforce at least one model
      onSelectionChange(selectedModels.filter((m) => m !== id));
    } else {
      onSelectionChange([...selectedModels, id]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Models</CardTitle>
        <CardDescription className="text-xs">
          Choose which models participate in the discussion.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {availableModels.map((model) => {
          const isSelected = selectedModels.includes(model.id);
          const selectable = !disabled && model.available;
          return (
            <button
              key={model.id}
              type="button"
              onClick={() => handleToggle(model.id, selectable)}
              disabled={!selectable}
              className={cn(
                "flex items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background",
                !model.available && "opacity-60 cursor-not-allowed",
                disabled && "opacity-60 cursor-not-allowed"
              )}
              title={
                model.available
                  ? model.name
                  : "This model is currently unavailable"
              }
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium truncate">{model.name}</span>
                <span className="text-[11px] text-muted-foreground">{model.id}</span>
              </div>
              <Switch
                checked={isSelected}
                onCheckedChange={() => handleToggle(model.id, selectable)}
                disabled={!selectable}
              />
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}
