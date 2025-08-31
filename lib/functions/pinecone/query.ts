import pinecone from "@/lib/clients/pinecone/client";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";
import dotenv from 'dotenv'
dotenv.config()

const rawNamespace = process.env.PINECONE_NAMESPACE; // the namespace from the environment variable is temporary and for developement purposes only. The namespace is supposed to be a unique identifier for the user.
if (!rawNamespace) {
  throw new Error('Missing PINECONE_NAMESPACE env var');
}
const namespaceName: string = rawNamespace;

export async function semanticSearch(query: string, topK = 5) {
    const embedding = await getTextEmbedding(query);
    const res = await pinecone
      .namespace(namespaceName)
      .query({ topK, vector: embedding, includeMetadata: true });
    return res.matches; // [{ id, score, metadata }]
}