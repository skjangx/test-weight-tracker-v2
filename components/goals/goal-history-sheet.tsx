"use client"

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { Target, Calendar, Trash2 } from 'lucide-react'

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { toast } from 'sonner'

interface Goal {
  id: string
  target_weight: number
  deadline: string
  is_active: boolean
  created_at: string
}

interface GoalHistorySheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function GoalHistorySheet({ open, onOpenChange }: GoalHistorySheetProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)
  const [deleting, setDeleting] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchGoals = async () => {
      if (!user || !open) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching goals:', error)
          return
        }

        setGoals(data || [])
      } catch (error) {
        console.error('Error fetching goals:', error)
      } finally {
        setLoading(false)
      }
    }

    if (open) {
      fetchGoals()
    }

    // Listen for goal updates
    const handleGoalUpdated = () => {
      console.log('Goal update detected, refreshing goal history')
      fetchGoals()
    }

    const handleGoalCreated = () => {
      console.log('Goal creation detected, refreshing goal history')
      fetchGoals()
    }

    window.addEventListener('goalUpdated', handleGoalUpdated)
    window.addEventListener('goalCreated', handleGoalCreated)

    return () => {
      window.removeEventListener('goalUpdated', handleGoalUpdated)
      window.removeEventListener('goalCreated', handleGoalCreated)
    }
  }, [user, open])

  const handleDeleteGoal = (goal: Goal) => {
    setGoalToDelete(goal)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteGoal = async () => {
    if (!goalToDelete || !user) return

    setDeleting(true)
    try {
      // Optimistic update - remove from UI immediately
      setGoals(prev => prev.filter(g => g.id !== goalToDelete.id))

      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', goalToDelete.id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Error deleting goal:', error)
        // Rollback optimistic update
        const { data } = await supabase
          .from('goals')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        setGoals(data || [])
        toast.error('Failed to delete goal')
        return
      }

      toast.success('Goal deleted successfully')

    } catch (error) {
      console.error('Error deleting goal:', error)
      // Rollback optimistic update on network error
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      setGoals(data || [])
      toast.error('Failed to delete goal')
    } finally {
      setDeleting(false)
      setDeleteDialogOpen(false)
      setGoalToDelete(null)
    }
  }

  const renderGoalList = () => {
    if (loading) {
      return (
        <div className="space-y-3" data-testid="goal-history-loading">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-6 border rounded-xl bg-card hover:bg-accent/5 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      )
    }

    if (goals.length === 0) {
      return (
        <div className="text-center py-12 px-4">
          <div className="max-w-sm mx-auto">
            <Target className="mx-auto h-16 w-16 text-muted-foreground/60 mb-6" />
            <h3 className="text-xl font-semibold mb-3">No Goals Yet</h3>
            <p className="text-muted-foreground leading-relaxed mb-6">
              You haven&apos;t created any weight goals yet. Start your journey by setting your first goal and tracking your progress!
            </p>
            <Button 
              onClick={() => onOpenChange(false)}
              className="w-full sm:w-auto"
            >
              Close & Create Goal
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-3" data-testid="goal-history-list">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-6 border rounded-xl bg-card hover:bg-accent/5 transition-colors group"
            data-testid="goal-item"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Target className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <div className="font-semibold text-lg">{goal.target_weight}kg</div>
                  <div className="text-sm text-muted-foreground">Target Weight</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {goal.is_active ? (
                  <Badge variant="default" data-testid="active-goal-badge" className="bg-green-100 text-green-800 border-green-200">
                    Active
                  </Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal)}
                    data-testid="delete-goal-button"
                    data-active="false"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Deadline:</span>
                <span>{format(new Date(goal.deadline), 'MMM dd, yyyy')}</span>
              </div>
              
              <div className="text-xs text-muted-foreground pt-2 border-t">
                Created on {format(new Date(goal.created_at), 'MMM dd, yyyy')}
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="w-[400px] sm:w-[540px] flex flex-col" 
        data-testid="goal-history-panel"
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-2 text-xl">
            <Target className="h-6 w-6" />
            <span>Goal History</span>
          </SheetTitle>
          <SheetDescription className="text-base">
            View all your weight goals, both active and completed ones.
          </SheetDescription>
        </SheetHeader>
        
        <div className="flex-1 overflow-y-auto">
          <div className="px-6">
            {renderGoalList()}
          </div>
        </div>
      </SheetContent>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="delete-confirmation">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteGoal}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Sheet>
  )
}