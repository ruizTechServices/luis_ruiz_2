export const githubEndpoints = {
  user: (username: string) => `/users/${encodeURIComponent(username)}`,
  userRepos: (username: string, perPage = 12) =>
    `/users/${encodeURIComponent(username)}/repos?per_page=${perPage}`,
  repo: (owner: string, repo: string) =>
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
  repoCommits: (owner: string, repo: string, perPage = 10) =>
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?per_page=${perPage}`,
};
