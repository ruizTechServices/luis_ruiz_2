export const runtime = "nodejs";

import { NextResponse } from "next/server";
import openai from "@/lib/clients/openai/client";

export async function GET() {
  try {
    const { data } = await openai.models.list();
    const models = (data ?? []).map((m) => m.id);
    return NextResponse.json({ models });
  } catch (err) {
    console.error("/api/openai/models error:", err);
    // Return empty list gracefully so UI can still render
    return NextResponse.json({ models: [] }, { status: 200 });
  }
}
