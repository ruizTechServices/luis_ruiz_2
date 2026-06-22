// lib/functions/openai/responses.ts
import openai from '@/lib/clients/openai/client'
type MinimalResponseCreate = {
  model: string
  input: string
  instructions?: string
  max_output_tokens?: number
}

type OpenAICompletionClient = {
  responses: {
    create(payload: MinimalResponseCreate): Promise<{ output_text?: string | null }>
  }
}

export async function getOpenAICompletion(
  message: string,
  model = 'gpt-4o',
  options?: { system?: string; maxOutputTokens?: number; client?: OpenAICompletionClient }
): Promise<string> {
  const payload: MinimalResponseCreate = {
    model,
    input: message,
  }
  if (options?.system) {
    payload.instructions = options.system
  }
  if (typeof options?.maxOutputTokens === 'number') {
    payload.max_output_tokens = options.maxOutputTokens
  }

  const client = options?.client ?? openai
  const { output_text } = await client.responses.create(payload)
  return output_text ?? ''
}
