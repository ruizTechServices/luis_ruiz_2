import { CircleDollarSign } from "lucide-react";
import {
  DashboardCard,
  DashboardIconTile,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { SignalBadge, type SignalTone } from "@/components/design-system/SignalBadge";
import type { MasterDashboardMoneySummary } from "@/lib/functions/master-dashboard/types";

function formatCurrency(value: number): string {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(safe);
}

export type RevenueSnapshotCardProps = {
  summary: MasterDashboardMoneySummary;
};

export function RevenueSnapshotCard({ summary }: RevenueSnapshotCardProps) {
  const hasEntries = summary.entries_count > 0;
  const netTone: SignalTone = summary.net >= 0 ? "mint" : "danger";

  const metrics: { label: string; value: string; detail: string; tone: SignalTone }[] = [
    {
      label: "Total income",
      value: formatCurrency(summary.total_income),
      detail: hasEntries ? `${summary.entries_count} money entries on file` : "No money entries yet",
      tone: "mint",
    },
    {
      label: "Total expenses",
      value: formatCurrency(summary.total_expense),
      detail: "Sum of expense entries in dashboard_money_entries",
      tone: "danger",
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
      tone: "info",
    },
  ];

  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Revenue Snapshot</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {hasEntries ? "From dashboard_money_entries." : "Log income and expenses to populate this snapshot."}
          </p>
        </div>
        <DashboardIconTile>
          <CircleDollarSign className="h-5 w-5" />
        </DashboardIconTile>
      </div>

      <div className="mt-5 grid gap-3">
        {metrics.map((metric) => (
          <div key={metric.label} className={dashboardItemClassName}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{metric.label}</p>
              <SignalBadge tone={metric.tone}>Live</SignalBadge>
            </div>
            <p className="mt-2 text-3xl font-semibold text-[var(--color-text-primary)]">{metric.value}</p>
            <p className="mt-1 text-xs leading-5 text-[var(--color-text-subtle)]">{metric.detail}</p>
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
