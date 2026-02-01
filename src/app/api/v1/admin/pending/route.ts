import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const ADMIN_KEY = process.env.ADMIN_API_KEY

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !ADMIN_KEY) return false
  const token = authHeader.replace('Bearer ', '')
  return token === ADMIN_KEY
}

export async function GET(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: true, code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        created_at,
        author:authors(id, name),
        category:categories(id, name, slug)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Fetch pending error:', error)
      return NextResponse.json({ error: true, code: 'SERVER_ERROR' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        count: articles?.length || 0,
        articles: articles || []
      }
    })
  } catch (err) {
    console.error('Admin pending error:', err)
    return NextResponse.json({ error: true, code: 'SERVER_ERROR' }, { status: 500 })
  }
}
