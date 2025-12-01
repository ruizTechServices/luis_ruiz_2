"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  SessionInitEvent,
  TurnStartEvent,
  ContentChunkEvent,
  TurnCompleteEvent,
  TurnErrorEvent,
  RoundCompleteEvent,
  LongWaitEvent,
  RoundRobinEventType,
} from "./events";

type Handlers = {
  onSessionInit?: (data: SessionInitEvent["data"]) => void;
  onTurnStart?: (data: TurnStartEvent["data"]) => void;
  onContentChunk?: (data: ContentChunkEvent["data"]) => void;
  onTurnComplete?: (data: TurnCompleteEvent["data"]) => void;
  onRoundComplete?: (data: RoundCompleteEvent["data"]) => void;
  onTurnError?: (data: TurnErrorEvent["data"]) => void;
  onLongWait?: (data: LongWaitEvent["data"]) => void;
  onError?: (error: Event) => void;
  onClose?: () => void;
};

export function useRoundRobinStream(handlers: Handlers) {
  const [isConnected, setIsConnected] = useState(false);
  const sourceRef = useRef<EventSource | null>(null);

  const disconnect = useCallback(() => {
    if (sourceRef.current) {
      sourceRef.current.close();
      sourceRef.current = null;
    }
    setIsConnected(false);
    handlers.onClose?.();
  }, [handlers]);

  const attachListener = useCallback(
    <T extends RoundRobinEventType, D>(
      source: EventSource,
      type: T,
      handler?: (data: D) => void
    ) => {
      if (!handler) return;
      source.addEventListener(type, (event: MessageEvent) => {
        try {
          const parsed = JSON.parse(event.data) as D;
          handler(parsed);
        } catch (err) {
          console.error("Failed to parse SSE event", type, err);
        }
      });
    },
    []
  );

  const connect = useCallback(
    (sessionId: number) => {
      if (!sessionId) return;
      if (sourceRef.current) {
        sourceRef.current.close();
        sourceRef.current = null;
      }

      const es = new EventSource(
        `/api/round-robin/stream?sessionId=${sessionId}`
      );
      sourceRef.current = es;

      es.onopen = () => {
        setIsConnected(true);
      };

      es.onerror = (event) => {
        handlers.onError?.(event);
        setIsConnected(false);
        es.close();
      };

      attachListener<"session_init", SessionInitEvent["data"]>(
        es,
        "session_init",
        handlers.onSessionInit
      );
      attachListener<"turn_start", TurnStartEvent["data"]>(
        es,
        "turn_start",
        handlers.onTurnStart
      );
      attachListener<"content_chunk", ContentChunkEvent["data"]>(
        es,
        "content_chunk",
        handlers.onContentChunk
      );
      attachListener<"turn_complete", TurnCompleteEvent["data"]>(
        es,
        "turn_complete",
        handlers.onTurnComplete
      );
      attachListener<"round_complete", RoundCompleteEvent["data"]>(
        es,
        "round_complete",
        handlers.onRoundComplete
      );
      attachListener<"turn_error", TurnErrorEvent["data"]>(
        es,
        "turn_error",
        handlers.onTurnError
      );
      attachListener<"long_wait", LongWaitEvent["data"]>(
        es,
        "long_wait",
        handlers.onLongWait
      );
    },
    [attachListener, handlers]
  );

  useEffect(() => {
    return () => {
      if (sourceRef.current) {
        sourceRef.current.close();
      }
    };
  }, []);

  return { connect, disconnect, isConnected };
}
