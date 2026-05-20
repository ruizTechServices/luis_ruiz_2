import { Target } from "lucide-react";

export function TodayFocusCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Today Focus</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            The current command-center priority.
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
            Refactor luis-ruiz.com into master hub
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Next action
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
            Implement feature-spec loop
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
            Blockers
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
            None recorded
          </p>
        </div>
      </div>
    </section>
  );
}
