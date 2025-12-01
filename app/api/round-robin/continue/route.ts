import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/utils/supabaseServiceRole";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const { sessionId, message } = (await request.json()) as {
    sessionId?: number;
    message?: string;
  };

  const numericId = Number(sessionId);
  if (!numericId || Number.isNaN(numericId)) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role client unavailable" }, { status: 500 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("round_robin_sessions")
    .select("*")
    .eq("id", numericId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.status !== "awaiting_user") {
    return NextResponse.json(
      { error: `Cannot continue session with status: ${session.status}` },
      { status: 400 },
    );
  }

  const trimmed = message?.trim();
  if (trimmed) {
    const { error: messageError } = await supabase
      .from("round_robin_messages")
      .insert({
        session_id: numericId,
        model: "user",
        role: "user",
        content: trimmed,
        turn_index: session.current_turn_index ?? 0,
        token_count: null,
      });

    if (messageError) {
      console.error("[round-robin] Failed to save user message:", messageError);
    }
  }

  const { error: updateError } = await supabase
    .from("round_robin_sessions")
    .update({ status: "active", updated_at: new Date().toISOString() })
    .eq("id", numericId);

  if (updateError) {
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    streamUrl: `/api/round-robin/stream?sessionId=${numericId}`,
  });
}
