"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { githubProxyFetch } from "@/lib/clients/github";

type GithubBranch = {
  name: string;
  commit?: {
    sha?: string;
    commit?: {
      author?: {
        date?: string;
      };
      message?: string;
    };
    html_url?: string;
  };
};

type GithubRepo = {
  name: string;
  html_url: string;
  pushed_at?: string;
  private?: boolean;
  default_branch?: string;
};

type PanelState = {
  status: "idle" | "loading" | "success" | "error";
  error?: string;
};

function shortSha(value?: string) {
  return value ? value.slice(0, 7) : "unknown";
}

function formatUtc(value?: string) {
  if (!value) return "Unknown time";
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value));
}

export default function GithubApiTesterCard() {
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<PanelState>({ status: "idle" });
  const [branch, setBranch] = useState<GithubBranch | null>(null);
  const [repos, setRepos] = useState<GithubRepo[]>([]);

  const latestCommit = useMemo(() => branch?.commit?.commit, [branch]);

  const refreshGithubSnapshot = () => {
    setState({ status: "loading" });
    startTransition(async () => {
      try {
        const [branchData, repoData] = await Promise.all([
          githubProxyFetch<GithubBranch>({
            path: "/repos/ruizTechServices/luis_ruiz_2/branches/GioClaw-Edit",
          }),
          githubProxyFetch<GithubRepo[]>({
            path: "/users/ruizTechServices/repos",
            query: { sort: "updated", per_page: 4 },
          }),
        ]);

        setBranch(branchData);
        setRepos(repoData);
        setState({ status: "success" });
      } catch (error) {
        setState({
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow min-h-[330px] h-full flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">GitHub Snapshot</h3>
          <p className="text-gray-600 dark:text-gray-300 text-sm">
            Plain-English GitHub status for this site work, so you can quickly confirm branch activity and recent repo movement without dealing with API plumbing.
          </p>
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">Owner tool</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 shrink-0">
        <button
          onClick={refreshGithubSnapshot}
          disabled={isPending}
          className="px-4 py-2 rounded-md border text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
        >
          {isPending ? "Refreshing..." : "Refresh GitHub snapshot"}
        </button>
        <Link
          href="https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit"
          className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Open GioClaw-Edit branch
        </Link>{<>This should be the branch that is being worked on in development or the branch that is currently in production</>}
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.05fr_0.95fr] flex-1 min-h-0">
        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4 min-h-0 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Current branch head
          </p>

          {branch ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Branch</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">{branch.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Latest commit</p>
                <p className="text-base font-semibold text-gray-900 dark:text-white">
                  {latestCommit?.message || "No commit message returned"}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Commit SHA</p>
                  <p className="font-mono text-gray-900 dark:text-white">{shortSha(branch.commit?.sha)}</p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Updated</p>
                  <p className="text-gray-900 dark:text-white">{formatUtc(latestCommit?.author?.date)}</p>
                </div>
              </div>
              {branch.commit?.html_url ? (
                <Link
                  href={branch.commit.html_url}
                  className="inline-flex text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  View latest commit on GitHub
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              Run the snapshot to load the current branch head, last commit message, and update time.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-900/40 p-4 min-h-0 overflow-y-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400">
            Recently updated repos
          </p>

          {repos.length > 0 ? (
            <div className="mt-3 space-y-3">
              {repos.map((repo) => (
                <div
                  key={repo.name}
                  className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{repo.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Last push: {formatUtc(repo.pushed_at)}
                      </p>
                    </div>
                    <span className="text-[11px] uppercase tracking-[0.18em] text-gray-400">
                      {repo.private ? "Private" : "Public"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
              This will show the most recently updated GitHub repos after you refresh the snapshot.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600 p-3 text-xs leading-6 text-gray-500 dark:text-gray-400 shrink-0">
        Productive use-case: quickly confirm that your current branch moved, check the latest commit, and see whether repo activity looks alive, without opening GitHub in another tab.
      </div>

      {state.status === "error" ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 shrink-0">
          {state.error}
        </div>
      ) : null}
    </div>
  );
}
