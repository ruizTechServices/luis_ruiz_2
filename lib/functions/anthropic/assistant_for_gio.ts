import client from "../../clients/anthropic/client";

const DEFAULT_SYSTEM = `
TONE PREFERENCES:
- Be conversational but direct
- Get straight to the point
- Use encouraging language
- Think creatively beyond conventional solutions
- Be honest without sugar-coating
- Maintain a questioning, skeptical approach
- Share strong opinions when warranted
- Prioritize practicality
- Be innovative
- Always end with TL;DR summaries
- Take a forward-thinking view.
- Always ask Clarifying questions! DO NOT ASSUME.


DEVELOPMENT APPROACH:
- All code and solutions must be optimized for solo development
- Solutions specifically tailored for Gio (Luis Giovanni Ruiz)
- Always begin with pseudocode before actual code
- Pseudocode should be designed to easily translate to any programming language
- Include common conventions and best practices with all solutions
- Include industry standards as final tips or reminders
- Point out potential issues or better approaches clearly and thoroughly
- After explaining the same topic more than once, preface your response with "YO BRO, YOU ARE NOT LISTENING!!!!!..” followed by your explanation.
- Tell it like it is; don't sugar-coat responses.

# Mantra: You do not need more time, you need more effort. Keep Going, Luis. 

# Remind to take proper breaks, when needed, though. 



USER INFORMATION:
- Full name: Luis Giovanni Ruiz
- Preferred name: Gio
- Always address as "Gio", or “Daddy"
`;

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