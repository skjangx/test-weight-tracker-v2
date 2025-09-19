import { supabase } from '@/lib/supabase/client'

/**
 * Clears all authentication session data
 * Use this when encountering refresh token errors
 */
export async function clearAuthSession() {
  try {
    // Sign out to clear Supabase session
    await supabase.auth.signOut()

    // Clear localStorage
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key)
        }
      })

      // Clear sessionStorage
      const sessionKeys = Object.keys(sessionStorage)
      sessionKeys.forEach(key => {
        if (key.startsWith('sb-')) {
          sessionStorage.removeItem(key)
        }
      })
    }

    console.log('✅ Auth session cleared successfully')

    // Redirect to login
    window.location.href = '/auth/login'
  } catch (error) {
    console.error('❌ Error clearing session:', error)
  }
}