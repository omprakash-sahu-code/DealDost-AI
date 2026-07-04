import { NextRequest } from 'next/server';

interface RateLimitInfo {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitInfo>();

interface RateLimitConfig {
  limit: number;     // Max requests in the window
  windowMs: number;  // Window size in milliseconds
}

/**
 * Lightweight in-memory rate limiter.
 * 
 * NOTE: For Vercel Serverless deployments, memory is ephemeral and will reset 
 * when the serverless function environment restarts (goes cold).
 * 
 * TODO: Swap this with a persistent distributed rate limiter (e.g. Upstash Redis / @upstash/ratelimit)
 * if this application scales beyond MVP or portfolio stage.
 */
export async function rateLimit(
  req: NextRequest,
  config: RateLimitConfig = { limit: 15, windowMs: 60 * 1000 } // Default: 15 requests per minute
): Promise<{ success: boolean; limit: number; remaining: number; resetTime: number }> {
  // Extract client IP from headers
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
             req.headers.get('x-real-ip') || 
             '127.0.0.1';

  const now = Date.now();
  // Scope rate limit to both IP and the exact API route pathname
  const storeKey = `${ip}:${req.nextUrl.pathname}`;
  
  let record = memoryStore.get(storeKey);
  
  if (!record || now > record.resetTime) {
    record = {
      count: 0,
      resetTime: now + config.windowMs,
    };
  }

  record.count += 1;
  memoryStore.set(storeKey, record);

  const isAllowed = record.count <= config.limit;
  
  return {
    success: isAllowed,
    limit: config.limit,
    remaining: Math.max(0, config.limit - record.count),
    resetTime: record.resetTime,
  };
}
