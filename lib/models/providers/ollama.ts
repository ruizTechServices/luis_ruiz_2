// lib/models/providers/ollama.ts
import { chatStream } from "@/lib/clients/ollama/client";
import type { OllamaMessage } from "@/lib/clients/ollama/types";

export type OllamaProviderOpts = {
  model: string;
  messages: OllamaMessage[];
  temperature?: number;
  top_p?: number;
  signal?: AbortSignal;
};

/** Thin provider: converts Ollama events → plain text chunks */
export async function* ollamaStream(opts: OllamaProviderOpts) {
  const { model, messages, temperature, top_p, signal } = opts;

  for await (const evt of chatStream({
    signal,
    body: {
      model,
      messages,
      options: {
        ...(temperature !== undefined ? { temperature } : {}),
        ...(top_p !== undefined ? { top_p } : {}),
      },
    },
  })) {
    const piece = evt?.message?.content ?? "";
    if (piece) yield piece;
    if (evt?.done) break;
  }
}
