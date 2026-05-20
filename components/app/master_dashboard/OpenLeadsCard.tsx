import Link from "next/link";
import { Inbox, PlusCircle } from "lucide-react";

export function OpenLeadsCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Open Leads</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            No lead records connected yet.
          </p>
        </div>
        <span className="rounded-md bg-sky-50 p-2 text-sky-800 dark:bg-sky-400/10 dark:text-sky-200">
          <Inbox className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-white/15 dark:bg-white/[0.04]">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">
          Next: implement dashboard_leads table
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
          The shell is ready for lead records, values, statuses, and follow-up
          actions once persistence is added in a later spec.
        </p>
      </div>

      <Link
        href="/contact"
        className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
      >
        <PlusCircle className="h-4 w-4" />
        Review public intake
      </Link>
    </section>
  );
}
