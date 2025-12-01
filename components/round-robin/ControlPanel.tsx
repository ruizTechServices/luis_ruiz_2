// ControlPanel.tsx
// Provides Start, Stop, and Reset controls for the round-robin session.

"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export interface ControlPanelProps {
  sessionStatus: "idle" | "active" | "paused" | "awaiting_user" | "completed" | "error";
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
  onContinue: (message?: string) => void;
  canStart: boolean;
}

export function ControlPanel({
  sessionStatus,
  onStart,
  onPause,
  onResume,
  onEnd,
  onContinue,
  canStart,
}: ControlPanelProps) {
  const [continueMessage, setContinueMessage] = React.useState("");

  const handleContinue = () => {
    onContinue(continueMessage.trim() || undefined);
    setContinueMessage("");
  };

  return (
    <div className="border-t mt-4 pt-4 flex flex-col gap-3">
      {sessionStatus === "idle" && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Configure the topic and models, then start the discussion.
          </span>
          <Button type="button" onClick={onStart} disabled={!canStart}>
            Start discussion
          </Button>
        </div>
      )}

      {sessionStatus === "active" && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">
            Discussion is running. You can pause or end it at any time.
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onPause}
            >
              Pause
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onEnd}
            >
              End
            </Button>
          </div>
        </div>
      )}

      {sessionStatus === "paused" && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Discussion is paused.</span>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={onResume}>
              Resume
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onEnd}
            >
              End
            </Button>
          </div>
        </div>
      )}

      {sessionStatus === "awaiting_user" && (
        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium">
            Your turn  add a follow-up message to continue the discussion.
          </span>
          <Textarea
            value={continueMessage}
            onChange={(e) => setContinueMessage(e.target.value)}
            placeholder="Add an optional follow-up message for the next round..."
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onEnd}
            >
              End discussion
            </Button>
            <Button type="button" size="sm" onClick={handleContinue}>
              Continue
            </Button>
          </div>
        </div>
      )}

      {sessionStatus === "completed" && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-muted-foreground">Discussion completed.</span>
          <Button type="button" size="sm" onClick={onEnd}>
            New discussion
          </Button>
        </div>
      )}

      {sessionStatus === "error" && (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-destructive">
            A model encountered an error. You can retry or end the discussion.
          </span>
          <div className="flex gap-2">
            <Button type="button" size="sm" onClick={onResume}>
              Retry
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={onEnd}
            >
              End
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
