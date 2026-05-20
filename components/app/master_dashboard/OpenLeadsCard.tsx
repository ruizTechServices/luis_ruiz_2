import { Inbox } from "lucide-react";
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

function statusToneClasses(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized === "new") {
    return "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200";
  }
  if (normalized === "contacted" || normalized === "qualified") {
    return "bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200";
  }
  if (normalized === "proposal_sent" || normalized === "deposit_paid") {
    return "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200";
  }
  if (normalized === "in_progress") {
    return "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200";
  }
  return "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200";
}

export type OpenLeadsCardProps = {
  leads: DashboardLead[];
};

export function OpenLeadsCard({ leads }: OpenLeadsCardProps) {
  const visible = leads.slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Open Leads</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {visible.length > 0
              ? "Soonest follow-ups first, then newest leads."
              : "No leads yet."}
          </p>
        </div>
        <span className="rounded-md bg-sky-50 p-2 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200">
          <Inbox className="h-5 w-5" />
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">
            No open leads yet
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Add leads through <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">POST /api/dashboard/leads</code>
            {" "}or wire a future lead form to the dashboard API.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {visible.map((lead) => {
            const title = lead.business_name || lead.name || "Unnamed lead";
            const subtitle =
              lead.business_name && lead.name && lead.name !== lead.business_name
                ? lead.name
                : null;
            const budget = formatBudget(lead.budget);
            const followUp = formatFollowUp(lead.next_follow_up_at);

            return (
              <article
                key={lead.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                      {title}
                    </h3>
                    {subtitle ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
                    ) : null}
                  </div>
                  <span
                    className={`self-start rounded-md px-2 py-1 text-xs font-semibold ${statusToneClasses(lead.status)}`}
                  >
                    {lead.status}
                  </span>
                </div>

                {lead.problem ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-700 dark:text-slate-200">
                    {lead.problem}
                  </p>
                ) : null}

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {budget ? <span><span className="font-semibold text-slate-700 dark:text-slate-200">Budget:</span> {budget}</span> : null}
                  {followUp ? <span><span className="font-semibold text-slate-700 dark:text-slate-200">Follow-up:</span> {followUp}</span> : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
