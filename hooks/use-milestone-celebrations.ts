'use client'

import { useEffect, useRef } from 'react'
import { showMilestoneToast } from '@/lib/utils/toast'
import { triggerMilestoneConfetti } from '@/lib/utils/confetti'
import { type ChartDataPoint } from '@/lib/utils/chart-helpers'

/**
 * Get milestone celebration message
 */
function getMilestoneMessage(milestoneNumber: number, kgLost: number): string {
  const messages = [
    `🎉 Congratulations! You've lost ${kgLost.toFixed(1)}kg!`,
    `🌟 Amazing progress! ${kgLost.toFixed(1)}kg down!`,
    `🚀 Fantastic work! You've achieved ${kgLost.toFixed(1)}kg weight loss!`,
    `💪 Incredible! ${kgLost.toFixed(1)}kg milestone reached!`,
    `🏆 Outstanding! You've lost ${kgLost.toFixed(1)}kg!`
  ]

  return messages[milestoneNumber % messages.length] || messages[0]
}

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
  const triggerCelebration = (milestoneData: { milestoneNumber: number; kgLost: number; date: string }) => {
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