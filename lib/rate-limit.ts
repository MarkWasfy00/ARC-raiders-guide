import { cache } from './redis';

interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
  limit: number;
}

/**
 * Redis-based rate limiter using sliding window algorithm
 * @param identifier - Unique identifier (e.g., IP address, user ID)
 * @param limit - Maximum number of requests allowed in the window
 * @param windowSeconds - Time window in seconds
 */
export async function rateLimit(
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  try {
    const key = `ratelimit:${identifier}`;

    // Increment counter
    const current = await cache.incr(key);

    // Set expiration on first request
    if (current === 1) {
      await cache.expire(key, windowSeconds);
    }

    const remaining = Math.max(0, limit - current);
    const reset = Date.now() + windowSeconds * 1000;

    return {
      success: current <= limit,
      remaining,
      reset,
      limit,
    };
  } catch (error) {
    console.error('Rate limit error:', error);
    // Fail open - allow request if Redis is unavailable
    return {
      success: true,
      remaining: limit,
      reset: Date.now() + windowSeconds * 1000,
      limit,
    };
  }
}

/**
 * Predefined rate limits for different use cases
 */
export const limits = {
  // Standard API routes: 100 requests per minute
  api: { limit: 100, window: 60 },

  // Auth endpoints: 5 requests per minute (stricter)
  auth: { limit: 5, window: 60 },

  // Chat messages: 30 messages per minute
  chat: { limit: 30, window: 60 },

  // File uploads: 10 uploads per minute
  upload: { limit: 10, window: 60 },

  // Listing creation: 5 per hour
  createListing: { limit: 5, window: 3600 },

  // Search queries: 60 per minute
  search: { limit: 60, window: 60 },

  // Admin operations: 30 per minute
  admin: { limit: 30, window: 60 },
};

/**
 * Helper to get client IP from headers
 */
export function getClientIP(headers: Headers): string {
  // Try X-Forwarded-For first (for proxied requests)
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    // Take the first IP in the chain
    return forwarded.split(',')[0].trim();
  }

  // Try X-Real-IP
  const realIP = headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }

  // Fallback
  return 'unknown';
}

/**
 * Wrapper for rate limiting API routes
 * Returns headers to add to the response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString(),
  };
}

/**
 * Check rate limit and return response if exceeded
 */
export async function checkRateLimit(
  identifier: string,
  limitConfig: { limit: number; window: number }
): Promise<{ allowed: boolean; result: RateLimitResult }> {
  const result = await rateLimit(identifier, limitConfig.limit, limitConfig.window);

  return {
    allowed: result.success,
    result,
  };
}
