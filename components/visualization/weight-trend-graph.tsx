'use client'

import { useState, useMemo } from 'react'
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
  Dot
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
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
            <span className="text-muted-foreground">7-day avg:</span>
            <span className="font-medium">{formatWeight(movingAverage)}</span>
          </div>
        )}
        
        {change !== 0 && (
          <>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Daily change:</span>
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
        
        {data.isMilestone && (
          <div className="mt-2 pt-2 border-t border-border">
            <Badge variant="secondary" className="text-xs">
              🎉 Milestone!
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
          variant={currentPeriod === value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onPeriodChange(value)}
          className="text-xs"
        >
          {label}
        </Button>
      ))}
    </div>
  )
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
  const chartDomain = useMemo(() => getChartDomain(chartData), [chartData])
  
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
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weight Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    )
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
            <div className="flex items-center space-x-1 ml-4">
              {getTrendIcon()}
              <span className="text-sm text-muted-foreground">{getTrendText()}</span>
            </div>
          </div>
          <TimePeriodSelector
            currentPeriod={config.period}
            onPeriodChange={setPeriod}
          />
        </div>
        
        {/* Quick stats */}
        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
          {currentWeight && (
            <span>Current: {formatWeight(currentWeight)}</span>
          )}
          {totalWeightLost && totalWeightLost > 0 && (
            <span className="text-green-600">
              Lost: {formatWeight(totalWeightLost)}
            </span>
          )}
          {activeGoal && (
            <span className="flex items-center space-x-1">
              <Target className="h-3 w-3" />
              <span>Goal: {formatWeight(activeGoal.target_weight)}</span>
            </span>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Chart controls */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <Button
              variant={config.showMovingAverage ? 'default' : 'outline'}
              size="sm"
              onClick={() => setShowMovingAverage(!config.showMovingAverage)}
            >
              7-day average
            </Button>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {chartData.length} data points
          </div>
        </div>

        {/* Main chart */}
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
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
                  strokeDasharray="5 5"
                  strokeWidth={2}
                />
              )}
              
              {/* Legend */}
              <Legend 
                iconType="line"
                wrapperStyle={{ fontSize: '12px' }}
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
                  name="7-day average"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-0.5 bg-blue-600"></div>
              <span>Daily weight</span>
            </div>
            {config.showMovingAverage && (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-0.5 bg-gray-500 border-dashed border-t"></div>
                <span>7-day average</span>
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
          </div>
          
          <div>
            Showing {config.period === 'all' ? 'all time' : config.period}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}