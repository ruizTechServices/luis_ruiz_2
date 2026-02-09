// =============================================================================
// NUCLEUS BOT RATE LIMITING - luis-ruiz.com
// Distributed rate limiter using Upstash Redis (works on Vercel serverless).
// Falls back to in-memory limiting when Redis is not configured.
// =============================================================================

import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

// ---------------------------------------------------------------------------
// Upstash Redis rate limiter (production)
// ---------------------------------------------------------------------------

let upstashLimiter: Ratelimit | null = null;

function getUpstashLimiter(limit: number, windowMs: number): Ratelimit | null {
  if (upstashLimiter) return upstashLimiter;

  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));
  const windowStr = `${windowSeconds} s` as `${number} s`;

  upstashLimiter = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(limit, windowStr),
    prefix: 'nucleus:rl',
  });

  return upstashLimiter;
}

// ---------------------------------------------------------------------------
// In-memory fallback (local development without Redis)
// ---------------------------------------------------------------------------

const memStore = new Map<string, { count: number; reset: number }>();

function rateLimitInMemory(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now();
  const existing = memStore.get(key);

  if (!existing || now > existing.reset) {
    const reset = now + windowMs;
    memStore.set(key, { count: 1, reset });
    return { allowed: true, limit, remaining: Math.max(0, limit - 1), resetMs: reset - now };
  }

  existing.count += 1;
  return {
    allowed: existing.count <= limit,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetMs: Math.max(0, existing.reset - now),
  };
}

// ---------------------------------------------------------------------------
// Public API (same interface as before)
// ---------------------------------------------------------------------------

export async function rateLimit(
  key: string,
  options?: { limit?: number; windowMs?: number },
): Promise<RateLimitResult> {
  const limit = options?.limit ?? readNumber(process.env.NUCLEUS_RATE_LIMIT_MAX, 60);
  const windowMs = options?.windowMs ?? readNumber(process.env.NUCLEUS_RATE_LIMIT_WINDOW_MS, 60_000);

  const upstash = getUpstashLimiter(limit, windowMs);

  if (upstash) {
    const result = await upstash.limit(key);
    return {
      allowed: result.success,
      limit: result.limit,
      remaining: result.remaining,
      resetMs: Math.max(0, result.reset - Date.now()),
    };
  }

  // Fallback to in-memory for local dev
  return rateLimitInMemory(key, limit, windowMs);
}

export function rateLimitHeaders(result: RateLimitResult, isBlocked = false): Record<string, string> {
  const resetSeconds = Math.ceil(result.resetMs / 1000);
  const headers: Record<string, string> = {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': Math.max(0, result.remaining).toString(),
    'X-RateLimit-Reset': resetSeconds.toString(),
  };

  if (isBlocked) {
    headers['Retry-After'] = resetSeconds.toString();
  }

  return headers;
}
