export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";

export async function POST(req: Request) {
  try {
    const { text, model } = await req.json();
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json({ error: "'text' must be a non-empty string" }, { status: 400 });
    }

    const embedding = await getTextEmbedding(text, model);
    return NextResponse.json({ embedding });
  } catch (err) {
    console.error("/api/embeddings error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
