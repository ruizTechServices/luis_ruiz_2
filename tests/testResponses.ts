import assert from "node:assert/strict";
import "dotenv/config";
import { getOpenAICompletion } from "@/lib/functions/openai/responses";

async function main() {
  console.log("Testing getOpenAICompletion helper");

  const calls: unknown[] = [];
  const output = await getOpenAICompletion("Say hello", "test-model", {
    system: "System prompt",
    maxOutputTokens: 12,
    client: {
      responses: {
        async create(payload) {
          calls.push(payload);
          return { output_text: "hello from mock" };
        },
      },
    },
  });

  assert.equal(output, "hello from mock");
  assert.deepEqual(calls, [
    {
      model: "test-model",
      input: "Say hello",
      instructions: "System prompt",
      max_output_tokens: 12,
    },
  ]);

  if (process.env.RUN_INTEGRATION_TESTS === "1") {
    const liveOutput = await getOpenAICompletion(
      "Write a one-sentence random bedtime story.",
      "gpt-4o",
    );
    assert.ok(liveOutput.length > 0, "Live OpenAI response should not be empty");
  }
}

main().catch((err) => {
  console.error("testResponses.ts failed:", err);
  process.exit(1);
});
