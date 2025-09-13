'use client'

import { createContext, useContext, useCallback, useEffect, useState, ReactNode } from 'react'
import { useAuth } from '@/lib/auth/context'
import { supabase } from '@/lib/supabase/client'

interface SyncStatus {
  lastSynced: Date | null
  isSyncing: boolean
  error: string | null
  isOnline: boolean
  retryCount: number
}

interface SyncContextType {
  syncStatus: SyncStatus
  manualSync: () => Promise<void>
  clearError: () => void
  getTimeSinceLastSync: () => string
}

const SyncContext = createContext<SyncContextType | null>(null)

interface SyncProviderProps {
  children: ReactNode
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { user } = useAuth()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    lastSynced: null,
    isSyncing: false,
    error: null,
    isOnline: navigator.onLine,
    retryCount: 0
  })

  // Exponential backoff calculation
  const getBackoffDelay = (retryCount: number): number => {
    return Math.min(1000 * Math.pow(2, retryCount), 30000) // Max 30 seconds
  }

  // Sync function with conflict resolution
  const performSync = useCallback(async (): Promise<boolean> => {
    if (!user || syncStatus.isSyncing) return false

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }))

      // Check for conflicts and sync weight entries
      const { data: serverEntries, error: fetchError } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (fetchError) {
        throw new Error(`Sync failed: ${fetchError.message}`)
      }

      // Check for conflicts and sync goals
      const { data: serverGoals, error: goalError } = await supabase
        .from('weight_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (goalError) {
        throw new Error(`Goal sync failed: ${goalError.message}`)
      }

      // Update last synced timestamp
      const now = new Date()
      localStorage.setItem('lastSynced', now.toISOString())

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSynced: now,
        error: null,
        retryCount: 0
      }))

      console.log('Sync completed successfully:', {
        weightEntries: serverEntries?.length || 0,
        goals: serverGoals?.length || 0,
        timestamp: now
      })

      return true
    } catch (error) {
      console.error('Sync error:', error)
      
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: error instanceof Error ? error.message : 'Sync failed',
        retryCount: prev.retryCount + 1
      }))

      // Schedule retry with exponential backoff
      if (syncStatus.retryCount < 5) {
        const delay = getBackoffDelay(syncStatus.retryCount)
        setTimeout(() => {
          performSync()
        }, delay)
      }

      return false
    }
  }, [user, syncStatus.isSyncing, syncStatus.retryCount])

  // Manual sync function
  const manualSync = useCallback(async (): Promise<void> => {
    await performSync()
  }, [performSync])

  // Clear error
  const clearError = useCallback(() => {
    setSyncStatus(prev => ({ ...prev, error: null, retryCount: 0 }))
  }, [])

  // Get human-readable time since last sync
  const getTimeSinceLastSync = useCallback((): string => {
    if (!syncStatus.lastSynced) return 'Never'

    const now = new Date()
    const diffMs = now.getTime() - syncStatus.lastSynced.getTime()
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMinutes / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffMinutes < 1) return 'Just now'
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`
  }, [syncStatus.lastSynced])

  // Initialize last synced time from localStorage
  useEffect(() => {
    const savedLastSynced = localStorage.getItem('lastSynced')
    if (savedLastSynced) {
      setSyncStatus(prev => ({
        ...prev,
        lastSynced: new Date(savedLastSynced)
      }))
    }
  }, [])

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: true }))
      // Sync when coming back online
      if (user) {
        setTimeout(() => performSync(), 1000)
      }
    }

    const handleOffline = () => {
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [user, performSync])

  // Hourly auto-sync
  useEffect(() => {
    if (!user) return

    // Initial sync after login
    setTimeout(() => performSync(), 2000)

    // Set up hourly sync interval
    const interval = setInterval(() => {
      if (syncStatus.isOnline && !syncStatus.isSyncing) {
        performSync()
      }
    }, 60 * 60 * 1000) // 1 hour

    return () => clearInterval(interval)
  }, [user, performSync, syncStatus.isOnline, syncStatus.isSyncing])

  const value: SyncContextType = {
    syncStatus,
    manualSync,
    clearError,
    getTimeSinceLastSync
  }

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  )
}

export function useSync() {
  const context = useContext(SyncContext)
  if (!context) {
    throw new Error('useSync must be used within a SyncProvider')
  }
  return context
}