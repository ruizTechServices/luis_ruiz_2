import Link from "next/link";
import { cn } from "@/lib/utils";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";

/*
HOW TO USE THIS COMPONENT THROUGHOUT THE APP:

1. BlogPostCard (Individual Post Card):
   - Import: import { BlogPostCard } from "@/components/app/blog/blog_card";
   - Usage: <BlogPostCard blogPost={blogPostObject} />
   - Props: Requires a BlogPost object with id, title, summary, tags, etc.

2. BlogCard (Carousel Slideshow):
   - Import: import { BlogCard } from "@/components/app/blog/blog_card";
   - Usage: <BlogCard />
   - Server Component: Must be used in server components (fetches data from Supabase)
   - Automatically displays latest 5 posts in a carousel format

Examples:
- Dashboard: <BlogCard /> (shows recent posts slideshow)
- Blog listing: {posts.map(post => <BlogPostCard key={post.id} blogPost={post} />)}
- Individual pages: <BlogPostCard blogPost={singlePost} />
*/

interface BlogPost {
  id: number;
  created_at: string;
  title: string;
  summary: string;
  tags: string; // or string[] if you update the schema
  references: string;
  body: string;
}

interface BlogCardProps {
  blogPost: BlogPost;
}

export function BlogPostCard({ blogPost }: BlogCardProps) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-violet-400/20 hover:bg-white/[0.07]">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-violet-200/70">
        Blog / Build Log
      </div>

      <Link href={`/blog/${blogPost.id}`}>
        <h2 className="mb-3 text-xl font-bold text-white hover:text-violet-200 transition-colors">
          {blogPost.title}
        </h2>
      </Link>

      <p className="mb-4 leading-7 text-slate-300">{blogPost.summary}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {blogPost.tags &&
          blogPost.tags.split(",").map((tag, index) => {
            const trimmedTag = tag.trim();
            return (
              <Link
                key={index}
                href={`/blog?tag=${encodeURIComponent(trimmedTag)}`}
                className={cn(
                  "rounded-full px-3 py-1 text-sm font-medium transition-all",
                  "bg-violet-500/15 text-violet-200 hover:bg-violet-500/25",
                  "border border-violet-400/20",
                  "hover:scale-105 active:scale-95 cursor-pointer"
                )}
              >
                {trimmedTag}
              </Link>
            );
          })}
      </div>

      <div className="flex items-center justify-between gap-4 text-sm text-slate-400">
        <span>
          {blogPost.created_at
            ? new Date(blogPost.created_at).toLocaleDateString()
            : "No date"}
        </span>
        <Link href="/projects" className="font-medium text-violet-300 hover:text-violet-200">
          See related project work →
        </Link>
      </div>
    </article>
  );
}

// Slideshow component: fetches posts and renders one-at-a-time carousel
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
    return <div className="text-sm text-gray-500">No posts yet.</div>;
  }

  return (
    <Carousel opts={{ align: "start", loop: true }} className="w-full">
      <CarouselContent>
        {posts.map((p) => (
          <CarouselItem key={p.id}>
            <BlogPostCard blogPost={p} />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
