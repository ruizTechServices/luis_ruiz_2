import { CircleDollarSign } from "lucide-react";
import type { MasterDashboardMoneySummary } from "@/lib/functions/master-dashboard/types";

function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safe);
}

const toneClasses: Record<string, string> = {
  emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
  blue: "bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
  slate: "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200",
  violet: "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200",
  rose: "bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200",
};

export type RevenueSnapshotCardProps = {
  summary: MasterDashboardMoneySummary;
};

export function RevenueSnapshotCard({ summary }: RevenueSnapshotCardProps) {
  const hasEntries = summary.entries_count > 0;
  const netTone = summary.net >= 0 ? "emerald" : "rose";

  const metrics: { label: string; value: string; detail: string; tone: keyof typeof toneClasses }[] = [
    {
      label: "Total income",
      value: formatCurrency(summary.total_income),
      detail: hasEntries
        ? `${summary.entries_count} money entries on file`
        : "No money entries yet",
      tone: "emerald",
    },
    {
      label: "Total expenses",
      value: formatCurrency(summary.total_expense),
      detail: "Sum of expense entries in dashboard_money_entries",
      tone: "rose",
    },
    {
      label: "Net",
      value: formatCurrency(summary.net),
      detail: "Income minus expenses",
      tone: netTone,
    },
    {
      label: "Open opportunity",
      value: formatCurrency(summary.open_opportunity_value),
      detail: "Open lead budgets + active project revenue potential",
      tone: "blue",
    },
  ];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Revenue Snapshot</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {hasEntries
              ? "From dashboard_money_entries."
              : "Log income and expenses to populate this snapshot."}
          </p>
        </div>
        <span className="rounded-md bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
          <CircleDollarSign className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metric.label}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[metric.tone]}`}>
                Live
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
