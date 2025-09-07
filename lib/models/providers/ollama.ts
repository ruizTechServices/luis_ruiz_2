// lib/models/providers/ollama.ts
import { chatStream } from "@/lib/clients/ollama/client";
import type { OllamaMessage } from "@/lib/clients/ollama/types";

export type OllamaProviderOpts = {
  model: string;
  messages: OllamaMessage[];
  temperature?: number;
  signal?: AbortSignal;
};

/** Thin provider: converts Ollama events → plain text chunks */
export async function* ollamaStream(opts: OllamaProviderOpts) {
  const { model, messages, temperature, signal } = opts;

  for await (const evt of chatStream({
    signal,
    body: {
      model,
      messages,
      options: { temperature: temperature ?? 0.6 },
    },
  })) {
    const piece = evt?.message?.content ?? "";
    if (piece) yield piece;
    if (evt?.done) break;
  }
}
