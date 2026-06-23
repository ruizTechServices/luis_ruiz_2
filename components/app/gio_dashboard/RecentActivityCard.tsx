import {
  DashboardCard,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";

const MOCK_ACTIVITY = [
  { title: "Homepage latest-pushes section updated", meta: "UI refinement / mock timeline" },
  { title: "Contacts inbox typing pass completed", meta: "Admin workflow / recent dev work" },
  { title: "Notion build-log sync scaffolded", meta: "Automation / pending cron finalization" },
];

export default function RecentActivityCard() {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">Recent Activity</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Mock activity feed until the true activity stream is connected.
          </p>
        </div>
        <DashboardStatusBadge tone="warning">Mock</DashboardStatusBadge>
      </div>

      <div className="mt-5 space-y-3">
        {MOCK_ACTIVITY.map((item, index) => (
          <div key={item.title} className={`${dashboardItemClassName} flex gap-3`}>
            <div className="mt-1 size-2.5 rounded-full bg-[var(--color-signal-info)]" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)]">{item.title}</p>
              <p className="mt-1 text-xs text-[var(--color-text-subtle)]">
                {item.meta} / item {index + 1}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] p-3 text-xs leading-6 text-[var(--color-text-subtle)]">
        Next refinement: replace this with a true activity stream from posts, contacts, project updates, and system actions.
      </div>
    </DashboardCard>
  );
}
