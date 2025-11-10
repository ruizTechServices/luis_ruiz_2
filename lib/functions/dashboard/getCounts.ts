// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\lib\functions\dashboard\getCounts.ts
import type { SupabaseClient, PostgrestError } from "@supabase/supabase-js";

export type DashboardCounts = {
  posts: number;
  comments: number;
  votes: number;
  errors: PostgrestError[];
};

export async function getCounts(
  supabase: SupabaseClient
): Promise<DashboardCounts> {
  async function countTable(table: string): Promise<{ count: number; error: PostgrestError | null }> {
    // Prefer HEAD for efficiency
    const head = await supabase.from(table).select("id", { head: true, count: "exact" });
    if (!head.error) return { count: head.count ?? 0, error: null };

    // Fallback: GET with limit(0) still returns count header
    const get = await supabase.from(table).select("id", { count: "exact" }).limit(0);

    if (!get.error) {
      return { count: get.count ?? 0, error: null };
    }

    return { count: get.count ?? 0, error: get.error ?? head.error };
  }

  const [posts, comments, votes] = await Promise.all([
    countTable("blog_posts"),
    countTable("comments"),
    countTable("votes"),
  ]);

  const errors = [posts.error, comments.error, votes.error].filter(Boolean) as PostgrestError[];

  return {
    posts: posts.count,
    comments: comments.count,
    votes: votes.count,
    errors,
  };
}
