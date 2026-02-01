import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get current views and increment
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

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
