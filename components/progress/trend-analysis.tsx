'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useTrendAnalysis, getTrendIndicator } from '@/hooks/use-trend-analysis'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronDown, ChevronUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react'

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  color?: string
  className?: string
}

/**
 * Simple SVG Sparkline Component
 */
function Sparkline({ data, width = 120, height = 30, color = 'rgb(59, 130, 246)', className = '' }: SparklineProps) {
  if (data.length < 2) {
    return (
      <div className={`inline-block ${className}`} style={{ width, height }}>
        <div className="w-full h-full bg-muted rounded flex items-center justify-center text-xs text-muted-foreground">
          No data
        </div>
      </div>
    )
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  // Create SVG path
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 4) + 2
    const y = height - ((value - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  return (
    <div className={`inline-block ${className}`} style={{ width, height }}>
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Data points */}
        {data.map((value, index) => {
          const x = (index / (data.length - 1)) * (width - 4) + 2
          const y = height - ((value - min) / range) * (height - 4) - 2
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill={color}
              className="opacity-60"
            />
          )
        })}
      </svg>
    </div>
  )
}

interface TrendSectionProps {
  trend: NonNullable<ReturnType<typeof useTrendAnalysis>['weeklyTrend']>
  type: 'weekly' | 'monthly'
}

/**
 * Individual trend section component
 */
function TrendSection({ trend, type }: TrendSectionProps) {
  const indicator = getTrendIndicator(trend.direction)
  const sparklineData = trend.data.map(d => d.value)

  return (
    <div className="space-y-3" data-testid={`${type}-trend`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">{trend.label}</h4>
        <div className="flex items-center space-x-2">
          <Badge 
            variant={trend.direction === 'down' ? 'default' : trend.direction === 'up' ? 'destructive' : 'secondary'}
            className="text-xs"
          >
            {indicator.icon} {trend.direction}
          </Badge>
        </div>
      </div>

      {/* Sparkline and Summary */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-1">
          <Sparkline 
            data={sparklineData} 
            color={trend.direction === 'down' ? '#16a34a' : trend.direction === 'up' ? '#dc2626' : '#6b7280'}
            className="mb-1"
          />
          <div className="text-xs text-muted-foreground">
            {trend.data.length} {type === 'weekly' ? 'weeks' : 'months'} of data
          </div>
        </div>

        <div className="text-right space-y-1">
          <div className="text-sm">
            <span className="text-muted-foreground">Avg change: </span>
            <span className={`font-medium ${indicator.color}`}>
              {trend.averageChange >= 0 ? '+' : ''}{trend.averageChange}kg
            </span>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className={`font-medium ${trend.totalChange < 0 ? 'text-green-600' : trend.totalChange > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              {trend.totalChange >= 0 ? '+' : ''}{trend.totalChange}kg
            </span>
          </div>
        </div>
      </div>

      {/* Detailed Data */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {trend.data.map((point, index) => (
          <div key={index} className="flex justify-between p-2 bg-muted/50 rounded">
            <span className="text-muted-foreground">{point.period}:</span>
            <div className="text-right">
              <div className="font-medium">{point.value}kg</div>
              {point.change !== null && (
                <div className={`text-xs ${point.change < 0 ? 'text-green-600' : point.change > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {point.change >= 0 ? '+' : ''}{point.change}kg
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface TrendAnalysisProps {
  className?: string
}

/**
 * US-7.3: Trend Analysis Component
 * Shows weekly and monthly trends with mini sparkline charts
 */
export function TrendAnalysis({ className = '' }: TrendAnalysisProps) {
  const { weeklyTrend, monthlyTrend, loading, error } = useTrendAnalysis()
  const [isExpanded, setIsExpanded] = useState(false)

  if (loading) {
    return (
      <Card className={className} data-testid="trend-analysis">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className} data-testid="trend-analysis">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <BarChart3 className="h-5 w-5" />
            <span>Trend Analysis</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!weeklyTrend && !monthlyTrend) {
    return (
      <Card className={className} data-testid="trend-analysis">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Trend Analysis</span>
          </CardTitle>
          <CardDescription>
            Your weight trends will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Keep logging weight entries to see your trends
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card className={className} data-testid="trend-analysis">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Trend Analysis</CardTitle>
            </div>

            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                data-testid="trend-expand-toggle"
              >
                {isExpanded ? (
                  <>
                    <span className="mr-2">Hide</span>
                    <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    <span className="mr-2">Show</span>
                    <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CardDescription>
            {isExpanded 
              ? 'Your weight loss trends and patterns over time'
              : `${weeklyTrend ? weeklyTrend.data.length + ' weeks' : ''} ${monthlyTrend ? monthlyTrend.data.length + ' months' : ''} of trend data available`
            }
          </CardDescription>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6" data-testid="trend-details">
            {/* Weekly Trend */}
            {weeklyTrend && (
              <TrendSection trend={weeklyTrend} type="weekly" />
            )}

            {/* Separator */}
            {weeklyTrend && monthlyTrend && (
              <Separator className="my-4" />
            )}

            {/* Monthly Trend */}
            {monthlyTrend && (
              <TrendSection trend={monthlyTrend} type="monthly" />
            )}

            {/* Summary Insights */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h5 className="text-sm font-medium">Insights</h5>
              
              {weeklyTrend && (
                <p className="text-sm text-muted-foreground">
                  {weeklyTrend.direction === 'down' 
                    ? `📉 You're losing an average of ${Math.abs(weeklyTrend.averageChange)}kg per week. Great progress!`
                    : weeklyTrend.direction === 'up'
                    ? `📈 Your weight has been increasing by ${weeklyTrend.averageChange}kg per week on average.`
                    : '📊 Your weight has been stable over the past few weeks.'
                  }
                </p>
              )}
              
              {monthlyTrend && (
                <p className="text-sm text-muted-foreground">
                  {monthlyTrend.direction === 'down'
                    ? `🎯 Monthly trend shows ${Math.abs(monthlyTrend.totalChange)}kg total loss over ${monthlyTrend.data.length} months.`
                    : monthlyTrend.direction === 'up'
                    ? `⚠️ Monthly trend shows ${monthlyTrend.totalChange}kg total gain over ${monthlyTrend.data.length} months.`
                    : `📊 Your monthly average has been stable over ${monthlyTrend.data.length} months.`
                  }
                </p>
              )}

              {weeklyTrend && monthlyTrend && weeklyTrend.direction !== monthlyTrend.direction && (
                <p className="text-sm text-orange-600">
                  ⚡ Your weekly and monthly trends differ - consider reviewing recent changes to your routine.
                </p>
              )}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  )
}