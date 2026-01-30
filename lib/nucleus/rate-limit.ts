// =============================================================================
// NUCLEUS BOT RATE LIMITING - luis-ruiz.com
// Simple in-memory rate limiter (per-instance). Replace with Redis/Upstash for scale.
// =============================================================================

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

const store = new Map<string, { count: number; reset: number }>();

function readNumber(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function rateLimit(
  key: string,
  options?: { limit?: number; windowMs?: number }
): RateLimitResult {
  const limit = options?.limit ?? readNumber(process.env.NUCLEUS_RATE_LIMIT_MAX, 60);
  const windowMs = options?.windowMs ?? readNumber(process.env.NUCLEUS_RATE_LIMIT_WINDOW_MS, 60_000);
  const now = Date.now();

  const existing = store.get(key);
  if (!existing || now > existing.reset) {
    const reset = now + windowMs;
    store.set(key, { count: 1, reset });
    return {
      allowed: true,
      limit,
      remaining: Math.max(0, limit - 1),
      resetMs: reset - now,
    };
  }

  existing.count += 1;

  return {
    allowed: existing.count <= limit,
    limit,
    remaining: Math.max(0, limit - existing.count),
    resetMs: Math.max(0, existing.reset - now),
  };
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
