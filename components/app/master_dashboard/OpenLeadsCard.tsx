import { Inbox } from "lucide-react";
import {
  DashboardCard,
  DashboardEmptyState,
  DashboardIconTile,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import { SignalBadge, type SignalTone } from "@/components/design-system/SignalBadge";
import type { DashboardLead } from "@/lib/functions/master-dashboard/types";

function formatBudget(value: number | null): string | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return null;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);
}

function formatFollowUp(value: string | null): string | null {
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

function statusTone(status: string): SignalTone {
  const normalized = status.toLowerCase();
  if (normalized === "new") return "warning";
  if (normalized === "contacted" || normalized === "qualified") return "info";
  if (normalized === "proposal_sent" || normalized === "deposit_paid") return "violet";
  if (normalized === "in_progress") return "mint";
  return "neutral";
}

export type OpenLeadsCardProps = {
  leads: DashboardLead[];
};

export function OpenLeadsCard({ leads }: OpenLeadsCardProps) {
  const visible = leads.slice(0, 5);

  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Open Leads</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            {visible.length > 0 ? "Soonest follow-ups first, then newest leads." : "No leads yet."}
          </p>
        </div>
        <DashboardIconTile tone="info">
          <Inbox className="h-5 w-5" />
        </DashboardIconTile>
      </div>

      {visible.length === 0 ? (
        <DashboardEmptyState title="No open leads yet">
          <p>
            Add leads through{" "}
            <code className="rounded bg-[var(--color-surface)] px-1 py-0.5 font-technical text-xs">
              POST /api/dashboard/leads
            </code>{" "}
            or wire a future lead form to the dashboard API.
          </p>
        </DashboardEmptyState>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((lead) => {
            const title = lead.business_name || lead.name || "Unnamed lead";
            const subtitle =
              lead.business_name && lead.name && lead.name !== lead.business_name ? lead.name : null;
            const budget = formatBudget(lead.budget);
            const followUp = formatFollowUp(lead.next_follow_up_at);

            return (
              <article key={lead.id} className={dashboardItemClassName}>
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[var(--color-text-primary)]">
                      {title}
                    </h3>
                    {subtitle ? (
                      <p className="mt-1 text-xs text-[var(--color-text-subtle)]">{subtitle}</p>
                    ) : null}
                  </div>
                  <SignalBadge tone={statusTone(lead.status)} className="self-start">
                    {lead.status}
                  </SignalBadge>
                </div>

                {lead.problem ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--color-text-secondary)]">
                    {lead.problem}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--color-text-subtle)]">
                  {budget ? (
                    <span>
                      <span className="font-semibold text-[var(--color-text-secondary)]">Budget:</span>{" "}
                      {budget}
                    </span>
                  ) : null}
                  {followUp ? (
                    <span>
                      <span className="font-semibold text-[var(--color-text-secondary)]">
                        Follow-up:
                      </span>{" "}
                      {followUp}
                    </span>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </DashboardCard>
  );
}
