import { getDashboardSupabase } from "./getDashboardSupabase";
import type { DashboardSystemLink } from "./types";

const DASHBOARD_SYSTEM_LINKS_SELECT = [
  "id",
  "name",
  "url",
  "description",
  "type",
  "status",
  "priority",
  "created_at",
  "updated_at",
].join(", ");

export type GetDashboardSystemLinksOptions = {
  status?: string | string[];
  type?: string;
  limit?: number;
};

export async function getDashboardSystemLinks(
  options: GetDashboardSystemLinksOptions = {}
): Promise<DashboardSystemLink[]> {
  const supabase = getDashboardSupabase();
  let query = supabase
    .from("dashboard_system_links")
    .select(DASHBOARD_SYSTEM_LINKS_SELECT)
    .order("priority", { ascending: true })
    .order("name", { ascending: true });

  if (options.status) {
    if (Array.isArray(options.status)) {
      query = query.in("status", options.status);
    } else {
      query = query.eq("status", options.status);
    }
  }
  if (options.type) {
    query = query.eq("type", options.type);
  }
  if (typeof options.limit === "number" && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.overrideTypes<DashboardSystemLink[], { merge: false }>();
  if (error) throw error;
  return data ?? [];
}
