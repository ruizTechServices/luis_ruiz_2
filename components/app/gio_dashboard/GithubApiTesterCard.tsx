"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DashboardCard,
  DashboardErrorState,
  DashboardStatusBadge,
  dashboardItemClassName,
} from "@/components/design-system/DashboardPrimitives";
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
    <DashboardCard className="flex min-h-[330px] flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">GitHub Snapshot</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Plain-English GitHub status for this site work: branch activity and recent repo movement.
          </p>
        </div>
        <DashboardStatusBadge>Owner tool</DashboardStatusBadge>
      </div>

      <div className="mt-5 flex shrink-0 flex-wrap items-center gap-3">
        <Button type="button" variant="outline" onClick={refreshGithubSnapshot} disabled={isPending}>
          {isPending ? "Refreshing..." : "Refresh GitHub snapshot"}
        </Button>
        <Button asChild variant="outline">
          <Link href="https://github.com/ruizTechServices/luis_ruiz_2/tree/GioClaw-Edit">
            Open GioClaw-Edit branch
          </Link>
        </Button>
      </div>

      <div className="mt-5 grid min-h-0 flex-1 gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <div className={`${dashboardItemClassName} min-h-0 overflow-y-auto`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
            Current branch head
          </p>

          {branch ? (
            <div className="mt-3 space-y-3">
              <div>
                <p className="text-sm text-[var(--color-text-subtle)]">Branch</p>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">{branch.name}</p>
              </div>
              <div>
                <p className="text-sm text-[var(--color-text-subtle)]">Latest commit</p>
                <p className="text-base font-semibold text-[var(--color-text-primary)]">
                  {latestCommit?.message || "No commit message returned"}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-[var(--color-text-subtle)]">Commit SHA</p>
                  <p className="font-mono text-[var(--color-text-primary)]">{shortSha(branch.commit?.sha)}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-subtle)]">Updated</p>
                  <p className="text-[var(--color-text-primary)]">{formatUtc(latestCommit?.author?.date)}</p>
                </div>
              </div>
              {branch.commit?.html_url ? (
                <Link
                  href={branch.commit.html_url}
                  className="inline-flex text-sm font-medium text-[var(--color-action-primary)] underline-offset-4 hover:underline"
                >
                  View latest commit on GitHub
                </Link>
              ) : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
              Run the snapshot to load the current branch head, last commit message, and update time.
            </p>
          )}
        </div>

        <div className={`${dashboardItemClassName} min-h-0 overflow-y-auto`}>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
            Recently updated repos
          </p>

          {repos.length > 0 ? (
            <div className="mt-3 space-y-3">
              {repos.map((repo) => (
                <div key={repo.name} className={dashboardItemClassName}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text-primary)]">{repo.name}</p>
                      <p className="text-xs text-[var(--color-text-subtle)]">
                        Last push: {formatUtc(repo.pushed_at)}
                      </p>
                    </div>
                    <DashboardStatusBadge>{repo.private ? "Private" : "Public"}</DashboardStatusBadge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
              This will show the most recently updated GitHub repos after you refresh the snapshot.
            </p>
          )}
        </div>
      </div>

      <div className="mt-4 shrink-0 rounded-[var(--radius-sm)] border border-dashed border-[var(--color-border-strong)] p-3 text-xs leading-6 text-[var(--color-text-subtle)]">
        Productive use-case: confirm branch movement, check the latest commit, and see whether repo activity looks alive.
      </div>

      {state.status === "error" ? (
        <DashboardErrorState className="mt-4 shrink-0">
          {state.error}
        </DashboardErrorState>
      ) : null}
    </DashboardCard>
  );
}
