import { createClient } from "@supabase/supabase-js";
import { getTextEmbedding } from "@/lib/functions/openai/embeddings";

export type RetrievedContext = {
  id: number;
  content: string;
  role: string;
  session_id: number | null;
  message_id: number | null;
  similarity: number;
};

export async function getRelevantContext(
  queryText: string,
  topK: number = 5,
  minSimilarity?: number,
): Promise<RetrievedContext[]> {
  const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.warn("Supabase env vars missing for getRelevantContext");
    return [];
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  const embedding = await getTextEmbedding(queryText);

  const { data, error } = await supabase.rpc("match_gios_context", {
    query_embedding: embedding,
    match_count: topK,
    min_similarity: minSimilarity ?? null,
  });

  if (error) {
    console.error("match_gios_context RPC error:", error);
    return [];
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    content: r.content,
    role: r.role,
    session_id: r.session_id ?? null,
    message_id: r.message_id ?? null,
    similarity: r.similarity,
  }));
}
