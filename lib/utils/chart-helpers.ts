import { format, subDays, isAfter, isBefore, parseISO } from 'date-fns'
import type { WeightEntry } from '@/lib/schemas/weight-entry'

export interface ChartDataPoint {
  date: string
  displayDate: string
  weight: number
  movingAverage?: number
  isMilestone?: boolean
  milestoneData?: {
    kgLost: number
    milestoneNumber: number
    isNew: boolean
  }
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

    const entryDate = parseISO(entry.date)
    const currentYear = new Date().getFullYear()
    const entryYear = entryDate.getFullYear()

    // Include year in display if it's not the current year
    const displayDate = entryYear === currentYear
      ? format(entryDate, 'MMM dd')
      : format(entryDate, 'MMM dd, yyyy')

    return {
      date: entry.date,
      displayDate,
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
  startingWeight?: number,
  previousMilestones: number[] = []
): ChartDataPoint[] {
  if (!startingWeight || data.length === 0) return data

  // Sort data by date to ensure proper milestone detection
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  const achievedMilestones = new Set(previousMilestones)

  return sortedData.map((point, index) => {
    const weightLost = startingWeight - point.weight
    const milestoneNumber = Math.floor(weightLost / 3) // Every 3kg milestone
    
    // Check if this is a milestone (3kg+ lost) and if it's new
    const isMilestone = weightLost >= 3 && milestoneNumber > 0
    const isNewMilestone = isMilestone && !achievedMilestones.has(milestoneNumber)
    
    // If it's a new milestone, mark it as achieved
    if (isNewMilestone) {
      achievedMilestones.add(milestoneNumber)
    }

    return {
      ...point,
      isMilestone: isMilestone,
      milestoneData: isMilestone ? {
        kgLost: weightLost,
        milestoneNumber,
        isNew: isNewMilestone
      } : undefined
    }
  })
}

/**
 * Get milestone celebration message
 */
export function getMilestoneMessage(milestoneNumber: number, kgLost: number): string {
  const messages = [
    `🎉 Congratulations! You've lost ${kgLost.toFixed(1)}kg!`,
    `🌟 Amazing progress! ${kgLost.toFixed(1)}kg down!`,
    `🚀 Fantastic work! You've achieved ${kgLost.toFixed(1)}kg weight loss!`,
    `💪 Incredible! ${kgLost.toFixed(1)}kg milestone reached!`,
    `🏆 Outstanding! You've lost ${kgLost.toFixed(1)}kg!`
  ]
  
  return messages[milestoneNumber % messages.length] || messages[0]
}

/**
 * Format weight for display
 */
export function formatWeight(weight: number | undefined | null): string {
  if (weight == null || isNaN(weight)) {
    return 'N/A'
  }
  return `${weight.toFixed(1)} kg`
}

/**
 * Format weight change for display
 */
export function formatWeightChange(change: number | undefined | null, showSign = true): string {
  if (change == null || isNaN(change)) {
    return 'N/A'
  }
  const sign = change > 0 ? '+' : ''
  const prefix = showSign ? sign : ''
  return `${prefix}${change.toFixed(1)} kg`
}

/**
 * Format percentage change for display
 */
export function formatPercentChange(percent: number | undefined | null, showSign = true): string {
  if (percent == null || isNaN(percent)) {
    return 'N/A'
  }
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
export function getChartDomain(data: ChartDataPoint[], goalWeight?: number): [number, number] {
  if (data.length === 0) return [0, 100]

  const weights = data.map(d => d.weight)
  let minWeight = Math.min(...weights)
  let maxWeight = Math.max(...weights)

  // Include goal weight in the domain calculation if provided
  if (goalWeight !== undefined) {
    minWeight = Math.min(minWeight, goalWeight)
    maxWeight = Math.max(maxWeight, goalWeight)
  }

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
  period: 'all',
  showMovingAverage: true,
  showGoalLine: true,
  movingAverageDays: 7
}