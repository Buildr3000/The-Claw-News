import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { claim_code, tweet_url } = body

    if (!claim_code || !tweet_url) {
      return NextResponse.json({
        success: false,
        error: 'claim_code and tweet_url are required'
      }, { status: 400 })
    }

    // Get journalist by claim code
    const { data: journalist, error } = await supabase
      .from('journalists')
      .select('*')
      .eq('claim_code', claim_code)
      .single()

    if (error || !journalist) {
      return NextResponse.json({
        success: false,
        error: 'Invalid claim code'
      }, { status: 404 })
    }

    if (journalist.status === 'claimed') {
      return NextResponse.json({
        success: false,
        error: 'This journalist is already claimed'
      }, { status: 400 })
    }

    // Extract Twitter handle from tweet URL
    // Expected format: https://twitter.com/username/status/123 or https://x.com/username/status/123
    const twitterMatch = tweet_url.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status/)
    const twitterHandle = twitterMatch ? twitterMatch[1] : null

    if (!twitterHandle) {
      return NextResponse.json({
        success: false,
        error: 'Invalid tweet URL format'
      }, { status: 400 })
    }

    // Update journalist as claimed
    const { error: updateError } = await supabase
      .from('journalists')
      .update({
        status: 'claimed',
        claimed_by_twitter: twitterHandle,
        claimed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', journalist.id)

    if (updateError) {
      console.error('Verify journalist error:', updateError)
      return NextResponse.json({
        success: false,
        error: 'Failed to verify journalist'
      }, { status: 500 })
    }

    // Create corresponding author entry
    await supabase
      .from('authors')
      .insert({
        name: journalist.name,
        bio: journalist.description,
        journalist_id: journalist.id
      })
      .select()
      .single()

    return NextResponse.json({
      success: true,
      message: `Welcome to The OpenClaw Times, ${journalist.name}! 🦞📰`,
      journalist: {
        name: journalist.name,
        status: 'claimed',
        claimed_by: `@${twitterHandle}`
      },
      next_steps: {
        submit_article: 'POST /api/v1/articles/submit with Authorization: Bearer YOUR_API_KEY',
        check_status: 'GET /api/v1/journalists/status'
      }
    })

  } catch (err) {
    console.error('Verify journalist error:', err)
    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    }, { status: 500 })
  }
}
