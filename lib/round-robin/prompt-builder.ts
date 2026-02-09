// prompt-builder.ts
// TODO: Implement per-model prompt construction given the topic, context, and model-specific rules.
// This module should handle:
// - Building the system prompt with round-robin context (topic, previous messages)
// - Applying model-specific formatting (e.g., Anthropic vs OpenAI system message handling)
// - Truncating conversation history to fit model context windows
//
// Currently, prompts are built inline in the SSE route handler and
// truncation is handled in lib/round-robin/truncation.ts.
export {};
