import assert from "node:assert/strict";
import "dotenv/config";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";

(async () => {
  const vector = await getTextEmbedding("Hello world", "test-embedding-model", {
    embeddings: {
      async create(input) {
        assert.deepEqual(input, {
          model: "test-embedding-model",
          input: "Hello world",
          encoding_format: "float",
        });
        return { data: [{ embedding: [0.1, 0.2, 0.3] }] };
      },
    },
  });

  assert.deepEqual(vector, [0.1, 0.2, 0.3]);

  if (process.env.RUN_INTEGRATION_TESTS === "1") {
    const liveVector = await getTextEmbedding("Hello world");
    assert.ok(liveVector.length > 0, "Live embedding vector should not be empty");
  }

  console.log("testEmbeddings.ts passed");
})().catch((err) => {
  console.error("testEmbeddings.ts failed:", err);
  process.exit(1);
});
