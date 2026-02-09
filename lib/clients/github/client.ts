import { githubConfig } from './config';

type GithubRequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: HeadersInit;
};

function buildGithubUrl(path: string): string {
  if (!path) {
    throw new Error('GitHub request path is required');
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  if (path.startsWith('/')) {
    return `${githubConfig.apiBaseUrl}${path}`;
  }

  return `${githubConfig.apiBaseUrl}/${path}`;
}

export async function githubFetch<T>(
  path: string,
  options: GithubRequestOptions = {},
): Promise<T> {
  const url = buildGithubUrl(path);
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': githubConfig.apiVersion,
    ...(options.headers as Record<string, string>),
  };

  if (githubConfig.token) {
    headers.Authorization = `Bearer ${githubConfig.token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorBody = await safeReadBody(response);
    const suffix = errorBody ? `: ${errorBody}` : '';
    throw new Error(
      `GitHub request failed (${response.status} ${response.statusText})${suffix}`,
    );
  }

  return response.json() as Promise<T>;
}

async function safeReadBody(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
