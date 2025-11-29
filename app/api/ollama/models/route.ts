export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/clients/ollama/client";

type TagsResponse = { models?: Array<{ name?: string }>; };

export async function GET() {
  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(`${baseUrl}/api/tags`, {
      cache: "no-store",
      signal: controller.signal,
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          models: [],
          error: `Ollama responded with ${res.status}. Make sure the server at ${baseUrl} is healthy.`,
        },
        { status: 200 },
      );
    }

    const json = (await res.json()) as TagsResponse;
    const models = (json.models ?? [])
      .map((m) => m?.name)
      .filter((n): n is string => Boolean(n));

    return NextResponse.json({ models });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to reach Ollama";
    console.error("/api/ollama/models error:", err);
    return NextResponse.json(
      {
        models: [],
        error: `Unable to reach Ollama tags endpoint (${message}). Start Ollama locally or expose it via OLLAMA_BASE_URL.`,
      },
      { status: 200 },
    );
  } finally {
    clearTimeout(timer);
  }
}
