// providers/gemini.ts
// Adapter for Google Gemini models, translating requests/responses to shared format.

import { GoogleGenerativeAI, Content } from '@google/generative-ai';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';

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
    const model = client.getGenerativeModel({
      model: DEFAULT_GEMINI_MODEL,
      systemInstruction: systemPrompt,
    });

    try {
      const chat = model.startChat({
        history: messages.slice(0, -1).map(toGeminiContent),
      });

      const lastMessage = messages[messages.length - 1];
      const result = await chat.sendMessage(lastMessage?.content ?? '');
      const response = result.response;
      const content = response.text().trim();

      if (!content) {
        throw new GeminiProviderError('Gemini returned an empty response');
      }

      const tokenCount = countTokens(content);
      return { content, tokenCount };
    } catch (error) {
      if (error instanceof GeminiProviderError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown Gemini error';
      throw new GeminiProviderError(message);
    }
  },
};

export default geminiAdapter;
