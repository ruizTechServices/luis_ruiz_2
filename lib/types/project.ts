export interface RelatedBlogPost {
  id: number;
  title: string | null;
  summary: string | null;
  created_at: string;
}

export type ProjectStatus = "draft" | "active" | "complete" | "archived";
export type ProjectCategory = "project" | "product" | "client" | "experiment";
export type ProjectVisibility = "public" | "unlisted" | "private";

export interface ProjectRow {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  slug: string;
  summary: string | null;
  status: ProjectStatus;
  category: ProjectCategory;
  featured: boolean;
  visibility: ProjectVisibility;
  stack: string[];
  role: string | null;
  context: string | null;
  problem: string | null;
  constraints: string | null;
  approach: string | null;
  architecture: string | null;
  decisions: string | null;
  outcomes: string | null;
  current_status: string | null;
  repo_url: string | null;
  live_url: string | null;
  cover_image_url: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  relatedPosts?: RelatedBlogPost[];
}
