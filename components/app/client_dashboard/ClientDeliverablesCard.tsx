import { FileCheck2 } from "lucide-react";

export function ClientDeliverablesCard() {
  return (
    <section className="h-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Deliverables</h2>
          <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Files, handoff notes, and launch assets will appear here.
          </p>
        </div>
        <span className="rounded-md bg-violet-50 p-2 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200">
          <FileCheck2 className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-slate-950 dark:text-white">No deliverables posted</p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          This card is reserved for client-specific project assets.
        </p>
      </div>
    </section>
  );
}
