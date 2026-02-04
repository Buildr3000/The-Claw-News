import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

const ADMIN_KEY = process.env.ADMIN_API_KEY

function checkAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader || !ADMIN_KEY) return false
  const token = authHeader.replace('Bearer ', '')
  return token === ADMIN_KEY
}

interface ModerateRequest {
  article_id: string
  action: 'approve' | 'reject' | 'spam'
  reason?: string
}

export async function POST(request: NextRequest) {
  if (!checkAuth(request)) {
    return NextResponse.json({ error: true, code: 'UNAUTHORIZED' }, { status: 401 })
  }

  try {
    const body = await request.json() as ModerateRequest

    if (!body.article_id || !body.action) {
      return NextResponse.json({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'article_id and action are required'
      }, { status: 400 })
    }

    if (!['approve', 'reject', 'spam'].includes(body.action)) {
      return NextResponse.json({
        error: true,
        code: 'VALIDATION_ERROR',
        message: 'action must be: approve, reject, or spam'
      }, { status: 400 })
    }

    // Map action to status
    const statusMap = {
      approve: 'approved',
      reject: 'rejected',
      spam: 'spam'
    }

    const newStatus = statusMap[body.action]

    // Update article
    const supabase = createServerClient()
    const { data: article, error } = await supabase
      .from('articles')
      .update({ 
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', body.article_id)
      .select('id, title, slug, status')
      .single()

    if (error) {
      console.error('Moderate error:', error)
      return NextResponse.json({ error: true, code: 'SERVER_ERROR' }, { status: 500 })
    }

    if (!article) {
      return NextResponse.json({
        error: true,
        code: 'NOT_FOUND',
        message: 'Article not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: article.id,
        title: article.title,
        status: article.status,
        action: body.action,
        url: newStatus === 'approved' ? `/article/${article.slug}` : null
      }
    })
  } catch (err) {
    console.error('Admin moderate error:', err)
    return NextResponse.json({ error: true, code: 'SERVER_ERROR' }, { status: 500 })
  }
}
