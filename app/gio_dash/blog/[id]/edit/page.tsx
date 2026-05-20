import "server-only";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { getPostById } from "@/lib/db/blog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getProjectsForSelection } from "@/lib/db/projects";
import { getRelatedProjectIdsForPost, replaceRelatedProjectsForPost } from "@/lib/db/blog";

export const dynamic = "force-dynamic";

interface EditBlogPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;
  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) redirect("/gio_dash/blog");

  const post = await getPostById(postId);
  if (!post) redirect("/gio_dash/blog");

  const [projects, relatedProjectIds] = await Promise.all([
    getProjectsForSelection(),
    getRelatedProjectIdsForPost(postId),
  ]);

  async function updatePostAction(formData: FormData) {
    "use server";

    const supabase = await createServerClient();
    const { data: userRes } = await supabase.auth.getUser();
    const email = userRes?.user?.email;
    if (!email) {
      throw new Error("Not authenticated");
    }
    if (!isOwner(email)) {
      throw new Error("Not authorized");
    }

    const title = (formData.get("title") || "").toString().trim();
    const summary = (formData.get("summary") || "").toString().trim();
    const tags = (formData.get("tags") || "").toString().trim();
    const references = (formData.get("references") || "").toString().trim();
    const body = (formData.get("body") || "").toString().trim();
    const relatedProjectIds = formData
      .getAll("relatedProjectIds")
      .map((value) => Number(value))
      .filter((value) => Number.isInteger(value) && value > 0);

    if (!title || !body) {
      throw new Error("Title and body are required");
    }

    const { error } = await supabase
      .from("blog_posts")
      .update({
        title,
        summary: summary || null,
        tags: tags || null,
        references: references || null,
        body,
      })
      .eq("id", postId);

    if (error) {
      console.error("Failed to update post:", error);
      throw new Error(error.message);
    }

    await replaceRelatedProjectsForPost(postId, relatedProjectIds);

    revalidatePath("/gio_dash");
    revalidatePath("/gio_dash/blog");
    revalidatePath("/blog");
    revalidatePath(`/blog/${postId}`);
    redirect("/gio_dash/blog?updated=1");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-slate-800 dark:to-indigo-900">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Edit Blog Post
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Update the selected blog post in Supabase and refresh the public blog.
          </p>
        </div>

        <Card className="p-6">
          <form action={updatePostAction} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" defaultValue={post.title ?? ""} placeholder="Post title" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Summary</Label>
              <Input id="summary" name="summary" defaultValue={post.summary ?? ""} placeholder="Short summary (optional)" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input id="tags" name="tags" defaultValue={post.tags ?? ""} placeholder="tag1, tag2, tag3" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="references">References</Label>
                <Input id="references" name="references" defaultValue={post.references ?? ""} placeholder="Links or citations (optional)" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="body">Body</Label>
              <Textarea id="body" name="body" rows={16} defaultValue={post.body ?? ""} placeholder="Write your post content here..." required />
            </div>

            <div className="space-y-3">
              <Label>Related Projects</Label>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 rounded-xl border p-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <label key={project.id} className="flex items-start gap-3 rounded-lg border p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60">
                      <input
                        type="checkbox"
                        name="relatedProjectIds"
                        value={project.id}
                        defaultChecked={relatedProjectIds.includes(project.id)}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium">{project.title || project.url}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 break-all">{project.url}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No projects available yet to link.</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit">Save Changes</Button>
              <Link
                href="/gio_dash/blog"
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
