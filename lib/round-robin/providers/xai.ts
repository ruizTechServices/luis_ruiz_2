// providers/xai.ts
// Adapter for xAI models (e.g., Grok) with normalized request and response plumbing.

import OpenAI from 'openai';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_XAI_MODEL = 'grok-4-1-fast';

class XAIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'XAIProviderError';
  }
}

function getClient(): OpenAI {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) {
    throw new XAIProviderError('Missing XAI_API_KEY environment variable');
  }
  return new OpenAI({
    apiKey,
    baseURL: 'https://api.x.ai/v1',
    timeout: 120000,
  });
}

function toChatMessage(message: RoundRobinMessage): OpenAI.Chat.Completions.ChatCompletionMessageParam {
  return {
    role: message.role,
    content: message.content,
  };
}

export const xaiAdapter: ProviderAdapter = {
  name: 'xai',
  contextLimit: MODEL_CONTEXT_LIMITS['xai'] ?? 131_072,

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.XAI_API_KEY);
  },

  // NOTE: truncation is handled by the stream route before calling this adapter
  async generateResponse(messages: RoundRobinMessage[], systemPrompt: string) {
    const client = getClient();

    const payloadMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map(toChatMessage),
    ];

    try {
      const completion = await client.chat.completions.create({
        model: DEFAULT_XAI_MODEL,
        temperature: 0.7,
        messages: payloadMessages,
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new XAIProviderError('xAI returned an empty response');
      }

      const tokenCount = completion.usage?.total_tokens ?? countTokens(content);
      return { content, tokenCount };
    } catch (error) {
      console.error('[round-robin] xai error', {
        model: DEFAULT_XAI_MODEL,
        messageCount: messages.length,
        lastRole: messages.at(-1)?.role,
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof XAIProviderError) throw error;
      const message =
        error instanceof OpenAI.APIError
          ? `${error.status ?? ''} ${error.message}`.trim()
          : error instanceof Error
            ? error.message
            : 'Unknown xAI error';
      throw new XAIProviderError(message);
    }
  },
};

export default xaiAdapter;
