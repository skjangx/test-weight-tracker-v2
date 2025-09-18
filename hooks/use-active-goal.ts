'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { supabase } from '@/lib/supabase/client'
import type { Goal } from '@/lib/schemas/goal'

interface UseActiveGoalResult {
  activeGoal: Goal | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
}

/**
 * Hook to fetch and manage the user's active weight loss goal
 */
export function useActiveGoal(): UseActiveGoalResult {
  const { user } = useAuth()
  const [activeGoal, setActiveGoal] = useState<Goal | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch active goal from Supabase
  const fetchActiveGoal = async () => {
    if (!user) {
      setActiveGoal(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)

      if (fetchError) {
        throw fetchError
      }

      setActiveGoal(data && data.length > 0 ? data[0] : null)
    } catch (err) {
      console.error('Error fetching active goal:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch active goal')
      setActiveGoal(null)
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchActiveGoal()
  }, [user])

  // Listen for goal changes
  useEffect(() => {
    if (!user) return

    const handleGoalChange = () => {
      fetchActiveGoal()
    }

    // Listen for custom events from goal management components
    window.addEventListener('goalCreated', handleGoalChange)
    window.addEventListener('goalUpdated', handleGoalChange)
    window.addEventListener('goalDeactivated', handleGoalChange)

    return () => {
      window.removeEventListener('goalCreated', handleGoalChange)
      window.removeEventListener('goalUpdated', handleGoalChange)
      window.removeEventListener('goalDeactivated', handleGoalChange)
    }
  }, [user])

  return {
    activeGoal,
    loading,
    error,
    refresh: fetchActiveGoal
  }
}

/**
 * Hook to calculate goal progress based on current weight
 */
export function useGoalProgress(currentWeight?: number) {
  const { activeGoal } = useActiveGoal()

  if (!activeGoal || !currentWeight) {
    return {
      progress: 0,
      remainingWeight: 0,
      isCompleted: false,
      daysRemaining: 0
    }
  }

  // Calculate progress (assuming starting weight is higher than target)
  const startingWeight = activeGoal.starting_weight || currentWeight
  const targetWeight = activeGoal.target_weight
  const totalWeightToLose = startingWeight - targetWeight
  const weightLost = startingWeight - currentWeight
  const remainingWeight = currentWeight - targetWeight
  
  const progress = Math.max(0, Math.min(100, (weightLost / totalWeightToLose) * 100))
  const isCompleted = currentWeight <= targetWeight

  // Calculate days remaining
  const today = new Date()
  const deadline = new Date(activeGoal.deadline)
  const daysRemaining = Math.max(0, Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

  return {
    progress: Number(progress.toFixed(1)),
    remainingWeight: Number(Math.max(0, remainingWeight).toFixed(1)),
    isCompleted,
    daysRemaining
  }
}