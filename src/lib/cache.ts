/**
 * Cache utilities for API routes
 * 
 * Cache-Control header strategies:
 * - LIST: Short cache for paginated lists (content changes frequently)
 * - DETAIL: Medium cache for individual items (changes less often)
 * - STATIC: Long cache for rarely changing content
 * - NONE: No caching (health checks, mutations)
 */

export type CacheStrategy = 'LIST' | 'DETAIL' | 'STATIC' | 'NONE'

export interface CacheConfig {
  maxAge: number          // Browser cache (seconds)
  sMaxAge: number         // CDN cache (seconds)
  staleWhileRevalidate: number  // Serve stale while refreshing (seconds)
  isPublic: boolean
}

export const CACHE_CONFIGS: Record<CacheStrategy, CacheConfig> = {
  // Lists: 30s browser, 60s CDN, 5min stale
  LIST: {
    maxAge: 30,
    sMaxAge: 60,
    staleWhileRevalidate: 300,
    isPublic: true
  },
  // Detail pages: 60s browser, 120s CDN, 10min stale
  DETAIL: {
    maxAge: 60,
    sMaxAge: 120,
    staleWhileRevalidate: 600,
    isPublic: true
  },
  // Static content: 5min browser, 1h CDN, 1h stale
  STATIC: {
    maxAge: 300,
    sMaxAge: 3600,
    staleWhileRevalidate: 3600,
    isPublic: true
  },
  // No cache
  NONE: {
    maxAge: 0,
    sMaxAge: 0,
    staleWhileRevalidate: 0,
    isPublic: false
  }
}

/**
 * Generate Cache-Control header value
 */
export function getCacheControl(strategy: CacheStrategy): string {
  const config = CACHE_CONFIGS[strategy]
  
  if (strategy === 'NONE') {
    return 'no-store, no-cache, must-revalidate'
  }
  
  const parts: string[] = []
  
  if (config.isPublic) {
    parts.push('public')
  } else {
    parts.push('private')
  }
  
  parts.push(`max-age=${config.maxAge}`)
  parts.push(`s-maxage=${config.sMaxAge}`)
  parts.push(`stale-while-revalidate=${config.staleWhileRevalidate}`)
  
  return parts.join(', ')
}

/**
 * Get all cache-related headers as an object
 */
export function cacheHeaders(strategy: CacheStrategy): Record<string, string> {
  return {
    'Cache-Control': getCacheControl(strategy),
    'CDN-Cache-Control': getCacheControl(strategy),
    'Vercel-CDN-Cache-Control': getCacheControl(strategy)
  }
}

/**
 * Merge cache headers with existing headers
 */
export function withCacheHeaders(
  strategy: CacheStrategy, 
  existingHeaders: Record<string, string> = {}
): Record<string, string> {
  return {
    ...existingHeaders,
    ...cacheHeaders(strategy)
  }
}
