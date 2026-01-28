import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp, rateLimitResponse } from "./services/rate-limiter";

/**
 * Wrapper for API route handlers that applies rate limiting
 */
export function withRateLimit<T extends unknown[]>(
  handler: (req: NextRequest, ...args: T) => Promise<Response>
) {
  return async (req: NextRequest, ...args: T): Promise<Response> => {
    const clientIp = getClientIp(req);
    const rateLimitResult = await checkRateLimit(clientIp);

    if (!rateLimitResult.allowed) {
      return rateLimitResponse(rateLimitResult.resetAt);
    }

    // Add rate limit headers to response
    const response = await handler(req, ...args);

    // Clone response to add headers
    const newHeaders = new Headers(response.headers);
    newHeaders.set("X-RateLimit-Remaining", String(rateLimitResult.remaining));
    newHeaders.set("X-RateLimit-Reset", String(Math.ceil(rateLimitResult.resetAt / 1000)));

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders,
    });
  };
}

/**
 * Simple rate limit check for use in API routes
 * Returns a response if rate limited, null otherwise
 */
export async function checkApiRateLimit(req: NextRequest): Promise<Response | null> {
  const clientIp = getClientIp(req);
  const result = await checkRateLimit(clientIp);

  if (!result.allowed) {
    return rateLimitResponse(result.resetAt);
  }

  return null;
}
