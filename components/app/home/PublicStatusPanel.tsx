import { Activity, Building2, FileText, Gauge, Waypoints } from "lucide-react";
import { publicStatusItems } from "./home-data";

const icons = [Building2, Gauge, Waypoints, Activity, FileText];

export function PublicStatusPanel() {
  return (
    <section className="border-b border-slate-200/70 bg-white py-14 dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700 dark:text-teal-200">
              Public focus areas
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              What this hub is organizing right now.
            </h2>
          </div>
          <p className="max-w-2xl text-sm leading-7 text-slate-600 dark:text-slate-300">
            This panel shows public-facing direction only: service areas,
            products, experiments, and writing.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {publicStatusItems.map((item, index) => {
            const Icon = icons[index] ?? Activity;

            return (
              <article
                key={item.title}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <div className="mb-5 flex items-center justify-between gap-3">
                  <span className="rounded-md border border-slate-200 bg-white p-2 text-slate-800 dark:border-white/10 dark:bg-slate-900 dark:text-teal-200">
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="rounded-md bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-300/10 dark:text-teal-200">
                    {item.status}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-950 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
