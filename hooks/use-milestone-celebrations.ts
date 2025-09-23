'use client'

import { useEffect, useRef } from 'react'
import { type ChartDataPoint } from '@/lib/utils/chart-helpers'

interface UseMilestoneCelebrationsProps {
  chartData: ChartDataPoint[]
  enabled?: boolean
}

/**
 * Hook to manage milestone celebrations with confetti and toast notifications
 */
export function useMilestoneCelebrations({ 
  chartData, 
  enabled = true 
}: UseMilestoneCelebrationsProps) {
  const celebratedMilestonesRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Milestone functionality has been removed
    // This hook is now a no-op but kept for backwards compatibility
    return
  }, [chartData, enabled])

  // Function to manually trigger celebration (for testing or replay)
  const triggerCelebration = () => {
    // Milestone functionality has been removed
    // This function is now a no-op but kept for backwards compatibility
    return
  }

  // Function to reset celebrated milestones (for testing)
  const resetCelebrations = () => {
    celebratedMilestonesRef.current.clear()
  }

  return {
    triggerCelebration,
    resetCelebrations,
    celebratedCount: celebratedMilestonesRef.current.size
  }
}