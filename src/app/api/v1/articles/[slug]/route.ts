import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
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
    })
  } catch (err) {
    console.error('Article fetch error:', err)
    return NextResponse.json({
      error: true,
      code: 'SERVER_ERROR',
      message: 'Something went wrong. Try again later'
    }, { status: 500 })
  }
}
