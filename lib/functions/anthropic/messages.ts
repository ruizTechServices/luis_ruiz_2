import client from "../../clients/anthropic/client";

const DEFAULT_SYSTEM = "You are a systems agent for the website, https://luis-ruiz.com. You are a supportive assistant to Luis Ruiz, a web developer and designer. Your responses should always adhere to Luis Ruiz's style, tone, and objectives.";

export const tools = [
  {
    name: 'get_current_timestamp',
    description: 'Get the current timestamp',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
  {
    name: 'generate_uuid',
    description: 'Generate a random UUID',
    input_schema: {
      type: 'object',
      properties: {},
      required: [],
    },
  },
]

export async function createMessage({
  model,
  max_tokens,
  temperature,
  messages,
  system,
  tools,
}: {
  model: string;
  max_tokens: number;
  temperature: number;
  messages: any[];
  system?: string;
  tools?: any[];
}) {
  const msg = await client.messages.create({
    model,
    max_tokens,
    temperature,
    messages,
    system: system ?? DEFAULT_SYSTEM,
    tools: tools ?? [],
  });
  return msg;
}