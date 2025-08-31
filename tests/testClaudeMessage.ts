// testClaudeMessage.ts

import { createMessage } from '../lib/functions/anthropic/messages'
import { tools as anthropicTools } from '../lib/functions/anthropic/messages'
import { getCurrentTimestamp } from '../lib/functions/getCurrentTimestamp'
import crypto from 'crypto'
import type { ContentBlock, ToolUseBlock, TextBlock } from '@anthropic-ai/sdk/resources/messages'

const isToolUse = (b: ContentBlock): b is ToolUseBlock => b.type === 'tool_use'
const isText = (b: ContentBlock): b is TextBlock => b.type === 'text'

const userInput = 'What time is it? Give me the result in 12 hour format & 00/00/0000. Also, give me a random uuid.'

const messages: any[] = [
  {
    role: 'user',
    content: userInput,
  },
];

async function run() {
  const model = 'claude-opus-4-1-20250805'

  // First turn: allow tool use
  const first = await createMessage({
    model,
    max_tokens: 200,
    temperature: 1,
    messages,
    tools: anthropicTools,
  })

  // Keep transcript up to date
  messages.push({ role: 'assistant', content: first.content })

  // Find tool_use blocks
  const toolUses = ((first.content || []) as ContentBlock[]).filter(isToolUse)

  if (toolUses.length > 0) {
    const toolResults = [] as any[]

    for (const tu of toolUses) {
      const name = tu.name as string
      const id = tu.id as string
      let result: string | object = ''

      switch (name) {
        case 'get_current_timestamp': {
          result = getCurrentTimestamp()
          break
        }
        case 'generate_uuid': {
          result = crypto.randomUUID()
          break
        }
        default: {
          result = { error: `Unknown tool: ${name}` }
        }
      }

      toolResults.push({
        type: 'tool_result',
        tool_use_id: id,
        content: typeof result === 'string' ? result : JSON.stringify(result),
      })
    }

    // Second turn: send tool_result back to the model
    messages.push({ role: 'user', content: toolResults })

    const second = await createMessage({
      model,
      max_tokens: 200,
      temperature: 1,
      messages,
      tools: anthropicTools,
    })

    const finalText = ((second.content || []) as ContentBlock[])
      .filter(isText)
      .map((b) => b.text)
      .join('\n')

    console.log('Final assistant text:', finalText)
    return
  }

  // If no tools were requested, just print any text from the first response
  const text = ((first.content || []) as ContentBlock[])
    .filter(isText)
    .map((b) => b.text)
    .join('\n')
  console.log('Assistant text (no tools used):', text)
}

run().catch((err) => {
  console.error('testClaudeMessage failed:', err)
  process.exit(1)
})
