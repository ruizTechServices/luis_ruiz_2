import assert from "node:assert/strict";
import dotenv from "dotenv";
import { evaluator, evaluateAnalysis } from "../hooks/evaluator";

dotenv.config({ path: ".env.local" });

const ALLOWED_TONES = ["Aggressive", "Casual", "Neutral", "Positive", "Formal", "Urgent"];

async function mockComplete() {
  return "tone: Neutral analysis: Local deterministic evaluation.";
}

(async () => {
  const msg = process.argv[2] ?? "Hello from terminal";
  const MAX_CHARS = 150;

  const result = await evaluateAnalysis(msg, {
    maxChars: MAX_CHARS,
    complete: mockComplete,
  });

  assert.ok(result.tone, "Parsed tone should not be empty");
  assert.ok(result.analysis, "Parsed analysis should not be empty");
  assert.ok(result.formatted.includes("tone:"), "Formatted output should include tone");
  assert.ok(result.formatted.includes("analysis:"), "Formatted output should include analysis");
  assert.ok(result.formatted.length <= MAX_CHARS, "Formatted output should respect max length");
  assert.ok(ALLOWED_TONES.includes(result.tone), `Tone not in allowed set: ${result.tone}`);

  const out = await evaluator(msg, mockComplete);
  assert.ok(out.includes("tone:"), "evaluator() output should include tone");
  assert.ok(out.includes("analysis:"), "evaluator() output should include analysis");
  assert.ok(out.length <= 250, "evaluator() output should use default max length");

  if (process.env.RUN_INTEGRATION_TESTS === "1") {
    const live = await evaluateAnalysis(msg, { maxChars: MAX_CHARS });
    assert.ok(ALLOWED_TONES.includes(live.tone), `Live tone not in allowed set: ${live.tone}`);
  }

  console.log("testEvaluator.ts passed");
})().catch((err) => {
  console.error("testEvaluator.ts failed:", err);
  process.exit(1);
});
