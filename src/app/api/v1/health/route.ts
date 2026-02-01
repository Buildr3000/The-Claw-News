import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  try {
    // Check Supabase connection
    const { error } = await supabase.from('categories').select('id').limit(1)
    
    if (error) {
      return NextResponse.json({
        status: 'degraded',
        database: 'error',
        error: error.message,
        timestamp: new Date().toISOString()
      }, { status: 503 })
    }

    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      database: 'unreachable',
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 503 })
  }
}
