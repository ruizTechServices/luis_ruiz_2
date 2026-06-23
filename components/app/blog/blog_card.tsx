import Link from "next/link";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";

interface BlogPost {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  tags: string;
  references: string;
  body: string;
  relatedProjects?: { id: number; title: string | null; url: string }[];
}

interface BlogCardProps {
  blogPost: BlogPost;
}

export function BlogPostCard({ blogPost }: BlogCardProps) {
  return (
    <article className="rounded-md border bg-card p-6">
      <Link href={`/blog/${blogPost.id}`}>
        <h2 className="mb-3 text-xl font-semibold text-card-foreground hover:underline">
          {blogPost.title}
        </h2>
      </Link>

      <p className="mb-4 leading-7 text-muted-foreground">{blogPost.summary}</p>

      {blogPost.tags ? (
        <div className="mb-4 flex flex-wrap gap-2">
          {blogPost.tags.split(",").map((tag, index) => {
            const trimmedTag = tag.trim();
            return (
              <Link
                key={`${trimmedTag}-${index}`}
                href={`/blog?tag=${encodeURIComponent(trimmedTag)}`}
              >
                <Badge variant="secondary">{trimmedTag}</Badge>
              </Link>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 text-sm text-muted-foreground">
        {blogPost.relatedProjects && blogPost.relatedProjects.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {blogPost.relatedProjects.slice(0, 3).map((project) => (
              <Link
                key={project.id}
                href="/projects"
                className="rounded-md border px-3 py-1 text-xs hover:bg-muted"
              >
                Related: {project.title || project.url}
              </Link>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-4">
          <span>
            {blogPost.created_at
              ? new Date(blogPost.created_at).toLocaleDateString()
              : "No date"}
          </span>
          <Link href="/projects" className="font-medium text-foreground hover:underline">
            Projects
          </Link>
        </div>
      </div>
    </article>
  );
}

export async function BlogCard() {
  const supabase = await createServerClient();

  const { data: posts, error } = await supabase
    .from("blog_posts")
    .select("id, created_at, title, summary, tags, references, body")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Failed to load blog posts:", error);
  }

  if (!posts?.length) {
    return <div className="text-sm text-muted-foreground">No posts yet.</div>;
  }

  const postIds = posts.map((post) => post.id);
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

  const normalizedPosts = posts.map((post) => ({
    ...post,
    relatedProjects: relationMap.get(post.id) ?? [],
  }));

  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent>
        {normalizedPosts.map((post) => (
          <CarouselItem key={post.id}>
            <BlogPostCard blogPost={post} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
