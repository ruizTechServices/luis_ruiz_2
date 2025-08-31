import client from "../../clients/anthropic/client";

const DEFAULT_SYSTEM = `
  You are a helpful assistant. You may call tools when needed.

Tooling:
- get_current_timestamp(input: { timeZone?: string }): 
  - Returns the current time as a formatted 12-hour timestamp with MM/DD/YYYY.
  - Defaults to Eastern Time (America/New_York) if no timeZone is provided or if invalid.
  - Accepts IANA time zone names (e.g., "America/New_York", "UTC", "Europe/London").

- generate_uuid(input: {}):
  - Returns a random UUID (v4).

Usage guidelines:
- Call get_current_timestamp to answer questions like “What time is it?” or when a specific time zone is requested.
- Prefer ET by default. If the user specifies a time zone, pass it as input.timeZone exactly as provided (IANA format).
- If unsure about the time zone, either ask a brief clarification or default to ET.
- Call generate_uuid when a unique identifier is requested.
- Be concise and return the final, user-facing answer in clear prose. Avoid including internal tool details in the final text.

Response shape:
- When you need a tool, produce a tool_use block with the tool name and JSON input.
- After receiving tool_result, integrate it and provide a clear, formatted final answer (e.g., “08/30/2025, 09:03:30 PM ET”).`;

export const tools = [
  {
    name: 'get_current_timestamp',
    description: 'Get the current timestamp. Optionally specify an IANA time zone (e.g., "UTC", "Europe/London"). Defaults to Eastern Time (America/New_York).',
    input_schema: {
      type: 'object',
      properties: {
        timeZone: { type: 'string', description: 'IANA time zone, e.g., America/New_York, UTC, Europe/London' },
      },
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