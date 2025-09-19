"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Calendar, TrendingDown, Pencil, Trophy, History, Plus } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { format, differenceInDays, subDays } from 'date-fns'
import { GoalUpdateModal } from './goal-update-modal'
import { GoalCreationModal } from './goal-creation-modal'
import { GoalHistorySheet } from './goal-history-sheet'

interface Goal {
  id: string
  target_weight: number
  deadline: string
  is_active: boolean
  created_at: string
}

interface WeightEntry {
  id: string
  weight: number
  date: string
  created_at: string
}

export function ActiveGoalDisplay() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [historyModalOpen, setHistoryModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch active goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (goalError && goalError.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error fetching active goal:', goalError)
          return
        }

        setActiveGoal(goalData)

        if (goalData) {
          // Fetch weight entries
          const { data: entriesData, error: entriesError } = await supabase
            .from('weight_entries')
            .select('id, weight, date, created_at')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })

          if (entriesError) {
            console.error('Error fetching weight entries:', entriesError)
          } else {
            setWeightEntries(entriesData || [])
          }

        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for goal creation and update events from the modals
    const handleGoalCreated = () => {
      console.log('Goal creation event received, refreshing data')
      fetchData()
    }
    
    const handleGoalUpdated = () => {
      console.log('Goal update event received, refreshing data')
      fetchData()
    }

    const handleWeightEntryCreated = () => {
      console.log('Weight entry event received, refreshing data')
      fetchData()
    }
    
    const handleWeightEntryUpdated = () => {
      console.log('Weight entry updated event received, refreshing data')
      fetchData()
    }
    
    window.addEventListener('goalCreated', handleGoalCreated)
    window.addEventListener('goalUpdated', handleGoalUpdated)
    window.addEventListener('weightEntryCreated', handleWeightEntryCreated)
    window.addEventListener('weightEntryUpdated', handleWeightEntryUpdated)

    // Set up real-time subscriptions for goal and weight entry changes
    const goalsChannel = supabase
      .channel('goals_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'goals',
          filter: `user_id=eq.${user?.id}` 
        }, 
        (payload) => {
          console.log('Goals real-time change detected:', payload)
          fetchData()
        }
      )
      .subscribe()

    const weightEntriesChannel = supabase
      .channel('weight_entries_changes_for_goals')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'weight_entries',
          filter: `user_id=eq.${user?.id}` 
        }, 
        (payload) => {
          console.log('Weight entries real-time change detected:', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('goalCreated', handleGoalCreated)
      window.removeEventListener('goalUpdated', handleGoalUpdated)
      window.removeEventListener('weightEntryCreated', handleWeightEntryCreated)
      window.removeEventListener('weightEntryUpdated', handleWeightEntryUpdated)
      supabase.removeChannel(goalsChannel)
      supabase.removeChannel(weightEntriesChannel)
    }
  }, [user])

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Current Goal</span>
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-6 w-16" />
            </div>
          </CardTitle>
          <CardDescription>
            Your active weight goal and progress tracking
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5" />
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-32 mb-1" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-4 w-4" />
                  <div>
                    <Skeleton className="h-3 w-20 mb-1" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="pt-4 border-t">
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!activeGoal) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-muted-foreground" />
            <span>No Active Goal</span>
          </CardTitle>
          <CardDescription>
            Set a weight goal to start tracking your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Create your first goal to begin your weight management journey!
            </p>

            {/* Action Buttons */}
            <div className="flex flex-row gap-2 pt-4">
              <GoalCreationModal
                trigger={
                  <Button className="flex-1 h-11" size="default">
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden xs:inline">Set Your First Goal</span>
                    <span className="xs:hidden">Set Goal</span>
                  </Button>
                }
              />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setHistoryModalOpen(true)}
                className="flex-1"
              >
                <History className="h-4 w-4 mr-2" />
                <span className="hidden xs:inline">View History</span>
                <span className="xs:hidden">History</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const daysRemaining = differenceInDays(new Date(activeGoal.deadline), new Date())
  const isOverdue = daysRemaining < 0

  // Progress calculations - apply same averaging logic as weight entries table
  const getCurrentWeight = () => {
    if (weightEntries.length === 0) return null
    
    // Group entries by date and get the most recent date's average
    const groupedByDate = weightEntries.reduce((acc, entry) => {
      const date = entry.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry.weight)
      return acc
    }, {} as Record<string, number[]>)
    
    // Get the most recent date (first key since entries are ordered by date DESC)
    const dates = Object.keys(groupedByDate).sort().reverse()
    if (dates.length === 0) return null
    
    const mostRecentDateWeights = groupedByDate[dates[0]]
    const average = mostRecentDateWeights.reduce((sum, weight) => sum + weight, 0) / mostRecentDateWeights.length
    return Math.round(average * 100) / 100
  }
  
  const currentWeight = getCurrentWeight()
  const weightToLose = currentWeight ? Math.max(0, currentWeight - activeGoal.target_weight) : 0
  
  // Calculate 7-day weight trend for projection
  const getLast7DaysEntries = () => {
    const sevenDaysAgo = subDays(new Date(), 7)
    return weightEntries.filter(entry => 
      new Date(entry.date) >= sevenDaysAgo
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }
  
  const calculateProjectedDate = () => {
    if (!currentWeight || weightEntries.length < 2) return null
    
    const last7Days = getLast7DaysEntries()
    if (last7Days.length < 2) return null
    
    const oldestEntry = last7Days[0]
    const newestEntry = last7Days[last7Days.length - 1]
    const daysDiff = differenceInDays(new Date(newestEntry.date), new Date(oldestEntry.date))
    
    if (daysDiff === 0) return null
    
    const weightLossRate = (oldestEntry.weight - newestEntry.weight) / daysDiff // kg per day
    
    if (weightLossRate <= 0) return "At current rate, goal may not be achievable"
    
    const daysToGoal = weightToLose / weightLossRate
    const projectedDate = new Date()
    projectedDate.setDate(projectedDate.getDate() + daysToGoal)
    
    return format(projectedDate, 'yyyy-MM-dd')
  }
  
  // Determine progress status
  const getProgressStatus = () => {
    if (!currentWeight || daysRemaining <= 0) return { status: 'red', label: 'Behind Schedule' }
    
    const projectedDate = calculateProjectedDate()
    if (!projectedDate || typeof projectedDate === 'string') return { status: 'yellow', label: 'On Track' }
    
    const projectedDays = differenceInDays(new Date(projectedDate), new Date())
    
    if (projectedDays < daysRemaining - 7) return { status: 'green', label: 'Ahead of Schedule' }
    if (projectedDays <= daysRemaining + 7) return { status: 'yellow', label: 'On Track' }
    return { status: 'red', label: 'Behind Schedule' }
  }
  
  const progressStatus = getProgressStatus()
  const isGoalAchieved = currentWeight && currentWeight <= activeGoal.target_weight



  return (
    <Card className="lg:col-span-2" data-testid="active-goal">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Current Goal</span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className="bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900 dark:text-green-300 border-green-300 dark:border-green-700">
              Active
            </Badge>
          </div>
        </CardTitle>
        <CardDescription>
          Your active weight goal and progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="flex-shrink-0 mt-1">
                <TrendingDown className="h-4 md:h-5 w-4 md:w-5 text-green-500" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium">Target Weight</p>
                <p className="text-xl md:text-2xl font-bold" data-testid="goal-target">
                  {activeGoal.target_weight}kg
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-2 md:space-x-3">
              <div className="flex-shrink-0 mt-1">
                <Calendar className="h-4 md:h-5 w-4 md:w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium">Deadline</p>
                <p className="text-sm md:text-lg font-semibold">
                  {format(new Date(activeGoal.deadline), 'MMM dd, yyyy')}
                </p>
                <p className={`text-xs md:text-sm ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} data-testid="days-remaining">
                  {isOverdue
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days remaining`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Goal Achievement Banner */}
          {isGoalAchieved && (
            <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg" data-testid="goal-achieved">
              <div className="flex items-center space-x-2">
                <Trophy className="h-5 w-5 text-green-600" />
                <p className="text-green-800 dark:text-green-200 font-semibold">Goal Achieved! 🎉</p>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                Congratulations on reaching your target weight of {activeGoal.target_weight}kg!
              </p>
            </div>
          )}

          {/* Progress Details */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Weight to Lose */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Weight to Lose</p>
                <p className="text-sm font-semibold" data-testid="weight-to-lose">
                  {!currentWeight
                    ? 'Add weight entries to track progress'
                    : weightToLose > 0
                      ? `${weightToLose.toFixed(1)} kg to go`
                      : 'Goal achieved!'
                  }
                </p>
              </div>
            </div>

            {/* Progress Status */}
            <div className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-3 h-3 rounded-full progress-${progressStatus.status}`}
                   style={{
                     backgroundColor: progressStatus.status === 'green' ? '#10b981' :
                                    progressStatus.status === 'yellow' ? '#f59e0b' : '#ef4444'
                   }}
                   data-testid="progress-indicator"
              />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Progress</p>
                <p className="text-sm font-medium" data-testid="progress-value">{progressStatus.label}</p>
              </div>
            </div>

          </div>


          {/* Action Buttons */}
          <div className="flex flex-row gap-2 pt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setEditModalOpen(true)}
              className="flex-1 justify-center"
              data-testid="update-goal-button"
            >
              <Pencil className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Update Goal</span>
              <span className="xs:hidden">Update</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHistoryModalOpen(true)}
              className="flex-1"
              data-testid="goal-history-button"
            >
              <History className="h-4 w-4 mr-2" />
              <span className="hidden xs:inline">Goal History</span>
              <span className="xs:hidden">History</span>
            </Button>
          </div>

          <div className="pt-3">
            <p className="text-xs text-muted-foreground">
              Goal created on {format(new Date(activeGoal.created_at), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      </CardContent>
      
      <GoalUpdateModal
        goal={activeGoal}
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
      />

      <GoalHistorySheet
        open={historyModalOpen}
        onOpenChange={setHistoryModalOpen}
      />
    </Card>
  )
}

// Projection banner component to be used outside the card
export function ProjectionBanner() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      try {
        // Fetch active goal
        const { data: goalData, error: goalError } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (goalError && goalError.code !== 'PGRST116') {
          console.error('Error fetching active goal:', goalError)
          return
        }

        setActiveGoal(goalData)

        if (goalData) {
          // Fetch weight entries
          const { data: entriesData, error: entriesError } = await supabase
            .from('weight_entries')
            .select('id, weight, date, created_at')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false })

          if (entriesError) {
            console.error('Error fetching weight entries:', entriesError)
          } else {
            setWeightEntries(entriesData || [])
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Listen for goal creation and update events
    const handleGoalUpdated = () => {
      console.log('Goal update event received in ProjectionBanner, refreshing data')
      fetchData()
    }

    const handleWeightEntryUpdated = () => {
      console.log('Weight entry updated event received in ProjectionBanner, refreshing data')
      fetchData()
    }

    window.addEventListener('goalCreated', handleGoalUpdated)
    window.addEventListener('goalUpdated', handleGoalUpdated)
    window.addEventListener('weightEntryCreated', handleWeightEntryUpdated)
    window.addEventListener('weightEntryUpdated', handleWeightEntryUpdated)

    // Set up real-time subscriptions for goal and weight entry changes
    const goalsChannel = supabase
      .channel('projection_goals_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'goals',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('ProjectionBanner: Goals real-time change detected:', payload)
          fetchData()
        }
      )
      .subscribe()

    const weightEntriesChannel = supabase
      .channel('projection_weight_entries_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'weight_entries',
          filter: `user_id=eq.${user?.id}`
        },
        (payload) => {
          console.log('ProjectionBanner: Weight entries real-time change detected:', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('goalCreated', handleGoalUpdated)
      window.removeEventListener('goalUpdated', handleGoalUpdated)
      window.removeEventListener('weightEntryCreated', handleWeightEntryUpdated)
      window.removeEventListener('weightEntryUpdated', handleWeightEntryUpdated)
      supabase.removeChannel(goalsChannel)
      supabase.removeChannel(weightEntriesChannel)
    }
  }, [user])

  // Calculate current weight
  const getCurrentWeight = () => {
    if (weightEntries.length === 0) return null

    const groupedByDate = weightEntries.reduce((acc, entry) => {
      const date = entry.date
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(entry.weight)
      return acc
    }, {} as Record<string, number[]>)

    const dates = Object.keys(groupedByDate).sort().reverse()
    if (dates.length === 0) return null

    const mostRecentDateWeights = groupedByDate[dates[0]]
    const average = mostRecentDateWeights.reduce((sum, weight) => sum + weight, 0) / mostRecentDateWeights.length
    return Math.round(average * 100) / 100
  }

  const currentWeight = getCurrentWeight()

  if (loading || !activeGoal || !currentWeight || weightEntries.length < 2) return null

  // Same calculation logic as in ActiveGoalDisplay
  const getLast7DaysEntries = () => {
    const sevenDaysAgo = subDays(new Date(), 7)
    return weightEntries.filter(entry =>
      new Date(entry.date) >= sevenDaysAgo
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const calculateProjectedDate = () => {
    const last7Days = getLast7DaysEntries()
    if (last7Days.length < 2) return null

    const oldestEntry = last7Days[0]
    const newestEntry = last7Days[last7Days.length - 1]
    const daysDiff = differenceInDays(new Date(newestEntry.date), new Date(oldestEntry.date))

    if (daysDiff === 0) return null

    const weightLossRate = (oldestEntry.weight - newestEntry.weight) / daysDiff
    if (weightLossRate <= 0) return "At current rate, goal may not be achievable"

    const weightToLose = Math.max(0, currentWeight - activeGoal.target_weight)
    const daysToGoal = weightToLose / weightLossRate
    const projectedDate = new Date()
    projectedDate.setDate(projectedDate.getDate() + daysToGoal)

    return format(projectedDate, 'yyyy-MM-dd')
  }

  const projectedDate = calculateProjectedDate()

  if (!projectedDate || typeof projectedDate !== 'string' || !projectedDate.includes('-')) {
    return null
  }

  return (
    <div className="w-full mb-6 p-3 md:p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
      <div className="flex items-start justify-between gap-3 md:gap-4">
        <div className="flex items-start space-x-2 md:space-x-3 flex-1">
          <Calendar className="h-4 md:h-5 w-4 md:w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-xs md:text-sm font-semibold text-blue-800 dark:text-blue-200 mb-1">
              Projected Goal Date
            </p>
            <p className="text-sm md:text-xl font-bold text-blue-900 dark:text-blue-100 leading-tight">
              {format(new Date(projectedDate), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 md:mb-2">Days to goal</p>
          <p className="text-sm md:text-2xl font-bold text-blue-900 dark:text-blue-100">
            {differenceInDays(new Date(projectedDate), new Date())}
          </p>
        </div>
      </div>
      <div className="mt-2 md:mt-3 pt-2 md:pt-3 border-t border-blue-200/50 dark:border-blue-700/50">
        <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
          Based on your 7-day weight loss trend
        </p>
      </div>
    </div>
  )
}