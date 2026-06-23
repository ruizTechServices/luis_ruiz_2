import "server-only";
import Link from "next/link";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import { isOwner } from "@/lib/auth/ownership";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getProjectsForSelection } from "@/lib/db/projects";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardPageHeader,
  DashboardPageShell,
} from "@/components/design-system/DashboardPrimitives";

export const dynamic = "force-dynamic";

async function createPost(formData: FormData) {
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

  const { data: createdPost, error } = await supabase
    .from("blog_posts")
    .insert({ title, summary, tags, references, body })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to create post:", error);
    throw new Error(error.message);
  }

  if (relatedProjectIds.length > 0) {
    const uniqueIds = [...new Set(relatedProjectIds)];
    const { error: linkError } = await supabase
      .from("project_blog_links")
      .insert(uniqueIds.map((projectId) => ({ project_id: projectId, blog_post_id: createdPost.id })));

    if (linkError) {
      console.error("Failed to link related projects:", linkError);
      throw new Error(linkError.message);
    }
  }

  revalidatePath("/gio_dash");
  revalidatePath("/gio_dash/blog");
  revalidatePath("/blog");
  redirect("/gio_dash/blog?created=1");
}

export default async function NewPostPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;
  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  const projects = await getProjectsForSelection();

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="New Blog Post"
        description="Create and publish a new post to the Supabase blog_posts table so it appears on the public blog page."
        backHref="/gio_dash/blog"
        backLabel="Back to blog admin"
      />

      <DashboardCard>
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

            <div className="space-y-3">
              <Label>Related Projects</Label>
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 md:grid-cols-2">
                  {projects.map((project) => (
                    <label key={project.id} className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-sm)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-3 transition hover:border-[var(--color-border-strong)]">
                      <input type="checkbox" name="relatedProjectIds" value={project.id} className="mt-1" />
                      <div className="min-w-0">
                        <div className="font-medium text-[var(--color-text-primary)]">{project.title || project.url}</div>
                        <div className="break-all text-xs text-[var(--color-text-subtle)]">{project.url}</div>
                      </div>
                    </label>
                  ))}
                </div>
              ) : (
                <DashboardEmptyState title="No projects available yet">
                  No projects are available to link.
                </DashboardEmptyState>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="submit">Publish Post</Button>
              <Button asChild variant="outline">
                <Link href="/gio_dash/blog">Cancel and go back</Link>
              </Button>
            </div>
          </form>
      </DashboardCard>
    </DashboardPageShell>
  );
}
