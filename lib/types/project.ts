export interface RelatedBlogPost {
  id: number;
  title: string | null;
  summary: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  relatedPosts?: RelatedBlogPost[];
}
