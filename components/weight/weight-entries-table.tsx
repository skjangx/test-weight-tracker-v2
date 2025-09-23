'use client'

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isWithinInterval } from 'date-fns'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/skeletons/table-skeleton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { useActiveGoal } from '@/hooks/use-active-goal'
import type { WeightEntry } from '@/lib/schemas/weight-entry'
import { EditWeightDialog } from './edit-weight-dialog'
import { AddWeightDialog } from './add-weight-dialog'
import { ChevronLeft, ChevronRight, TrendingDown, Calendar, Trophy, Target, Frown, Plus } from 'lucide-react'

export interface WeightEntriesTableRef {
  refreshEntries: () => void
}

interface ProcessedEntry extends WeightEntry {
  isAveraged: boolean
  entryCount: number
  weights: number[]
  memos: string[]
  entries?: WeightEntry[]
  dailyChange?: number
  dailyChangePercent?: number
  sevenDayAverage?: number
  remainingToGoal?: number
}

interface MonthlyStats {
  weeklyAverage: number
  totalChange: number
  bestDay: {
    date: string
    loss: number
    memo?: string
  } | null
  worstDay: {
    date: string
    gain: number
    memo?: string
  } | null
  goalAchieved: boolean
  goalProgress: number
}

export const WeightEntriesTable = forwardRef<WeightEntriesTableRef>((props, ref) => {
  const [allEntries, setAllEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<WeightEntry | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()
  const { activeGoal } = useActiveGoal()

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchEntries = useCallback(async () => {
    if (!user) return
    
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('weight_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Error fetching weight entries:', error)
        return
      }

      setAllEntries(data || [])
    } catch (error) {
      console.error('Error fetching entries:', error)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (!user) return

    fetchEntries()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('weight_entries_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_entries',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('Weight entries subscription triggered:', payload)
          fetchEntries()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchEntries])

  // Expose refresh function to parent components
  useImperativeHandle(ref, () => ({
    refreshEntries: fetchEntries
  }))

  // Process entries for current month with calculations
  const processedEntries = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    
    // Filter entries for current month
    const monthEntries = allEntries.filter(entry => {
      const entryDate = new Date(entry.date)
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd })
    })

    // Group by date and calculate averages
    const groupedEntries = monthEntries.reduce((acc, entry) => {
      const date = entry.date
      if (!acc[date]) {
        acc[date] = {
          ...entry,
          weights: [entry.weight],
          memos: [entry.memo].filter(Boolean) as string[],
          entries: [entry]
        }
      } else {
        acc[date].weights.push(entry.weight)
        acc[date].entries.push(entry)
        if (entry.memo) {
          acc[date].memos.push(entry.memo)
        }
      }
      return acc
    }, {} as Record<string, { date: string; weights: number[]; memos: string[]; entries: WeightEntry[] }>)

    // Convert to processed entries with calculations
    const processed: ProcessedEntry[] = Object.values(groupedEntries).map((group: { date: string; weights: number[]; memos: string[]; entries: WeightEntry[] }) => {
      const avgWeight = Math.round((group.weights.reduce((sum: number, w: number) => sum + w, 0) / group.weights.length) * 100) / 100
      const isAveraged = group.weights.length > 1
      
      return {
        // Required WeightEntry fields
        id: group.entries[0].id,
        user_id: group.entries[0].user_id,
        weight: avgWeight,
        date: group.date,
        memo: isAveraged
          ? `Avg of ${group.weights.length} (${group.weights.join(', ')})${group.memos.length > 0 ? '; ' + group.memos.join('; ') : ''}`
          : group.memos.join('; ') || null,
        created_at: group.entries[0].created_at,
        updated_at: group.entries[0].updated_at,
        // ProcessedEntry specific fields
        isAveraged,
        entryCount: group.weights.length,
        weights: group.weights,
        memos: group.memos,
        entries: group.entries
      }
    })

    // Sort by date descending
    processed.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Calculate changes and moving averages
    for (let i = 0; i < processed.length; i++) {
      const current = processed[i]
      const previous = processed[i + 1]
      
      if (previous) {
        const change = current.weight - previous.weight
        current.dailyChange = Math.round(change * 100) / 100
        current.dailyChangePercent = Math.round((change / previous.weight) * 10000) / 100
      }
      
      // Calculate 7-day trend (average of previous 7 days, excluding current entry)
      const currentDate = new Date(current.date)
      const sevenDaysAgo = new Date(currentDate)
      sevenDaysAgo.setDate(currentDate.getDate() - 7)

      const previousEntries = processed.slice(i + 1).filter(entry => {
        const entryDate = new Date(entry.date)
        return entryDate > sevenDaysAgo && entryDate < currentDate
      })

      if (previousEntries.length > 0) {
        const avgWeight = previousEntries.reduce((sum, entry) => sum + entry.weight, 0) / previousEntries.length
        current.sevenDayAverage = Math.round(avgWeight * 10) / 10
      }
      
      // Calculate remaining to goal
      if (activeGoal) {
        current.remainingToGoal = Math.max(0, Math.round((current.weight - activeGoal.target_weight) * 100) / 100)
      }
    }

    return processed
  }, [allEntries, currentMonth, activeGoal])

  // Calculate monthly statistics
  const monthlyStats = useMemo((): MonthlyStats => {
    if (processedEntries.length === 0) {
      return {
        weeklyAverage: 0,
        totalChange: 0,
        bestDay: null,
        worstDay: null,
        goalAchieved: false,
        goalProgress: 0
      }
    }

    // Weekly average for the month
    const totalWeight = processedEntries.reduce((sum, entry) => sum + entry.weight, 0)
    const weeklyAverage = Math.round((totalWeight / processedEntries.length) * 100) / 100

    // Calculate total change for the month (first entry - last entry)
    // processedEntries are sorted with newest first, so:
    // - processedEntries[0] = most recent weight (end of month)
    // - processedEntries[processedEntries.length - 1] = oldest weight (start of month)
    const currentWeight = processedEntries[0].weight
    const startWeight = processedEntries[processedEntries.length - 1].weight
    const totalChange = Math.round((currentWeight - startWeight) * 100) / 100

    // Find best and worst days (based on daily change)
    let bestDay = null
    let worstDay = null
    let bestLoss = 0
    let worstGain = 0

    processedEntries.forEach(entry => {
      if (entry.dailyChange && entry.dailyChange < bestLoss) {
        bestLoss = entry.dailyChange
        bestDay = {
          date: entry.date,
          loss: Math.abs(entry.dailyChange),
          memo: entry.memo
        }
      }
      if (entry.dailyChange && entry.dailyChange > worstGain) {
        worstGain = entry.dailyChange
        worstDay = {
          date: entry.date,
          gain: entry.dailyChange,
          memo: entry.memo
        }
      }
    })

    // Check goal achievement
    let goalAchieved = false
    let goalProgress = 0
    if (activeGoal && processedEntries.length > 0) {
      goalAchieved = currentWeight <= activeGoal.target_weight
      const totalToLose = startWeight - activeGoal.target_weight
      const weightLost = startWeight - currentWeight
      goalProgress = totalToLose > 0 ? Math.round((weightLost / totalToLose) * 10000) / 100 : 0
    }

    return {
      weeklyAverage,
      totalChange,
      bestDay,
      worstDay,
      goalAchieved,
      goalProgress
    }
  }, [processedEntries, activeGoal])

  const handleRowClick = (entry: ProcessedEntry) => {
    // For averaged entries, find the most recent individual entry for that date
    if (entry.isAveraged && entry.entries) {
      const mostRecentEntry = entry.entries.sort((a: WeightEntry, b: WeightEntry) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )[0]
      setSelectedEntry(mostRecentEntry)
    } else {
      setSelectedEntry(entry as WeightEntry)
    }
    setEditModalOpen(true)
  }

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1))
  }

  const isCurrentMonth = () => {
    const now = new Date()
    return currentMonth.getMonth() === now.getMonth() && currentMonth.getFullYear() === now.getFullYear()
  }

  if (loading) {
    return (
      <div data-testid="weight-entries-table">
        <TableSkeleton 
          title="Weight Entries" 
          rows={5} 
          columns={7} 
          showHeader={true} 
          showPagination={true} 
        />
      </div>
    )
  }

  // Empty states
  if (allEntries.length === 0) {
    return (
      <Card data-testid="weight-entries-table">
        <CardHeader>
          {/* Header with Add Weight Button - Consistent with other states */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Weight Entries</CardTitle>
            </div>
            <AddWeightDialog
              onSuccess={fetchEntries}
              trigger={
                <Button variant="secondary" size="sm" data-testid="add-weight-from-table">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Weight
                </Button>
              }
            />
          </div>
          <CardDescription>Your weight tracking journey starts here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">!</span>
              </div>
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold text-lg">Start Your Journey</h3>
              <p className="text-muted-foreground max-w-md">
                {!activeGoal
                  ? "Set a weight goal and add your first weight entry to begin tracking your progress."
                  : "Add your first weight entry to start tracking your progress towards your goal."
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (processedEntries.length === 0) {
    return (
      <Card data-testid="weight-entries-table">
        <CardHeader>
          {/* Header with Add Weight Button - Consistent with main layout */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Weight Entries</CardTitle>
            </div>
            <AddWeightDialog
              onSuccess={fetchEntries}
              trigger={
                <Button variant="secondary" size="sm" data-testid="add-weight-from-table">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Weight
                </Button>
              }
            />
          </div>

          {/* Month Navigation - Consistent with main layout */}
          <div className="flex items-center justify-center space-x-2 pt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousMonth}
              data-testid="previous-month"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-[140px] text-center" data-testid="current-month">
              <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextMonth}
              disabled={isCurrentMonth()}
              data-testid="next-month"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Frown className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-semibold">No Entries This Month</h3>
              <p className="text-muted-foreground">
                No weight entries found for {format(currentMonth, 'MMMM yyyy')}.
                {isCurrentMonth() ? ' Start logging your weight to track progress!' : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card data-testid="weight-entries-table">
      <CardHeader>
        {/* Header with Add Weight Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>Weight Entries</CardTitle>
          </div>
          <AddWeightDialog
            onSuccess={fetchEntries}
            trigger={
              <Button variant="secondary" size="sm" data-testid="add-weight-from-table">
                <Plus className="h-4 w-4 mr-2" />
                Add Weight
              </Button>
            }
          />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center space-x-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousMonth}
            data-testid="previous-month"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[140px] text-center" data-testid="current-month">
            <span className="font-medium">{format(currentMonth, 'MMMM yyyy')}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextMonth}
            disabled={isCurrentMonth()}
            data-testid="next-month"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        
        {/* Simplified Monthly Summary - Consistent Layout */}
        <div className="mt-4 space-y-4" data-testid="monthly-statistics">
          {processedEntries.length > 0 ? (
            <>
              {/* Data Available - Show Summary Cards */}
              <div className="grid grid-cols-3 gap-2 md:gap-4">
                {/* Average Card */}
                <div className="bg-background rounded-lg border p-3 md:p-4 space-y-1 md:space-y-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs md:text-sm text-muted-foreground">Average</span>
                  </div>
                  <p className="text-lg md:text-2xl font-semibold">{monthlyStats.weeklyAverage}kg</p>
                </div>

                {/* Progress Card */}
                <div className="bg-background rounded-lg border p-3 md:p-4 space-y-1 md:space-y-2">
                  <div className="flex items-center gap-1 md:gap-2">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-xs md:text-sm text-muted-foreground">Progress</span>
                  </div>
                  <p className="text-lg md:text-2xl font-semibold">
                    {monthlyStats.totalChange > 0 ? '+' : ''}{monthlyStats.totalChange ? monthlyStats.totalChange : '0'}kg
                  </p>
                </div>

                {/* Best Day Card */}
                {monthlyStats.bestDay ? (
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-3 md:p-4 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-1 md:gap-2">
                      <TrendingDown className="h-3 md:h-4 w-3 md:w-4 text-green-600" />
                      <span className="text-xs md:text-sm text-green-600 dark:text-green-400">Best Day</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-lg md:text-2xl font-semibold text-green-700 dark:text-green-300">
                        -{monthlyStats.bestDay.loss}kg
                      </p>
                      <p className="text-xs md:text-sm text-green-600 dark:text-green-400">
                        {format(new Date(monthlyStats.bestDay.date), 'MMM dd')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3 md:p-4 space-y-1 md:space-y-2">
                    <div className="flex items-center gap-1 md:gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-xs md:text-sm text-blue-600 dark:text-blue-400">Consistency</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm md:text-lg font-semibold text-blue-700 dark:text-blue-300">Great!</p>
                      <p className="text-xs md:text-sm text-blue-600 dark:text-blue-400">Steady progress</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional goal progress - only if significant */}
              {activeGoal && monthlyStats.goalAchieved && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 p-3">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-green-600" />
                    <p className="text-sm font-medium text-green-700 dark:text-green-300">
                      🎉 Goal Achieved! Reached {activeGoal.target_weight}kg
                    </p>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* No Data - Reserve Same Space */
            <div className="h-[108px]" />
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Weight</TableHead>
              {!isMobile && (
                <>
                  <TableHead>Daily Change</TableHead>
                  <TableHead>7-Day Trend</TableHead>
                  {activeGoal && <TableHead>To Goal</TableHead>}
                  <TableHead>Memo</TableHead>
                </>
              )}
              {isMobile && <TableHead>Change</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedEntries.map((entry) => (
              <TableRow 
                key={entry.id} 
                data-testid="weight-entry-row"
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => handleRowClick(entry)}
              >
                <TableCell>
                  <div>
                    <div className="font-medium">
                      {format(new Date(entry.date), 'MMM dd')}
                    </div>
                    {isMobile && entry.isAveraged && (
                      <div className="text-xs text-amber-600">
                        Avg of {entry.entryCount}
                      </div>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="font-semibold">
                    {entry.weight}kg
                    {!isMobile && entry.isAveraged && (
                      <span className="text-amber-600 ml-1 text-xs" title={`Average of ${entry.entryCount} entries`}>*</span>
                    )}
                  </div>
                </TableCell>
                
                {!isMobile && (
                  <>
                    <TableCell>
                      {entry.dailyChange !== undefined ? (
                        <div className={`flex items-center space-x-1 ${
                          entry.dailyChange < 0 ? 'text-green-600' : 
                          entry.dailyChange > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <span className="font-medium">
                            {entry.dailyChange >= 0 ? '+' : ''}{entry.dailyChange}kg
                          </span>
                          {entry.dailyChangePercent !== undefined && (
                            <span className="text-xs">({entry.dailyChangePercent >= 0 ? '+' : ''}{entry.dailyChangePercent}%)</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      {entry.sevenDayAverage !== undefined ? (
                        <span className="font-medium text-sm">
                          {entry.sevenDayAverage}kg
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    
                    {activeGoal && (
                      <TableCell>
                        {entry.remainingToGoal !== undefined ? (
                          <div className={`font-medium ${
                            entry.remainingToGoal === 0 ? 'text-green-600' : 'text-amber-600'
                          }`}>
                            {entry.remainingToGoal === 0 ? '🎯 Achieved!' : `${entry.remainingToGoal}kg`}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                    )}
                    
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {entry.memo || '-'}
                    </TableCell>
                  </>
                )}
                
                {isMobile && (
                  <TableCell>
                    {entry.sevenDayAverage !== undefined ? (
                      <span className="text-sm font-medium">
                        {entry.sevenDayAverage}kg
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      
      {selectedEntry && (
        <EditWeightDialog
          open={editModalOpen}
          onOpenChange={(open) => {
            setEditModalOpen(open)
            if (!open) {
              setSelectedEntry(null)
            }
          }}
          entry={selectedEntry}
          onSuccess={() => {
            fetchEntries()
          }}
        />
      )}
    </Card>
  )
})

WeightEntriesTable.displayName = 'WeightEntriesTable'