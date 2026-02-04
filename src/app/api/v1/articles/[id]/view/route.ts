import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Simple view deduplication: 1 view per IP per article per hour
const viewStore = new Map<string, number>()
const VIEW_COOLDOWN = 3600000 // 1 hour

function canCountView(articleId: string, ip: string): boolean {
  const key = `${articleId}:${ip}`
  const lastView = viewStore.get(key)
  const now = Date.now()
  
  if (lastView && now - lastView < VIEW_COOLDOWN) {
    return false
  }
  
  viewStore.set(key, now)
  
  // Clean old entries periodically (keep map size reasonable)
  if (viewStore.size > 10000) {
    const cutoff = now - VIEW_COOLDOWN
    for (const [k, v] of viewStore.entries()) {
      if (v < cutoff) viewStore.delete(k)
    }
  }
  
  return true
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Get IP for deduplication
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
               request.headers.get('x-real-ip') || 
               'unknown'
    
    // Check if this view should count
    if (!canCountView(id, ip)) {
      return NextResponse.json({ success: true, counted: false })
    }

    // Get current views and increment
    const supabase = createServerClient()
    const { data: article } = await supabase
      .from('articles')
      .select('views')
      .eq('id', id)
      .single()

    if (article) {
      await supabase
        .from('articles')
        .update({ views: (article.views || 0) + 1 })
        .eq('id', id)
    }

    return NextResponse.json({ success: true, counted: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
