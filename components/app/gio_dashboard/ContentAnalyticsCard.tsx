import {
  DashboardCard,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";

const MOCK_METRICS = [
  { label: "Weekly page views", value: "1,284", delta: "+12%", tone: "text-[var(--color-signal-mint)]" },
  { label: "Avg. blog read depth", value: "63%", delta: "+4%", tone: "text-[var(--color-signal-info)]" },
  { label: "Contact conversion", value: "3.8%", delta: "mock", tone: "text-[var(--color-signal-violet)]" },
];

export default function ContentAnalyticsCard() {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">Content Analytics</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Mock performance snapshot while the real analytics layer is still being wired.
          </p>
        </div>
        <DashboardStatusBadge tone="info">Mock</DashboardStatusBadge>
      </div>

      <div className="mt-5 space-y-4">
        {MOCK_METRICS.map((metric) => (
          <div key={metric.label} className={dashboardItemClassName}>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{metric.label}</p>
              <span className={`text-xs font-semibold ${metric.tone}`}>{metric.delta}</span>
            </div>
            <p className="mt-2 text-2xl font-bold text-[var(--color-text-primary)]">{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] p-3 text-xs leading-6 text-[var(--color-text-subtle)]">
        Next refinement: connect this card to real blog views, project clicks, and contact conversion events.
      </div>
    </DashboardCard>
  );
}
