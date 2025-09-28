import { createClient as createServerClient } from "@/lib/clients/supabase/server";

export type ProjectRow = {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

async function supa() {
  return createServerClient();
}

export async function getProjects(): Promise<ProjectRow[]> {
  const supabase = await supa();
  const { data, error } = await supabase
    .from("projects")
    .select("id, url, title, description, created_at, updated_at")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as ProjectRow[];
}
