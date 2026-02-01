import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role for write operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Increment views directly with raw SQL for atomicity
    const { error } = await supabase.rpc('increment_article_views', { article_id: id })
    
    // Fallback if RPC doesn't exist
    if (error) {
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
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
