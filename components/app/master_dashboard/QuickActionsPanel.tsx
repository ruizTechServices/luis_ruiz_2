import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DashboardCard, DashboardIconTile } from "@/components/design-system/DashboardPrimitives";
import { quickActions } from "./dashboard-seed-data";

export function QuickActionsPanel() {
  return (
    <DashboardCard>
      <div>
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Quick Actions</h2>
        <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
          Fast routes into the admin work Gio is most likely to touch.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-4 transition hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]"
            >
              <div className="flex items-start justify-between gap-3">
                <DashboardIconTile>
                  <Icon className="h-4 w-4" />
                </DashboardIconTile>
                <ArrowRight className="h-4 w-4 text-[var(--color-text-subtle)] transition group-hover:text-[var(--color-action-primary)]" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-[var(--color-text-primary)]">{action.label}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--color-text-secondary)]">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </DashboardCard>
  );
}
