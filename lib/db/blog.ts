import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { BlogPost, Comment as BlogComment } from "@/lib/types/blog";

export async function supa() {
  return createServerClient();
}

export async function getPostById(id: number): Promise<BlogPost | null> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("blog_posts")
    .select("id, created_at, title, summary, tags, references, body")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data as BlogPost | null;
}

export async function getComments(postId: number): Promise<BlogComment[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, user_email, content, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as BlogComment[];
}

export async function getVoteCounts(postId: number): Promise<{ up: number; down: number }> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("votes")
    .select("vote_type")
    .eq("post_id", postId);
  if (error) throw error;
  const up = (data ?? []).filter((v) => v.vote_type === "up").length;
  const down = (data ?? []).filter((v) => v.vote_type === "down").length;
  return { up, down };
}
