// C:\Users\giost\CascadeProjects\websites\luis-ruiz\luis_ruiz_2\components\app\user_dash\blog_updates.tsx
'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { createClient as createBrowserClient } from '@/lib/clients/supabase/client';

type BlogPost = {
  id: number;
  title: string | null;
  summary: string | null;
  tags: string | null;             // delimited string in current schema
  created_at: string;              // timestamptz
  // body?: string | null;         // not shown in card, omit from query for perf
  // slug?: string | null;         // future-proof if you add it later
};

const ROTATE_MS = 7000;      // auto-advance interval
const NEW_DAYS = 7;          // "NEW" badge threshold

// ---------- helpers ----------
function parseTags(tags: string | null): string[] {
  if (!tags) return [];
  // Split on comma, semicolon, or pipe, trim empties
  return tags
    .split(/[,;|]/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .slice(0, 5); // cap to avoid UI overflow
}

function isNew(createdISO: string): boolean {
  const created = new Date(createdISO).getTime();
  const now = Date.now();
  const diffDays = (now - created) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_DAYS;
}

function timeAgo(createdISO: string): string {
  const secs = Math.max(1, Math.floor((Date.now() - new Date(createdISO).getTime()) / 1000));
  const units: [number, string][] = [
    [60, 's'],
    [60, 'm'],
    [24, 'h'],
    [7, 'd'],
    [4.34524, 'w'],
    [12, 'mo'],
    [Number.POSITIVE_INFINITY, 'y'],
  ];
  let value = secs;
  let unit = 's';
  for (const [limit, label] of units) {
    if (value < limit) {
      unit = label;
      break;
    }
    value = Math.floor(value / limit);
  }
  return `${value}${unit} ago`;
}

function postUrl(p: Partial<BlogPost> & { slug?: string | null }): string {
  // Prefer slug if you add it later; else fallback to id
  return p.slug ? `/blog/${p.slug}` : `/blog/${p.id}`;
}

// ---------- data layer ----------
async function fetchPosts(limit = 10): Promise<BlogPost[]> {
  const supabase = createBrowserClient();
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, summary, tags, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data || []) as BlogPost[];
}

function useBlogPosts(limit = 10) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabaseRef = useRef<ReturnType<typeof createBrowserClient> | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await fetchPosts(limit);
        if (mounted) {
          setPosts(data);
          setError(null);
        }
      } catch (error) {
        if (mounted) {
          const message = error instanceof Error ? error.message : 'Failed to load posts';
          setError(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [limit]);

  // Realtime: listen for new posts (INSERT)
  useEffect(() => {
    const supabase = createBrowserClient();
    supabaseRef.current = supabase;

    // If Realtime replication is OFF for this table, this silently does nothing.
    const channel = supabase
      .channel('blog_posts_inserts')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'blog_posts',
        },
        (payload) => {
          const newRow = payload.new as BlogPost;
          // Prepend if we don't already have it
          setPosts((prev) => {
            if (prev.some((p) => p.id === newRow.id)) return prev;
            return [newRow, ...prev].slice(0, limit);
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
      supabaseRef.current = null;
    };
  }, [limit]);

  return { posts, loading, error };
}

// ---------- behavior layer ----------
function useAutoRotate(count: number, intervalMs: number) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  // Respect reduced motion
  const reduceMotion = useMemo(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
    []
  );

  useEffect(() => {
    if (reduceMotion || paused || count <= 1) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % count);
    }, intervalMs);
    return () => clearInterval(id);
  }, [count, intervalMs, paused, reduceMotion]);

  const goTo = useCallback((i: number) => setIndex((prev) => (count ? ((i % count) + count) % count : prev)), [count]);
  const next = useCallback(() => setIndex((i) => (count ? (i + 1) % count : i)), [count]);
  const prev = useCallback(() => setIndex((i) => (count ? (i - 1 + count) % count : i)), [count]);

  return { index, setIndex: goTo, next, prev, paused, setPaused };
}

// ---------- presentation ----------
function AnnouncerCard({ post }: { post: BlogPost }) {
  const tags = parseTags(post.tags);
  const fresh = isNew(post.created_at);

  return (
    <div className="w-full h-full">
      <div className="relative h-full min-h-[180px] rounded-2xl p-5 md:p-6 shadow-lg bg-gradient-to-br from-indigo-600/90 via-fuchsia-600/80 to-rose-500/80 text-white overflow-hidden">
        {/* top chips */}
        <div className="flex items-center gap-2 mb-3">
          {fresh && (
            <span className="inline-flex items-center rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide ring-1 ring-white/30">
              NEW
            </span>
          )}
          <span className="inline-flex items-center rounded-full bg-black/20 px-2 py-0.5 text-[11px] ring-1 ring-white/20">
            {timeAgo(post.created_at)}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold leading-snug line-clamp-2 drop-shadow-sm">
          {post.title || 'Untitled update'}
        </h3>

        <p className="mt-2 text-sm md:text-base text-white/90 line-clamp-3">
          {post.summary || 'No summary provided.'}
        </p>

        {tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((t) => (
              <span key={t} className="text-[11px] rounded-full bg-white/15 px-2 py-0.5 ring-1 ring-white/20">
                #{t}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Link
            href={postUrl(post)}
            className="inline-flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white/70 transition"
          >
            Read update
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M5 12h13m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* subtle blur accent */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-white/25 blur-3xl" />
      </div>
    </div>
  );
}

function Dots({
  count,
  active,
  onChoose,
}: {
  count: number;
  active: number;
  onChoose: (i: number) => void;
}) {
  if (count <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-center gap-2" role="tablist" aria-label="Announcements">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          role="tab"
          aria-selected={i === active}
          aria-label={`Show announcement ${i + 1}`}
          onClick={() => onChoose(i)}
          className={`h-2.5 w-2.5 rounded-full transition ${
            i === active ? 'bg-indigo-600 dark:bg-indigo-400 scale-110' : 'bg-slate-300 dark:bg-slate-700'
          }`}
        />
      ))}
    </div>
  );
}

// ---------- main exported component ----------
export default function BlogUpdates({ limit = 10 }: { limit?: number }) {
  const { posts, loading, error } = useBlogPosts(limit);
  const count = posts.length;

  const { index, setIndex, next, prev, paused, setPaused } = useAutoRotate(count, ROTATE_MS);

  // slider width/transform
  const translate = `translateX(-${index * 100}%)`;

  return (
    <section
      className="rounded-2xl bg-white/60 dark:bg-slate-900/60 backdrop-blur border border-slate-200/60 dark:border-slate-800 p-4 md:p-5 shadow-sm"
      role="region"
      aria-roledescription="carousel"
      aria-label="Latest announcements"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg md:text-xl font-semibold text-slate-800 dark:text-slate-100">
          Updates
        </h2>
        <div className="inline-flex items-center gap-2">
          <button
            aria-label="Previous announcement"
            onClick={prev}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ‹
          </button>
          <button
            aria-label="Next announcement"
            onClick={next}
            className="rounded-lg border border-slate-300 dark:border-slate-700 px-2 py-1 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ›
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="relative overflow-hidden rounded-xl" style={{ minHeight: 200 }}>
        {/* Loading / Error / Empty states */}
        {loading && (
          <div className="animate-pulse rounded-xl h-[200px] w-full bg-slate-200 dark:bg-slate-800" />
        )}
        {!loading && error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300">
            Failed to load updates — {error}
          </div>
        )}
        {!loading && !error && count === 0 && (
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-5 text-slate-600 dark:text-slate-300">
            No updates yet. Check back soon.
          </div>
        )}

        {!loading && !error && count > 0 && (
          <div
            className="flex w-full transition-transform duration-500 ease-out will-change-transform"
            style={{ transform: translate }}
          >
            {posts.map((post) => (
              <div key={post.id} className="w-full flex-shrink-0">
                <AnnouncerCard post={post} />
              </div>
            ))}
          </div>
        )}
      </div>

      <Dots count={count} active={index} onChoose={setIndex} />

      {/* Status row */}
      <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
        {count > 0 ? (
          <span>
            Showing {index + 1} of {count} {paused ? '— paused' : ''}
          </span>
        ) : (
          <span>—</span>
        )}
      </div>
    </section>
  );
}
