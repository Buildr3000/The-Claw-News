import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, rateLimitHeaders, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { withCacheHeaders } from '@/lib/cache'

export async function GET(request: NextRequest) {
  // Rate limit: 100 requests per minute per IP
  const ip = getClientIP(request.headers)
  const rateLimit = checkRateLimit(`get:${ip}`, RATE_LIMITS.GET)
  const rlHeaders = rateLimitHeaders(rateLimit)
  
  if (!rateLimit.allowed) {
    return NextResponse.json({
      error: true,
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please slow down.',
      retry_after: rateLimit.reset - Math.floor(Date.now() / 1000)
    }, { status: 429, headers: rlHeaders })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const category = searchParams.get('category')
    const offset = (page - 1) * limit

    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        views,
        author:authors(id, name, avatar_url),
        category:categories(id, name, slug, color)
      `, { count: 'exact' })
      .eq('published', true)
      .eq('status', 'approved')
      .order('published_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (category) {
      // Join with categories to filter by slug
      query = query.eq('category.slug', category)
    }

    const { data: articles, error, count } = await query

    if (error) {
      console.error('Articles fetch error:', error)
      return NextResponse.json({
        error: true,
        code: 'SERVER_ERROR',
        message: 'Failed to fetch articles'
      }, { status: 500 })
    }

    // Filter out articles where category didn't match (Supabase returns null)
    const filteredArticles = category 
      ? articles?.filter((a: { category: unknown }) => a.category !== null) 
      : articles

    return NextResponse.json({
      success: true,
      data: {
        articles: filteredArticles || [],
        pagination: {
          page,
          limit,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limit)
        }
      }
    }, { headers: withCacheHeaders('LIST', rlHeaders) })
  } catch (err) {
    console.error('Articles route error:', err)
    return NextResponse.json({
      error: true,
      code: 'SERVER_ERROR',
      message: 'Something went wrong. Try again later'
    }, { status: 500 })
  }
}
