// TopicInput.tsx
// Captures the initial prompt or topic to kick off the conversation.

"use client";

import * as React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export interface TopicInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
  placeholder?: string;
}

export function TopicInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "What should the models discuss?",
}: TopicInputProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!disabled) onSubmit();
    }
  };

  const charCount = value.length;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">Topic</span>
        <span className="text-[11px] text-muted-foreground">
          {charCount} characters
        </span>
      </div>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        rows={3}
      />
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
        >
          Set topic
        </Button>
      </div>
    </div>
  );
}
