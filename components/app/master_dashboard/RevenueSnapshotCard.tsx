import { CircleDollarSign } from "lucide-react";
import { commandMetrics } from "./dashboard-seed-data";

const toneClasses = {
  emerald: "bg-emerald-50 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-200",
  blue: "bg-sky-50 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200",
  amber: "bg-amber-50 text-amber-800 dark:bg-amber-400/10 dark:text-amber-200",
  slate: "bg-slate-100 text-slate-800 dark:bg-white/10 dark:text-slate-200",
  violet: "bg-violet-50 text-violet-800 dark:bg-violet-400/10 dark:text-violet-200",
  rose: "bg-rose-50 text-rose-800 dark:bg-rose-400/10 dark:text-rose-200",
};

export function RevenueSnapshotCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Revenue Snapshot</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Placeholder values until the dashboard data layer is connected.
          </p>
        </div>
        <span className="rounded-md bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
          <CircleDollarSign className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3">
        {commandMetrics.map((metric) => (
          <div key={metric.label} className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-white/10 dark:bg-white/[0.04]">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{metric.label}</p>
              <span className={`rounded-md px-2 py-1 text-xs font-semibold ${toneClasses[metric.tone]}`}>
                Placeholder
              </span>
            </div>
            <p className="mt-2 text-3xl font-semibold text-slate-950 dark:text-white">{metric.value}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">{metric.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
