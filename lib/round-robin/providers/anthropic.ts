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

    try {
      const response = await client.messages.create({
        model: DEFAULT_ANTHROPIC_MODEL,
        max_tokens: 2048,
        system: systemPrompt,
        messages: messages.map(toAnthropicMessage),
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
      if (error instanceof AnthropicProviderError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Anthropic error';
      throw new AnthropicProviderError(message);
    }
  },
};

export default anthropicAdapter;
