// providers/anthropic.ts
// Adapter for invoking Anthropic models with unified request/response handling.

import Anthropic from '@anthropic-ai/sdk';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-sonnet-4-20250514';

class AnthropicProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnthropicProviderError';
  }
}

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new AnthropicProviderError('Missing ANTHROPIC_API_KEY environment variable');
  }
  return new Anthropic({ apiKey });
}

function toAnthropicMessage(message: RoundRobinMessage): Anthropic.MessageParam {
  return {
    role: message.role,
    content: message.content,
  };
}

export const anthropicAdapter: ProviderAdapter = {
  name: 'anthropic',
  contextLimit: MODEL_CONTEXT_LIMITS['anthropic'] ?? 200_000,

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.ANTHROPIC_API_KEY);
  },

  // NOTE: truncation is handled by the stream route before calling this adapter
  async generateResponse(messages: RoundRobinMessage[], systemPrompt: string) {
    const client = getClient();
    const conversation = messages.map(toAnthropicMessage);

    // Anthropic expects the last turn to be user/input; ensure we end on a user role.
    if (conversation.length === 0 || conversation[conversation.length - 1].role !== 'user') {
      conversation.push({
        role: 'user',
        content: 'Continue the discussion based on the conversation above. Provide your next contribution.',
      });
    }

    try {
      const response = await client.messages.create({
        model: DEFAULT_ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: conversation,
      });

      const textBlock = response.content.find((block) => block.type === 'text');
      const content = textBlock && 'text' in textBlock ? textBlock.text.trim() : '';
      if (!content) {
        throw new AnthropicProviderError('Anthropic returned an empty response');
      }

      const tokenCount =
        (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0) ||
        countTokens(content);

      return { content, tokenCount };
    } catch (error) {
      console.error('[round-robin] anthropic error', {
        model: DEFAULT_ANTHROPIC_MODEL,
        messageCount: messages.length,
        lastRole: messages.at(-1)?.role,
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof AnthropicProviderError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Anthropic error';
      throw new AnthropicProviderError(message);
    }
  },
};

export default anthropicAdapter;
