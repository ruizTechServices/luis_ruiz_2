import 'dotenv/config'
import { createMessage, tools as gioTools } from '../lib/functions/anthropic/assistant_for_gio'
import { getCurrentTimestamp } from '../lib/functions/getCurrentTimestamp'
import crypto from 'crypto'
import type { ContentBlock, ToolUseBlock, TextBlock } from '@anthropic-ai/sdk/resources/messages'

const isToolUse = (b: ContentBlock): b is ToolUseBlock => b.type === 'tool_use'
const isText = (b: ContentBlock): b is TextBlock => b.type === 'text'

const userInput = process.argv.slice(2).join(' ') ||
  'Gio wants a pep talk and the current time in ET (and then in UTC). Also generate a random uuid.'

const messages: any[] = [
  { role: 'user', content: userInput },
]

// Skip when Anthropic key is not provided
if (!process.env.ANTHROPIC_API_KEY) {
  console.log('⏭️ Skipping Anthropic assistant test (no ANTHROPIC_API_KEY).')
  process.exit(0)
}

async function run() {
  const model = 'claude-3-5-sonnet-20240620'

  const first = await createMessage({
    model,
    max_tokens: 400,
    temperature: 0.7,
    messages,
    tools: gioTools,
  })

  messages.push({ role: 'assistant', content: first.content })

  const toolUses = ((first.content || []) as ContentBlock[]).filter(isToolUse)

  if (toolUses.length > 0) {
    const toolResults: any[] = []
    for (const tu of toolUses) {
      const name = tu.name
      const id = tu.id
      let result: string | object = ''

      switch (name) {
        case 'get_current_timestamp': {
          const tz = (tu as any)?.input?.timeZone as string | undefined
          // If the assistant asked for two zones in one call, ignore and default here.
          result = getCurrentTimestamp(tz)
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

      toolResults.push({ type: 'tool_result', tool_use_id: id, content: String(result) })
    }

    messages.push({ role: 'user', content: toolResults })

    const second = await createMessage({
      model,
      max_tokens: 400,
      temperature: 0.7,
      messages,
      tools: gioTools,
    })

    const finalText = ((second.content || []) as ContentBlock[])
      .filter(isText)
      .map((b) => b.text)
      .join('\n')
    console.log('Final assistant text:', finalText)
    return
  }

  const text = ((first.content || []) as ContentBlock[])
    .filter(isText)
    .map((b) => b.text)
    .join('\n')
  console.log('Assistant text (no tools used):', text)
}

run().catch((err) => {
  console.error('testAssistantForGio failed:', err)
  process.exit(1)
})

 