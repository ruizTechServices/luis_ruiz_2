// providers/huggingface.ts
// Adapter for Hugging Face Inference models with consistent API contracts.

import { InferenceClient } from '@huggingface/inference';

import type { ProviderAdapter, RoundRobinMessage } from '../types';
import { countTokens, MODEL_CONTEXT_LIMITS } from '../truncation';

const DEFAULT_HF_MODEL = process.env.HF_MODEL ?? 'HuggingFaceH4/zephyr-7b-beta';

class HuggingFaceProviderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'HuggingFaceProviderError';
  }
}

function getClient(): InferenceClient {
  const apiKey = process.env.HF_API_KEY;
  if (!apiKey) {
    throw new HuggingFaceProviderError('Missing HF_API_KEY environment variable');
  }
  return new InferenceClient(apiKey);
}

function toHFMessage(message: RoundRobinMessage): { role: 'user' | 'assistant'; content: string } {
  return {
    role: message.role,
    content: message.content,
  };
}

export const huggingfaceAdapter: ProviderAdapter = {
  name: 'huggingface',
  contextLimit: MODEL_CONTEXT_LIMITS['huggingface'] ?? 8_192,

  async isAvailable(): Promise<boolean> {
    return Boolean(process.env.HF_API_KEY);
  },

  // NOTE: truncation is handled by the stream route before calling this adapter
  async generateResponse(messages: RoundRobinMessage[], systemPrompt: string) {
    const client = getClient();

    try {
      const response = await client.chatCompletion({
        model: DEFAULT_HF_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages.map(toHFMessage),
        ],
        max_tokens: 1024,
      });

      const content = response.choices?.[0]?.message?.content?.trim() ?? '';
      if (!content) {
        throw new HuggingFaceProviderError('HuggingFace returned an empty response');
      }

      const tokenCount = response.usage?.total_tokens ?? countTokens(content);
      return { content, tokenCount };
    } catch (error) {
      if (error instanceof HuggingFaceProviderError) throw error;
      const message = error instanceof Error ? error.message : 'Unknown HuggingFace error';
      throw new HuggingFaceProviderError(message);
    }
  },
};

export default huggingfaceAdapter;
