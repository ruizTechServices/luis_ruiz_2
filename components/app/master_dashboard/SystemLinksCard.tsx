import Link from "next/link";
import { ArrowUpRight, Link2 } from "lucide-react";
import { systemLinks } from "./dashboard-seed-data";

export function SystemLinksCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">System Links</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Public systems, product surfaces, and operating dashboards.
          </p>
        </div>
        <span className="rounded-md bg-teal-50 p-2 text-teal-800 dark:bg-teal-400/10 dark:text-teal-200">
          <Link2 className="h-5 w-5" />
        </span>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {systemLinks.map((item) => {
          const content = (
            <>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">{item.label}</h3>
                <ArrowUpRight className="h-4 w-4 text-slate-400" />
              </div>
              <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">{item.description}</p>
            </>
          );

          const className =
            "rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-teal-300 hover:bg-white dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-teal-200/40 dark:hover:bg-white/[0.07]";

          return item.external ? (
            <a key={item.label} href={item.href} className={className} target="_blank" rel="noreferrer">
              {content}
            </a>
          ) : (
            <Link key={item.label} href={item.href} className={className}>
              {content}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
