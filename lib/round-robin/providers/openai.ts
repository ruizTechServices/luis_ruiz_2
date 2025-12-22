import OpenAI from 'openai';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_OPENAI_MODEL = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';

class OpenAIProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OpenAIProviderError';
  }
}

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new OpenAIProviderError('Missing OPENAI_API_KEY environment variable');
  }
  return new OpenAI({ apiKey });
}

function toChatMessage(message: RoundRobinMessage): OpenAI.Chat.Completions.ChatCompletionMessageParam {
  return {
    role: message.role,
    content: message.content,
  };
}

export const openAIAdapter: ProviderAdapter = {
  name: 'openai',
  contextLimit: MODEL_CONTEXT_LIMITS['openai'] ?? 128_000,

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.OPENAI_API_KEY);
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
        model: DEFAULT_OPENAI_MODEL,
        temperature: 0.7,
        messages: payloadMessages,
      });

      const content = completion.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new OpenAIProviderError('OpenAI returned an empty response');
      }

      const tokenCount = completion.usage?.total_tokens ?? countTokens(content);

      return {
        content,
        tokenCount,
      };
    } catch (error) {
      console.error('[round-robin] openai error', {
        model: DEFAULT_OPENAI_MODEL,
        messageCount: messages.length,
        lastRole: messages.at(-1)?.role,
        error: error instanceof Error ? error.message : error,
      });
      const message =
        error instanceof OpenAI.APIError
          ? `${error.status ?? ''} ${error.error?.message ?? error.message}`.trim()
          : error instanceof Error
            ? error.message
            : 'Unknown OpenAI error';
      throw new OpenAIProviderError(message);
    }
  },
};

export default openAIAdapter;
