import {
  DashboardCard,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";

const MOCK_SETTINGS = [
  { label: "Admin surface mode", value: "Builder view" },
  { label: "Default content visibility", value: "Public-first" },
  { label: "Build log sync", value: "Enabled" },
];

export default function SettingsConfigCard() {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="mb-2 text-lg font-semibold text-[var(--color-text-primary)]">Settings & Config</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Mock config summary until dashboard preferences and feature toggles are backed by real settings.
          </p>
        </div>
        <DashboardStatusBadge tone="violet">Mock</DashboardStatusBadge>
      </div>

      <div className="mt-5 space-y-3">
        {MOCK_SETTINGS.map((setting) => (
          <div key={setting.label} className={`${dashboardItemClassName} flex items-center justify-between gap-3`}>
            <p className="text-sm text-[var(--color-text-secondary)]">{setting.label}</p>
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">{setting.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="h-3 rounded-full bg-[var(--color-border-strong)]" />
        <div className="h-3 rounded-full bg-[var(--color-border-strong)]" />
        <div className="h-3 rounded-full bg-[var(--color-signal-info)]" />
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--color-text-subtle)]">
        Next refinement: connect this card to actual dashboard preferences, sync settings, and feature toggles.
      </p>
    </DashboardCard>
  );
}
