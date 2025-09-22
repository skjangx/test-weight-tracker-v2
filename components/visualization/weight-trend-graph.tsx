'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
  Area,
  ComposedChart
} from 'recharts'
import { parseISO, format, addDays } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChartSkeleton } from '@/components/skeletons/chart-skeleton'
import { useWeightData } from '@/hooks/use-weight-data'
import { useActiveGoal } from '@/hooks/use-active-goal'
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
const calculateYearDividers = (chartData: { date: string; weight: number }[]) => {
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

// Helper function to calculate goal guideline path
const calculateGoalGuideline = (chartData: { date: string; weight: number | null }[], goalWeight?: number, goalDeadline?: string) => {
  if (!goalWeight || !goalDeadline || chartData.length === 0) return []

  // chartData is sorted by date ASC (oldest first), so the LAST item is the most recent
  // Find the most recent entry with weight data by iterating backwards
  let lastDataPoint = null
  for (let i = chartData.length - 1; i >= 0; i--) {
    if (chartData[i].weight != null) {
      lastDataPoint = chartData[i]
      break
    }
  }
  if (!lastDataPoint) return []

  const currentWeight = lastDataPoint.weight
  if (currentWeight === null) return [] // No weight data

  const currentDate = parseISO(lastDataPoint.date)
  const deadlineDate = parseISO(goalDeadline)

  // Calculate days from current weight to goal deadline
  const daysToGoal = Math.floor((deadlineDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24))

  if (daysToGoal <= 0) return [] // Goal deadline has passed

  const weightDifference = goalWeight - currentWeight
  const dailyWeightChange = weightDifference / daysToGoal

  const guidelinePoints = []

  // Start from the day AFTER the last actual weight entry to avoid overlap
  const currentYear = new Date().getFullYear()

  for (let i = 1; i <= daysToGoal; i++) {
    const guidelineDate = addDays(currentDate, i)
    const guidelineWeight = currentWeight + (dailyWeightChange * i)
    const guidelineYear = guidelineDate.getFullYear()

    // Include year in display if it's not the current year
    const displayDate = guidelineYear === currentYear
      ? format(guidelineDate, 'MMM dd')
      : format(guidelineDate, 'MMM dd, yyyy')

    guidelinePoints.push({
      date: guidelineDate.toISOString().split('T')[0],
      displayDate,
      goalGuideline: Math.round(guidelineWeight * 10) / 10,
      isGuideline: true
    })
  }

  return guidelinePoints
}

interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{ value: number; name: string; dataKey: string; color: string; payload: Record<string, unknown> }>
  label?: string
}


// Custom tooltip component for interactive hover details (US-4.5)
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null

  const data = payload[0].payload
  const weight = data.weight
  const movingAverage = data.movingAverage
  const goalGuideline = data.goalGuideline
  const change = data.change || 0
  const changePercent = data.changePercent || 0

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3 min-w-[200px]">
      <p className="font-semibold text-sm mb-2">{String(data.displayDate)}</p>

      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Weight:</span>
          <span className="font-medium">{formatWeight(Number(weight))}</span>
        </div>

        {movingAverage ? (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">7-entry avg:</span>
            <span className="font-medium">{formatWeight(Number(movingAverage))}</span>
          </div>
        ) : null}

        {goalGuideline ? (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Goal target:</span>
            <span className="font-medium text-green-600 dark:text-green-400">{formatWeight(Number(goalGuideline))}</span>
          </div>
        ) : null}
        
        {change !== 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Change from before:</span>
              <span className={`font-medium ${getChangeColor(Number(change))}`}>
                {formatWeightChange(Number(change))}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Percentage:</span>
              <span className={`font-medium ${getChangeColor(Number(change))}`}>
                {formatPercentChange(Number(changePercent))}
              </span>
            </div>
          </>
        )}
        
      </div>
    </div>
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
      type: "spring" as const,
      damping: 20,
      stiffness: 100,
      mass: 0.8,
      when: "beforeChildren" as const,
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
      type: "spring" as const,
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


  // Chart dimensions and domain
  const chartDomain = useMemo(() => getChartDomain(chartData, activeGoal?.target_weight), [chartData, activeGoal?.target_weight])

  // Calculate year dividers for multi-year spans
  const yearDividers = useMemo(() => calculateYearDividers(chartData), [chartData])

  // Calculate goal guideline path
  const goalGuideline = useMemo(() => {
    // Only show guideline when we have a goal and we're in "all time" view
    if (config.period === 'all' && activeGoal && chartData.length > 0) {
      return calculateGoalGuideline(chartData, activeGoal.target_weight, activeGoal.deadline)
    }
    return []
  }, [chartData, config.period, activeGoal])

  // Combine actual data with guideline for chart (keep data separate for proper line rendering)
  const combinedChartData = useMemo(() => {
    if (goalGuideline.length === 0) return chartData

    // Create a map to merge data by date
    const dataMap = new Map()

    // First, add all actual weight data (these will always have weight values)
    chartData.forEach(point => {
      dataMap.set(point.date, { ...point })
    })

    // Then, add goal guideline data to existing dates or create new entries
    goalGuideline.forEach(point => {
      const existing = dataMap.get(point.date)
      if (existing) {
        // Add guideline to existing weight entry
        dataMap.set(point.date, { ...existing, goalGuideline: point.goalGuideline })
      } else {
        // Create new entry with only guideline (no weight to avoid breaking line continuity)
        dataMap.set(point.date, {
          date: point.date,
          displayDate: point.displayDate,
          goalGuideline: point.goalGuideline,
          isGuideline: true
        })
      }
    })

    // Convert back to array and sort by date
    return Array.from(dataMap.values()).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [chartData, goalGuideline])

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
    <Card className="@container/card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Weight Trend</CardTitle>
          </div>
          {/* Desktop: Show buttons in header */}
          <div className="hidden @md/card:block">
            <TimePeriodSelector
              currentPeriod={config.period}
              onPeriodChange={setPeriod}
            />
          </div>
        </div>
        {/* Mobile: Show buttons below header */}
        <div className="@md/card:hidden mt-3">
          <TimePeriodSelector
            currentPeriod={config.period}
            onPeriodChange={setPeriod}
          />
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
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
              key={`chart-${config.period}-${chartData.length}`}
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
                connectNulls={false}
              />

              {/* Main weight line */}
              <Line
                type="monotone"
                dataKey="weight"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: "#2563eb", strokeWidth: 2 }}
                name="Weight"
                isAnimationActive={true}
                animationDuration={1500}
                animationEasing="ease-in-out"
                connectNulls={false}
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
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              )}

              {/* Goal guideline line */}
              {goalGuideline.length > 0 && (
                <Line
                  type="monotone"
                  dataKey="goalGuideline"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="8 4"
                  dot={false}
                  activeDot={{
                    r: 3,
                    stroke: "#10b981",
                    strokeWidth: 2,
                    fill: "#10b981"
                  }}
                  name="Goal guideline"
                  connectNulls={false}
                  strokeOpacity={0.7}
                  isAnimationActive={true}
                  animationDuration={1500}
                  animationEasing="ease-in-out"
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>

        </motion.div>

        {/* Chart legend */}
        <motion.div
          className="flex items-center justify-center @md/card:justify-between mt-2 text-xs text-muted-foreground"
          variants={legendVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="flex items-center space-x-2 @md/card:space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-600"></div>
              <span className="hidden @sm/card:inline">Daily weight</span>
              <span className="@sm/card:hidden">Daily</span>
            </div>
            {config.showMovingAverage && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-gray-500 border-dashed border-t"></div>
                <span className="hidden @sm/card:inline">7-entry average</span>
                <span className="@sm/card:hidden">7-avg</span>
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
                <span className="hidden @sm/card:inline">Goal weight</span>
                <span className="@sm/card:hidden">Goal</span>
              </div>
            )}
            {goalGuideline.length > 0 && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 border-dashed border-t-2 border-green-500"></div>
                <span className="hidden @sm/card:inline">Goal guideline</span>
                <span className="@sm/card:hidden">Guide</span>
              </div>
            )}
          </div>

        </motion.div>
      </CardContent>
    </Card>
  )
}