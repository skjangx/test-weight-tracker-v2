'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth/context'
import { supabase } from '@/lib/supabase/client'
import type { WeightEntry } from '@/lib/schemas/weight-entry'
import {
  filterEntriesByPeriod,
  transformToChartData,
  calculateMilestones,
  type ChartDataPoint,
  type TimePeriod,
  type ChartConfig,
  defaultChartConfig
} from '@/lib/utils/chart-helpers'
import { calculateMovingAverage } from '@/lib/utils/moving-average'

interface UseWeightDataResult {
  // Data
  entries: WeightEntry[]
  chartData: ChartDataPoint[]
  
  // Configuration
  config: ChartConfig
  setConfig: (config: Partial<ChartConfig>) => void
  
  // Derived data
  startingWeight?: number
  currentWeight?: number
  totalWeightLost?: number
  
  // State
  loading: boolean
  error: string | null
  
  // Actions
  refresh: () => Promise<void>
  setPeriod: (period: TimePeriod) => void
  setShowMovingAverage: (show: boolean) => void
  setMovingAverageDays: (days: number) => void
}

/**
 * Hook to fetch and manage weight data for charts and analysis
 */
export function useWeightData(): UseWeightDataResult {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [config, setConfigState] = useState<ChartConfig>(defaultChartConfig)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch weight entries from Supabase
  const fetchWeightEntries = useCallback(async () => {
    if (!user) {
      setEntries([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      // Group entries by date and calculate daily averages
      const groupedEntries = (data || []).reduce((acc, entry) => {
        const date = entry.date
        if (!acc[date]) {
          acc[date] = {
            id: entry.id,
            user_id: entry.user_id,
            weight: entry.weight,
            date: entry.date,
            memo: entry.memo,
            created_at: entry.created_at,
            count: 1,
            totalWeight: entry.weight
          }
        } else {
          acc[date].totalWeight += entry.weight
          acc[date].count += 1
          acc[date].weight = acc[date].totalWeight / acc[date].count
          // Use the latest memo for the day
          if (entry.created_at > acc[date].created_at) {
            acc[date].memo = entry.memo
          }
        }
        return acc
      }, {} as Record<string, any>)

      const processedEntries = Object.values(groupedEntries) as WeightEntry[]
      setEntries(processedEntries)
    } catch (err) {
      console.error('Error fetching weight entries:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch weight entries')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    fetchWeightEntries()
  }, [fetchWeightEntries])

  // Listen for real-time updates
  useEffect(() => {
    if (!user) return

    const handleWeightEntryChange = () => {
      fetchWeightEntries()
    }

    // Listen for custom events from other components
    window.addEventListener('weightEntryCreated', handleWeightEntryChange)
    window.addEventListener('weightEntryUpdated', handleWeightEntryChange)
    window.addEventListener('weightEntryDeleted', handleWeightEntryChange)

    return () => {
      window.removeEventListener('weightEntryCreated', handleWeightEntryChange)
      window.removeEventListener('weightEntryUpdated', handleWeightEntryChange)
      window.removeEventListener('weightEntryDeleted', handleWeightEntryChange)
    }
  }, [user, fetchWeightEntries])

  // Configuration update helpers (define early to avoid initialization issues)
  const setConfig = useCallback((newConfig: Partial<ChartConfig>) => {
    setConfigState(prev => ({ ...prev, ...newConfig }))
  }, [])

  // Memoized processed data
  const processedData = (() => {
    // Filter by time period
    const filteredEntries = filterEntriesByPeriod(entries, config.period)

    // Transform to chart data
    let chartData = transformToChartData(filteredEntries, config)

    // Add milestones if we have starting weight (use chronologically first entry)
    const startingWeight = filteredEntries.length > 0
      ? filteredEntries[filteredEntries.length - 1].weight // Last item in filtered array is earliest by date (sorted desc)
      : undefined

    if (startingWeight) {
      chartData = calculateMilestones(chartData, startingWeight)
    }

    // Calculate additional moving average data if needed
    if (config.showMovingAverage && chartData.length > 1) {
      const weights = chartData.map(d => d.weight)
      const movingAverages = calculateMovingAverage(weights, {
        windowSize: config.movingAverageDays,
        type: 'sma'
      })

      chartData = chartData.map((point, index) => ({
        ...point,
        movingAverage: movingAverages[index]
      }))
    }

    return {
      chartData,
      startingWeight,
      currentWeight: filteredEntries[0]?.weight,
      totalWeightLost: startingWeight && filteredEntries[0]?.weight
        ? startingWeight - filteredEntries[0].weight
        : undefined
    }
  })()

  const setPeriod = useCallback((period: TimePeriod) => {
    setConfig({ period })
  }, [setConfig])

  const setShowMovingAverage = useCallback((show: boolean) => {
    setConfig({ showMovingAverage: show })
  }, [setConfig])

  const setMovingAverageDays = useCallback((days: number) => {
    const clampedDays = Math.max(2, Math.min(14, days))
    setConfig({ movingAverageDays: clampedDays })
  }, [setConfig])

  // Auto-fallback effect: update config when no data in period but entries exist
  useEffect(() => {
    if (entries.length > 0 && config.period !== 'all') {
      const filteredEntries = filterEntriesByPeriod(entries, config.period)
      if (filteredEntries.length === 0) {
        // Automatically switch to 'all' time period when no data in current period
        setConfig({ period: 'all' })
      }
    }
  }, [entries, config.period, setConfig])

  return {
    // Data
    entries,
    chartData: processedData.chartData,
    
    // Configuration
    config,
    setConfig,
    
    // Derived data
    startingWeight: processedData.startingWeight,
    currentWeight: processedData.currentWeight,
    totalWeightLost: processedData.totalWeightLost,
    
    // State
    loading,
    error,
    
    // Actions
    refresh: fetchWeightEntries,
    setPeriod,
    setShowMovingAverage,
    setMovingAverageDays
  }
}

/**
 * Hook to get weight statistics for the current period
 */
export function useWeightStats(period: TimePeriod = '30d') {
  const { entries } = useWeightData()

  return (() => {
    const filteredEntries = filterEntriesByPeriod(entries, period)
    
    if (filteredEntries.length === 0) {
      return {
        totalEntries: 0,
        averageWeight: 0,
        minWeight: 0,
        maxWeight: 0,
        weightRange: 0,
        totalChange: 0,
        averageChange: 0
      }
    }

    const weights = filteredEntries.map(e => e.weight)
    const minWeight = Math.min(...weights)
    const maxWeight = Math.max(...weights)
    const averageWeight = weights.reduce((sum, w) => sum + w, 0) / weights.length
    
    // Calculate total change (most recent - oldest in period)
    const sortedByDate = [...filteredEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    const totalChange = sortedByDate.length > 1 
      ? sortedByDate[sortedByDate.length - 1].weight - sortedByDate[0].weight
      : 0
      
    const averageChange = totalChange / Math.max(1, sortedByDate.length - 1)

    return {
      totalEntries: filteredEntries.length,
      averageWeight: Number(averageWeight.toFixed(1)),
      minWeight,
      maxWeight,
      weightRange: Number((maxWeight - minWeight).toFixed(1)),
      totalChange: Number(totalChange.toFixed(1)),
      averageChange: Number(averageChange.toFixed(2))
    }
  })()
}