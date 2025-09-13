'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/context'
import { supabase } from '@/lib/supabase/client'
import type { WeightEntry } from '@/lib/schemas/weight-entry'

interface WeeklySummary {
  id: string
  week_start: string
  week_end: string
  avg_weight: number | null
  total_weight_change: number | null
  days_logged: number
  entries_count: number
  created_at: string
  updated_at: string
}

interface WeeklySummaryWithComparison extends WeeklySummary {
  comparison?: {
    weight_change: number | null
    days_logged_change: number
    is_improvement: boolean
  }
}

interface UseWeeklySummaryResult {
  currentWeek: WeeklySummaryWithComparison | null
  previousWeek: WeeklySummary | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Get the start of week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) // Adjust for Monday start
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the end of week (Sunday) for a given date
 */
function getWeekEnd(date: Date): Date {
  const d = getWeekStart(date)
  d.setDate(d.getDate() + 6)
  d.setHours(23, 59, 59, 999)
  return d
}

/**
 * Calculate weekly summary from weight entries
 */
function calculateWeeklySummary(
  entries: WeightEntry[],
  weekStart: Date,
  weekEnd: Date
): Omit<WeeklySummary, 'id' | 'created_at' | 'updated_at'> {
  const weekEntries = entries.filter(entry => {
    const entryDate = new Date(entry.date)
    return entryDate >= weekStart && entryDate <= weekEnd
  })

  if (weekEntries.length === 0) {
    return {
      week_start: weekStart.toISOString().split('T')[0],
      week_end: weekEnd.toISOString().split('T')[0],
      avg_weight: null,
      total_weight_change: null,
      days_logged: 0,
      entries_count: 0
    }
  }

  // Group by date and calculate daily averages
  const dailyWeights = weekEntries.reduce((acc, entry) => {
    const date = entry.date
    if (!acc[date]) {
      acc[date] = { total: 0, count: 0 }
    }
    acc[date].total += entry.weight
    acc[date].count += 1
    return acc
  }, {} as Record<string, { total: number; count: number }>)

  const dailyAverages = Object.entries(dailyWeights).map(([date, data]) => ({
    date,
    weight: data.total / data.count
  }))

  // Sort by date
  dailyAverages.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const weights = dailyAverages.map(d => d.weight)
  const avgWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length

  // Calculate total change (first to last)
  const totalChange = weights.length > 1 
    ? weights[weights.length - 1] - weights[0]
    : 0

  return {
    week_start: weekStart.toISOString().split('T')[0],
    week_end: weekEnd.toISOString().split('T')[0],
    avg_weight: Number(avgWeight.toFixed(1)),
    total_weight_change: Number(totalChange.toFixed(1)),
    days_logged: Object.keys(dailyWeights).length,
    entries_count: weekEntries.length
  }
}

/**
 * Hook to manage weekly summary data
 */
export function useWeeklySummary(): UseWeeklySummaryResult {
  const { user } = useAuth()
  const [currentWeek, setCurrentWeek] = useState<WeeklySummaryWithComparison | null>(null)
  const [previousWeek, setPreviousWeek] = useState<WeeklySummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Generate or update weekly summaries
  const generateWeeklySummary = useCallback(async (weekStart: Date): Promise<WeeklySummary | null> => {
    if (!user) return null

    try {
      const weekEnd = getWeekEnd(weekStart)
      const weekStartStr = weekStart.toISOString().split('T')[0]
      const weekEndStr = weekEnd.toISOString().split('T')[0]

      // Get weight entries for the week
      const { data: entries, error: entriesError } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', weekStartStr)
        .lte('date', weekEndStr)
        .order('date', { ascending: true })

      if (entriesError) throw entriesError

      // Calculate summary
      const summary = calculateWeeklySummary(entries || [], weekStart, weekEnd)

      // Upsert to database
      const { data: savedSummary, error: upsertError } = await supabase
        .from('weekly_summaries')
        .upsert({
          user_id: user.id,
          ...summary,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id, week_start'
        })
        .select()
        .single()

      if (upsertError) throw upsertError

      return savedSummary
    } catch (err) {
      console.error('Error generating weekly summary:', err)
      throw err
    }
  }, [user])

  // Fetch weekly summaries
  const fetchWeeklySummaries = useCallback(async () => {
    if (!user) {
      setCurrentWeek(null)
      setPreviousWeek(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const now = new Date()
      const currentWeekStart = getWeekStart(now)
      const previousWeekStart = new Date(currentWeekStart)
      previousWeekStart.setDate(previousWeekStart.getDate() - 7)

      // Generate/update current and previous week summaries
      const [currentSummary, previousSummary] = await Promise.all([
        generateWeeklySummary(currentWeekStart),
        generateWeeklySummary(previousWeekStart)
      ])

      // Add comparison data to current week
      let currentWithComparison: WeeklySummaryWithComparison | null = null
      
      if (currentSummary) {
        currentWithComparison = {
          ...currentSummary,
          comparison: previousSummary ? {
            weight_change: currentSummary.avg_weight && previousSummary.avg_weight
              ? currentSummary.avg_weight - previousSummary.avg_weight
              : null,
            days_logged_change: currentSummary.days_logged - previousSummary.days_logged,
            is_improvement: (() => {
              // Improvement means:
              // 1. More days logged than previous week
              // 2. Weight loss (negative change) if goal is weight loss
              const moreDaysLogged = currentSummary.days_logged >= previousSummary.days_logged
              const hasWeightData = currentSummary.avg_weight && previousSummary.avg_weight
              
              if (!hasWeightData) return moreDaysLogged
              
              const weightChange = currentSummary.avg_weight! - previousSummary.avg_weight!
              const betterWeight = weightChange <= 0 // Assuming weight loss is the goal
              
              return moreDaysLogged && betterWeight
            })()
          } : undefined
        }
      }

      setCurrentWeek(currentWithComparison)
      setPreviousWeek(previousSummary)
    } catch (err) {
      console.error('Error fetching weekly summaries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch weekly summaries')
    } finally {
      setLoading(false)
    }
  }, [user, generateWeeklySummary])

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchWeeklySummaries()
  }, [fetchWeeklySummaries])

  // Load data on mount and user change
  useEffect(() => {
    fetchWeeklySummaries()
  }, [fetchWeeklySummaries])

  // Listen for weight entry changes
  useEffect(() => {
    if (!user) return

    const handleWeightEntryChange = () => {
      // Debounce refresh to avoid too frequent updates
      setTimeout(() => {
        fetchWeeklySummaries()
      }, 1000)
    }

    // Listen for custom events from weight entry components
    window.addEventListener('weightEntryCreated', handleWeightEntryChange)
    window.addEventListener('weightEntryUpdated', handleWeightEntryChange)
    window.addEventListener('weightEntryDeleted', handleWeightEntryChange)

    return () => {
      window.removeEventListener('weightEntryCreated', handleWeightEntryChange)
      window.removeEventListener('weightEntryUpdated', handleWeightEntryChange)
      window.removeEventListener('weightEntryDeleted', handleWeightEntryChange)
    }
  }, [user, fetchWeeklySummaries])

  return {
    currentWeek,
    previousWeek,
    loading,
    error,
    refresh
  }
}

/**
 * Utility function to format weight change with proper sign and color
 */
export function formatWeightChange(change: number | null): {
  text: string
  color: string
  isPositive: boolean
} {
  if (change === null) {
    return { text: 'No data', color: 'text-muted-foreground', isPositive: false }
  }

  const isPositive = change > 0
  const absChange = Math.abs(change)
  const sign = isPositive ? '+' : ''
  
  return {
    text: `${sign}${change.toFixed(1)}kg`,
    color: isPositive ? 'text-red-600' : 'text-green-600',
    isPositive
  }
}

/**
 * Utility function to get comparison text and styling
 */
export function formatComparison(comparison: WeeklySummaryWithComparison['comparison']): {
  text: string
  color: string
  icon: string
} {
  if (!comparison) {
    return { text: 'No comparison data', color: 'text-muted-foreground', icon: '—' }
  }

  if (comparison.is_improvement) {
    return { text: 'Improved vs last week', color: 'text-green-600', icon: '↗️' }
  } else {
    return { text: 'No improvement vs last week', color: 'text-orange-600', icon: '↘️' }
  }
}