import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { quickActions } from "./dashboard-seed-data";

export function QuickActionsPanel() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div>
        <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
          Fast routes into the admin work Gio is most likely to touch.
        </p>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.href}
              href={action.href}
              className="group rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-200/40 dark:hover:bg-white/[0.07]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="rounded-md bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-4 w-4 text-slate-400 transition group-hover:text-teal-700 dark:group-hover:text-teal-200" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-slate-950 dark:text-white">{action.label}</h3>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{action.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
