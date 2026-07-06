/**
 * Rate limiting with Upstash Redis (production) or in-memory fallback (dev/preview).
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN environment variables
 * to enable Redis-backed rate limiting that persists across serverless cold starts.
 *
 * Without Redis credentials, falls back to in-memory sliding window (suitable for
 * development or single-process deployments, but resets on cold starts in serverless).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// ─── Configuration ──────────────────────────────────────────────────────────

interface RateLimiterResult {
  success: boolean;
  remaining: number;
  resetAt: number;
}

interface RateLimiter {
  check(identifier: string): Promise<RateLimiterResult>;
}

// ─── Upstash Redis Rate Limiter ─────────────────────────────────────────────

function createUpstashLimiter(
  prefix: string,
  maxRequests: number,
  windowSeconds: number
): RateLimiter {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(maxRequests, `${windowSeconds} s`),
    prefix: `ratelimit:${prefix}`,
  });

  return {
    async check(identifier: string): Promise<RateLimiterResult> {
      const result = await limiter.limit(identifier);
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      };
    },
  };
}

// ─── In-Memory Fallback Rate Limiter ────────────────────────────────────────

interface MemoryEntry {
  count: number;
  resetAt: number;
}

function createMemoryLimiter(
  name: string,
  maxRequests: number,
  windowSeconds: number
): RateLimiter {
  const store = new Map<string, MemoryEntry>();

  // Periodic cleanup of expired entries
  if (typeof globalThis !== "undefined") {
    const cleanupKey = `__rateLimit_cleanup_${name}`;
    const g = globalThis as unknown as Record<string, NodeJS.Timeout | undefined>;
    if (!g[cleanupKey]) {
      g[cleanupKey] = setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
          if (entry.resetAt <= now) {
            store.delete(key);
          }
        }
      }, 60_000);
    }
  }

  return {
    async check(identifier: string): Promise<RateLimiterResult> {
      const now = Date.now();
      const entry = store.get(identifier);

      if (!entry || entry.resetAt <= now) {
        const resetAt = now + windowSeconds * 1000;
        store.set(identifier, { count: 1, resetAt });
        return { success: true, remaining: maxRequests - 1, resetAt };
      }

      if (entry.count < maxRequests) {
        entry.count++;
        return {
          success: true,
          remaining: maxRequests - entry.count,
          resetAt: entry.resetAt,
        };
      }

      return { success: false, remaining: 0, resetAt: entry.resetAt };
    },
  };
}

// ─── Factory ────────────────────────────────────────────────────────────────

const useRedis = Boolean(
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
);

function createLimiter(name: string, maxRequests: number, windowSeconds: number): RateLimiter {
  if (useRedis) {
    return createUpstashLimiter(name, maxRequests, windowSeconds);
  }
  return createMemoryLimiter(name, maxRequests, windowSeconds);
}

// ─── Pre-configured Rate Limiters ───────────────────────────────────────────

export const rateLimiters = {
  /** Messages: 30 messages per 60 seconds per user */
  messages: createLimiter("messages", 30, 60),

  /** Pusher auth: 60 requests per 60 seconds per user */
  pusherAuth: createLimiter("pusher-auth", 60, 60),

  /** File uploads: 10 uploads per 60 seconds per user */
  upload: createLimiter("upload", 10, 60),

  /** General API: 100 requests per 60 seconds per user */
  api: createLimiter("api", 100, 60),

  /** Sensitive operations (e.g., invites): 5 per 60 seconds */
  sensitive: createLimiter("sensitive", 5, 60),
};
