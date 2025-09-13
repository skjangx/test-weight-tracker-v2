'use client'

import { useState, useEffect, useCallback } from 'react'
import { useWeightData } from '@/hooks/use-weight-data'
import type { WeightEntry } from '@/lib/schemas/weight-entry'

interface TrendDataPoint {
  period: string
  value: number
  change: number | null
  changePercent: number | null
  date: Date
}

interface TrendPeriod {
  label: string
  data: TrendDataPoint[]
  averageChange: number
  totalChange: number
  direction: 'up' | 'down' | 'stable'
}

interface UseTrendAnalysisResult {
  weeklyTrend: TrendPeriod | null
  monthlyTrend: TrendPeriod | null
  loading: boolean
  error: string | null
}

/**
 * Get the start of week (Monday) for a given date
 */
function getWeekStart(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Get the start of month for a given date
 */
function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

/**
 * Calculate weekly trend data
 */
function calculateWeeklyTrend(entries: WeightEntry[]): TrendPeriod | null {
  if (entries.length === 0) return null

  const now = new Date()
  const periods: TrendDataPoint[] = []

  // Get last 4 weeks
  for (let i = 0; i < 4; i++) {
    const weekStart = getWeekStart(now)
    weekStart.setDate(weekStart.getDate() - (i * 7))
    
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)

    // Get entries for this week
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    if (weekEntries.length > 0) {
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

      const dailyAverages = Object.values(dailyWeights).map(d => d.total / d.count)
      const avgWeight = dailyAverages.reduce((sum, w) => sum + w, 0) / dailyAverages.length

      periods.unshift({
        period: `Week ${i === 0 ? 'This' : i === 1 ? 'Last' : `${i} ago`}`,
        value: Number(avgWeight.toFixed(1)),
        change: null, // Will be calculated after all periods are collected
        changePercent: null,
        date: weekStart
      })
    }
  }

  // Calculate changes
  for (let i = 1; i < periods.length; i++) {
    const current = periods[i]
    const previous = periods[i - 1]
    
    current.change = Number((current.value - previous.value).toFixed(1))
    current.changePercent = previous.value > 0 
      ? Number(((current.change / previous.value) * 100).toFixed(1))
      : null
  }

  if (periods.length === 0) return null

  const changes = periods.filter(p => p.change !== null).map(p => p.change!)
  const averageChange = changes.length > 0 
    ? Number((changes.reduce((sum, c) => sum + c, 0) / changes.length).toFixed(2))
    : 0
    
  const totalChange = periods.length >= 2 
    ? Number((periods[periods.length - 1].value - periods[0].value).toFixed(1))
    : 0

  const direction = averageChange < -0.1 ? 'down' : averageChange > 0.1 ? 'up' : 'stable'

  return {
    label: 'Weekly Trend (Last 4 Weeks)',
    data: periods,
    averageChange,
    totalChange,
    direction
  }
}

/**
 * Calculate monthly trend data
 */
function calculateMonthlyTrend(entries: WeightEntry[]): TrendPeriod | null {
  if (entries.length === 0) return null

  const now = new Date()
  const periods: TrendDataPoint[] = []

  // Get last 3 months
  for (let i = 0; i < 3; i++) {
    const monthStart = getMonthStart(now)
    monthStart.setMonth(monthStart.getMonth() - i)
    
    const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0)

    // Get entries for this month
    const monthEntries = entries.filter(entry => {
      const entryDate = new Date(entry.date)
      return entryDate >= monthStart && entryDate <= monthEnd
    })

    if (monthEntries.length > 0) {
      // Group by date and calculate daily averages
      const dailyWeights = monthEntries.reduce((acc, entry) => {
        const date = entry.date
        if (!acc[date]) {
          acc[date] = { total: 0, count: 0 }
        }
        acc[date].total += entry.weight
        acc[date].count += 1
        return acc
      }, {} as Record<string, { total: number; count: number }>)

      const dailyAverages = Object.values(dailyWeights).map(d => d.total / d.count)
      const avgWeight = dailyAverages.reduce((sum, w) => sum + w, 0) / dailyAverages.length

      const monthName = monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      periods.unshift({
        period: i === 0 ? 'This Month' : monthName,
        value: Number(avgWeight.toFixed(1)),
        change: null,
        changePercent: null,
        date: monthStart
      })
    }
  }

  // Calculate changes
  for (let i = 1; i < periods.length; i++) {
    const current = periods[i]
    const previous = periods[i - 1]
    
    current.change = Number((current.value - previous.value).toFixed(1))
    current.changePercent = previous.value > 0 
      ? Number(((current.change / previous.value) * 100).toFixed(1))
      : null
  }

  if (periods.length === 0) return null

  const changes = periods.filter(p => p.change !== null).map(p => p.change!)
  const averageChange = changes.length > 0 
    ? Number((changes.reduce((sum, c) => sum + c, 0) / changes.length).toFixed(2))
    : 0
    
  const totalChange = periods.length >= 2 
    ? Number((periods[periods.length - 1].value - periods[0].value).toFixed(1))
    : 0

  const direction = averageChange < -0.1 ? 'down' : averageChange > 0.1 ? 'up' : 'stable'

  return {
    label: 'Monthly Trend (Last 3 Months)',
    data: periods,
    averageChange,
    totalChange,
    direction
  }
}

/**
 * Hook to manage trend analysis data
 */
export function useTrendAnalysis(): UseTrendAnalysisResult {
  const { entries, loading: weightDataLoading, error: weightDataError } = useWeightData()
  const [weeklyTrend, setWeeklyTrend] = useState<TrendPeriod | null>(null)
  const [monthlyTrend, setMonthlyTrend] = useState<TrendPeriod | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const calculateTrends = useCallback(() => {
    try {
      setError(null)
      
      if (entries.length === 0) {
        setWeeklyTrend(null)
        setMonthlyTrend(null)
        return
      }

      const weekly = calculateWeeklyTrend(entries)
      const monthly = calculateMonthlyTrend(entries)

      setWeeklyTrend(weekly)
      setMonthlyTrend(monthly)
    } catch (err) {
      console.error('Error calculating trends:', err)
      setError(err instanceof Error ? err.message : 'Failed to calculate trends')
    }
  }, [entries])

  // Calculate trends when entries change
  useEffect(() => {
    if (!weightDataLoading) {
      setLoading(true)
      calculateTrends()
      setLoading(false)
    }
  }, [entries, weightDataLoading, calculateTrends])

  // Handle weight data errors
  useEffect(() => {
    if (weightDataError) {
      setError(weightDataError)
    }
  }, [weightDataError])

  return {
    weeklyTrend,
    monthlyTrend,
    loading: loading || weightDataLoading,
    error: error || weightDataError
  }
}

/**
 * Utility function to get trend direction icon and color
 */
export function getTrendIndicator(direction: TrendPeriod['direction']): {
  icon: string
  color: string
  description: string
} {
  switch (direction) {
    case 'down':
      return {
        icon: '📉',
        color: 'text-green-600',
        description: 'Trending down (losing weight)'
      }
    case 'up':
      return {
        icon: '📈',
        color: 'text-red-600',
        description: 'Trending up (gaining weight)'
      }
    default:
      return {
        icon: '📊',
        color: 'text-gray-600',
        description: 'Stable trend'
      }
  }
}