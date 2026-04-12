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

export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await supa();

  const baseQuery = await supabase
    .from("projects")
    .select("id, url, title, description, created_at, updated_at")
    .order("created_at", { ascending: true });

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
    .order("created_at", { ascending: true });

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

export async function getProjectsForSelection(): Promise<Pick<ProjectRow, "id" | "title" | "url">[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, url")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Pick<ProjectRow, "id" | "title" | "url">[];
}
