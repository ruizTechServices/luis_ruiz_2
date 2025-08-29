import { getTextEmbedding } from "@/lib/functions/openai/embeddings";

(async () => {
  try {
    const vector = await getTextEmbedding("Hello world");
    console.log("Embedding length:", vector.length);
    console.log(vector);
  } catch (err) {
    console.error("Failed to fetch embedding", err);
  }
})();