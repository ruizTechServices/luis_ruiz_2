import "server-only";
import Link from "next/link";
import { createClient as createServerSupabase } from "@/lib/clients/supabase/server";
import { BlogPostCard } from "@/components/app/blog/blog_card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const revalidate = 60;

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page ?? "1"));
  const pageSize = Math.max(1, Number(sp.pageSize ?? "10"));
  const tag = typeof sp.tag === "string" ? sp.tag.trim() : undefined;

  const supabase = await createServerSupabase();

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("blog_posts")
    .select("id, created_at, title, summary, tags, references, body", {
      count: "exact",
    });

  if (tag && tag.length > 0) {
    query = query.ilike("tags", `%${tag}%`);
  }

  const { data: posts, count, error } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error("Failed to load blog posts:", error);
  }

  const postIds = (posts ?? []).map((post) => post.id);
  const relationMap = new Map<number, { id: number; title: string | null; url: string }[]>();

  if (postIds.length > 0) {
    const relationRes = await supabase
      .from("project_blog_links")
      .select("blog_post_id, projects(id, title, url)")
      .in("blog_post_id", postIds);

    if (!relationRes.error && relationRes.data) {
      for (const row of relationRes.data as Array<{
        blog_post_id: number;
        projects:
          | { id: number; title: string | null; url: string }
          | { id: number; title: string | null; url: string }[]
          | null;
      }>) {
        const entries = row.projects
          ? Array.isArray(row.projects)
            ? row.projects
            : [row.projects]
          : [];
        relationMap.set(row.blog_post_id, [
          ...(relationMap.get(row.blog_post_id) ?? []),
          ...entries,
        ]);
      }
    }
  }

  const normalizedPosts = (posts ?? []).map((post) => ({
    ...post,
    relatedProjects: relationMap.get(post.id) ?? [],
  }));

  const totalPages =
    typeof count === "number" ? Math.max(1, Math.ceil(count / pageSize)) : 1;
  const latestPosts = normalizedPosts.slice(0, 3);
  const makeHref = (p: number) => {
    const params = new URLSearchParams();
    if (tag) params.set("tag", tag);
    params.set("page", String(p));
    params.set("pageSize", String(pageSize));
    return `/blog?${params.toString()}`;
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="ss-container py-10">
        <section className="border-b pb-8">
          <h1 className="text-3xl font-semibold tracking-normal">Blog</h1>
        </section>

        {latestPosts.length > 0 && !tag ? (
          <section className="border-b py-8">
            <div className="mb-6 flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Latest</h2>
              <Button asChild variant="outline" size="sm">
                <Link href="/projects">Projects</Link>
              </Button>
            </div>
            <div className="grid gap-4 lg:grid-cols-3">
              {latestPosts.map((post) => (
                <BlogPostCard key={post.id} blogPost={post} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="py-8">
          <h2 className="mb-6 text-xl font-semibold">All posts</h2>

          {tag ? (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtering by:</span>
              <span className="inline-flex items-center gap-1 rounded-md border px-3 py-1 text-sm font-medium">
                {tag}
                <Link
                  href={`/blog?pageSize=${pageSize}`}
                  className="ml-1"
                  aria-label="Clear filter"
                >
                  x
                </Link>
              </span>
              <Link href="/blog" className="text-sm text-muted-foreground underline">
                Clear all filters
              </Link>
            </div>
          ) : null}

          <form method="get" className="mb-6 flex flex-wrap items-end gap-3 rounded-md border bg-card p-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="tag">Filter by tag</Label>
              <Input
                id="tag"
                name="tag"
                defaultValue={tag ?? ""}
                placeholder="e.g. ai"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="pageSize">Per page</Label>
              <Select name="pageSize" defaultValue={String(pageSize)}>
                <SelectTrigger id="pageSize" className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit">Apply</Button>
          </form>

          <section className="flex flex-col gap-4">
            {normalizedPosts.length ? (
              normalizedPosts.map((post) => (
                <BlogPostCard key={post.id} blogPost={post} />
              ))
            ) : (
              <div className="text-sm text-muted-foreground">No posts yet.</div>
            )}
          </section>

          <div className="mt-8 flex items-center gap-3 text-muted-foreground">
            {page > 1 ? (
              <Button asChild variant="outline" size="sm">
                <Link href={makeHref(page - 1)}>Previous</Link>
              </Button>
            ) : null}
            <span className="text-sm">
              Page {page} {totalPages ? `of ${totalPages}` : ""}
            </span>
            {page < totalPages ? (
              <Button asChild variant="outline" size="sm">
                <Link href={makeHref(page + 1)}>Next</Link>
              </Button>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
