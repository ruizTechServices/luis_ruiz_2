export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getBaseUrl } from "@/lib/clients/ollama/client";

export async function GET() {
  const baseUrl = getBaseUrl();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 1500);
  try {
    const res = await fetch(`${baseUrl}/api/version`, {
      cache: "no-store",
      signal: controller.signal,
    });
    const online = res.ok;
    return NextResponse.json({ online, baseUrl });
  } catch {
    return NextResponse.json({ online: false, baseUrl });
  } finally {
    clearTimeout(timer);
  }
}
