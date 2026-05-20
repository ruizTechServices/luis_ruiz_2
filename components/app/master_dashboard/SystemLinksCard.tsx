import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import type { DashboardSystemLink } from "@/lib/functions/master-dashboard/types";

export type SystemLinksCardProps = {
  links: DashboardSystemLink[];
};

function isInternalHref(href: string): boolean {
  return href.startsWith("/");
}

export function SystemLinksCard({ links }: SystemLinksCardProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">System Links</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Important active destinations from the owner command center.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/gio_dash/systems"
            className="rounded-md bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-200 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15"
          >
            View all
          </Link>
          <span className="rounded-md bg-teal-50 p-2 text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
            <Link2 className="h-5 w-5" />
          </span>
        </div>
      </div>

      {links.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-700 dark:border-white/15 dark:bg-white/[0.04] dark:text-slate-200">
          <p className="font-semibold text-slate-950 dark:text-white">No active system links</p>
          <p className="mt-1">
            Add owner-only destinations through{" "}
            <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">
              POST /api/dashboard/system-links
            </code>
            .
          </p>
        </div>
      ) : (
        <div className="mt-5 divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 dark:divide-white/10 dark:border-white/10">
          {links.map((item) => {
            const openLink = isInternalHref(item.url) ? (
              <Link
                href={item.url}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-teal-200"
                aria-label={`Open ${item.name}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            ) : (
              <a
                href={item.url}
                className="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-teal-700 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-teal-200"
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${item.name}`}
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            );

            return (
              <div key={item.id} className="grid gap-3 bg-slate-50 p-4 dark:bg-white/[0.04] sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{item.name}</h3>
                    <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-semibold text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
                      {item.type}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-200">
                      {item.status}
                    </span>
                    <span className="rounded-md bg-white px-2 py-1 text-xs font-semibold text-slate-600 ring-1 ring-slate-200 dark:bg-slate-950/40 dark:text-slate-300 dark:ring-white/10">
                      P{item.priority}
                    </span>
                  </div>
                  {item.description ? (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600 dark:text-slate-300">
                      {item.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex items-center justify-end">{openLink}</div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
