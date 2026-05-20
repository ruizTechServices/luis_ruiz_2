import { getDashboardSupabase } from "./getDashboardSupabase";
import type { DashboardProject } from "./types";

const DASHBOARD_PROJECTS_SELECT = [
  "id",
  "name",
  "slug",
  "type",
  "status",
  "priority",
  "repo_url",
  "live_url",
  "description",
  "next_action",
  "revenue_potential",
  "last_touched_at",
  "created_at",
  "updated_at",
].join(", ");

export const ACTIVE_PROJECT_STATUSES = [
  "idea",
  "validated",
  "building",
  "testing",
  "shipped",
  "selling",
];

export type GetDashboardProjectsOptions = {
  status?: string | string[];
  activeOnly?: boolean;
  limit?: number;
};

export async function getDashboardProjects(
  options: GetDashboardProjectsOptions = {}
): Promise<DashboardProject[]> {
  const supabase = getDashboardSupabase();
  let query = supabase
    .from("dashboard_projects")
    .select(DASHBOARD_PROJECTS_SELECT)
    .order("priority", { ascending: true })
    .order("last_touched_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options.activeOnly) {
    query = query.in("status", ACTIVE_PROJECT_STATUSES);
  } else if (options.status) {
    if (Array.isArray(options.status)) {
      query = query.in("status", options.status);
    } else {
      query = query.eq("status", options.status);
    }
  }

  if (typeof options.limit === "number" && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.overrideTypes<DashboardProject[], { merge: false }>();
  if (error) throw error;
  return data ?? [];
}
