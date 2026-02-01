import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
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
    })
  } catch (err) {
    console.error('Articles route error:', err)
    return NextResponse.json({
      error: true,
      code: 'SERVER_ERROR',
      message: 'Something went wrong. Try again later'
    }, { status: 500 })
  }
}
