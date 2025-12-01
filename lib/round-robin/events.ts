// events.ts
// Server-Sent Event types and helpers for round-robin streaming.

export type RoundRobinEventType =
  | "session_init"
  | "turn_start"
  | "content_chunk"
  | "turn_complete"
  | "turn_error"
  | "session_paused"
  | "session_resumed"
  | "session_completed"
  | "model_status"
  | "long_wait";

export interface BaseEvent<T extends RoundRobinEventType, D> {
  type: T;
  data: D;
}

export type SessionInitEvent = BaseEvent<"session_init", {
  sessionId: number;
  topic: string;
  turnOrder: string[];
  activeModels: string[];
}>;

export type TurnStartEvent = BaseEvent<"turn_start", {
  model: string;
  turnIndex: number;
}>;

export type ContentChunkEvent = BaseEvent<"content_chunk", {
  model: string;
  chunk: string;
  isComplete: boolean;
}>;

export type TurnCompleteEvent = BaseEvent<"turn_complete", {
  model: string;
  fullContent: string;
  tokenCount: number;
}>;

export type TurnErrorEvent = BaseEvent<"turn_error", {
  model: string;
  error: string;
  options: Array<"retry" | "skip" | "remove">;
}>;

export type SessionPausedEvent = BaseEvent<"session_paused", {
  reason: string;
}>;

export type SessionResumedEvent = BaseEvent<"session_resumed", {
  currentTurn: number;
}>;

export type SessionCompletedEvent = BaseEvent<"session_completed", {
  summary: string;
}>;

export type ModelStatusEvent = BaseEvent<"model_status", {
  model: string;
  status: "active" | "inactive" | "error";
  reason?: string;
}>;

export type LongWaitEvent = BaseEvent<"long_wait", {
  model: string;
  elapsedSeconds: number;
}>;

export type RoundRobinEvent =
  | SessionInitEvent
  | TurnStartEvent
  | ContentChunkEvent
  | TurnCompleteEvent
  | TurnErrorEvent
  | SessionPausedEvent
  | SessionResumedEvent
  | SessionCompletedEvent
  | ModelStatusEvent
  | LongWaitEvent;

export function serializeEvent(event: RoundRobinEvent): string {
  return `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\n\n`;
}
