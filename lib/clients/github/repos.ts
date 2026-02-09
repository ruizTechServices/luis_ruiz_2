import { githubProxyFetch } from './frontend';
import type { GithubProxyOptions } from './frontend';

export type ProxyRequestOptions = Pick<
  GithubProxyOptions,
  'proxySecret' | 'baseUrl' | 'signal' | 'raw' | 'headers'
>;

export type RepoCreateInput = {
  name: string;
} & Record<string, unknown>;

export type RepoUpdateInput = Record<string, unknown>;

export type RepoListOptions = {
  type?: 'all' | 'owner' | 'member';
  sort?: 'created' | 'updated' | 'pushed' | 'full_name';
  direction?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
};

export type SearchReposOptions = {
  sort?: 'stars' | 'forks' | 'help-wanted-issues' | 'updated';
  order?: 'asc' | 'desc';
  perPage?: number;
  page?: number;
};

export async function listUserRepos(
  username: string,
  options: RepoListOptions = {},
  request?: ProxyRequestOptions,
) {
  if (!username) {
    throw new Error('username is required');
  }

  return githubProxyFetch({
    path: `/users/${encodeURIComponent(username)}/repos`,
    query: mapRepoListOptions(options),
    ...request,
  });
}

export async function getRepo(
  owner: string,
  repo: string,
  request?: ProxyRequestOptions,
) {
  if (!owner || !repo) {
    throw new Error('owner and repo are required');
  }

  return githubProxyFetch({
    path: `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    ...request,
  });
}

export async function createRepo(
  input: RepoCreateInput,
  request?: ProxyRequestOptions,
) {
  if (!input?.name) {
    throw new Error('name is required');
  }

  return githubProxyFetch({
    path: '/user/repos',
    method: 'POST',
    body: input,
    ...request,
  });
}

export async function createOrgRepo(
  org: string,
  input: RepoCreateInput,
  request?: ProxyRequestOptions,
) {
  if (!org) {
    throw new Error('org is required');
  }
  if (!input?.name) {
    throw new Error('name is required');
  }

  return githubProxyFetch({
    path: `/orgs/${encodeURIComponent(org)}/repos`,
    method: 'POST',
    body: input,
    ...request,
  });
}

export async function updateRepo(
  owner: string,
  repo: string,
  input: RepoUpdateInput,
  request?: ProxyRequestOptions,
) {
  if (!owner || !repo) {
    throw new Error('owner and repo are required');
  }

  return githubProxyFetch({
    path: `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    method: 'PATCH',
    body: input,
    ...request,
  });
}

export async function deleteRepo(
  owner: string,
  repo: string,
  request?: ProxyRequestOptions,
) {
  if (!owner || !repo) {
    throw new Error('owner and repo are required');
  }

  return githubProxyFetch({
    path: `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`,
    method: 'DELETE',
    ...request,
  });
}

export async function searchRepos(
  query: string,
  options: SearchReposOptions = {},
  request?: ProxyRequestOptions,
) {
  const q = query.trim();
  if (!q) {
    throw new Error('query is required');
  }

  return githubProxyFetch({
    path: '/search/repositories',
    query: mapSearchOptions({ ...options, q }),
    ...request,
  });
}

function mapRepoListOptions(options: RepoListOptions) {
  const query: Record<string, string | number> = {};

  if (options.type) query.type = options.type;
  if (options.sort) query.sort = options.sort;
  if (options.direction) query.direction = options.direction;
  if (typeof options.perPage === 'number') query.per_page = options.perPage;
  if (typeof options.page === 'number') query.page = options.page;

  return query;
}

function mapSearchOptions(options: SearchReposOptions & { q: string }) {
  const query: Record<string, string | number> = {
    q: options.q,
  };

  if (options.sort) query.sort = options.sort;
  if (options.order) query.order = options.order;
  if (typeof options.perPage === 'number') query.per_page = options.perPage;
  if (typeof options.page === 'number') query.page = options.page;

  return query;
}
