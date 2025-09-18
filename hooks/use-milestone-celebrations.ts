'use client'

import { useEffect, useRef } from 'react'
import { showMilestoneToast } from '@/lib/utils/toast'
import { triggerMilestoneConfetti } from '@/lib/utils/confetti'
import { getMilestoneMessage, type ChartDataPoint } from '@/lib/utils/chart-helpers'

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
    if (!enabled || !chartData.length) return

    // Find new milestones that haven't been celebrated yet
    const newMilestones = chartData.filter(point => 
      point.milestoneData?.isNew && 
      !celebratedMilestonesRef.current.has(`${point.date}-${point.milestoneData.milestoneNumber}`)
    )

    // Celebrate each new milestone
    newMilestones.forEach(point => {
      if (!point.milestoneData) return

      const milestoneKey = `${point.date}-${point.milestoneData.milestoneNumber}`
      
      // Mark as celebrated to prevent duplicate celebrations
      celebratedMilestonesRef.current.add(milestoneKey)

      // Delay celebration slightly to ensure proper rendering
      setTimeout(() => {
        // Trigger confetti animation
        triggerMilestoneConfetti()

        // Show toast notification
        const message = getMilestoneMessage(
          point.milestoneData!.milestoneNumber, 
          point.milestoneData!.kgLost
        )

        showMilestoneToast(message, `Milestone achieved on ${point.displayDate}`)
      }, 100)
    })
  }, [chartData, enabled])

  // Function to manually trigger celebration (for testing or replay)
  const triggerCelebration = (milestoneData: { milestoneNumber: number; kgLost: number; date: string }) => {
    triggerMilestoneConfetti()
    
    const message = getMilestoneMessage(milestoneData.milestoneNumber, milestoneData.kgLost)
    showMilestoneToast(message, `Milestone achieved on ${milestoneData.date}`)
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