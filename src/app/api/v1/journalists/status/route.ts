import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({
        success: false,
        error: 'Missing Authorization header'
      }, { status: 401 })
    }

    const apiKey = authHeader.replace('Bearer ', '')

    const { data: journalist, error } = await supabase
      .from('journalists')
      .select('id, name, status, articles_count, claimed_at, moltbook_handle')
      .eq('api_key', apiKey)
      .single()

    if (error || !journalist) {
      return NextResponse.json({
        success: false,
        error: 'Invalid API key'
      }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      journalist: {
        id: journalist.id,
        name: journalist.name,
        status: journalist.status,
        articles_count: journalist.articles_count,
        claimed_at: journalist.claimed_at,
        moltbook_handle: journalist.moltbook_handle,
        can_submit: journalist.status === 'claimed'
      }
    })

  } catch (err) {
    console.error('Journalist status error:', err)
    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    }, { status: 500 })
  }
}
