import "server-only";
import { redirect } from "next/navigation";
import { isOwner } from "@/lib/auth/ownership";
import { createClient as createServerClient } from "@/lib/clients/supabase/server";
import {
  getDashboardMoney,
  summarizeMoneyEntries,
} from "@/lib/functions/master-dashboard/getDashboardMoney";
import type {
  DashboardMoneyEntry,
  MasterDashboardMoneySummary,
} from "@/lib/functions/master-dashboard/types";
import {
  DashboardCard,
  DashboardCode,
  DashboardEmptyState,
  DashboardErrorState,
  DashboardPageHeader,
  DashboardPageShell,
  DashboardStatusBadge,
  DashboardTableShell,
  dashboardTableBodyClassName,
  dashboardTableCellClassName,
  dashboardTableClassName,
  dashboardTableHeadClassName,
} from "@/components/design-system/DashboardPrimitives";

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatOccurred(value: string): string {
  if (!value) return "-";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

export default async function MoneyPage() {
  const supabase = await createServerClient();
  const { data: userRes } = await supabase.auth.getUser();
  const email = userRes?.user?.email;

  if (!email) redirect("/login");
  if (!isOwner(email)) redirect("/dashboard");

  let entries: DashboardMoneyEntry[] = [];
  let summary: MasterDashboardMoneySummary = {
    total_income: 0,
    total_expense: 0,
    net: 0,
    entries_count: 0,
    open_opportunity_value: 0,
  };
  let loadError: string | null = null;
  try {
    entries = await getDashboardMoney({ limit: 200 });
    summary = summarizeMoneyEntries(entries);
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Failed to load money entries";
  }

  return (
    <DashboardPageShell>
      <DashboardPageHeader
        title="Money / P&L"
        description={<>Operational P&L from <DashboardCode>dashboard_money_entries</DashboardCode>.</>}
        meta={<DashboardStatusBadge>{entries.length} entries</DashboardStatusBadge>}
      />

      {loadError ? (
        <DashboardErrorState>Could not load money entries: {loadError}</DashboardErrorState>
      ) : null}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <DashboardCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">Income</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-signal-mint)]">{formatCurrency(summary.total_income)}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">Expense</p>
          <p className="mt-2 text-2xl font-semibold text-[var(--color-signal-danger)]">{formatCurrency(summary.total_expense)}</p>
        </DashboardCard>
        <DashboardCard>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--color-text-subtle)]">Net</p>
          <p className={`mt-2 text-2xl font-semibold ${summary.net >= 0 ? "text-[var(--color-signal-mint)]" : "text-[var(--color-signal-danger)]"}`}>
            {formatCurrency(summary.net)}
          </p>
        </DashboardCard>
      </section>

      {entries.length === 0 && !loadError ? (
        <DashboardEmptyState title="No money entries yet">
          Log income or expenses through <DashboardCode>POST /api/dashboard/money</DashboardCode>.
        </DashboardEmptyState>
      ) : entries.length > 0 ? (
        <DashboardTableShell>
          <table className={dashboardTableClassName}>
            <thead className={dashboardTableHeadClassName}>
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className={dashboardTableBodyClassName}>
              {entries.map((entry) => (
                <tr key={entry.id} className="transition hover:bg-[var(--color-surface-raised)]">
                  <td className={dashboardTableCellClassName}>{formatOccurred(entry.occurred_on)}</td>
                  <td className={dashboardTableCellClassName}>
                    <DashboardStatusBadge tone={entry.entry_type === "income" ? "mint" : "danger"}>
                      {entry.entry_type}
                    </DashboardStatusBadge>
                  </td>
                  <td className={dashboardTableCellClassName}>{entry.category}</td>
                  <td className={dashboardTableCellClassName}>{entry.description ?? "-"}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${entry.entry_type === "income" ? "text-[var(--color-signal-mint)]" : "text-[var(--color-signal-danger)]"}`}>
                    {formatCurrency(Number(entry.amount) || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DashboardTableShell>
      ) : null}
    </DashboardPageShell>
  );
}
