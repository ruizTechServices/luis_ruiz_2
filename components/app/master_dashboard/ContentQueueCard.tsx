import Link from "next/link";
import { BlogCard } from "@/components/app/blog/blog_card";
import { contentActions } from "./dashboard-seed-data";

export async function ContentQueueCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">Content Queue</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Current build-log surface plus admin routes for content movement.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {contentActions.map((action) => {
            const Icon = action.icon;
            const className =
              "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-900 transition hover:bg-slate-50 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10";

            return action.external ? (
              <a key={action.label} href={action.href} target="_blank" rel="noreferrer" className={className}>
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </a>
            ) : (
              <Link key={action.label} href={action.href} className={className}>
                <Icon className="h-3.5 w-3.5" />
                {action.label}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-950 p-5 dark:bg-black/30">
        <BlogCard />
      </div>
    </section>
  );
}
