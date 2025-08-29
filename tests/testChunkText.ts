// tests/testChunkText.ts

import { chunkText } from '../lib/functions/chunkText'

const sampleText = "In stage 1, we will learn about the fundamental data preprocessing steps and code the attention mechanism at the heart of every LLM. Next, in stage 2, we will learn how to code and pretrain a GPT-like LLM capable of generating new texts. We will also go over the fundamentals of evaluating LLMs, which is essential for developing capable NLP systems. Pretraining an LLM from scratch is a significant endeavor, demanding thousands to millions of dollars in computing costs for GPT-like models. Therefore, the focus of stage 2 is on implementing training for educational purposes using a small dataset. In addition, I also provide code examples for loading openly available model weights. Finally, in stage 3, we will take a pretrained LLM and fine-tune it to follow instructions such as answering queries or classifying texts—the most common tasks in many real-world applications and research. I hope you are looking forward to embarking on this exciting journey!"

console.log('=== Testing chunkText function ===\n')

// Test 1: Basic chunking
console.log('Test 1: Basic chunking (size=100, overlap=20)')
const chunks1 = chunkText(sampleText, 100, 20)
console.log(`Number of chunks: ${chunks1.length}`)
chunks1.forEach((chunk, index) => {
  console.log(`Chunk ${index}: ${chunk.id.slice(0, 8)}... | start: ${chunk.start} | end: ${chunk.end} | length: ${chunk.text.length}`)
  console.log(`Text preview: "${chunk.text.slice(0, 50)}..."\n`)
})

// Test 2: No overlap
console.log('Test 2: No overlap (size=150, overlap=0)')
const chunks2 = chunkText(sampleText, 150, 0)
console.log(`Number of chunks: ${chunks2.length}`)
chunks2.forEach((chunk, index) => {
  console.log(`Chunk ${index}: start: ${chunk.start} | end: ${chunk.end} | length: ${chunk.text.length}`)
})

// Test 3: Small text
console.log('\nTest 3: Small text (shorter than chunk size)')
const smallText = "This is a small text."
const chunks3 = chunkText(smallText, 100, 20)
console.log(`Number of chunks: ${chunks3.length}`)
console.log(`Chunk text: "${chunks3[0].text}"`)
console.log(`Start: ${chunks3[0].start}, End: ${chunks3[0].end}`)

console.log('\n✅ All tests completed')
