// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\blog\page.tsx
import "server-only";
import Link from "next/link";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { getBlogPostsForAdmin, type BlogPostWithStats } from "@/lib/db/blog";
import BlogPostsClient from "./BlogPostsClient";

export default async function BlogAdminPage() {
  const supabase = await createServerClient();

  // Auth check: admin only
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;
  if (!email) {
    redirect("/login");
  }
  if (!isOwner(email)) {
    redirect("/dashboard");
  }

  // Fetch posts with stats
  let posts: BlogPostWithStats[] = [];
  let error: string | null = null;
  try {
    posts = await getBlogPostsForAdmin();
  } catch (e) {
    error = e instanceof Error ? e.message : "Failed to fetch posts";
    posts = [];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Blog Admin
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Manage blog posts, comments, and votes ({posts.length} posts)
            </p>
          </div>
          <Link
            href="/gio_dash/blog/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Post
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
            <p className="text-red-700 dark:text-red-300">{error}</p>
          </div>
        )}

        <BlogPostsClient posts={posts} />
      </div>
    </div>
  );
}
