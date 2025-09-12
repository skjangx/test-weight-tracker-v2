import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns'
import type { WeightEntry } from '@/lib/schemas/weight-entry'

export interface ChartDataPoint {
  date: string
  displayDate: string
  weight: number
  movingAverage?: number
  isMilestone?: boolean
  change?: number
  changePercent?: number
}

export type TimePeriod = '7d' | '30d' | '90d' | 'all'

export interface ChartConfig {
  period: TimePeriod
  showMovingAverage: boolean
  showGoalLine: boolean
  movingAverageDays: number
}

/**
 * Filter weight entries based on time period
 */
export function filterEntriesByPeriod(
  entries: WeightEntry[],
  period: TimePeriod
): WeightEntry[] {
  if (period === 'all') {
    return entries
  }

  const days = {
    '7d': 7,
    '30d': 30,
    '90d': 90
  }[period]

  const cutoffDate = subDays(new Date(), days)
  
  return entries.filter(entry => {
    const entryDate = parseISO(entry.date)
    return isAfter(entryDate, cutoffDate) || entryDate.toDateString() === cutoffDate.toDateString()
  })
}

/**
 * Transform weight entries into chart data points
 */
export function transformToChartData(
  entries: WeightEntry[],
  config: ChartConfig
): ChartDataPoint[] {
  // Sort entries by date ascending for chart display
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const chartData: ChartDataPoint[] = sortedEntries.map((entry, index) => {
    const prevEntry = sortedEntries[index - 1]
    let change = 0
    let changePercent = 0

    if (prevEntry) {
      change = entry.weight - prevEntry.weight
      changePercent = (change / prevEntry.weight) * 100
    }

    return {
      date: entry.date,
      displayDate: format(parseISO(entry.date), 'MMM dd'),
      weight: entry.weight,
      change,
      changePercent,
      isMilestone: false // Will be calculated later
    }
  })

  // Add moving average if requested
  if (config.showMovingAverage && chartData.length > 1) {
    chartData.forEach((point, index) => {
      point.movingAverage = calculateMovingAverage(
        chartData,
        index,
        config.movingAverageDays
      )
    })
  }

  return chartData
}

/**
 * Calculate moving average for a data point
 */
export function calculateMovingAverage(
  data: ChartDataPoint[],
  currentIndex: number,
  windowSize: number
): number {
  const startIndex = Math.max(0, currentIndex - windowSize + 1)
  const window = data.slice(startIndex, currentIndex + 1)
  
  if (window.length === 0) return data[currentIndex].weight

  const sum = window.reduce((acc, point) => acc + point.weight, 0)
  return Number((sum / window.length).toFixed(1))
}

/**
 * Calculate milestone achievements based on starting weight
 */
export function calculateMilestones(
  data: ChartDataPoint[],
  startingWeight?: number
): ChartDataPoint[] {
  if (!startingWeight || data.length === 0) return data

  return data.map(point => {
    const weightLost = startingWeight - point.weight
    const milestoneReached = Math.floor(weightLost / 3) // Every 3kg milestone
    
    // Check if this is the first time reaching this milestone
    const isNewMilestone = weightLost >= 3 && milestoneReached > 0 && 
      (point.weight === Math.min(...data.map(d => d.weight)))

    return {
      ...point,
      isMilestone: isNewMilestone
    }
  })
}

/**
 * Format weight for display
 */
export function formatWeight(weight: number): string {
  return `${weight.toFixed(1)} kg`
}

/**
 * Format weight change for display
 */
export function formatWeightChange(change: number, showSign = true): string {
  const sign = change > 0 ? '+' : ''
  const prefix = showSign ? sign : ''
  return `${prefix}${change.toFixed(1)} kg`
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(percent: number, showSign = true): string {
  const sign = percent > 0 ? '+' : ''
  const prefix = showSign ? sign : ''
  return `${prefix}${percent.toFixed(1)}%`
}

/**
 * Get color for weight change (green for loss, red for gain)
 */
export function getChangeColor(change: number): string {
  if (change < 0) return 'text-green-600 dark:text-green-400' // Weight loss
  if (change > 0) return 'text-red-600 dark:text-red-400'     // Weight gain
  return 'text-gray-600 dark:text-gray-400'                   // No change
}

/**
 * Generate chart domain with padding
 */
export function getChartDomain(data: ChartDataPoint[]): [number, number] {
  if (data.length === 0) return [0, 100]

  const weights = data.map(d => d.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  
  // Add 5% padding above and below
  const range = maxWeight - minWeight
  const padding = Math.max(range * 0.05, 1) // Minimum 1kg padding
  
  return [
    Math.max(0, minWeight - padding),
    maxWeight + padding
  ]
}

/**
 * Get optimal tick count based on data range and container width
 */
export function getOptimalTickCount(
  containerWidth: number,
  dataLength: number
): number {
  const targetTickWidth = 60 // Minimum pixels between ticks
  const maxTicks = Math.floor(containerWidth / targetTickWidth)
  
  // Don't show more ticks than we have data points
  return Math.min(maxTicks, dataLength, 10) // Cap at 10 ticks max
}

/**
 * Default chart configuration
 */
export const defaultChartConfig: ChartConfig = {
  period: '30d',
  showMovingAverage: true,
  showGoalLine: true,
  movingAverageDays: 7
}