import type { GithubCommitRecord } from "@/lib/types/github";

export function shortSha(sha: string): string {
  return sha.slice(0, 7);
}

export function firstLine(message: string): string {
  return message.trim().split(/\r?\n/, 1)[0] || "(no message)";
}

export function formatCommitUtc(isoString: string): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    hour12: false,
  }).format(date) + " UTC";
}

export function groupCommitsByDay(commits: GithubCommitRecord[]) {
  const groups = new Map<string, GithubCommitRecord[]>();

  for (const commit of commits) {
    const key = commit.authoredAt.slice(0, 10);
    const existing = groups.get(key) ?? [];
    existing.push(commit);
    groups.set(key, existing);
  }

  return Array.from(groups.entries()).map(([day, items]) => ({ day, commits: items }));
}
