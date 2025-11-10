import { NextRequest } from "next/server";
import type { OllamaMessage } from "@/lib/clients/ollama/types";
import { ollamaStream } from "@/lib/models/providers/ollama";
import { createServiceRoleClient } from "@/lib/utils/supabaseServiceRole";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { model, messages, temperature, top_p, chat_id, with_context, top_k, min_similarity } = (await req.json()) as {
    model: string;
    messages: OllamaMessage[];
    temperature?: number;
    top_p?: number;
    chat_id?: number | null;
    with_context?: boolean; // optional: whether to augment with retrieved context
    top_k?: number;         // optional: how many contexts to retrieve
    min_similarity?: number; // optional: filter by similarity threshold
  };

  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.warn("[api/ollama] Supabase service-role client unavailable. Persistence will be skipped.");
  }

  const encoder = new TextEncoder();
  let sessionId: number | null = chat_id ?? null;
  let assistantText = "";

  // Helper: safe RPC call
  async function nextChatId(): Promise<number> {
    if (!supabase) return Math.floor(Date.now() / 1000);
    const { data, error } = await supabase.rpc("next_chat_id");
    if (error || typeof data !== "number") {
      console.warn("next_chat_id RPC failed, falling back to timestamp:", error);
      return Math.floor(Date.now() / 1000);
    }
    return data;
  }

  // Resolve the current user prompt (last user message)
  const lastUser = [...messages].reverse().find(m => m.role === "user");
  const userContent = lastUser?.content?.trim() ?? "";

  if (!sessionId) {
    sessionId = await nextChatId();
  }

  // Insert user message + embeddings (and into gios_context)
  let userMessageId: number | null = null;
  let userEmbedding: number[] | null = null;
  if (userContent && supabase) {
    try {
      const { data: msgRow, error: insErr } = await supabase
        .from("chat_messages")
        .insert({ chat_id: sessionId, message: userContent })
        .select("id")
        .single();
      if (insErr) throw insErr;
      userMessageId = msgRow?.id ?? null;

      userEmbedding = await getTextEmbedding(userContent);

      // Save to chat_embeddings (duplicate store per your preference)
      if (userMessageId) {
        await supabase.from("chat_embeddings").insert({
          role: "user",
          embedding: userEmbedding,
          message: userContent,
          chat_id: userMessageId,
        });
      }

      // Save to gios_context
      await supabase.from("gios_context").insert({
        session_id: sessionId,
        message_id: userMessageId,
        role: "user",
        model,
        source: "conversation",
        content: userContent,
        embedding: userEmbedding,
      });
    } catch (e) {
      console.error("Failed to persist user message/embedding:", e);
    }
  }

  // Optional: retrieve similar context to augment the prompt (disabled by default)
  let messagesForModel: OllamaMessage[] = messages;
  if (with_context && supabase && userEmbedding) {
    try {
      const { data: ctxRows, error: ctxErr } = await supabase.rpc(
        "match_gios_context",
        {
          query_embedding: userEmbedding,
          match_count: top_k ?? 5,
          min_similarity: min_similarity ?? null,
        },
      );
      if (ctxErr) throw ctxErr;
      if (Array.isArray(ctxRows) && ctxRows.length > 0) {
        const rows = ctxRows as Array<{ content: string }>;
        const ctxText = rows.map((r, i) => `(${i + 1}) ${r.content}`).join("\n---\n");
        const systemCtx: OllamaMessage = {
          role: "system",
          content: `Relevant context (most similar first):\n${ctxText}\n\nIf context is irrelevant, ignore it. Answer concisely.`,
        };
        messagesForModel = [systemCtx, ...messages];
      }
    } catch (e) {
      console.warn("Context retrieval failed, proceeding without context:", e);
    }
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of ollamaStream({ model, messages: messagesForModel, temperature, top_p })) {
          assistantText += chunk;
          controller.enqueue(encoder.encode(chunk));
        }
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : typeof e === "string" ? e : "stream failed";
        controller.enqueue(encoder.encode(`[error] ${message}`));
      } finally {
        controller.close();
        // After stream completes, persist assistant message and embeddings
        if (assistantText && supabase) {
          try {
            const { data: msgRow, error: insErr } = await supabase
              .from("chat_messages")
              .insert({ chat_id: sessionId, message: assistantText })
              .select("id")
              .single();
            if (insErr) throw insErr;
            const assistantMessageId = msgRow?.id ?? null;

            const assistantEmbedding = await getTextEmbedding(assistantText);

            if (assistantMessageId) {
              await supabase.from("chat_embeddings").insert({
                role: "assistant",
                embedding: assistantEmbedding,
                message: assistantText,
                chat_id: assistantMessageId,
              });
            }

            await supabase.from("gios_context").insert({
              session_id: sessionId,
              message_id: assistantMessageId,
              role: "assistant",
              model,
              source: "conversation",
              content: assistantText,
              embedding: assistantEmbedding,
            });
          } catch (e) {
            console.error("Failed to persist assistant message/embedding:", e);
          }
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "x-chat-id": String(sessionId ?? ""),
      "x-db-persist": supabase ? "on" : "off",
      "x-context-requested": with_context ? "true" : "false",
    },
  });
}
