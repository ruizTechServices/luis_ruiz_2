export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/clients/ollama/client";

type TagsResponse = { models?: Array<{ name?: string }>; };

export async function GET() {
  try {
    const res = await fetch(`${getBaseUrl()}/api/tags`, { cache: "no-store" });
    if (!res.ok) {
      return NextResponse.json({ models: [] }, { status: 200 });
    }

    const json = (await res.json()) as TagsResponse;
    const models = (json.models ?? [])
      .map((m) => m?.name)
      .filter((n): n is string => Boolean(n));

    return NextResponse.json({ models });
  } catch (err) {
    console.error("/api/ollama/models error:", err);
    return NextResponse.json({ models: [] }, { status: 200 });
  }
}
