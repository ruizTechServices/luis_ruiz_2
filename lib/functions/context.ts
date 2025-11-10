import { getTextEmbedding } from "@/lib/functions/openai/embeddings";
import { createServiceRoleClient } from "@/lib/utils/supabaseServiceRole";

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
  const supabase = createServiceRoleClient();
  if (!supabase) {
    console.warn("Supabase service-role client unavailable for getRelevantContext");
    return [];
  }
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

  type Row = {
    id: number;
    content: string;
    role: string;
    session_id: number | null;
    message_id: number | null;
    similarity: number;
  };
  const rows = (data ?? []) as Row[];
  return rows.map((r) => ({
    id: r.id,
    content: r.content,
    role: r.role,
    session_id: r.session_id ?? null,
    message_id: r.message_id ?? null,
    similarity: r.similarity,
  }));
}
