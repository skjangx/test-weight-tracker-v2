"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Target, Calendar, TrendingDown, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { format, differenceInDays } from 'date-fns'
import { GoalUpdateModal } from './goal-update-modal'

interface Goal {
  id: string
  target_weight: number
  deadline: string
  is_active: boolean
  created_at: string
}

export function ActiveGoalDisplay() {
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchActiveGoal = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
          console.error('Error fetching active goal:', error)
          return
        }

        setActiveGoal(data)
      } catch (error) {
        console.error('Error fetching active goal:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchActiveGoal()

    // Listen for goal creation and update events from the modals
    const handleGoalCreated = () => {
      console.log('Goal creation event received, refreshing active goal')
      fetchActiveGoal()
    }
    
    const handleGoalUpdated = () => {
      console.log('Goal update event received, refreshing active goal')
      fetchActiveGoal()
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
          fetchActiveGoal()
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
                <p className={`text-sm ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
                  {isOverdue 
                    ? `${Math.abs(daysRemaining)} days overdue`
                    : `${daysRemaining} days remaining`
                  }
                </p>
              </div>
            </div>
          </div>

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