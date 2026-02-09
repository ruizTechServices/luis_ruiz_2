import { NextResponse } from 'next/server';

import { DEFAULT_TURN_ORDER } from '@/lib/round-robin/constants';
import { createServiceRoleClient } from '@/lib/clients/supabase/service-role';

type StartSessionPayload = {
  topic: string;
  turnOrder?: string[];
  activeModels?: string[];
  userId?: string;
};

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as StartSessionPayload;
    const topic = body.topic?.trim();

    if (!topic) {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const turnOrder = Array.isArray(body.turnOrder) && body.turnOrder.length > 0 ? body.turnOrder : DEFAULT_TURN_ORDER;
    const activeModels = Array.isArray(body.activeModels) && body.activeModels.length > 0 ? body.activeModels : turnOrder;

    const supabase = createServiceRoleClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Supabase service role client unavailable' }, { status: 500 });
    }

    const { data: session, error } = await supabase
      .from('round_robin_sessions')
      .insert({
        topic,
        turn_order: turnOrder,
        active_models: activeModels,
        current_turn_index: 0,
        status: 'active',
        user_id: body.userId ?? null,
      })
      .select('id, topic, turn_order, active_models')
      .single();

    if (error || !session) {
      const message = error?.message ?? 'Failed to create session';
      return NextResponse.json({ error: message }, { status: 500 });
    }

    const { error: messageError } = await supabase
      .from('round_robin_messages')
      .insert({
        session_id: session.id,
        model: 'user',
        role: 'user',
        content: topic,
        turn_index: 0,
        token_count: null,
      });

    if (messageError) {
      console.error('[round-robin] Failed to persist initial topic:', messageError);
    }

    return NextResponse.json({
      sessionId: session.id,
      streamUrl: `/api/round-robin/stream?sessionId=${session.id}`,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
