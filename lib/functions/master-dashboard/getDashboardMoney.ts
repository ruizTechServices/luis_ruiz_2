import { getDashboardSupabase } from "./getDashboardSupabase";
import type {
  DashboardLead,
  DashboardMoneyEntry,
  DashboardProject,
  MasterDashboardMoneySummary,
} from "./types";

const DASHBOARD_MONEY_SELECT = [
  "id",
  "entry_type",
  "category",
  "description",
  "amount",
  "occurred_on",
  "project_id",
  "client_id",
  "created_at",
].join(", ");

export type GetDashboardMoneyOptions = {
  entryType?: string;
  since?: string;
  limit?: number;
};

export async function getDashboardMoney(
  options: GetDashboardMoneyOptions = {}
): Promise<DashboardMoneyEntry[]> {
  const supabase = getDashboardSupabase();
  let query = supabase
    .from("dashboard_money_entries")
    .select(DASHBOARD_MONEY_SELECT)
    .order("occurred_on", { ascending: false })
    .order("created_at", { ascending: false });

  if (options.entryType) {
    query = query.eq("entry_type", options.entryType);
  }
  if (options.since) {
    query = query.gte("occurred_on", options.since);
  }
  if (typeof options.limit === "number" && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query.overrideTypes<DashboardMoneyEntry[], { merge: false }>();
  if (error) throw error;
  return data ?? [];
}

export type SummarizeMoneyEntriesOptions = {
  openLeads?: DashboardLead[];
  openProjects?: DashboardProject[];
};

export function summarizeMoneyEntries(
  entries: DashboardMoneyEntry[],
  options: SummarizeMoneyEntriesOptions = {}
): MasterDashboardMoneySummary {
  let total_income = 0;
  let total_expense = 0;

  for (const entry of entries) {
    const amount = Number(entry.amount) || 0;
    if (entry.entry_type === "income") {
      total_income += amount;
    } else if (entry.entry_type === "expense") {
      total_expense += amount;
    }
  }

  let open_opportunity_value = 0;
  if (options.openLeads) {
    for (const lead of options.openLeads) {
      const budget = Number(lead.budget) || 0;
      if (budget > 0) open_opportunity_value += budget;
    }
  }
  if (options.openProjects) {
    for (const project of options.openProjects) {
      const potential = Number(project.revenue_potential) || 0;
      if (potential > 0) open_opportunity_value += potential;
    }
  }

  return {
    total_income,
    total_expense,
    net: total_income - total_expense,
    entries_count: entries.length,
    open_opportunity_value,
  };
}
