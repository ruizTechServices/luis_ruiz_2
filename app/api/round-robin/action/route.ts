import { NextResponse } from "next/server";

import { DEFAULT_TURN_ORDER, MAX_RETRY_ATTEMPTS } from "@/lib/round-robin/constants";
import { createServiceRoleClient } from "@/lib/utils/supabaseServiceRole";

type ActionBody = {
  sessionId: number;
  action: "retry" | "skip" | "remove" | "pause" | "resume";
  model?: string;
};

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ActionBody;
    const sessionId = Number(body.sessionId);

    if (!sessionId || Number.isNaN(sessionId)) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!body.action) {
      return NextResponse.json({ error: "action is required" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: "Supabase service role client unavailable" }, { status: 500 });
    }

    const { data: session, error } = await supabase
      .from("round_robin_sessions")
      .select("*")
      .eq("id", sessionId)
      .single();

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    let activeModels: string[] = session.active_models ?? session.turn_order ?? DEFAULT_TURN_ORDER;
    if (!Array.isArray(activeModels) || activeModels.length === 0) {
      activeModels = DEFAULT_TURN_ORDER;
    }

    const currentTurnIndex: number = session.current_turn_index ?? 0;

    if (["retry", "skip", "remove"].includes(body.action) && !body.model) {
      return NextResponse.json({ error: "model is required for this action" }, { status: 400 });
    }

    let nextStatus = session.status ?? "active";
    let nextTurnIndex = currentTurnIndex;
    let nextActiveModels = [...activeModels];
    let nextErrorContext = session.error_context ?? null;

    switch (body.action) {
      case "retry": {
        const retryCount = (session.error_context?.retryCount ?? 0) + 1;
        if (retryCount > MAX_RETRY_ATTEMPTS) {
          return NextResponse.json(
            { error: `Retry limit reached (${MAX_RETRY_ATTEMPTS})` },
            { status: 400 }
          );
        }
        nextStatus = "active";
        nextErrorContext = { model: body.model, error: null, retryCount };
        break;
      }
      case "skip": {
        nextTurnIndex = (currentTurnIndex + 1) % nextActiveModels.length;
        nextStatus = "active";
        nextErrorContext = null;
        break;
      }
      case "remove": {
        nextActiveModels = nextActiveModels.filter((m) => m !== body.model);
        if (nextActiveModels.length === 0) {
          nextStatus = "completed";
        }
        nextTurnIndex = nextActiveModels.length ? nextTurnIndex % nextActiveModels.length : 0;
        nextErrorContext = null;
        break;
      }
      case "pause": {
        nextStatus = "paused";
        break;
      }
      case "resume": {
        if (session.status !== "paused" && session.status !== "awaiting_user") {
          return NextResponse.json(
            { error: "Session is not paused or awaiting user input" },
            { status: 400 },
          );
        }
        nextStatus = "active";
        nextErrorContext = null;
        break;
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    const { data: updatedSession, error: updateError } = await supabase
      .from("round_robin_sessions")
      .update({
        status: nextStatus,
        current_turn_index: nextTurnIndex,
        active_models: nextActiveModels,
        error_context: nextErrorContext,
      })
      .eq("id", sessionId)
      .select("*")
      .single();

    if (updateError || !updatedSession) {
      return NextResponse.json({ error: updateError?.message ?? "Failed to update session" }, { status: 500 });
    }

    return NextResponse.json({ session: updatedSession });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
