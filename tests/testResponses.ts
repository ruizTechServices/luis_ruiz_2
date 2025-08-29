// tests/testOpenAICompletion.ts
// Quick smoke-test for getOpenAICompletion helper.
// Run with: npx tsx tests/testOpenAICompletion.ts

import 'dotenv/config'
import { getOpenAICompletion } from '@/lib/functions/openai/responses'

async function main() {
  console.log('🧪 Testing getOpenAICompletion…')
  const prompt = 'Write a one-sentence random bedtime story.'
  try {
    const output = await getOpenAICompletion(prompt, 'gpt-4o')
    console.log('✅ Response:', output)
  } catch (err) {
    console.error('❌ Error calling OpenAI:', err)
  }
}

main()
