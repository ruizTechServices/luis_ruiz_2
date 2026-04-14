import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { RelatedBlogPost, ProjectRow } from "@/lib/types/project";

async function supa() {
  return createServerClient();
}

type ProjectLinkRow = {
  blog_posts: RelatedBlogPost | RelatedBlogPost[] | null;
};

type ProjectBaseRow = Omit<ProjectRow, "relatedPosts">;
type ProjectRelationRow = Pick<ProjectRow, "id"> & {
  project_blog_links: ProjectLinkRow[] | null;
};
type ProjectSelectionRow = Pick<ProjectRow, "id" | "title" | "url" | "slug">;

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

  const { data: baseProjects, error: baseError } = await supabase
    .from("projects")
    .select(projectSelect)
    .in("visibility", ["public", "unlisted"])
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .overrideTypes<ProjectBaseRow[], { merge: false }>();

  if (baseError) throw baseError;

  const { data: relationProjects, error: relationError } = await supabase
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
    .order("created_at", { ascending: false })
    .overrideTypes<ProjectRelationRow[], { merge: false }>();

  const relationMap = new Map<number, RelatedBlogPost[]>();

  if (!relationError && relationProjects) {
    for (const project of relationProjects) {
      relationMap.set(project.id, normalizeRelatedPosts(project.project_blog_links));
    }
  }

  return (baseProjects ?? []).map((project) => ({
    ...project,
    relatedPosts: relationMap.get(project.id) ?? [],
  }));
}

export async function getProjectsForSelection(): Promise<ProjectSelectionRow[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, url, slug")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .overrideTypes<ProjectSelectionRow[], { merge: false }>();

  if (error) throw error;
  return data ?? [];
}
