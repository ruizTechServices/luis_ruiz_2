import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { BlogPost, Comment as BlogComment, Vote } from "@/lib/types/blog";

export async function supa() {
  return createServerClient();
}

// ─────────────────────────────────────────────────────────────
// Admin functions
// ─────────────────────────────────────────────────────────────

export interface BlogPostWithStats extends BlogPost {
  comment_count: number;
  up_votes: number;
  down_votes: number;
}

/**
 * Get all blog posts with comment/vote counts for admin view.
 */
export async function getBlogPostsForAdmin(): Promise<BlogPostWithStats[]> {
  const supabase = await supa();

  // Get posts
  const { data: posts, error: postsErr } = await supabase
    .from("blog_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (postsErr) throw postsErr;
  if (!posts || posts.length === 0) return [];

  // Get comment counts
  const { data: comments } = await supabase
    .from("comments")
    .select("post_id");

  // Get vote counts
  const { data: votes } = await supabase
    .from("votes")
    .select("post_id, vote_type");

  // Aggregate
  const commentCounts = new Map<number, number>();
  const upVotes = new Map<number, number>();
  const downVotes = new Map<number, number>();

  (comments ?? []).forEach((c) => {
    commentCounts.set(c.post_id, (commentCounts.get(c.post_id) ?? 0) + 1);
  });

  (votes ?? []).forEach((v) => {
    if (v.vote_type === "up") {
      upVotes.set(v.post_id, (upVotes.get(v.post_id) ?? 0) + 1);
    } else if (v.vote_type === "down") {
      downVotes.set(v.post_id, (downVotes.get(v.post_id) ?? 0) + 1);
    }
  });

  return posts.map((p) => ({
    ...p,
    comment_count: commentCounts.get(p.id) ?? 0,
    up_votes: upVotes.get(p.id) ?? 0,
    down_votes: downVotes.get(p.id) ?? 0,
  })) as BlogPostWithStats[];
}

/**
 * Delete a blog post (and cascading comments/votes via FK).
 */
export async function deletePost(id: number): Promise<void> {
  const supabase = await supa();
  // Delete comments and votes first (if no ON DELETE CASCADE)
  await supabase.from("comments").delete().eq("post_id", id);
  await supabase.from("votes").delete().eq("post_id", id);
  const { error } = await supabase.from("blog_posts").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Update a blog post.
 */
export async function updatePost(
  id: number,
  updates: Partial<Omit<BlogPost, "id" | "created_at">>
): Promise<BlogPost | null> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("blog_posts")
    .update(updates)
    .eq("id", id)
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as BlogPost | null;
}

/**
 * Get all comments for a post (admin view).
 */
export async function getCommentsForPost(postId: number): Promise<BlogComment[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as BlogComment[];
}

/**
 * Delete a comment.
 */
export async function deleteComment(id: number): Promise<void> {
  const supabase = await supa();
  const { error } = await supabase.from("comments").delete().eq("id", id);
  if (error) throw error;
}

/**
 * Get all votes for a post (admin view).
 */
export async function getVotesForPost(postId: number): Promise<Vote[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("votes")
    .select("*")
    .eq("post_id", postId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Vote[];
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
