export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getOpenAICompletion } from "@/lib/functions/openai/responses";

export async function POST(req: Request) {
  try {
    const { message, model, system, maxOutputTokens } = await req.json();
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "'message' must be a non-empty string" }, { status: 400 });
    }

    const text = await getOpenAICompletion(message, model, {
      system,
      maxOutputTokens,
    });

    return NextResponse.json({ text });
  } catch (err) {
    console.error("/api/responses error:", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
