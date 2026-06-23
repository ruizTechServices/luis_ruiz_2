import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardIconTile,
  dashboardActionClassName,
} from "@/components/design-system/DashboardPrimitives";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import type { DashboardSystemLink } from "@/lib/functions/master-dashboard/types";

export type SystemLinksCardProps = {
  links: DashboardSystemLink[];
};

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

export function SystemLinksCard({ links }: SystemLinksCardProps) {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">System Links</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Important active destinations from the owner command center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/gio_dash/systems" className={dashboardActionClassName}>
            View all
          </Link>
          <DashboardIconTile tone="mint">
            <Link2 className="h-5 w-5" />
          </DashboardIconTile>
        </div>
      </div>

      {links.length === 0 ? (
        <DashboardEmptyState title="No active system links">
          <p>
            Add owner-only destinations through{" "}
            <code className="rounded bg-[var(--color-surface)] px-1 py-0.5 font-technical text-xs">
              POST /api/dashboard/system-links
            </code>
            .
          </p>
        </DashboardEmptyState>
      ) : (
        <div className="mt-5 divide-y divide-[var(--color-border)] overflow-hidden rounded-[var(--radius-md)] border border-[var(--color-border)]">
          {links.map((item) => {
            const linkClassName =
              "inline-flex size-10 items-center justify-center rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] transition hover:bg-[var(--color-surface)] hover:text-[var(--color-signal-mint)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-focus-ring)]";
            const openLink = isInternalHref(item.url) ? (
              <Link href={item.url} className={linkClassName} aria-label={`Open ${item.name}`}>
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <a
                href={item.url}
                className={linkClassName}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${item.name}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            );

            return (
              <div key={item.id} className="grid gap-3 bg-[var(--color-surface-raised)] p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">{item.name}</h3>
                    <SignalBadge tone="mint">{item.type}</SignalBadge>
                    <SignalBadge>{item.status}</SignalBadge>
                    <SignalBadge>P{item.priority}</SignalBadge>
                  </div>
                  {item.description ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-[var(--color-text-secondary)]">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center justify-end">{openLink}</div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
