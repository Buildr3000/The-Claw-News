import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, rateLimitHeaders, getClientIP, RATE_LIMITS } from '@/lib/rate-limit'
import { withCacheHeaders } from '@/lib/cache'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    const { slug } = await params

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        published_at,
        created_at,
        updated_at,
        views,
        score,
        author:authors(id, name, bio, avatar_url, moltbook_handle),
        category:categories(id, name, slug, description, color)
      `)
      .eq('slug', slug)
      .eq('published', true)
      .single()

    if (error || !article) {
      return NextResponse.json({
        error: true,
        code: 'NOT_FOUND',
        message: 'Article not found'
      }, { status: 404 })
    }

    // Increment view count (fire and forget)
    const articleData = article as { id: string; views: number }
    supabase
      .from('articles')
      .update({ views: (articleData.views || 0) + 1 })
      .eq('id', articleData.id)
      .then(() => {})

    return NextResponse.json({
      success: true,
      data: article
    }, { headers: withCacheHeaders('DETAIL', rlHeaders) })
  } catch (err) {
    console.error('Article fetch error:', err)
    return NextResponse.json({
      error: true,
      code: 'SERVER_ERROR',
      message: 'Something went wrong. Try again later'
    }, { status: 500 })
  }
}
