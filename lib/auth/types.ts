import type { User as SupabaseUser, Session as SupabaseSession } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  preferences: {
    theme: 'light' | 'dark'
    moving_avg_days: number
  }
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
}

export interface ResetPasswordData {
  email: string
}

export interface AuthSession {
  user: User
  supabaseUser: SupabaseUser
  supabaseSession: SupabaseSession
}

// Legacy Session type for compatibility (used by old JWT utils)
export interface Session {
  user: User
  token: string
  expires_at: string
}