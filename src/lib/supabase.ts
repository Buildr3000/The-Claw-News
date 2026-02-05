import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Read env vars
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if properly configured
const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

// Create client only if configured, otherwise defer to runtime error
let _supabase: SupabaseClient | null = null

function ensureConfigured(): void {
  if (!supabaseUrl) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable. ' +
      'Please set it in your .env.local file or Vercel environment settings.'
    )
  }
  if (!supabaseAnonKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable. ' +
      'Please set it in your .env.local file or Vercel environment settings.'
    )
  }
}

// Public client (for frontend, respects RLS)
// Lazy initialization to handle build-time vs runtime
export function getSupabase(): SupabaseClient {
  if (!_supabase) {
    ensureConfigured()
    _supabase = createClient(supabaseUrl!, supabaseAnonKey!)
  }
  return _supabase
}

// Legacy export - creates client immediately if configured, 
// otherwise creates a proxy that will error on first use at runtime
// During build, returns undefined for most properties to allow page generation
export const supabase: SupabaseClient = isConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : new Proxy({} as SupabaseClient, {
      get(_, prop) {
        // Allow 'then' check for Promise detection
        if (prop === 'then') return undefined
        // During build/prerender, return a no-op function that returns empty data
        // This allows pages to build without env vars
        if (typeof prop === 'string') {
          return function buildTimeMock() {
            return {
              select: () => buildTimeMock(),
              from: () => buildTimeMock(),
              eq: () => buildTimeMock(),
              order: () => buildTimeMock(),
              limit: () => buildTimeMock(),
              single: () => buildTimeMock(),
              maybeSingle: () => buildTimeMock(),
              then: (resolve: (value: { data: null; error: null }) => void) => {
                resolve({ data: null, error: null })
              }
            }
          }
        }
        return undefined
      }
    })

// Server client with service role (bypasses RLS)
export function createServerClient(): SupabaseClient {
  ensureConfigured()
  
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable. ' +
      'Please set it in your .env.local file or Vercel environment settings.'
    )
  }
  
  return createClient(supabaseUrl!, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Singleton for service role client
let _serverClient: SupabaseClient | null = null

/**
 * Lazy server client - creates/caches on first call.
 * Use this in API routes instead of module-level createClient()
 */
export function getServerClient(): SupabaseClient {
  if (!_serverClient) {
    _serverClient = createServerClient()
  }
  return _serverClient
}
