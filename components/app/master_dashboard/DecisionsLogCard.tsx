import Link from "next/link";
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
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Decisions Log</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Recent active decisions that should not be re-decided casually.
          </p>
        </div>
        <Link
          href="/gio_dash/notes"
          className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
        >
          View all
        </Link>
      </div>

      {decisions.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200">
          <p className="font-semibold text-slate-950 dark:text-white">No active decisions logged</p>
          <p className="mt-1">
            Add decisions through{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">
              POST /api/dashboard/decisions
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {decisions.map((decision) => {
            const created = formatDate(decision.created_at);
            const revisit = formatDate(decision.revisit_at);
            return (
              <article key={decision.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{decision.title}</h3>
                    {created ? (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Created {created}</p>
                    ) : null}
                  </div>
                  <span className="self-start rounded-md bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200">
                    {decision.status}
                  </span>
                </div>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {decision.decision}
                </p>
                {revisit ? (
                  <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-200">
                    Revisit {revisit}
                  </p>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
