import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getLatestPushes } from "@/lib/github/latest-pushes";
import { formatCommitUtc, groupCommitsByDay, shortSha } from "@/lib/github/commit-utils";

export default async function LatestPushesSection() {
  const feed = await getLatestPushes(6);
  const grouped = groupCommitsByDay(feed.commits);

  return (
    <section className="px-6 py-10 sm:py-14 lg:py-16">
      <div className="mx-auto w-full max-w-6xl rounded-[2rem] border border-slate-200/70 bg-white/75 p-6 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/60 dark:shadow-[0_24px_65px_rgba(2,6,23,0.28)] sm:p-8 lg:p-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-600 dark:text-sky-100/70">Latest pushes</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              Real branch activity, pulled from GitHub instead of padded portfolio copy.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
              This section reads directly from the <span className="font-semibold text-slate-900 dark:text-white">{feed.branch}</span> branch on <span className="font-semibold text-slate-900 dark:text-white">{feed.repo}</span> and refreshes on the server.
            </p>
          </div>

          <Link
            href={`https://github.com/${feed.repo}/tree/${encodeURIComponent(feed.branch)}`}
            className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_35px_rgba(15,23,42,0.16)] transition hover:bg-slate-800 dark:border-white/15 dark:bg-white/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] dark:backdrop-blur-xl dark:hover:bg-white/[0.12]"
          >
            View branch on GitHub
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
          <div className="space-y-5">
            {grouped.map((group) => (
              <div key={group.day} className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-950/30 dark:backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-sky-100/60">{group.day}</p>
                <div className="mt-4 space-y-4">
                  {group.commits.map((commit) => (
                    <article key={commit.sha} className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-sm dark:border-white/8 dark:bg-white/[0.03] dark:shadow-none">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-300">
                        <Link href={commit.htmlUrl} className="font-mono text-violet-600 hover:text-violet-500 dark:text-sky-300 dark:hover:text-sky-200">
                          {shortSha(commit.sha)}
                        </Link>
                        <span>{formatCommitUtc(commit.authoredAt)}</span>
                        <span>{commit.authorName}</span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-slate-900 dark:text-white">{commit.message}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[1.5rem] border border-slate-200/70 bg-gradient-to-b from-slate-100 to-white p-5 shadow-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] dark:backdrop-blur-xl dark:shadow-none">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-sky-100/60">Why this belongs here</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600 dark:text-slate-300">
              <li>It proves current execution instead of asking for trust.</li>
              <li>It ties the homepage to real shipping velocity.</li>
              <li>It connects projects, public writing, and GitHub into one proof trail.</li>
            </ul>
            <div className="mt-6 rounded-2xl border border-slate-200/80 bg-white/90 p-4 dark:border-white/8 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Feed behavior</p>
              <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
                Server-fetched and cached every 10 minutes, so it stays credible without hammering the GitHub API.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
