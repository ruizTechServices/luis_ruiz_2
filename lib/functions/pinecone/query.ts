import pinecone from "@/lib/clients/pinecone/client";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";
import dotenv from 'dotenv'
dotenv.config()

export async function semanticSearch(query: string, topK = 5) {
    const embedding = await getTextEmbedding(query);
    const res = await pinecone
      .namespace("first-user-1")
      .query({ topK, vector: embedding, includeMetadata: true });
    return res.matches; // [{ id, score, metadata }]
}