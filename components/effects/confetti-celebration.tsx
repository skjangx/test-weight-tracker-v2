'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'

interface ConfettiCelebrationProps {
  isActive: boolean
  milestone: number // Weight lost in kg (e.g., 3, 6, 9...)
  onComplete?: () => void
}

// Simple confetti particle interface
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
}

// Confetti colors for celebration
const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
]

export function ConfettiCelebration({ 
  isActive, 
  milestone, 
  onComplete 
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const [animationId, setAnimationId] = useState<number | null>(null)

  // Create confetti particles
  const createParticles = (count: number = 50): Particle[] => {
    const newParticles: Particle[] = []
    const centerX = window.innerWidth / 2
    const centerY = window.innerHeight / 2

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 200,
        y: centerY + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8 - 2,
        life: 0,
        maxLife: 60 + Math.random() * 60, // 1-2 seconds at 60fps
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 3 + Math.random() * 4
      })
    }

    return newParticles
  }

  // Update particle physics
  const updateParticles = (particles: Particle[]): Particle[] => {
    return particles
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx,
        y: particle.y + particle.vy,
        vy: particle.vy + 0.2, // Gravity
        vx: particle.vx * 0.99, // Air resistance
        life: particle.life + 1
      }))
      .filter(particle => particle.life < particle.maxLife)
  }

  // Animation loop
  const animate = () => {
    setParticles(prevParticles => {
      const updatedParticles = updateParticles(prevParticles)
      
      if (updatedParticles.length === 0) {
        // Animation complete
        setAnimationId(null)
        onComplete?.()
        return []
      }
      
      return updatedParticles
    })
  }

  // Start confetti animation
  useEffect(() => {
    if (isActive && !animationId) {
      // Show celebration toast
      toast.success(`🎉 Milestone Achieved!`, {
        description: `Congratulations! You've lost ${milestone}kg!`,
        duration: 5000
      })

      // Create particles and start animation
      setParticles(createParticles())
      
      const id = setInterval(animate, 16) // ~60fps
      setAnimationId(id)
    }

    return () => {
      if (animationId) {
        clearInterval(animationId)
        setAnimationId(null)
      }
    }
  }, [isActive, milestone, animationId, onComplete])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationId) {
        clearInterval(animationId)
      }
    }
  }, [animationId])

  if (!isActive || particles.length === 0) return null

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-50"
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh'
      }}
    >
      <svg
        width="100%"
        height="100%"
        style={{ 
          position: 'absolute',
          top: 0,
          left: 0
        }}
      >
        {particles.map((particle, index) => (
          <circle
            key={index}
            cx={particle.x}
            cy={particle.y}
            r={particle.size}
            fill={particle.color}
            opacity={1 - (particle.life / particle.maxLife)}
            transform={`rotate(${particle.life * 5} ${particle.x} ${particle.y})`}
          />
        ))}
      </svg>
    </div>
  )
}

// Hook to manage milestone detection and celebration
export function useMilestoneCelebration() {
  const [celebratingMilestone, setCelebratingMilestone] = useState<number | null>(null)
  const [lastCelebratedMilestone, setLastCelebratedMilestone] = useState<number>(0)

  const checkAndCelebrateMilestone = async (
    startingWeight: number,
    currentWeight: number,
    userId: string
  ) => {
    const weightLost = startingWeight - currentWeight
    const currentMilestone = Math.floor(weightLost / 3) * 3 // Round down to nearest 3kg milestone

    // Check if we've reached a new milestone (minimum 3kg)
    if (
      currentMilestone >= 3 && 
      currentMilestone > lastCelebratedMilestone &&
      weightLost >= currentMilestone
    ) {
      // Check if this milestone was already recorded in database
      try {
        const { data: existingMilestone } = await supabase
          .from('milestones')
          .select('*')
          .eq('user_id', userId)
          .eq('weight_lost', currentMilestone)
          .single()

        if (!existingMilestone) {
          // Record new milestone in database
          await supabase
            .from('milestones')
            .insert({
              user_id: userId,
              weight_lost: currentMilestone,
              achieved_at: new Date().toISOString()
            })

          setCelebratingMilestone(currentMilestone)
          setLastCelebratedMilestone(currentMilestone)
        }
      } catch (error) {
        console.error('Error checking/recording milestone:', error)
        // Still celebrate even if database operation fails
        setCelebratingMilestone(currentMilestone)
        setLastCelebratedMilestone(currentMilestone)
      }
    }
  }

  const completeCelebration = () => {
    setCelebratingMilestone(null)
  }

  return {
    celebratingMilestone,
    checkAndCelebrateMilestone,
    completeCelebration
  }
}

// Milestone tracker component to integrate with weight data
export function MilestoneTracker({
  startingWeight,
  currentWeight
}: {
  startingWeight?: number
  currentWeight?: number
}) {
  const { user } = useAuth()
  const { 
    celebratingMilestone, 
    checkAndCelebrateMilestone, 
    completeCelebration 
  } = useMilestoneCelebration()

  useEffect(() => {
    if (startingWeight && currentWeight && user) {
      checkAndCelebrateMilestone(startingWeight, currentWeight, user.id)
    }
  }, [startingWeight, currentWeight, user, checkAndCelebrateMilestone])

  return (
    <ConfettiCelebration
      isActive={celebratingMilestone !== null}
      milestone={celebratingMilestone || 0}
      onComplete={completeCelebration}
    />
  )
}