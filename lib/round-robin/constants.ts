// constants.ts
// Holds static model names, default configuration, and other reusable constants.

export const SUPPORTED_MODELS = [
  { id: 'openai', name: 'GPT-4', contextLimit: 128_000 },
  { id: 'anthropic', name: 'Claude', contextLimit: 200_000 },
  { id: 'mistral', name: 'Mistral', contextLimit: 32_000 },
  { id: 'gemini', name: 'Gemini', contextLimit: 1_000_000 },
  { id: 'huggingface', name: 'Zephyr', contextLimit: 8_192 },
  { id: 'xai', name: 'Grok', contextLimit: 131_072 },
] as const;

export const DEFAULT_TURN_ORDER = ['openai', 'anthropic', 'mistral', 'gemini', 'huggingface', 'xai'];

export const RESPONSE_TOKEN_RESERVE = 2_000;
export const SYSTEM_PROMPT_TOKEN_RESERVE = 500;
export const MAX_RETRY_ATTEMPTS = 3;
export const LONG_WAIT_THRESHOLD_SECONDS = 30;

export const ROUND_ROBIN_SYSTEM_PROMPT = `You are {model_name}, participating in a group discussion with other AI models.

Participants: {participant_list}

Guidelines:
- Be concise but substantive (2-4 paragraphs max)
- Build on previous responses, don't repeat
- Acknowledge others' points when relevant
- Stay on topic
- Be respectful and constructive

The discussion topic is provided below. When it's your turn, contribute meaningfully to the conversation.`;
