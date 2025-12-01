import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/utils/supabaseServiceRole";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const sessionIdParam = request.nextUrl.searchParams.get("sessionId");
  if (!sessionIdParam) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const sessionId = Number(sessionIdParam);
  if (Number.isNaN(sessionId)) {
    return NextResponse.json({ error: "sessionId must be numeric" }, { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase service role client unavailable" }, { status: 500 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("round_robin_sessions")
    .select("*")
    .eq("id", sessionId)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const { data: messages, error: messagesError } = await supabase
    .from("round_robin_messages")
    .select("*")
    .eq("session_id", sessionId)
    .order("turn_index", { ascending: true })
    .order("created_at", { ascending: true });

  if (messagesError) {
    return NextResponse.json({ error: "Failed to load session messages" }, { status: 500 });
  }

  return NextResponse.json({
    session,
    messages: messages ?? [],
    currentTurn: session.current_turn_index ?? 0,
  });
}
