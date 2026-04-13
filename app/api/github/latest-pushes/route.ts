export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getLatestPushes } from "@/lib/github/latest-pushes";

export async function GET() {
  try {
    const feed = await getLatestPushes();
    return NextResponse.json(feed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown GitHub error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
