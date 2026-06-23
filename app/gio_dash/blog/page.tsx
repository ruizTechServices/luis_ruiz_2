// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\blog\page.tsx
import "server-only";
import Link from "next/link";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { getBlogPostsForAdmin, type BlogPostWithStats } from "@/lib/db/blog";
import { Button } from "@/components/ui/button";
import {
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
  DashboardStatusBadge,
} from "@/components/design-system/DashboardPrimitives";
import BlogPostsClient from "./BlogPostsClient";

interface BlogAdminPageProps {
  searchParams: Promise<{ created?: string; updated?: string }>;
}

export default async function BlogAdminPage({ searchParams }: BlogAdminPageProps) {
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

  const params = await searchParams;
  const created = params.created === "1";
  const updated = params.updated === "1";

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
    <DashboardPageShell>
      <DashboardPageHeader
        title="Blog Admin"
        description={`Manage blog posts, comments, and votes across ${posts.length} posts.`}
        meta={<DashboardStatusBadge>{posts.length} posts</DashboardStatusBadge>}
        actions={
          <Button asChild>
            <Link href="/gio_dash/blog/new">New Post</Link>
          </Button>
        }
      />

      {created && (
        <DashboardErrorState className="border-[color-mix(in_srgb,var(--color-signal-mint),transparent_58%)] bg-[color-mix(in_srgb,var(--color-signal-mint),transparent_91%)]">
          <p className="font-medium">Blog post published successfully.</p>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            The post was saved to Supabase and should now appear on the public blog page.
          </p>
        </DashboardErrorState>
      )}

      {updated && (
        <DashboardErrorState className="border-[color-mix(in_srgb,var(--color-signal-info),transparent_58%)] bg-[color-mix(in_srgb,var(--color-signal-info),transparent_91%)]">
          <p className="font-medium">Blog post updated successfully.</p>
          <p className="mt-1 text-[var(--color-text-secondary)]">
            The latest changes were saved to Supabase and the public blog was revalidated.
          </p>
        </DashboardErrorState>
      )}

      {error && (
        <DashboardErrorState>
          <p>{error}</p>
        </DashboardErrorState>
      )}

      <BlogPostsClient posts={posts} />
    </DashboardPageShell>
  );
}
