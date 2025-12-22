// providers/mistral.ts
// Adapter for Mistral models, wrapping authentication and payload shaping.

import { Mistral } from '@mistralai/mistralai';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_MISTRAL_MODEL = process.env.MISTRAL_MODEL ?? 'mistral-small-latest';

class MistralProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MistralProviderError';
  }
}

function getClient(): Mistral {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    throw new MistralProviderError('Missing MISTRAL_API_KEY environment variable');
  }
  return new Mistral({ apiKey });
}

function toMistralMessage(message: RoundRobinMessage): { role: 'user' | 'assistant'; content: string } {
  return {
    role: message.role,
    content: message.content,
  };
}

export const mistralAdapter: ProviderAdapter = {
  name: 'mistral',
  contextLimit: MODEL_CONTEXT_LIMITS['mistral'] ?? 32_000,

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.MISTRAL_API_KEY);
  },

  // NOTE: truncation is handled by the stream route before calling this adapter
  async generateResponse(messages: RoundRobinMessage[], systemPrompt: string) {
    const client = getClient();
    const conversation = messages.map(toMistralMessage);

    // Mistral requires the last message to be 'user' or 'tool'; enforce a user turn to avoid 400 errors.
    if (conversation.length === 0 || conversation[conversation.length - 1].role !== 'user') {
      conversation.push({
        role: 'user',
        content: 'Continue the discussion based on the conversation above. Provide your next contribution.',
      });
    }

    try {
      const response = await client.chat.complete({
        model: DEFAULT_MISTRAL_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversation,
        ],
      });

      const choice = response.choices?.[0];
      const content = typeof choice?.message?.content === 'string'
        ? choice.message.content.trim()
        : '';

      if (!content) {
        throw new MistralProviderError('Mistral returned an empty response');
      }

      const tokenCount = response.usage?.totalTokens ?? countTokens(content);
      return { content, tokenCount };
    } catch (error) {
      console.error('[round-robin] mistral error', {
        model: DEFAULT_MISTRAL_MODEL,
        messageCount: messages.length,
        lastRole: messages.at(-1)?.role,
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof MistralProviderError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Mistral error';
      throw new MistralProviderError(message);
    }
  },
};

export default mistralAdapter;
