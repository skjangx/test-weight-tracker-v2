'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useWeightData } from '@/hooks/use-weight-data'
import { CountUp } from '@/components/ui/animated-components'
import {
  TrendingDown,
  TrendingUp,
  Calendar,
  Flame,
  Target,
  Activity
} from 'lucide-react'
import { format, startOfWeek, endOfWeek } from 'date-fns'
import type { WeightEntry } from '@/lib/schemas/weight-entry'

/**
 * This Week's Progress Card
 * Displays key weekly metrics in a compact, motivating format
 */
export function ThisWeekProgress() {
  const { stats, loading: statsLoading } = useDashboardStats()
  const { currentWeight, entries: weightEntries, loading: dataLoading } = useWeightData()

  const loading = statsLoading || dataLoading

  // Calculate weekly progress
  const calculateWeeklyStats = () => {
    if (!weightEntries || weightEntries.length === 0) {
      return {
        weeklyChange: 0,
        daysLogged: 0,
        weeklyAverage: 0,
        bestDay: null,
        changeDirection: 'stable' as const
      }
    }

    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 }) // Monday
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 })

    // Filter entries for this week
    const thisWeekEntries = weightEntries.filter((entry: WeightEntry) => {
      const entryDate = new Date(entry.date)
      return entryDate >= weekStart && entryDate <= weekEnd
    })

    if (thisWeekEntries.length === 0) {
      return {
        weeklyChange: 0,
        daysLogged: 0,
        weeklyAverage: currentWeight || 0,
        bestDay: null,
        changeDirection: 'stable' as const
      }
    }

    // Group entries by date and calculate daily averages (same logic as weight entries table)
    const groupedByDate = thisWeekEntries.reduce((acc, entry) => {
      const date = entry.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry.weight)
      return acc
    }, {} as Record<string, number[]>)

    // Calculate daily averages for each date
    const dailyAverages = Object.entries(groupedByDate)
      .map(([date, weights]) => ({
        date,
        weight: weights.reduce((sum, weight) => sum + weight, 0) / weights.length
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    const daysLogged = dailyAverages.length

    if (dailyAverages.length === 0) {
      return {
        weeklyChange: 0,
        daysLogged: 0,
        weeklyAverage: currentWeight || 0,
        bestDay: null,
        changeDirection: 'stable' as const
      }
    }

    // Calculate weekly change using daily averages
    const firstWeight = dailyAverages[0].weight
    const lastWeight = dailyAverages[dailyAverages.length - 1].weight
    const weeklyChange = lastWeight - firstWeight

    // Calculate overall weekly average
    const weeklyAverage = dailyAverages.reduce((sum, day) => sum + day.weight, 0) / dailyAverages.length

    // Find best day (lowest average weight this week)
    const bestDay = dailyAverages.reduce((best, day) =>
      day.weight < best.weight ? day : best
    )
    const bestDayName = format(new Date(bestDay.date), 'EEEE')

    const changeDirection = weeklyChange < -0.1 ? 'down' : weeklyChange > 0.1 ? 'up' : 'stable'

    return {
      weeklyChange,
      daysLogged,
      weeklyAverage,
      bestDay: bestDayName,
      changeDirection
    }
  }

  const weeklyStats = calculateWeeklyStats()

  const getChangeIcon = () => {
    if (weeklyStats.changeDirection === 'down') return TrendingDown
    if (weeklyStats.changeDirection === 'up') return TrendingUp
    return Activity
  }

  const getChangeColor = () => {
    if (weeklyStats.changeDirection === 'down') return 'text-green-600 dark:text-green-400'
    if (weeklyStats.changeDirection === 'up') return 'text-red-600 dark:text-red-400'
    return 'text-muted-foreground'
  }

  const getChangeText = () => {
    const abs = Math.abs(weeklyStats.weeklyChange)
    if (weeklyStats.changeDirection === 'down') return `Lost ${abs.toFixed(1)} kg`
    if (weeklyStats.changeDirection === 'up') return `Gained ${abs.toFixed(1)} kg`
    return 'No change'
  }

  const ChangeIcon = getChangeIcon()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span>This Week&apos;s Progress</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Weekly Change */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <ChangeIcon className={`h-4 w-4 ${getChangeColor()}`} />
              <CountUp
                value={Math.abs(weeklyStats.weeklyChange)}
                decimals={1}
                suffix=" kg"
                className={`text-lg font-semibold ${getChangeColor()}`}
                duration={800}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              {getChangeText()}
            </p>
          </div>

          {/* Days Logged */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-500" />
              <div className="flex items-center space-x-1">
                <CountUp
                  value={weeklyStats.daysLogged}
                  className="text-lg font-semibold text-purple-600 dark:text-purple-400"
                  duration={600}
                />
                <span className="text-lg font-semibold text-muted-foreground">/7</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Days logged</p>
          </div>

          {/* Current Streak - Hide when 0, show encouragement instead */}
          <div className="space-y-1">
            {stats.dayStreak > 0 ? (
              <>
                <div className="flex items-center space-x-2">
                  <Flame className="h-4 w-4 text-orange-500" />
                  <div className="flex items-center space-x-1">
                    <CountUp
                      value={stats.dayStreak}
                      className="text-lg font-semibold text-orange-600 dark:text-orange-400"
                      duration={700}
                    />
                    <span className="text-sm text-muted-foreground">
                      {stats.dayStreak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Current streak</p>
              </>
            ) : (
              <>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-semibold text-muted-foreground">
                    Ready to start!
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">Log today to begin streak</p>
              </>
            )}
          </div>

          {/* Weekly Average */}
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-indigo-500" />
              <CountUp
                value={weeklyStats.weeklyAverage}
                decimals={1}
                suffix=" kg"
                className="text-lg font-semibold text-indigo-600 dark:text-indigo-400"
                duration={900}
              />
            </div>
            <p className="text-sm text-muted-foreground">Weekly average</p>
          </div>
        </div>

        {/* Best Day Badge */}
        {weeklyStats.bestDay && weeklyStats.daysLogged > 1 && (
          <div className="mt-4 pt-3 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Best day this week:</p>
              <Badge variant="secondary" className="text-xs">
                🏆 {weeklyStats.bestDay}
              </Badge>
            </div>
          </div>
        )}

        {/* Motivational Message */}
        {weeklyStats.daysLogged >= 5 && (
          <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-700 dark:text-green-300">
              🎉 Great consistency! You&apos;ve logged {weeklyStats.daysLogged} days this week.
            </p>
          </div>
        )}

        {weeklyStats.daysLogged < 3 && weeklyStats.daysLogged > 0 && (
          <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-sm text-amber-700 dark:text-amber-300">
              💪 Keep it up! Try to log your weight daily for better insights.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}