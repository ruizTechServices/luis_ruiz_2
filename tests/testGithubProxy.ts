// testGithubProxy.ts
// Lightweight sanity checks for the GitHub proxy helper.
// Run with: npx tsx tests/testGithubProxy.ts

import 'dotenv/config';

import { githubProxyFetch, createRepo, searchRepos } from '../lib/clients/github';

type FetchCall = { input: RequestInfo | URL; init?: RequestInit };

const calls: FetchCall[] = [];
const originalFetch = globalThis.fetch;

function mockFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  calls.push({ input, init });
  return Promise.resolve(
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    }),
  );
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function getUrl(input: RequestInfo | URL): URL {
  if (typeof input === 'string') return new URL(input);
  if (input instanceof URL) return input;
  return new URL(input.url);
}

async function run() {
  globalThis.fetch = mockFetch;

  const baseUrl = 'http://localhost/api/github';

  await githubProxyFetch({
    path: '/users/tester',
    query: { per_page: 5 },
    baseUrl,
  });

  assert(calls.length === 1, 'Expected 1 fetch call after githubProxyFetch.');
  const getCall = calls[0];
  const getCallUrl = getUrl(getCall.input);
  assert(getCall.init?.method === 'GET', 'GET request should use method GET.');
  assert(getCallUrl.pathname === '/api/github', 'GET should target /api/github.');
  assert(getCallUrl.searchParams.get('path') === '/users/tester', 'GET path query mismatch.');
  assert(getCallUrl.searchParams.get('per_page') === '5', 'GET per_page query mismatch.');

  const secret = 'secret-token';
  await createRepo(
    { name: 'new-repo' },
    { proxySecret: secret, baseUrl },
  );

  assert(calls.length === 2, 'Expected 2 fetch calls after createRepo.');
  const postCall = calls[1];
  assert(postCall.init?.method === 'POST', 'createRepo should use POST.');
  const postHeaders = (postCall.init?.headers ?? {}) as Record<string, string>;
  assert(
    postHeaders['x-github-proxy-secret'] === secret,
    'createRepo should include proxy secret header.',
  );
  const postBody = JSON.parse(String(postCall.init?.body ?? '')) as {
    path?: string;
    body?: { name?: string };
  };
  assert(postBody.path === '/user/repos', 'createRepo should target /user/repos.');
  assert(postBody.body?.name === 'new-repo', 'createRepo should include repo name.');

  await searchRepos('nextjs', { sort: 'stars', perPage: 3 }, { baseUrl });

  assert(calls.length === 3, 'Expected 3 fetch calls after searchRepos.');
  const searchCall = calls[2];
  const searchUrl = getUrl(searchCall.input);
  assert(searchUrl.searchParams.get('path') === '/search/repositories', 'searchRepos path mismatch.');
  assert(searchUrl.searchParams.get('q') === 'nextjs', 'searchRepos query mismatch.');
  assert(searchUrl.searchParams.get('sort') === 'stars', 'searchRepos sort mismatch.');
  assert(searchUrl.searchParams.get('per_page') === '3', 'searchRepos per_page mismatch.');

  console.log('GitHub proxy helper checks passed.');
}

run()
  .catch((error) => {
    console.error('GitHub proxy helper checks failed:', error);
    process.exit(1);
  })
  .finally(() => {
    if (originalFetch) {
      globalThis.fetch = originalFetch;
    }
  });
