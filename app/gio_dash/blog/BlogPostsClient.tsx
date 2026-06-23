"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardStatusBadge,
} from "@/components/design-system/DashboardPrimitives";
import type { BlogPostWithStats } from "@/lib/db/blog";

interface BlogPostsClientProps {
  posts: BlogPostWithStats[];
}

export default function BlogPostsClient({ posts }: BlogPostsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (id: number, title: string | null) => {
    if (!confirm(`Delete post "${title || "Untitled"}"? This will also delete all comments and votes.`)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Delete failed");
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  if (posts.length === 0) {
    return (
      <DashboardEmptyState title="No blog posts yet">
        <Button asChild className="mt-3">
          <Link href="/gio_dash/blog/new">Create your first post</Link>
        </Button>
      </DashboardEmptyState>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <DashboardCard key={post.id} as="article">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-lg font-semibold text-[var(--color-text-primary)]">
                {post.title || "Untitled"}
              </h2>
              {post.summary ? (
                <p className="mt-1 line-clamp-2 text-sm text-[var(--color-text-secondary)]">
                  {post.summary}
                </p>
              ) : null}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--color-text-subtle)]">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {post.tags ? (
                  <span className="flex min-w-0 items-center gap-1">
                    <span aria-hidden="true">#</span>
                    <span className="truncate">{post.tags}</span>
                  </span>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-sm">
              <DashboardStatusBadge>{post.comment_count} comments</DashboardStatusBadge>
              <DashboardStatusBadge tone="mint">{post.up_votes} up</DashboardStatusBadge>
              <DashboardStatusBadge tone="danger">{post.down_votes} down</DashboardStatusBadge>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href={`/blog/${post.id}`}>View</Link>
              </Button>
              <Button asChild variant="outline" size="sm">
                <Link href={`/gio_dash/blog/${post.id}/edit`}>Edit</Link>
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(post.id, post.title)}
                disabled={deletingId === post.id || isPending}
                className="text-[var(--color-signal-danger)] hover:text-[var(--color-signal-danger)]"
              >
                {deletingId === post.id ? "..." : "Delete"}
              </Button>
            </div>
          </div>
        </DashboardCard>
      ))}
    </div>
  );
}
