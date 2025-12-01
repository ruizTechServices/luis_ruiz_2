// ConversationThread.tsx
// Displays the full conversation between selected models and the user.

"use client";

import * as React from "react";
import { ModelBadge } from "./ModelBadge";
import { cn } from "@/lib/utils";

export interface Message {
  id: number;
  model: string;
  role: "user" | "assistant";
  content: string;
  turnIndex: number;
  isStreaming?: boolean;
  streamedContent?: string;
}

export interface ConversationThreadProps {
  messages: Message[];
  currentlyStreaming?: {
    model: string;
    content: string;
  } | null;
  modelsInRound?: number;
}

export function ConversationThread({
  messages,
  currentlyStreaming,
  modelsInRound = 1,
}: ConversationThreadProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  const combinedMessages = React.useMemo(() => {
    const base = [...messages];
    if (currentlyStreaming) {
      base.push({
        id: Number.MAX_SAFE_INTEGER,
        model: currentlyStreaming.model,
        role: "assistant",
        content: currentlyStreaming.content,
        turnIndex: messages[messages.length - 1]?.turnIndex ?? 0,
        isStreaming: true,
      });
    }
    return base;
  }, [messages, currentlyStreaming]);

  React.useEffect(() => {
    const node = scrollRef.current;
    if (node) {
      node.scrollTop = node.scrollHeight;
    }
  }, [combinedMessages]);

  const safeModelsPerRound = modelsInRound > 0 ? modelsInRound : 1;
  let lastRound: number | null = null;

  return (
    <div
      ref={scrollRef}
      className="mt-4 h-[420px] w-full overflow-y-auto rounded-lg border bg-background/60 px-4 py-3 space-y-3"
    >
      {combinedMessages.length === 0 && (
        <p className="text-sm text-muted-foreground">
          The conversation will appear here once it starts.
        </p>
      )}

      {combinedMessages.map((msg) => {
        const round = Math.floor(msg.turnIndex / safeModelsPerRound) + 1;
        const showDivider = !msg.isStreaming && round !== lastRound;
        if (showDivider) {
          lastRound = round;
        }

        const isUser = msg.role === "user";

        return (
          <React.Fragment key={`${msg.id}-${msg.isStreaming ? "stream" : "final"}`}>
            {showDivider && (
              <div className="my-2 flex items-center gap-2 text-[11px] text-muted-foreground">
                <span className="flex-1 h-px bg-border" />
                <span>Round {round}</span>
                <span className="flex-1 h-px bg-border" />
              </div>
            )}
            <div
              className={cn(
                "flex gap-2",
                isUser ? "justify-end" : "justify-start"
              )}
            >
              {!isUser && (
                <div className="mt-1">
                  <ModelBadge model={msg.model} />
                </div>
              )}
              <div
                className={cn(
                  "max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
                  isUser
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground",
                  msg.isStreaming && !isUser && "border border-dashed"
                )}
              >
                {msg.content}
                {msg.isStreaming && (
                  <span className="inline-block w-3 animate-pulse">
                    
                  </span>
                )}
              </div>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
