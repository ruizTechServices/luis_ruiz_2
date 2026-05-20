import { CalendarDays, CheckCircle2 } from "lucide-react";

function formatToday() {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  }).format(new Date());
}

export function DashboardHeader() {
  return (
    <header className="rounded-2xl border border-slate-200/80 bg-white/90 p-6 shadow-sm dark:border-white/10 dark:bg-slate-950/70 sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800 dark:border-emerald-300/20 dark:bg-emerald-400/10 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4" />
            Owner-only command center
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl dark:text-white">
            Gio Command Center
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            Private operating shell for ruizTechServices, luis-ruiz.com, public
            content, client-facing systems, and AI product work.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
            <CalendarDays className="h-4 w-4 text-teal-700 dark:text-teal-200" />
            Today
          </div>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{formatToday()}</p>
        </div>
      </div>
    </header>
  );
}
