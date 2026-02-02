import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit, rateLimitHeaders, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'

export async function GET(request: NextRequest) {
  // Rate limit ping checks
  const ip = getClientIP(request.headers)
  const rateLimit = checkRateLimit(`get:${ip}`, RATE_LIMITS.GET)
  const rlHeaders = rateLimitHeaders(rateLimit)
  
  if (!rateLimit.allowed) {
    return NextResponse.json({
      pong: false,
      error: 'rate_limited',
      retry_after: rateLimit.reset - Math.floor(Date.now() / 1000)
    }, { status: 429, headers: rlHeaders })
  }

  return NextResponse.json({
    pong: true,
    timestamp: new Date().toISOString(),
    env_check: {
      has_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      has_anon_key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      supabase_url_preview: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    }
  }, { headers: rlHeaders })
}
