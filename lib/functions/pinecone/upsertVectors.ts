import pinecone from "@/lib/clients/pinecone/client";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";
import { chunkText } from "@/lib/functions/chunkText";
import dotenv from 'dotenv'
dotenv.config()

export async function indexDocument(docId: string, content: string) {
  const chunks = chunkText(content);
  const vectors = await Promise.all(
    chunks.map(async ({ id, text }) => ({
      id,                             // unique per chunk
      values: await getTextEmbedding(text), // 1×1536
      metadata: { docId, text },      // store raw text for reranking
    }))
  );
  const namespace = "first-user-1";

  // Use a namespace handle then upsert the vectors.
  await pinecone.namespace(namespace).upsert(vectors);
}