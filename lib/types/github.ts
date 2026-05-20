export type GithubCommitAuthor = {
  name: string;
  date: string;
};

export type GithubCommitRecord = {
  sha: string;
  htmlUrl: string;
  message: string;
  authorName: string;
  authoredAt: string;
};

export type LatestPushesFeed = {
  repo: string;
  branch: string;
  commits: GithubCommitRecord[];
  fetchedAt: string;
};
