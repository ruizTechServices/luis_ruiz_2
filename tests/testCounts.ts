// tests/testCounts.ts
import { getCounts } from '../lib/functions/dashboard/getCounts';
import type { PostgrestError } from '@supabase/supabase-js';

type HeadConfig = { count?: number | null; error: PostgrestError | null };
type GetConfig = { count?: number | null; error: PostgrestError | null };

type TableConfig = {
  head?: HeadConfig;
  get?: GetConfig;
};

type SupabaseMockConfig = Record<string, TableConfig>;

function createSupabaseMock(config: SupabaseMockConfig) {
  return {
    from(table: string) {
      return {
        select(_column: string, options?: { head?: boolean }) {
          const tableConfig = config[table] ?? {};

          if (options?.head) {
            const head = tableConfig.head ?? { count: 0, error: { message: `HEAD not mocked for ${table}` } as PostgrestError };
            return { count: head.count ?? 0, error: head.error };
          }

          const get = tableConfig.get ?? { count: 0, error: { message: `GET not mocked for ${table}` } as PostgrestError };
          return {
            limit() {
              return { count: get.count ?? 0, error: get.error };
            },
          };
        },
      };
    },
  };
}

type AsyncTest = {
  name: string;
  run: () => Promise<void>;
};

function logResult(name: string, passed: boolean, error?: unknown) {
  if (passed) {
    console.log(`✅ ${name}`);
  } else {
    console.error(`❌ ${name}`);
    if (error) {
      console.error(error);
    }
  }
}

function assertEqual(actual: unknown, expected: unknown, context: string) {
  const actualJSON = JSON.stringify(actual);
  const expectedJSON = JSON.stringify(expected);
  if (actualJSON !== expectedJSON) {
    throw new Error(`${context} failed.\nExpected: ${expectedJSON}\nReceived: ${actualJSON}`);
  }
}

async function runTests(tests: AsyncTest[]) {
  console.log('=== Running getCounts tests ===');
  for (const test of tests) {
    try {
      await test.run();
      logResult(test.name, true);
    } catch (err) {
      logResult(test.name, false, err);
    }
  }
  console.log('=== Finished getCounts tests ===');
}

const tests: AsyncTest[] = [
  {
    name: 'returns counts when HEAD succeeds',
    async run() {
      const mock = createSupabaseMock({
        blog_posts: { head: { count: 5, error: null } },
        comments: { head: { count: 10, error: null } },
        votes: { head: { count: 15, error: null } },
      });

      const result = await getCounts(mock as any);

      assertEqual(result, {
        posts: 5,
        comments: 10,
        votes: 15,
        errors: [],
      }, 'HEAD success scenario');
    },
  },
  {
    name: 'falls back to GET when HEAD is unsupported',
    async run() {
      const unsupported = { message: 'HEAD not supported' } as PostgrestError;
      const mock = createSupabaseMock({
        blog_posts: {
          head: { count: null, error: unsupported },
          get: { count: 3, error: null },
        },
        comments: {
          head: { count: null, error: unsupported },
          get: { count: 8, error: null },
        },
        votes: {
          head: { count: null, error: unsupported },
          get: { count: 12, error: null },
        },
      });

      const result = await getCounts(mock as any);

      assertEqual(result, {
        posts: 3,
        comments: 8,
        votes: 12,
        errors: [],
      }, 'Fallback scenario');
    },
  },
  {
    name: 'collects errors when both HEAD and GET fail',
    async run() {
      const postsError = { message: 'posts error' } as PostgrestError;
      const votesError = { message: 'votes error' } as PostgrestError;

      const mock = createSupabaseMock({
        blog_posts: {
          head: { count: null, error: postsError },
          get: { count: 0, error: postsError },
        },
        comments: {
          head: { count: 7, error: null },
        },
        votes: {
          head: { count: null, error: votesError },
          get: { count: 0, error: votesError },
        },
      });

      const result = await getCounts(mock as any);

      assertEqual(result.posts, 0, 'posts count');
      assertEqual(result.comments, 7, 'comments count');
      assertEqual(result.votes, 0, 'votes count');
      assertEqual(result.errors, [postsError, votesError], 'error aggregation');
    },
  },
];

runTests(tests).catch((err) => {
  console.error('Unexpected failure while running getCounts tests', err);
  process.exit(1);
});
