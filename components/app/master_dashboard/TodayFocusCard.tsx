import { Target } from "lucide-react";
import {
  DashboardCard,
  DashboardIconTile,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
import type {
  DashboardDecision,
  DashboardLead,
  DashboardProject,
} from "@/lib/functions/master-dashboard/types";

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

export type TodayFocusCardProps = {
  topProject?: DashboardProject;
  nextLead?: DashboardLead;
  latestDecision?: DashboardDecision;
};

export function TodayFocusCard({ topProject, nextLead, latestDecision }: TodayFocusCardProps) {
  const projectNext =
    topProject?.next_action?.trim() ||
    (topProject?.name ? `Push ${topProject.name} forward (no next action recorded)` : null);

  const leadName = nextLead?.business_name || nextLead?.name || null;
  const leadFollowUp = formatFollowUp(nextLead?.next_follow_up_at ?? null);
  const leadLine = leadName
    ? leadFollowUp
      ? `${leadName} / ${leadFollowUp}`
      : `${leadName} / status ${nextLead?.status ?? "open"}`
    : null;

  const decisionLine = latestDecision?.title || null;

  return (
    <DashboardCard>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text-primary)]">Today Focus</h2>
          <p className="mt-1 text-sm text-[var(--color-text-secondary)]">
            Derived from the highest-priority active project, soonest lead follow-up,
            and latest active decision.
          </p>
        </div>
        <DashboardIconTile tone="violet">
          <Target className="h-5 w-5" />
        </DashboardIconTile>
      </div>

      <div className="mt-5 grid gap-3">
        {[
          ["Primary focus", topProject?.name ?? "No active projects on file", projectNext],
          ["Soonest lead follow-up", leadLine ?? "No open leads to follow up on", null],
          ["Active decision in focus", decisionLine ?? "No active decisions logged", null],
        ].map(([label, value, detail]) => (
          <div key={label} className={dashboardItemClassName}>
            <p className="ss-eyebrow text-[var(--color-text-subtle)]">{label}</p>
            <p className="mt-2 text-sm font-semibold text-[var(--color-text-primary)]">{value}</p>
            {detail ? <p className="mt-1 text-xs text-[var(--color-text-secondary)]">{detail}</p> : null}
          </div>
        ))}
      </div>
    </DashboardCard>
  );
}
