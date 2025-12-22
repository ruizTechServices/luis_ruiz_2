// providers/index.ts
// Barrel export for round-robin provider adapters.

export { openAIAdapter } from './openai';
export { anthropicAdapter } from './anthropic';
export { geminiAdapter } from './gemini';
export { mistralAdapter } from './mistral';
export { huggingfaceAdapter } from './huggingface';
export { xaiAdapter } from './xai';

import { openAIAdapter } from './openai';
import { anthropicAdapter } from './anthropic';
import { geminiAdapter } from './gemini';
import { mistralAdapter } from './mistral';
import { huggingfaceAdapter } from './huggingface';
import { xaiAdapter } from './xai';
import type { ProviderAdapter } from '../types';

// Registry mapping model IDs to their adapters
export const adapterRegistry: Record<string, ProviderAdapter> = {
  openai: openAIAdapter,
  anthropic: anthropicAdapter,
  gemini: geminiAdapter,
  mistral: mistralAdapter,
  huggingface: huggingfaceAdapter,
  xai: xaiAdapter,
};

// Fallback adapter when a provider is unavailable
export const fallbackAdapter = openAIAdapter;
