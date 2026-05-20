import { Target } from "lucide-react";
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
      ? `${leadName} · ${leadFollowUp}`
      : `${leadName} · status ${nextLead?.status ?? "open"}`
    : null;

  const decisionLine = latestDecision?.title || null;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Today Focus</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Derived from the highest-priority active project, soonest lead follow-up,
            and latest active decision.
          </p>
        </div>
        <span className="rounded-md bg-violet-50 p-2 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200">
          <Target className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Primary focus
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
            {topProject?.name ?? "No active projects on file"}
          </p>
          {projectNext ? (
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{projectNext}</p>
          ) : null}
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Soonest lead follow-up
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
            {leadLine ?? "No open leads to follow up on"}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Active decision in focus
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
            {decisionLine ?? "No active decisions logged"}
          </p>
        </div>
      </div>
    </section>
  );
}
