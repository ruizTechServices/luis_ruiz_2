import "server-only";
import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

async function createPost(formData: FormData) {
  "use server";
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const title = (formData.get("title") || "").toString().trim();
  const summary = (formData.get("summary") || "").toString().trim();
  const tags = (formData.get("tags") || "").toString().trim();
  const references = (formData.get("references") || "").toString().trim();
  const body = (formData.get("body") || "").toString().trim();

  if (!title || !body) {
    throw new Error("Title and body are required");
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert({ title, summary, tags, references, body })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create post:", error);
    throw new Error(error.message);
  }

  // Refresh dashboard and go back
  revalidatePath("/gio_dash");
  redirect("/gio_dash");
}

export default function NewPostPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            New Blog Post
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Create and publish a new post to your blog_posts table
          </p>
        </div>

        <Card className="p-6">
          <form action={createPost} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" placeholder="Post title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" name="summary" placeholder="Short summary (optional)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" placeholder="tag1, tag2, tag3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="references">References</Label>
                <Input id="references" name="references" placeholder="Links or citations (optional)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" rows={12} placeholder="Write your post content here..." required />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Publish Post</Button>
              <Link
                href="/gio_dash"
                className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
              >
                Cancel and go back
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
