// providers/gemini.ts
// Adapter for Google Gemini models, translating requests/responses to shared format.

import { GoogleGenerativeAI, Content } from '@google/generative-ai';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_GEMINI_MODEL = 'gemini-3-flash-preview';

class GeminiProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiProviderError';
  }
}

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiProviderError('Missing GEMINI_API_KEY environment variable');
  }
  return new GoogleGenerativeAI(apiKey);
}

function toGeminiContent(message: RoundRobinMessage): Content {
  return {
    role: message.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: message.content }],
  };
}

export const geminiAdapter: ProviderAdapter = {
  name: 'gemini',
  contextLimit: MODEL_CONTEXT_LIMITS['gemini'] ?? 1_000_000,

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.GEMINI_API_KEY);
  },

  // NOTE: truncation is handled by the stream route before calling this adapter
  async generateResponse(messages: RoundRobinMessage[], systemPrompt: string) {
    const client = getClient();

    // Gemini requires the last turn to be user/input; coerce if needed.
    const conversation = [...messages];
    if (conversation.length === 0 || conversation[conversation.length - 1].role !== 'user') {
      conversation.push({
        ...conversation[conversation.length - 1],
        role: 'user',
        content: 'Continue the discussion based on the conversation above. Provide your next contribution.',
      });
    }

    const model = client.getGenerativeModel({
      model: DEFAULT_GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    try {
      const chat = model.startChat({
        history: conversation.slice(0, -1).map(toGeminiContent),
      });

      const lastMessage = conversation[conversation.length - 1];
      const result = await chat.sendMessage(lastMessage?.content ?? '');
      const response = result.response;
      const content = response.text().trim();

      if (!content) {
        throw new GeminiProviderError('Gemini returned an empty response');
      }

      const tokenCount = countTokens(content);
      return { content, tokenCount };
    } catch (error) {
      console.error('[round-robin] gemini error', {
        model: DEFAULT_GEMINI_MODEL,
        messageCount: messages.length,
        lastRole: messages.at(-1)?.role,
        error: error instanceof Error ? error.message : error,
      });
      if (error instanceof GeminiProviderError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Gemini error';
      throw new GeminiProviderError(message);
    }
  },
};

export default geminiAdapter;
