export type GithubConfig = {
  apiBaseUrl: string;
  apiVersion: string;
  token: string;
  user: string;
};

const apiBaseUrl = process.env.GITHUB_API_BASE_URL?.trim() || 'https://api.github.com';
const apiVersion = process.env.GITHUB_API_VERSION?.trim() || '2022-11-28';
const token = process.env.GITHUB_TOKEN?.trim() || '';
const user = process.env.GITHUB_USER?.trim() || '';

export const githubConfig: GithubConfig = {
  apiBaseUrl,
  apiVersion,
  token,
  user,
};

export function isGithubConfigured(): boolean {
  return Boolean(token);
}
