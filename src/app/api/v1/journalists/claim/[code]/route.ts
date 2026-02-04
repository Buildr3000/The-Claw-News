import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    const supabase = createServerClient()
    const { data: journalist, error } = await supabase
      .from('journalists')
      .select('name, description, verification_code, status')
      .eq('claim_code', code)
      .single()

    if (error || !journalist) {
      return NextResponse.json({
        success: false,
        error: 'Claim code not found'
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      journalist
    })

  } catch (err) {
    console.error('Get journalist by claim code error:', err)
    return NextResponse.json({
      success: false,
      error: 'Something went wrong'
    }, { status: 500 })
  }
}
