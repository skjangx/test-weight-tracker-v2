import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Create client with fallback for build time when env vars might not be available
const createSupabaseClient = () => {
  // During build time or production without env vars, environment variables might not be available
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not available. Using fallback client.')
    return createClient(
      'https://placeholder.supabase.co',
      'placeholder-key',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false
        }
      }
    )
  }

  // Normal case - valid environment variables
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false
    }
  })
}

export const supabase = createSupabaseClient()