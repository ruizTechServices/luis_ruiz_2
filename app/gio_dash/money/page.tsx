import "server-only";
import Link from "next/link";
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

export const dynamic = "force-dynamic";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number.isFinite(value) ? value : 0);
}

function formatOccurred(value: string): string {
  if (!value) return "—";
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_45%,#ecfeff_100%)] py-8 text-slate-950 dark:bg-[linear-gradient(135deg,#020617_0%,#111827_48%,#062f2f_100%)] dark:text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link href="/gio_dash" className="text-xs font-semibold text-slate-500 hover:underline dark:text-slate-400">
              ← Back to command center
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Money / P&amp;L
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 dark:text-slate-300">
              Operational P&amp;L from <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">dashboard_money_entries</code>.
            </p>
          </div>
          <span className="self-start rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
            {entries.length} entries
          </span>
        </div>

        {loadError ? (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-400/30 dark:bg-amber-400/10 dark:text-amber-100">
            Could not load money entries: {loadError}
          </div>
        ) : null}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Income</p>
            <p className="mt-2 text-2xl font-semibold text-emerald-700 dark:text-emerald-300">{formatCurrency(summary.total_income)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Expense</p>
            <p className="mt-2 text-2xl font-semibold text-rose-700 dark:text-rose-300">{formatCurrency(summary.total_expense)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">Net</p>
            <p className={`mt-2 text-2xl font-semibold ${summary.net >= 0 ? "text-emerald-700 dark:text-emerald-300" : "text-rose-700 dark:text-rose-300"}`}>
              {formatCurrency(summary.net)}
            </p>
          </div>
        </section>

        {entries.length === 0 && !loadError ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-700 dark:border-white/15 dark:bg-slate-950/60 dark:text-slate-200">
            <p className="font-semibold text-slate-900 dark:text-white">No money entries yet</p>
            <p className="mt-1">Log income or expenses through <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">POST /api/dashboard/money</code>.</p>
          </div>
        ) : entries.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-slate-950/70">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-white/10">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-600 dark:bg-white/[0.04] dark:text-slate-300">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                {entries.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{formatOccurred(entry.occurred_on)}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-md px-2 py-1 text-xs font-semibold ${
                        entry.entry_type === "income"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200"
                          : "bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200"
                      }`}>
                        {entry.entry_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.category}</td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-200">{entry.description ?? "—"}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${
                      entry.entry_type === "income"
                        ? "text-emerald-700 dark:text-emerald-300"
                        : "text-rose-700 dark:text-rose-300"
                    }`}>
                      {formatCurrency(Number(entry.amount) || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </main>
  );
}
