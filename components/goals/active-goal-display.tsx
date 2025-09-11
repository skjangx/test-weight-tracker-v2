"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Calendar, TrendingDown, Pencil, Flame, Trophy } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { format, differenceInDays, subDays, parseISO } from 'date-fns'
import { GoalUpdateModal } from './goal-update-modal'

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
  const [currentStreak, setCurrentStreak] = useState(0)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
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

          if (entriesError) {
            console.error('Error fetching weight entries:', entriesError)
          } else {
            setWeightEntries(entriesData || [])
          }

          // Fetch current streak
          const { data: streakData, error: streakError } = await supabase
            .from('streaks')
            .select('current_count')
            .eq('user_id', user.id)
            .eq('is_active', true)
            .single()

          if (streakError && streakError.code !== 'PGRST116') {
            console.error('Error fetching streak:', streakError)
          } else {
            setCurrentStreak(streakData?.current_count || 0)
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
    
    window.addEventListener('goalCreated', handleGoalCreated)
    window.addEventListener('goalUpdated', handleGoalUpdated)

    // Set up real-time subscription for goal changes
    const channel = supabase
      .channel('goals_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'goals',
          filter: `user_id=eq.${user?.id}` 
        }, 
        (payload) => {
          console.log('Real-time change detected:', payload)
          fetchData()
        }
      )
      .subscribe()

    return () => {
      window.removeEventListener('goalCreated', handleGoalCreated)
      window.removeEventListener('goalUpdated', handleGoalUpdated)
      supabase.removeChannel(channel)
    }
  }, [user])

  if (loading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-primary" />
            <span>Current Goal</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
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
          <p className="text-sm text-muted-foreground">
            Create your first goal to begin your weight management journey!
          </p>
        </CardContent>
      </Card>
    )
  }

  const daysRemaining = differenceInDays(new Date(activeGoal.deadline), new Date())
  const isOverdue = daysRemaining < 0

  // Progress calculations
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : null
  const startWeight = weightEntries.length > 0 ? weightEntries[weightEntries.length - 1].weight : null
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
  const projectedDate = calculateProjectedDate()
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
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setEditModalOpen(true)}
              data-testid="edit-goal-button"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Badge variant="default">Active</Badge>
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
              <div className="flex-shrink-0">
                <TrendingDown className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Target Weight</p>
                <p className="text-2xl font-bold" data-testid="goal-target">
                  {activeGoal.target_weight}kg
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium">Deadline</p>
                <p className="text-lg font-semibold">
                  {format(new Date(activeGoal.deadline), 'MMM dd, yyyy')}
                </p>
                <p className={`text-sm ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`} data-testid="days-remaining">
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            {/* Weight to Lose */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <TrendingDown className="h-4 w-4 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Weight to Lose</p>
                <p className="text-lg font-semibold" data-testid="weight-to-lose">
                  {weightToLose > 0 ? `${weightToLose.toFixed(1)} kg to go` : 'Goal achieved!'}
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

            {/* Current Streak */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Flame className="h-4 w-4 text-red-500" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Streak</p>
                <p className="text-sm font-semibold" data-testid="current-streak">
                  🔥 {currentStreak} day streak
                </p>
              </div>
            </div>
          </div>

          {/* Projected Date */}
          {projectedDate && typeof projectedDate === 'string' && projectedDate.includes('-') && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <p className="text-sm text-blue-800 dark:text-blue-200" data-testid="projected-date">
                Projected: {projectedDate}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                Based on your 7-day weight trend
              </p>
            </div>
          )}

          <div className="pt-4 border-t">
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
    </Card>
  )
}