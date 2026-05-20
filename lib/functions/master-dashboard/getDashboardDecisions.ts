import { getDashboardSupabase } from "./getDashboardSupabase";
import type { DashboardDecision } from "./types";

const DASHBOARD_DECISIONS_SELECT = [
  "id",
  "title",
  "decision",
  "reason",
  "project_id",
  "status",
  "revisit_at",
  "created_at",
  "updated_at",
].join(", ");

export type GetDashboardDecisionsOptions = {
  status?: string | string[];
  limit?: number;
};

export async function getDashboardDecisions(
  options: GetDashboardDecisionsOptions = {}
): Promise<DashboardDecision[]> {
  const supabase = getDashboardSupabase();
  let query = supabase
    .from("dashboard_decisions")
    .select(DASHBOARD_DECISIONS_SELECT)
    .order("updated_at", { ascending: false })
    .order("created_at", { ascending: false });

  if (options.status) {
    if (Array.isArray(options.status)) {
      query = query.in("status", options.status);
    } else {
      query = query.eq("status", options.status);
    }
  }

  if (typeof options.limit === "number" && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.overrideTypes<DashboardDecision[], { merge: false }>();
  if (error) throw error;
  return data ?? [];
}
