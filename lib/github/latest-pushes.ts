import { githubFetch } from "@/lib/clients/github";
import { BUILD_LOG_GITHUB_BRANCH, BUILD_LOG_GITHUB_REPO } from "@/lib/github/build-log-config";
import { firstLine } from "@/lib/github/commit-utils";
import type { GithubCommitRecord, LatestPushesFeed } from "@/lib/types/github";

type GithubApiCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author?: {
      name?: string;
      date?: string;
    };
    committer?: {
      name?: string;
      date?: string;
    };
  };
};

export async function getLatestPushes(limit = 6): Promise<LatestPushesFeed> {
  const [owner, repo] = BUILD_LOG_GITHUB_REPO.split("/");
  if (!owner || !repo) {
    throw new Error("Invalid BUILD_LOG_GITHUB_REPO format. Expected owner/repo.");
  }

  const commits = await githubFetch<GithubApiCommit[]>(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?sha=${encodeURIComponent(BUILD_LOG_GITHUB_BRANCH)}&per_page=${limit}`,
    {
      next: { revalidate: 600 },
    },
  );

  return {
    repo: BUILD_LOG_GITHUB_REPO,
    branch: BUILD_LOG_GITHUB_BRANCH,
    fetchedAt: new Date().toISOString(),
    commits: commits.map(normalizeCommit),
  };
}

function normalizeCommit(commit: GithubApiCommit): GithubCommitRecord {
  const author = commit.commit.author ?? commit.commit.committer ?? {};

  return {
    sha: commit.sha,
    htmlUrl: commit.html_url,
    message: firstLine(commit.commit.message ?? ""),
    authorName: author.name || "unknown",
    authoredAt: author.date || new Date(0).toISOString(),
  };
}
