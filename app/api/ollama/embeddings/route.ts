export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/clients/ollama/client";

export async function POST(req: Request) {
  try {
    const { text, model } = (await req.json()) as { text?: string; model?: string };
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "'text' must be a non-empty string" }, { status: 400 });
    }

    const base = getBaseUrl();
    const res = await fetch(`${base}/api/embeddings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || "nomic-embed-text:latest",
        prompt: text,
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      // Return gracefully with a message; keeps UI stable
      return NextResponse.json({ error: `ollama embeddings failed (${res.status})` }, { status: 200 });
    }

    const json = (await res.json()) as { embedding?: number[] };
    const embedding = Array.isArray(json?.embedding) ? json.embedding : [];
    return NextResponse.json({ embedding });
  } catch (err) {
    console.error("/api/ollama/embeddings error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
