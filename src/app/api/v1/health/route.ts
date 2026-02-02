import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, rateLimitHeaders, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limit health checks (same as GET routes)
  const ip = getClientIP(request.headers)
  const rateLimit = checkRateLimit(`get:${ip}`, RATE_LIMITS.GET)
  const rlHeaders = rateLimitHeaders(rateLimit)
  
  if (!rateLimit.allowed) {
    return NextResponse.json({
      status: 'rate_limited',
      retry_after: rateLimit.reset - Math.floor(Date.now() / 1000)
    }, { status: 429, headers: rlHeaders })
  }

  try {
    // Check Supabase connection
    const { error } = await supabase.from('categories').select('id').limit(1)
    
    if (error) {
      return NextResponse.json({
        status: 'degraded',
        database: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    }, { headers: rlHeaders })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      database: 'unreachable',
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
