import Link from "next/link";
import {
  DashboardCard,
  DashboardEmptyState,
  dashboardActionClassName,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { SignalBadge } from "@/components/design-system/SignalBadge";
import type { DashboardDecision } from "@/lib/functions/master-dashboard/types";

export type DecisionsLogCardProps = {
  decisions: DashboardDecision[];
};

function formatDate(value: string | null): string | null {
  if (!value) return null;
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return null;
  }
}

export function DecisionsLogCard({ decisions }: DecisionsLogCardProps) {
  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Decisions Log</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Recent active decisions that should not be re-decided casually.
          </p>
        </div>
        <Link href="/gio_dash/notes" className={dashboardActionClassName}>
          View all
        </Link>
      </div>

      {decisions.length === 0 ? (
        <DashboardEmptyState title="No active decisions logged">
          <p>
            Add decisions through{" "}
            <code className="rounded bg-[var(--color-surface)] px-1 py-0.5 font-technical text-xs">
              POST /api/dashboard/decisions
            </code>
            .
          </p>
        </DashboardEmptyState>
      ) : (
        <div className="mt-5 space-y-3">
          {decisions.map((decision) => {
            const created = formatDate(decision.created_at);
            const revisit = formatDate(decision.revisit_at);
            return (
              <article key={decision.id} className={dashboardItemClassName}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {decision.title}
                    </h3>
                    {created ? (
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">Created {created}</p>
                    ) : null}
                  </div>
                  <SignalBadge tone="mint" className="self-start">
                    {decision.status}
                  </SignalBadge>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-[var(--color-text-secondary)]">
                  {decision.decision}
                </p>
                {revisit ? (
                  <p className="mt-2 text-xs font-medium text-[var(--color-signal-warning)]">
                    Revisit {revisit}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
