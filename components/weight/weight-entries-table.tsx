'use client'

import { useEffect, useState, forwardRef, useImperativeHandle, useCallback, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, subMonths, addMonths, differenceInCalendarDays, isWithinInterval } from 'date-fns'
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
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { TableSkeleton } from '@/components/skeletons/table-skeleton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { useActiveGoal } from '@/hooks/use-active-goal'
import type { WeightEntry } from '@/lib/schemas/weight-entry'
import { EditWeightDialog } from './edit-weight-dialog'
import { AddWeightDialog } from './add-weight-dialog'
import { ChevronLeft, ChevronRight, TrendingDown, TrendingUp, Calendar, Trophy, Target, Zap, Frown, Plus } from 'lucide-react'

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
  movingAvgChange?: number
  movingAvgChangePercent?: number
  remainingToGoal?: number
}

interface MonthlyStats {
  weeklyAverage: number
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
          memos: [entry.memo].filter(Boolean),
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
    }, {} as Record<string, any>)

    // Convert to processed entries with calculations
    const processed: ProcessedEntry[] = Object.values(groupedEntries).map((group: any) => {
      const avgWeight = Math.round((group.weights.reduce((sum: number, w: number) => sum + w, 0) / group.weights.length) * 100) / 100
      const isAveraged = group.weights.length > 1
      
      return {
        ...group,
        weight: avgWeight,
        isAveraged,
        entryCount: group.weights.length,
        memo: isAveraged 
          ? `Average of ${group.weights.length} entries (${group.weights.join(', ')} kg)${group.memos.length > 0 ? '; ' + group.memos.join('; ') : ''}`
          : group.memos.join('; ') || null
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
      
      // Calculate 7-day moving average change
      if (i >= 6) {
        const recentWeights = processed.slice(i - 6, i + 1).map(e => e.weight)
        const olderWeights = processed.slice(i, i + 7).map(e => e.weight).filter(w => w !== undefined)
        
        if (olderWeights.length >= 7) {
          const recentAvg = recentWeights.reduce((sum, w) => sum + w, 0) / recentWeights.length
          const olderAvg = olderWeights.reduce((sum, w) => sum + w, 0) / olderWeights.length
          const avgChange = recentAvg - olderAvg
          
          current.movingAvgChange = Math.round(avgChange * 100) / 100
          current.movingAvgChangePercent = Math.round((avgChange / olderAvg) * 10000) / 100
        }
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
        bestDay: null,
        worstDay: null,
        goalAchieved: false,
        goalProgress: 0
      }
    }

    // Weekly average for the month
    const totalWeight = processedEntries.reduce((sum, entry) => sum + entry.weight, 0)
    const weeklyAverage = Math.round((totalWeight / processedEntries.length) * 100) / 100

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
      const currentWeight = processedEntries[0].weight
      goalAchieved = currentWeight <= activeGoal.target_weight
      const startWeight = processedEntries[processedEntries.length - 1].weight
      const totalToLose = startWeight - activeGoal.target_weight
      const weightLost = startWeight - currentWeight
      goalProgress = totalToLose > 0 ? Math.round((weightLost / totalToLose) * 10000) / 100 : 0
    }

    return {
      weeklyAverage,
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
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weight Entries</span>
          </CardTitle>
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
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>Weight Entries</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreviousMonth}
                data-testid="previous-month"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="min-w-[140px] text-center">
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
          </div>
          <CardDescription>
            No entries for {format(currentMonth, 'MMMM yyyy')}
          </CardDescription>
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
              <Button size="sm" data-testid="add-weight-from-table">
                <Plus className="h-4 w-4 mr-2" />
                Add Weight Entry
              </Button>
            }
          />
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center space-x-2 pt-2">
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
        
        <CardDescription>
          {format(currentMonth, 'MMMM yyyy')} weight tracking history
        </CardDescription>
        
        {/* Monthly Statistics Header */}
        {processedEntries.length > 0 && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg space-y-3" data-testid="monthly-statistics">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-sm">Monthly Summary</h4>
              {monthlyStats.goalAchieved && (
                <Badge variant="default" className="bg-green-500 text-white">
                  <Trophy className="h-3 w-3 mr-1" />
                  Goal Achieved! 🎉
                </Badge>
              )}
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2" data-testid="average-weight">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">{monthlyStats.weeklyAverage}kg</p>
                  <p className="text-muted-foreground text-xs">Monthly Average</p>
                </div>
              </div>
              
              {monthlyStats.bestDay && (
                <div className="flex items-center space-x-2" data-testid="best-day">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">-{monthlyStats.bestDay.loss}kg</p>
                    <p className="text-muted-foreground text-xs">
                      Best Day ({format(new Date(monthlyStats.bestDay.date), 'MMM dd')})
                    </p>
                  </div>
                </div>
              )}
              
              {monthlyStats.worstDay && (
                <div className="flex items-center space-x-2" data-testid="worst-day">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium">+{monthlyStats.worstDay.gain}kg</p>
                    <p className="text-muted-foreground text-xs">
                      Worst Day ({format(new Date(monthlyStats.worstDay.date), 'MMM dd')})
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {activeGoal && monthlyStats.goalProgress > 0 && (
              <div className="pt-2 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  {monthlyStats.goalAchieved 
                    ? `🎉 Congratulations! You've reached your target weight of ${activeGoal.target_weight}kg!`
                    : `Progress: ${monthlyStats.goalProgress}% towards your ${activeGoal.target_weight}kg goal`
                  }
                </p>
              </div>
            )}
          </div>
        )}
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
                      {format(new Date(entry.date), isMobile ? 'MMM dd' : 'MMM dd, yyyy')}
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
                      {entry.movingAvgChange !== undefined ? (
                        <div className={`flex items-center space-x-1 ${
                          entry.movingAvgChange < 0 ? 'text-green-600' : 
                          entry.movingAvgChange > 0 ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          <Zap className="h-3 w-3" />
                          <span className="font-medium text-xs">
                            {entry.movingAvgChange >= 0 ? '+' : ''}{entry.movingAvgChange}kg
                          </span>
                          {entry.movingAvgChangePercent !== undefined && (
                            <span className="text-xs">({entry.movingAvgChangePercent >= 0 ? '+' : ''}{entry.movingAvgChangePercent}%)</span>
                          )}
                        </div>
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
                    {entry.movingAvgChange !== undefined ? (
                      <div className={`text-sm font-medium ${
                        entry.movingAvgChange < 0 ? 'text-green-600' : 
                        entry.movingAvgChange > 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {entry.movingAvgChange >= 0 ? '+' : ''}{entry.movingAvgChange}kg
                        {entry.movingAvgChangePercent !== undefined && (
                          <div className="text-xs">{entry.movingAvgChangePercent >= 0 ? '+' : ''}{entry.movingAvgChangePercent}%</div>
                        )}
                      </div>
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