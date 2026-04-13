import Link from "next/link";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { getLatestPushes } from "@/lib/github/latest-pushes";
import { formatCommitUtc, groupCommitsByDay, shortSha } from "@/lib/github/commit-utils";

export default async function LatestPushesSection() {
  const feed = await getLatestPushes(6);
  const grouped = groupCommitsByDay(feed.commits);

  return (
    <section className="mx-auto w-full max-w-7xl px-6 py-20 lg:px-8">
      <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-8 shadow-[0_24px_65px_rgba(2,6,23,0.24)] ring-1 ring-white/6 backdrop-blur-2xl">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-sky-100/70">Latest pushes</p>
            <h2 className="mt-2 text-3xl font-bold text-white">Live branch activity from GitHub, not a fake static changelog.</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              This section reads directly from the <span className="font-semibold text-white">{feed.branch}</span> branch on <span className="font-semibold text-white">{feed.repo}</span> and refreshes on the server.
            </p>
          </div>

          <Link
            href={`https://github.com/${feed.repo}/tree/${encodeURIComponent(feed.branch)}`}
            className="inline-flex items-center gap-2 self-start rounded-full border border-white/15 bg-white/[0.07] px-5 py-3 text-sm font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl transition hover:bg-white/[0.12]"
          >
            View branch on GitHub
            <ArrowTopRightOnSquareIcon className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-6">
            {grouped.map((group) => (
              <div key={group.day} className="rounded-[1.5rem] border border-white/10 bg-slate-950/30 p-5 backdrop-blur-xl">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/60">{group.day}</p>
                <div className="mt-4 space-y-4">
                  {group.commits.map((commit) => (
                    <article key={commit.sha} className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
                      <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
                        <Link href={commit.htmlUrl} className="font-mono text-sky-300 hover:text-sky-200">
                          {shortSha(commit.sha)}
                        </Link>
                        <span>{formatCommitUtc(commit.authoredAt)}</span>
                        <span>{commit.authorName}</span>
                      </div>
                      <p className="mt-3 text-base font-semibold text-white">{commit.message}</p>
                    </article>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <aside className="rounded-[1.5rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.03))] p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-100/60">Why this matters</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-300">
              <li>Shows current execution instead of vague claims.</li>
              <li>Keeps project credibility tied to real shipped work.</li>
              <li>Creates a visible bridge between the site, GitHub, and build log.</li>
            </ul>
            <p className="mt-6 text-xs text-slate-400">Server-fetched and cached, so it stays real without hammering the GitHub API.</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
