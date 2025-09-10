"use client"

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

interface DashboardStats {
  weightEntries: number
  activeGoals: number
  dayStreak: number
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    weightEntries: 0,
    activeGoals: 0,
    dayStreak: 0
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        // Fetch weight entries count
        const { count: weightEntriesCount } = await supabase
          .from('weight_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        // Fetch active goals count
        const { count: activeGoalsCount } = await supabase
          .from('goals')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('is_active', true)

        // Fetch current streak (simplified - just get latest active streak)
        const { data: streakData } = await supabase
          .from('streaks')
          .select('current_count')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .single()

        const newStats = {
          weightEntries: weightEntriesCount || 0,
          activeGoals: activeGoalsCount || 0,
          dayStreak: streakData?.current_count || 0
        }
        
        console.log('Dashboard stats updated:', newStats)
        setStats(newStats)
      } catch (error) {
        console.error('Error fetching dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Listen for manual stats refresh events
    const handleStatsRefresh = () => {
      console.log('Stats refresh event received, refetching stats')
      fetchStats()
    }
    
    window.addEventListener('statsRefresh', handleStatsRefresh)

    // Set up real-time subscriptions for stats updates
    const channels = [
      supabase
        .channel('weight_entries_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'weight_entries',
            filter: `user_id=eq.${user?.id}` 
          }, 
          fetchStats
        )
        .subscribe(),

      supabase
        .channel('goals_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'goals',
            filter: `user_id=eq.${user?.id}` 
          }, 
          fetchStats
        )
        .subscribe(),

      supabase
        .channel('streaks_changes')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'streaks',
            filter: `user_id=eq.${user?.id}` 
          }, 
          fetchStats
        )
        .subscribe()
    ]

    return () => {
      window.removeEventListener('statsRefresh', handleStatsRefresh)
      channels.forEach(channel => supabase.removeChannel(channel))
    }
  }, [user])

  return { stats, loading }
}