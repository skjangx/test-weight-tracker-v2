/**
 * Moving Average Calculation Utilities
 * Supports Simple Moving Average (SMA) and Exponential Moving Average (EMA)
 */

export interface MovingAverageOptions {
  windowSize: number
  type: 'sma' | 'ema'
  alpha?: number // For EMA, if not provided will be calculated as 2/(windowSize+1)
}

/**
 * Calculate Simple Moving Average (SMA)
 * Each point in the window has equal weight
 */
export function calculateSMA(
  values: number[],
  windowSize: number
): number[] {
  if (values.length === 0 || windowSize <= 0) return []
  if (windowSize > values.length) windowSize = values.length

  const result: number[] = []

  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data points yet, use all available data
      const slice = values.slice(0, i + 1)
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length
      result.push(Number(average.toFixed(2)))
    } else {
      // Use full window
      const slice = values.slice(i - windowSize + 1, i + 1)
      const average = slice.reduce((sum, val) => sum + val, 0) / windowSize
      result.push(Number(average.toFixed(2)))
    }
  }

  return result
}

/**
 * Calculate Exponential Moving Average (EMA)
 * Recent values have higher weight than older values
 */
export function calculateEMA(
  values: number[],
  windowSize: number,
  alpha?: number
): number[] {
  if (values.length === 0 || windowSize <= 0) return []

  // Calculate alpha (smoothing factor) if not provided
  if (!alpha) {
    alpha = 2 / (windowSize + 1)
  }

  const result: number[] = []
  
  // First value is just the first data point
  result.push(values[0])

  // Calculate EMA for subsequent values
  for (let i = 1; i < values.length; i++) {
    const ema = alpha * values[i] + (1 - alpha) * result[i - 1]
    result.push(Number(ema.toFixed(2)))
  }

  return result
}

/**
 * Calculate weighted moving average with custom weights
 * Weights should sum to 1.0
 */
export function calculateWMA(
  values: number[],
  weights: number[]
): number[] {
  if (values.length === 0 || weights.length === 0) return []
  
  const windowSize = weights.length
  const result: number[] = []

  for (let i = 0; i < values.length; i++) {
    if (i < windowSize - 1) {
      // Not enough data, use SMA for early values
      const slice = values.slice(0, i + 1)
      const average = slice.reduce((sum, val) => sum + val, 0) / slice.length
      result.push(Number(average.toFixed(2)))
    } else {
      // Apply weighted average
      const slice = values.slice(i - windowSize + 1, i + 1)
      let weightedSum = 0
      let totalWeight = 0

      for (let j = 0; j < windowSize; j++) {
        weightedSum += slice[j] * weights[j]
        totalWeight += weights[j]
      }

      const weightedAverage = weightedSum / totalWeight
      result.push(Number(weightedAverage.toFixed(2)))
    }
  }

  return result
}

/**
 * Calculate moving average based on options
 */
export function calculateMovingAverage(
  values: number[],
  options: MovingAverageOptions
): number[] {
  switch (options.type) {
    case 'sma':
      return calculateSMA(values, options.windowSize)
    case 'ema':
      return calculateEMA(values, options.windowSize, options.alpha)
    default:
      return calculateSMA(values, options.windowSize)
  }
}

/**
 * Create a moving average configuration for weight tracking
 * Defaults to 7-day SMA which is good for daily weight fluctuations
 */
export function createWeightMAConfig(
  days: number = 7,
  type: 'sma' | 'ema' = 'sma'
): MovingAverageOptions {
  return {
    windowSize: Math.max(2, Math.min(14, days)), // Clamp between 2-14 days
    type,
    alpha: type === 'ema' ? 2 / (days + 1) : undefined
  }
}

/**
 * Get moving average trend direction
 * Returns 'up', 'down', or 'flat' based on recent MA values
 */
export function getMADirection(
  movingAverages: number[],
  lookback: number = 3
): 'up' | 'down' | 'flat' {
  if (movingAverages.length < lookback) return 'flat'

  const recent = movingAverages.slice(-lookback)
  const first = recent[0]
  const last = recent[recent.length - 1]
  
  const threshold = 0.1 // 0.1kg threshold for considering it "flat"
  
  if (last - first > threshold) return 'down' // Weight decreasing is "up" trend for weight loss
  if (first - last > threshold) return 'up'   // Weight increasing is "down" trend for weight loss
  return 'flat'
}

/**
 * Calculate the rate of change in moving average
 * Returns kg per day change rate
 */
export function getMAChangeRate(
  movingAverages: number[],
  days: number = 7
): number {
  if (movingAverages.length < days) return 0

  const recent = movingAverages.slice(-days)
  const firstValue = recent[0]
  const lastValue = recent[recent.length - 1]
  
  // Change per day
  const changeRate = (lastValue - firstValue) / (days - 1)
  return Number(changeRate.toFixed(3))
}

/**
 * Validate moving average window size based on data length
 */
export function validateWindowSize(
  dataLength: number,
  windowSize: number
): number {
  if (dataLength === 0) return 1
  if (windowSize <= 0) return 1
  if (windowSize > dataLength) return dataLength
  return windowSize
}

/**
 * Default moving average settings for weight tracking
 */
export const DEFAULT_MA_SETTINGS = {
  windowSize: 7,
  type: 'sma' as const,
  minDataPoints: 3, // Minimum data points before showing MA
  maxWindowSize: 14, // Maximum window size for weight data
  minWindowSize: 2   // Minimum window size
}