// c:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\app\gio_dash\blog\[id]\edit\page.tsx
import "server-only";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect, notFound } from "next/navigation";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { getPostById, updatePost } from "@/lib/db/blog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: PageProps) {
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

  const { id } = await params;
  const postId = parseInt(id, 10);
  if (isNaN(postId)) {
    notFound();
  }

  const post = await getPostById(postId);
  if (!post) {
    notFound();
  }

  async function handleUpdate(formData: FormData) {
    "use server";

    const title = (formData.get("title") || "").toString().trim();
    const summary = (formData.get("summary") || "").toString().trim();
    const tags = (formData.get("tags") || "").toString().trim();
    const references = (formData.get("references") || "").toString().trim();
    const body = (formData.get("body") || "").toString().trim();

    if (!title || !body) {
      throw new Error("Title and body are required");
    }

    await updatePost(postId, { title, summary, tags, references, body });

    revalidatePath("/gio_dash/blog");
    revalidatePath(`/blog/${postId}`);
    redirect("/gio_dash/blog");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Blog Post
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Update post #{post.id}
          </p>
        </div>

        <Card className="p-6">
          <form action={handleUpdate} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                placeholder="Post title"
                defaultValue={post.title ?? ""}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input
                id="summary"
                name="summary"
                placeholder="Short summary (optional)"
                defaultValue={post.summary ?? ""}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="tag1, tag2, tag3"
                  defaultValue={post.tags ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="references">References</Label>
                <Input
                  id="references"
                  name="references"
                  placeholder="Links or citations (optional)"
                  defaultValue={post.references ?? ""}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea
                id="body"
                name="body"
                rows={12}
                placeholder="Write your post content here..."
                defaultValue={post.body ?? ""}
                required
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Save Changes</Button>
              <Link
                href="/gio_dash/blog"
                className="text-sm text-gray-600 dark:text-gray-300 hover:underline"
              >
                Cancel
              </Link>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
