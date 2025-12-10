// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\blog\BlogPostsClient.tsx
"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import Link from "next/link";
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
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400 mb-4">No blog posts yet.</p>
        <Link
          href="/gio_dash/blog/new"
          className="text-blue-600 hover:underline font-medium"
        >
          Create your first post
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                {post.title || "Untitled"}
              </h2>
              {post.summary && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1 line-clamp-2">
                  {post.summary}
                </p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 dark:text-gray-400">
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                {post.tags && (
                  <span className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {post.tags}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{post.comment_count}</span>
              </div>
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                <span>{post.up_votes}</span>
              </div>
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>{post.down_votes}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Link
                href={`/blog/${post.id}`}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                View
              </Link>
              <Link
                href={`/gio_dash/blog/${post.id}/edit`}
                className="px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                Edit
              </Link>
              <button
                onClick={() => handleDelete(post.id, post.title)}
                disabled={deletingId === post.id || isPending}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
              >
                {deletingId === post.id ? "..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
