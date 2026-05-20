import { Clock3 } from "lucide-react";

export function ClientUpdatesCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Recent Updates</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Project-specific updates will appear here when a client workspace is active.
          </p>
        </div>
        <span className="rounded-md bg-sky-50 p-2 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200">
          <Clock3 className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">No client updates yet</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          Updates here will be scoped to this signed-in client account.
        </p>
      </div>
    </section>
  );
}
