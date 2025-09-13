'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/context'
import { supabase } from '@/lib/supabase/client'
import type { WeightEntry } from '@/lib/schemas/weight-entry'

interface UseStreakResult {
  currentStreak: number
  bestStreak: number
  loading: boolean
  error: string | null
  lastEntryDate: string | null
  updateStreak: () => Promise<void>
}

/**
 * Hook to manage streak tracking for weight entries
 */
export function useStreak(): UseStreakResult {
  const { user } = useAuth()
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [lastEntryDate, setLastEntryDate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calculate streak based on weight entries
  const calculateStreakFromEntries = useCallback(async (): Promise<{
    currentStreak: number
    bestStreak: number
    lastEntryDate: string | null
  }> => {
    if (!user) {
      return { currentStreak: 0, bestStreak: 0, lastEntryDate: null }
    }

    try {
      // Get all weight entries ordered by date descending
      const { data: entries, error: fetchError } = await supabase
        .from('weight_entries')
        .select('date, created_at')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError

      if (!entries || entries.length === 0) {
        return { currentStreak: 0, bestStreak: 0, lastEntryDate: null }
      }

      // Group entries by date to handle multiple entries per day
      const uniqueDates = [...new Set(entries.map(entry => entry.date))]
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

      // Calculate current streak
      let currentStreakCount = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Check if there's an entry today or yesterday (grace period)
      const mostRecentDate = new Date(uniqueDates[0])
      mostRecentDate.setHours(0, 0, 0, 0)
      
      const daysSinceLastEntry = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))
      
      // If more than 1 day has passed, streak is broken
      if (daysSinceLastEntry > 1) {
        currentStreakCount = 0
      } else {
        // Count consecutive days from most recent
        let checkDate = new Date(mostRecentDate)
        
        for (const dateStr of uniqueDates) {
          const entryDate = new Date(dateStr)
          entryDate.setHours(0, 0, 0, 0)
          
          if (entryDate.getTime() === checkDate.getTime()) {
            currentStreakCount++
            checkDate.setDate(checkDate.getDate() - 1)
          } else if (entryDate.getTime() < checkDate.getTime()) {
            // Gap found, streak ends
            break
          }
        }
      }

      // Calculate best streak (longest consecutive sequence)
      let bestStreakCount = 0
      let tempStreak = 0
      let expectedDate = new Date(uniqueDates[0])
      expectedDate.setHours(0, 0, 0, 0)

      for (const dateStr of uniqueDates) {
        const entryDate = new Date(dateStr)
        entryDate.setHours(0, 0, 0, 0)
        
        if (entryDate.getTime() === expectedDate.getTime()) {
          tempStreak++
          bestStreakCount = Math.max(bestStreakCount, tempStreak)
          expectedDate.setDate(expectedDate.getDate() - 1)
        } else {
          // Reset streak counting from this date
          tempStreak = 1
          expectedDate = new Date(entryDate)
          expectedDate.setDate(expectedDate.getDate() - 1)
        }
      }

      return {
        currentStreak: currentStreakCount,
        bestStreak: Math.max(bestStreakCount, currentStreakCount),
        lastEntryDate: uniqueDates[0] || null
      }
    } catch (err) {
      console.error('Error calculating streak:', err)
      throw err
    }
  }, [user])

  // Update streak in database
  const updateStreakInDatabase = useCallback(async (
    currentStreak: number,
    bestStreak: number,
    lastEntryDate: string | null
  ) => {
    if (!user) return

    try {
      const { error: updateError } = await supabase
        .from('users')
        .update({
          current_streak: currentStreak,
          best_streak: bestStreak,
          last_entry_date: lastEntryDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)

      if (updateError) throw updateError
    } catch (err) {
      console.error('Error updating streak in database:', err)
      throw err
    }
  }, [user])

  // Main update function
  const updateStreak = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const streakData = await calculateStreakFromEntries()
      
      // Update local state
      setCurrentStreak(streakData.currentStreak)
      setBestStreak(streakData.bestStreak)
      setLastEntryDate(streakData.lastEntryDate)

      // Update database
      await updateStreakInDatabase(
        streakData.currentStreak,
        streakData.bestStreak,
        streakData.lastEntryDate
      )
    } catch (err) {
      console.error('Error updating streak:', err)
      setError(err instanceof Error ? err.message : 'Failed to update streak')
    } finally {
      setLoading(false)
    }
  }, [user, calculateStreakFromEntries, updateStreakInDatabase])

  // Load initial streak data
  const loadStreakData = useCallback(async () => {
    if (!user) {
      setCurrentStreak(0)
      setBestStreak(0)
      setLastEntryDate(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // First try to get from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('current_streak, best_streak, last_entry_date')
        .eq('id', user.id)
        .single()

      if (userError && userError.code !== 'PGRST116') {
        throw userError
      }

      if (userData && userData.current_streak !== null) {
        // Use database values
        setCurrentStreak(userData.current_streak || 0)
        setBestStreak(userData.best_streak || 0)
        setLastEntryDate(userData.last_entry_date)
      } else {
        // Calculate fresh from entries
        await updateStreak()
      }
    } catch (err) {
      console.error('Error loading streak data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load streak data')
    } finally {
      setLoading(false)
    }
  }, [user, updateStreak])

  // Load data on mount and user change
  useEffect(() => {
    loadStreakData()
  }, [loadStreakData])

  // Listen for weight entry changes
  useEffect(() => {
    if (!user) return

    const handleWeightEntryChange = () => {
      updateStreak()
    }

    // Listen for custom events from weight entry components
    window.addEventListener('weightEntryCreated', handleWeightEntryChange)
    window.addEventListener('weightEntryDeleted', handleWeightEntryChange)

    return () => {
      window.removeEventListener('weightEntryCreated', handleWeightEntryChange)
      window.removeEventListener('weightEntryDeleted', handleWeightEntryChange)
    }
  }, [user, updateStreak])

  return {
    currentStreak,
    bestStreak,
    loading,
    error,
    lastEntryDate,
    updateStreak
  }
}

/**
 * Utility function to check if streak is about to break
 */
export function isStreakAtRisk(lastEntryDate: string | null): boolean {
  if (!lastEntryDate) return false

  const last = new Date(lastEntryDate)
  const today = new Date()
  
  // Set both to start of day for comparison
  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const daysDiff = Math.floor((today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24))
  
  // Streak is at risk if last entry was yesterday (need entry today)
  return daysDiff === 1
}

/**
 * Utility function to format streak display text
 */
export function formatStreakText(currentStreak: number): string {
  if (currentStreak === 0) return 'Start your streak!'
  if (currentStreak === 1) return '🔥 1 day streak'
  return `🔥 ${currentStreak} day streak`
}