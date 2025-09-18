'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { motion, useAnimation } from 'framer-motion'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
  Dot,
  Area,
  ComposedChart
} from 'recharts'
import { parseISO, format, addDays } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartSkeleton } from '@/components/skeletons/chart-skeleton'
import { useWeightData } from '@/hooks/use-weight-data'
import { useActiveGoal } from '@/hooks/use-active-goal'
import { useMilestoneCelebrations } from '@/hooks/use-milestone-celebrations'
import {
  formatWeight,
  formatWeightChange,
  formatPercentChange,
  getChangeColor,
  getChartDomain,
  type TimePeriod
} from '@/lib/utils/chart-helpers'
import { TrendingDown, TrendingUp, Minus, Target, Calendar } from 'lucide-react'
import { MovingAverageHelpTooltip, MilestoneHelpTooltip } from '@/components/help/help-tooltip'

// Helper function to calculate year divider lines
const calculateYearDividers = (chartData: any[]) => {
  if (chartData.length < 2) return []

  const years = new Set<number>()
  const dividers: { year: number; date: string; displayDate: string }[] = []

  chartData.forEach(point => {
    const date = parseISO(point.date)
    const year = date.getFullYear()

    if (!years.has(year)) {
      years.add(year)
      // Add year divider at January 1st of each year (except the first data point's year)
      if (years.size > 1) {
        const yearStart = new Date(year, 0, 1)
        dividers.push({
          year,
          date: yearStart.toISOString().split('T')[0],
          displayDate: format(yearStart, 'MMM d')
        })
      }
    }
  })

  return dividers.filter(divider => {
    // Only include dividers that fall within our data range
    const dividerDate = parseISO(divider.date)
    const firstDataDate = parseISO(chartData[chartData.length - 1].date) // Last item is earliest (sorted desc)
    const lastDataDate = parseISO(chartData[0].date) // First item is latest

    return dividerDate >= firstDataDate && dividerDate <= lastDataDate
  })
}

// Helper function to calculate trend projection (simple linear regression)
const calculateTrendProjection = (chartData: any[], daysToProject: number = 30) => {
  if (chartData.length < 3) return []

  // Use last 10 data points for trend calculation (or all if less than 10)
  const recentData = chartData.slice(0, Math.min(10, chartData.length))

  // Convert dates to numbers (days since first point) for regression
  const firstDate = parseISO(recentData[recentData.length - 1].date)
  const dataPoints = recentData.map(point => {
    const date = parseISO(point.date)
    const daysDiff = Math.floor((date.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24))
    return { x: daysDiff, y: point.weight }
  }).reverse() // Reverse to get chronological order

  // Simple linear regression
  const n = dataPoints.length
  const sumX = dataPoints.reduce((sum, point) => sum + point.x, 0)
  const sumY = dataPoints.reduce((sum, point) => sum + point.y, 0)
  const sumXY = dataPoints.reduce((sum, point) => sum + point.x * point.y, 0)
  const sumXX = dataPoints.reduce((sum, point) => sum + point.x * point.x, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const intercept = (sumY - slope * sumX) / n

  // Generate projection points
  const projectionPoints = []
  const lastDataPoint = dataPoints[dataPoints.length - 1]
  const lastDate = parseISO(chartData[0].date) // Most recent actual data point

  for (let i = 1; i <= daysToProject; i++) {
    const projectedDate = addDays(lastDate, i)
    const daysSinceFirst = lastDataPoint.x + i
    const projectedWeight = slope * daysSinceFirst + intercept

    // Only project if trend makes sense (reasonable weight range)
    if (projectedWeight > 40 && projectedWeight < 400) {
      projectionPoints.push({
        date: projectedDate.toISOString().split('T')[0],
        displayDate: format(projectedDate, 'MMM dd'),
        weight: Math.round(projectedWeight * 10) / 10, // Round to 1 decimal
        isProjection: true
      })
    }
  }

  return projectionPoints
}

interface CustomTooltipProps {
  active?: boolean
  payload?: any[]
  label?: string
}

interface CustomDotProps {
  cx?: number
  cy?: number
  fill?: string
  payload?: any
}

// Custom tooltip component for interactive hover details (US-4.5)
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  const weight = data.weight
  const movingAverage = data.movingAverage
  const change = data.change || 0
  const changePercent = data.changePercent || 0

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-semibold text-sm mb-2">{data.displayDate}</p>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Weight:</span>
          <span className="font-medium">{formatWeight(weight)}</span>
        </div>
        
        {movingAverage && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">7-entry avg:</span>
            <span className="font-medium">{formatWeight(movingAverage)}</span>
          </div>
        )}
        
        {change !== 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Change from before:</span>
              <span className={`font-medium ${getChangeColor(change)}`}>
                {formatWeightChange(change)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Percentage:</span>
              <span className={`font-medium ${getChangeColor(change)}`}>
                {formatPercentChange(changePercent)}
              </span>
            </div>
          </>
        )}
        
        {data.isMilestone && data.milestoneData && (
          <div className="mt-2 pt-2 border-t border-border">
            <Badge variant="secondary" className="text-xs">
              🎉 Milestone: {data.milestoneData.kgLost.toFixed(1)}kg lost!
            </Badge>
          </div>
        )}
      </div>
    </div>
  )
}

// Custom milestone dot component
const MilestoneDot = ({ cx, cy, fill, payload }: CustomDotProps) => {
  if (!payload?.isMilestone) return null

  return (
    <Dot
      cx={cx}
      cy={cy}
      r={6}
      fill="#22c55e"
      stroke="#16a34a"
      strokeWidth={2}
    />
  )
}

// Custom animated line component for trend line drawing effect
const AnimatedLine = ({ points }: { points: string }) => {
  return (
    <motion.path
      d={points}
      fill="none"
      stroke="#2563eb"
      strokeWidth={2}
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{
        duration: 1.5,
        ease: "easeInOut",
        delay: 0.5
      }}
    />
  )
}

// Time period selector component (US-4.2)
const TimePeriodSelector = ({ 
  currentPeriod, 
  onPeriodChange 
}: { 
  currentPeriod: TimePeriod
  onPeriodChange: (period: TimePeriod) => void 
}) => {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: '7d', label: '7 days' },
    { value: '30d', label: '30 days' },
    { value: '90d', label: '90 days' },
    { value: 'all', label: 'All time' }
  ]

  return (
    <div className="flex gap-1">
      {periods.map(({ value, label }) => (
        <Button
          key={value}
          variant="secondary"
          size="sm"
          onClick={() => onPeriodChange(value)}
          className={`text-xs ${
            currentPeriod === value
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : ''
          }`}
        >
          {label}
        </Button>
      ))}
    </div>
  )
}

// Animation variants for natural motion
const chartVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100,
      mass: 0.8,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
}

const legendVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 15,
      stiffness: 120,
      delay: 0.3
    }
  }
}

// Main Weight Trend Graph component
export function WeightTrendGraph() {
  const {
    chartData,
    config,
    setPeriod,
    setShowMovingAverage,
    startingWeight,
    currentWeight,
    totalWeightLost,
    loading,
    error
  } = useWeightData()

  const { activeGoal } = useActiveGoal()

  // Milestone celebrations handled by MilestoneTracker component to prevent duplicates
  const { triggerCelebration } = useMilestoneCelebrations({
    chartData,
    enabled: false
  })

  // Chart dimensions and domain
  const chartDomain = useMemo(() => getChartDomain(chartData, activeGoal?.target_weight), [chartData, activeGoal?.target_weight])

  // Calculate year dividers for multi-year spans
  const yearDividers = useMemo(() => calculateYearDividers(chartData), [chartData])

  // Calculate trend projection
  const trendProjection = useMemo(() => {
    // Only show projection for "all time" view and when we have enough data
    if (config.period === 'all' && chartData.length >= 3) {
      return calculateTrendProjection(chartData, 30)
    }
    return []
  }, [chartData, config.period])

  // Combine actual data with projection for chart
  const combinedChartData = useMemo(() => {
    if (trendProjection.length === 0) return chartData
    return [...chartData, ...trendProjection]
  }, [chartData, trendProjection])

  // Calculate trend direction
  const trendDirection = useMemo(() => {
    if (chartData.length < 2) return 'flat'
    
    const first = chartData[0]
    const last = chartData[chartData.length - 1]
    const change = last.weight - first.weight
    
    if (change < -0.5) return 'down' // Weight loss
    if (change > 0.5) return 'up'    // Weight gain
    return 'flat'
  }, [chartData])

  const getTrendIcon = () => {
    switch (trendDirection) {
      case 'down': return <TrendingDown className="h-4 w-4 text-green-600" />
      case 'up': return <TrendingUp className="h-4 w-4 text-red-600" />
      default: return <Minus className="h-4 w-4 text-gray-600" />
    }
  }

  const getTrendText = () => {
    switch (trendDirection) {
      case 'down': return 'Losing weight'
      case 'up': return 'Gaining weight'
      default: return 'Stable'
    }
  }

  if (loading) {
    return <ChartSkeleton title="Weight Trend" showControls={true} height={300} />
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Calendar className="h-5 w-5" />
            <span>Weight Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weight Trend</span>
          </CardTitle>
          <CardDescription>
            Your weight progress will appear here once you start logging entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No weight data available</p>
              <p className="text-sm">Start logging your weight to see trends</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Weight Trend</CardTitle>
          </div>
          <TimePeriodSelector
            currentPeriod={config.period}
            onPeriodChange={setPeriod}
          />
        </div>
        
      </CardHeader>
      
      <CardContent>
        {/* Chart controls */}
        <div className="flex items-center justify-between mb-4">
          
        </div>

        {/* Main chart */}
        <motion.div
          className="h-[300px] w-full relative"
          variants={chartVariants}
          initial="hidden"
          animate="visible"
        >
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={combinedChartData}
              margin={{
                top: 5,
                right: 5,
                left: 5,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                domain={chartDomain}
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}kg`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Goal reference line (US-4.4) */}
              {activeGoal && config.showGoalLine && (
                <ReferenceLine
                  y={activeGoal.target_weight}
                  stroke={
                    currentWeight && currentWeight > activeGoal.target_weight
                      ? "#ef4444" // Red if above goal
                      : "#22c55e" // Green if below goal
                  }
                  strokeDasharray="2 4"
                  strokeWidth={1}
                />
              )}

              {/* Year divider lines for multi-year spans */}
              {yearDividers.map((divider) => (
                <ReferenceLine
                  key={divider.year}
                  x={divider.displayDate}
                  stroke="#94a3b8"
                  strokeDasharray="1 3"
                  strokeWidth={1}
                  label={{
                    value: divider.year.toString(),
                    position: 'top',
                    offset: 10,
                    style: { fontSize: '11px', fill: '#64748b' }
                  }}
                />
              ))}


              {/* Define gradient */}
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0.05}/>
                </linearGradient>
              </defs>

              {/* Gradient area under the line */}
              <Area
                type="monotone"
                dataKey="weight"
                stroke="none"
                fill="url(#weightGradient)"
                isAnimationActive={false}
              />

              {/* Main weight line */}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={<MilestoneDot />}
                activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
                name="Weight"
                isAnimationActive={true}
              />

              {/* Moving average line (US-4.3) */}
              {config.showMovingAverage && (
                <Line
                  type="monotone"
                  dataKey="movingAverage"
                  stroke="#64748b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  activeDot={{ r: 3, stroke: "#64748b", strokeWidth: 2 }}
                  name="7-entry average"
                />
              )}

              {/* Trend projection line */}
              {trendProjection.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="3 6"
                  dot={false}
                  activeDot={{ r: 3, stroke: "#f59e0b", strokeWidth: 2 }}
                  name="Trend projection"
                  connectNulls={false}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

        </motion.div>

        {/* Chart legend */}
        <motion.div
          className="flex items-center justify-between mt-2 text-xs text-muted-foreground"
          variants={legendVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-600"></div>
              <span>Daily weight</span>
            </div>
            {config.showMovingAverage && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-gray-500 border-dashed border-t"></div>
                <span>7-entry average</span>
              </div>
            )}
            {activeGoal && (
              <div className="flex items-center space-x-1">
                <div
                  className={`w-3 h-0.5 border-dashed border-t-2 ${
                    currentWeight && currentWeight > activeGoal.target_weight
                      ? "border-red-500"
                      : "border-green-500"
                  }`}
                ></div>
                <span>Goal weight</span>
              </div>
            )}
            {trendProjection.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-amber-500 border-dashed border-t"></div>
                <span>Trend projection</span>
              </div>
            )}
          </div>

        </motion.div>
      </CardContent>
    </Card>
  )
}