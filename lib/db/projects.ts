import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { RelatedBlogPost, ProjectRow } from "@/lib/types/project";

async function supa() {
  return createServerClient();
}

type ProjectLinkRow = {
  blog_posts: RelatedBlogPost | RelatedBlogPost[] | null;
};

function normalizeRelatedPosts(links: ProjectLinkRow[] | null | undefined): RelatedBlogPost[] {
  if (!links?.length) return [];

  return links
    .flatMap((link) => {
      const entry = link.blog_posts;
      if (!entry) return [];
      return Array.isArray(entry) ? entry : [entry];
    })
    .filter((post): post is RelatedBlogPost => Boolean(post?.id));
}

const projectSelect = [
  "id",
  "url",
  "title",
  "description",
  "slug",
  "summary",
  "status",
  "category",
  "featured",
  "visibility",
  "stack",
  "role",
  "context",
  "problem",
  "constraints",
  "approach",
  "architecture",
  "decisions",
  "outcomes",
  "current_status",
  "repo_url",
  "live_url",
  "cover_image_url",
  "started_at",
  "completed_at",
  "created_at",
  "updated_at",
].join(", ");

export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await supa();

  const baseQuery = await supabase
    .from("projects")
    .select(projectSelect)
    .in("visibility", ["public", "unlisted"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (baseQuery.error) throw baseQuery.error;

  const baseProjects = (baseQuery.data ?? []) as Omit<ProjectRow, "relatedPosts">[];

  const relationQuery = await supabase
    .from("projects")
    .select(`
      id,
      project_blog_links(
        blog_posts(
          id,
          title,
          summary,
          created_at
        )
      )
    `)
    .in("visibility", ["public", "unlisted"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  const relationMap = new Map<number, RelatedBlogPost[]>();

  if (!relationQuery.error && relationQuery.data) {
    for (const project of relationQuery.data as Array<Pick<ProjectRow, "id"> & { project_blog_links?: ProjectLinkRow[] | null }>) {
      relationMap.set(project.id, normalizeRelatedPosts(project.project_blog_links));
    }
  }

  return baseProjects.map((project) => ({
    ...project,
    relatedPosts: relationMap.get(project.id) ?? [],
  }));
}

export async function getProjectsForSelection(): Promise<Pick<ProjectRow, "id" | "title" | "url" | "slug">[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, url, slug")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Pick<ProjectRow, "id" | "title" | "url" | "slug">[];
}
