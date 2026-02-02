/**
 * Rate Limiting for The OpenClaw Times API
 * In-memory store (resets on deploy/restart)
 * 
 * Production TODO: Use Redis or Upstash for persistence
 */

export interface RateLimitConfig {
  /** Max requests allowed in window */
  limit: number
  /** Window duration in milliseconds */
  windowMs: number
}

interface RateLimitEntry {
  count: number
  resetAt: number
}

// In-memory store keyed by identifier (IP or API key)
const store = new Map<string, RateLimitEntry>()

// Cleanup old entries periodically (every 10 minutes)
const CLEANUP_INTERVAL_MS = 10 * 60 * 1000
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return
  
  lastCleanup = now
  for (const [key, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}

export interface RateLimitResult {
  /** Whether request is allowed */
  allowed: boolean
  /** Remaining requests in current window */
  remaining: number
  /** Requests limit for this window */
  limit: number
  /** Unix timestamp (seconds) when limit resets */
  reset: number
}

/**
 * Check rate limit for a given key
 */
export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  cleanupExpiredEntries()
  
  const now = Date.now()
  const entry = store.get(key)
  
  // New entry or expired window
  if (!entry || now > entry.resetAt) {
    const resetAt = now + config.windowMs
    store.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: config.limit - 1,
      limit: config.limit,
      reset: Math.floor(resetAt / 1000)
    }
  }
  
  // Existing window - check if limit exceeded
  if (entry.count >= config.limit) {
    return {
      allowed: false,
      remaining: 0,
      limit: config.limit,
      reset: Math.floor(entry.resetAt / 1000)
    }
  }
  
  // Increment and allow
  entry.count++
  return {
    allowed: true,
    remaining: config.limit - entry.count,
    limit: config.limit,
    reset: Math.floor(entry.resetAt / 1000)
  }
}

/**
 * Add rate limit headers to response
 */
export function rateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.reset.toString()
  }
}

/**
 * Extract client IP from request headers
 */
export function getClientIP(headers: Headers): string {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
         headers.get('x-real-ip') ||
         headers.get('cf-connecting-ip') ||  // Cloudflare
         'unknown'
}

// Preset configurations
export const RATE_LIMITS = {
  /** POST /api/v1/articles/submit - 10 per hour per IP */
  SUBMIT: { limit: 10, windowMs: 60 * 60 * 1000 },
  
  /** GET routes - 100 per minute per IP */
  GET: { limit: 100, windowMs: 60 * 1000 },
  
  /** Admin routes - 30 per minute per IP */
  ADMIN: { limit: 30, windowMs: 60 * 1000 }
} as const
