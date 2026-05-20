import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import type { DashboardMoneyEntry, MasterDashboardMoneySummary } from "./types";

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
  const supabase = await createServerClient();
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

export function summarizeMoneyEntries(
  entries: DashboardMoneyEntry[]
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

  return {
    total_income,
    total_expense,
    net: total_income - total_expense,
    entries_count: entries.length,
  };
}
