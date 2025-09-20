// lib/clients/ollama/client.ts
import { parseNDJSON } from "../ollama/ndjson";
import type { OllamaChatRequest, OllamaStreamEvent } from "../ollama/types";

/**
 * Returns the base URL for Ollama API requests.
 * 
 * Defaults to `http://localhost:11434` if `OLLAMA_BASE_URL` environment variable is not set.
 */
export function getBaseUrl() {
  return process.env.OLLAMA_BASE_URL?.replace(/\/+$/, "") || "http://localhost:11434";
}

export type ChatStreamParams = {
  body: Omit<OllamaChatRequest, "stream"> & { stream?: boolean };
  signal?: AbortSignal;
  headers?: Record<string, string>;
};

/** Streams NDJSON events from Ollama /api/chat */
export async function* chatStream({
  body,
  signal,
  headers,
}: ChatStreamParams): AsyncGenerator<OllamaStreamEvent> {
  const res = await fetch(`${getBaseUrl()}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...headers },
    // @ts-expect-error Node hint; harmless elsewhere
    duplex: "half",
    body: JSON.stringify({ ...body, stream: true }),
    signal,
  });

  if (!res.ok || !res.body) {
    throw new Error(`Ollama request failed (${res.status})`);
  }

  const reader = res.body.getReader();
  for await (const evt of parseNDJSON(reader)) {
    yield evt as OllamaStreamEvent;
  }
}
