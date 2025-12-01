import { NextRequest } from 'next/server';

import {
  DEFAULT_TURN_ORDER,
  LONG_WAIT_THRESHOLD_SECONDS,
  ROUND_ROBIN_SYSTEM_PROMPT,
  SUPPORTED_MODELS,
} from '@/lib/round-robin/constants';
import { createRoundCompleteEvent, serializeEvent } from '@/lib/round-robin/events';
import openAIAdapter from '@/lib/round-robin/providers/openai';
import { truncateHistory } from '@/lib/round-robin/truncation';
import type { ProviderAdapter, RoundRobinMessage } from '@/lib/round-robin/types';
import { createServiceRoleClient } from '@/lib/utils/supabaseServiceRole';

const adapterRegistry: Record<string, ProviderAdapter> = {
  openai: openAIAdapter,
};

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const sessionIdParam = request.nextUrl.searchParams.get('sessionId');
  if (!sessionIdParam) {
    return new Response('sessionId is required', { status: 400 });
  }

  const sessionId = Number(sessionIdParam);
  if (Number.isNaN(sessionId)) {
    return new Response('sessionId must be numeric', { status: 400 });
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return new Response('Supabase service role client unavailable', { status: 500 });
  }

  const { data: session, error: sessionError } = await supabase
    .from('round_robin_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return new Response('Session not found', { status: 404 });
  }

  const adapter = adapterRegistry.openai;
  if (!(await adapter.isAvailable())) {
    return new Response('OpenAI adapter unavailable', { status: 503 });
  }

  const { data: historyRows, error: historyError } = await supabase
    .from('round_robin_messages')
    .select('*')
    .eq('session_id', sessionId)
    .order('turn_index', { ascending: true })
    .order('created_at', { ascending: true });

  if (historyError) {
    return new Response('Failed to load session history', { status: 500 });
  }

  const history: RoundRobinMessage[] = (historyRows ?? []).map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    model: row.model,
    role: row.role,
    content: row.content ?? '',
    embedding: row.embedding ?? undefined,
    createdAt: row.created_at ? new Date(row.created_at) : new Date(),
    turnIndex: row.turn_index ?? 0,
    tokenCount: row.token_count ?? undefined,
  }));

  const initialTurnOrder: string[] =
    Array.isArray(session.turn_order) && session.turn_order.length
      ? session.turn_order
      : DEFAULT_TURN_ORDER;

  const participants: string[] =
    Array.isArray(session.active_models) && session.active_models.length
      ? session.active_models
      : initialTurnOrder;

  const activeTurnOrder = initialTurnOrder.filter((id) => participants.includes(id));
  const modelsInRound = activeTurnOrder.length;

  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueueEvent = (event: Parameters<typeof serializeEvent>[0]) => {
        controller.enqueue(encoder.encode(serializeEvent(event)));
      };

      enqueueEvent({
        type: 'session_init',
        data: {
          sessionId,
          topic: session.topic,
          turnOrder: initialTurnOrder,
          activeModels: participants,
        },
      });

      let currentTurnIndex: number = session.current_turn_index ?? 0;
      const currentRound: number = session.current_round ?? 1;

      if (modelsInRound === 0) {
        enqueueEvent({
          type: 'session_paused',
          data: { reason: 'No active models configured' },
        });
        controller.close();
        return;
      }

      // User-gated rounds: run exactly one full round (one turn per active model),
      // then pause and wait for explicit user input via /continue or /action.
      while (true) {
        const turnsCompletedThisRound = currentTurnIndex % modelsInRound;
        const modelId = activeTurnOrder[turnsCompletedThisRound];
        const provider = adapterRegistry[modelId] ?? adapterRegistry.openai;

        enqueueEvent({ type: 'turn_start', data: { model: modelId, turnIndex: currentTurnIndex } });

        const trimmedHistory = await truncateHistory(history, modelId);
        const systemPrompt = buildSystemPrompt(modelId, session.topic, participants);

        const longWaitTimer = setTimeout(() => {
          enqueueEvent({
            type: 'long_wait',
            data: { model: modelId, elapsedSeconds: LONG_WAIT_THRESHOLD_SECONDS },
          });
        }, LONG_WAIT_THRESHOLD_SECONDS * 1000);

        try {
          const result = await provider.generateResponse(trimmedHistory, systemPrompt);
          clearTimeout(longWaitTimer);

          emitContentChunks(result.content, modelId, enqueueEvent);
          enqueueEvent({
            type: 'turn_complete',
            data: { model: modelId, fullContent: result.content, tokenCount: result.tokenCount },
          });

          try {
            const { error: saveError } = await supabase
              .from('round_robin_messages')
              .insert({
                session_id: sessionId,
                model: modelId,
                role: 'assistant',
                content: result.content,
                turn_index: currentTurnIndex,
                token_count: result.tokenCount,
              });

            if (saveError) {
              console.error('[round-robin] Failed to persist assistant message:', saveError);
            }
          } catch (persistError) {
            console.error('[round-robin] Unexpected error while persisting assistant message:', persistError);
          }

          history.push({
            id: Date.now(),
            sessionId,
            role: 'assistant',
            model: modelId,
            content: result.content,
            createdAt: new Date(),
            turnIndex: currentTurnIndex,
            tokenCount: result.tokenCount,
          });

          const newTurnIndex = currentTurnIndex + 1;
          const roundComplete = (newTurnIndex % modelsInRound) === 0;

          if (roundComplete) {
            await supabase
              .from('round_robin_sessions')
              .update({
                current_turn_index: newTurnIndex,
                current_round: currentRound + 1,
                status: 'awaiting_user',
                error_context: null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', sessionId);

            enqueueEvent(createRoundCompleteEvent(currentRound));
            controller.close();
            return;
          }

          currentTurnIndex = newTurnIndex;

          await supabase
            .from('round_robin_sessions')
            .update({
              current_turn_index: currentTurnIndex,
              error_context: null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);
        } catch (providerError) {
          clearTimeout(longWaitTimer);
          const message = providerError instanceof Error ? providerError.message : 'Unknown provider error';
          enqueueEvent({
            type: 'turn_error',
            data: { model: modelId, error: message, options: ['retry', 'skip', 'remove'] },
          });

          await supabase
            .from('round_robin_sessions')
            .update({
              status: 'error',
              error_context: { model: modelId, error: message, retryCount: 0 },
              updated_at: new Date().toISOString(),
            })
            .eq('id', sessionId);

          controller.close();
          return;
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      Connection: 'keep-alive',
      'Cache-Control': 'no-cache, no-transform',
    },
  });
}

function emitContentChunks(
  content: string,
  modelId: string,
  enqueueEvent: (event: Parameters<typeof serializeEvent>[0]) => void,
) {
  const chunkSize = 400;
  for (let i = 0; i < content.length; i += chunkSize) {
    const chunk = content.slice(i, i + chunkSize);
    const isComplete = i + chunkSize >= content.length;
    enqueueEvent({
      type: 'content_chunk',
      data: { model: modelId, chunk, isComplete },
    });
  }
}

function buildSystemPrompt(modelId: string, topic: string, participants: string[]) {
  const participantList = participants
    .map((id) => SUPPORTED_MODELS.find((model) => model.id === id)?.name ?? id)
    .join(', ');
  const modelName = SUPPORTED_MODELS.find((model) => model.id === modelId)?.name ?? modelId;

  return ROUND_ROBIN_SYSTEM_PROMPT.replace('{model_name}', modelName)
    .replace('{participant_list}', participantList)
    .concat(`\n\nTopic: ${topic}`);
}
