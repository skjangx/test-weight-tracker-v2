"use client"

import React, { createContext, useContext, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { User, AuthSession, LoginCredentials, RegisterData, ResetPasswordData } from './types'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: AuthSession | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (data: ResetPasswordData) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Function to create user profile from Supabase user (temporarily simplified)
  const getUserProfile = async (supabaseUser: SupabaseUser): Promise<User> => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      preferences: { theme: 'light', moving_avg_days: 7 },
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: supabaseUser.updated_at || new Date().toISOString()
    }
  }

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession()
        
        if (supabaseSession?.user) {
          const userProfile = await getUserProfile(supabaseSession.user)
          setSession({
            user: userProfile,
            supabaseUser: supabaseSession.user,
            supabaseSession
          })
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, supabaseSession) => {
        if (supabaseSession?.user) {
          const userProfile = await getUserProfile(supabaseSession.user)
          setSession({
            user: userProfile,
            supabaseUser: supabaseSession.user,
            supabaseSession
          })
        } else {
          setSession(null)
        }
        setIsLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Auth actions
  const login = async (credentials: LoginCredentials): Promise<void> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password
    })

    if (error) {
      toast.error('Login failed', {
        description: error.message
      })
      throw error
    }

    toast.success('Welcome back!', {
      description: `Last synced: ${new Date().toLocaleTimeString()}`
    })
  }

  const register = async (data: RegisterData): Promise<void> => {
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`
      }
    })

    if (error) {
      toast.error('Registration failed', {
        description: error.message
      })
      throw error
    }

    toast.success('Account created successfully!', {
      description: 'Welcome to Weight Tracker!'
    })
  }

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast.error('Logout failed', {
        description: error.message
      })
      throw error
    }

    // Clear local session immediately
    setSession(null)
    
    toast.success('Logged out successfully')
    
    // Redirect to login page after a brief delay to show the toast
    setTimeout(() => {
      window.location.href = '/login'
    }, 1000)
  }

  const resetPassword = async (data: ResetPasswordData): Promise<void> => {
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/login`
    })

    if (error) {
      toast.error('Password reset failed', {
        description: error.message
      })
      throw error
    }

    toast.success('Password reset email sent', {
      description: 'Check your email for reset instructions'
    })
  }

  const value: AuthContextType = {
    user: session?.user || null,
    session,
    isLoading,
    isAuthenticated: !!session,
    login,
    register,
    logout,
    resetPassword
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}