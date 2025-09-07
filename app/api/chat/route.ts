// app/api/chat/route.ts
import { NextRequest } from "next/server";
import type { OllamaMessage } from "@/lib/clients/ollama/types";
import { ollamaStream } from "@/lib/models/providers/ollama";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { model, messages, temperature } = (await req.json()) as {
    model: string;
    messages: OllamaMessage[];
    temperature?: number;
  };

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of ollamaStream({ model, messages, temperature })) {
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e: any) {
        controller.enqueue(encoder.encode(`[error] ${e?.message ?? "stream failed"}`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
