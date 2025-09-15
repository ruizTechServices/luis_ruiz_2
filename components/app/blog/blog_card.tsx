import Link from "next/link";
import { cookies } from "next/headers";
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
    <article className="bg-white rounded-lg shadow-md p-6 mb-4">
      <Link href={`/blog/${blogPost.id}`}>
        <h2 className="text-xl font-bold mb-2 hover:underline">
          {blogPost.title}
        </h2>
      </Link>
      <p className="text-gray-600 mb-3">{blogPost.summary}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        {blogPost.tags &&
          blogPost.tags.split(",").map((tag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {tag.trim()}
            </span>
          ))}
      </div>

      {/* Date */}
      <div className="text-sm text-gray-500">
        {blogPost.created_at
          ? new Date(blogPost.created_at).toLocaleDateString()
          : "No date"}
      </div>
    </article>
  );
}

// Slideshow component: fetches posts and renders one-at-a-time carousel
export async function BlogCard() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

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
