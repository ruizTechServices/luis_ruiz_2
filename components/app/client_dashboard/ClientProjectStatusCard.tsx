import { FolderKanban } from "lucide-react";

export function ClientProjectStatusCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Project Status</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            No active client project is connected to this account yet.
          </p>
        </div>
        <span className="rounded-md bg-teal-50 p-2 text-teal-800 dark:bg-teal-300/10 dark:text-teal-200">
          <FolderKanban className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Status</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">Waiting for setup</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Next step</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">Project kickoff</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
          <p className="text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">Access</p>
          <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">Client-only</p>
        </div>
      </div>
    </section>
  );
}
