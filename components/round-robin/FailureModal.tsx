"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SUPPORTED_MODELS } from "@/lib/round-robin/constants";

export interface FailureModalProps {
  isOpen: boolean;
  model: string;
  error: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onSkip: () => void;
  onRemove: () => void;
  onClose: () => void;
}

function getModelLabel(id: string) {
  return SUPPORTED_MODELS.find((m) => m.id === id)?.name ?? id;
}

export function FailureModal({
  isOpen,
  model,
  error,
  retryCount,
  maxRetries,
  onRetry,
  onSkip,
  onRemove,
  onClose,
}: FailureModalProps) {
  const canRetry = retryCount < maxRetries;
  const modelLabel = getModelLabel(model);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Model failed: {modelLabel}</DialogTitle>
          <DialogDescription>
            The current turn failed with an error. Choose how to proceed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-destructive">
            {error}
          </div>
          <p className="text-muted-foreground text-xs">
            Retry attempts: {retryCount} / {maxRetries}
          </p>
        </div>
        <div className="mt-4 flex flex-wrap justify-end gap-2">
          <Button type="button" size="sm" variant="outline" onClick={onSkip}>
            Skip this turn
          </Button>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            onClick={onRemove}
          >
            Remove from discussion
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onRetry}
            disabled={!canRetry}
          >
            Retry ({Math.min(retryCount + 1, maxRetries)}/{maxRetries})
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
