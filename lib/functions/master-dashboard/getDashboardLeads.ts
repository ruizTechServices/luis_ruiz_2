import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { DashboardLead } from "./types";

const DASHBOARD_LEADS_SELECT = [
  "id",
  "name",
  "business_name",
  "email",
  "phone",
  "source",
  "problem",
  "budget",
  "status",
  "next_follow_up_at",
  "notes",
  "created_at",
  "updated_at",
].join(", ");

export type GetDashboardLeadsOptions = {
  status?: string | string[];
  openOnly?: boolean;
  limit?: number;
};

const OPEN_LEAD_STATUSES = ["new", "contacted", "qualified", "proposal"];

export async function getDashboardLeads(
  options: GetDashboardLeadsOptions = {}
): Promise<DashboardLead[]> {
  const supabase = await createServerClient();
  let query = supabase
    .from("dashboard_leads")
    .select(DASHBOARD_LEADS_SELECT)
    .order("next_follow_up_at", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (options.openOnly) {
    query = query.in("status", OPEN_LEAD_STATUSES);
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

  const { data, error } = await query.overrideTypes<DashboardLead[], { merge: false }>();
  if (error) throw error;
  return data ?? [];
}
