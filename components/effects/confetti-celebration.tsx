'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { showMilestoneToast } from '@/lib/utils/toast'
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
  rotation: number
  rotationSpeed: number
}

// Optimized confetti colors for celebration
const CONFETTI_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
] as const

export function ConfettiCelebration({
  isActive,
  milestone,
  onComplete
}: ConfettiCelebrationProps) {
  const [particles, setParticles] = useState<Particle[]>([])
  const animationRef = useRef<number | undefined>(undefined)
  const startTimeRef = useRef<number | undefined>(undefined)

  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Create confetti particles (reduced count for better performance)
  const createParticles = useCallback((count: number = 30): Particle[] => {
    if (prefersReducedMotion) return [] // Respect accessibility preferences

    const newParticles: Particle[] = []
    const centerX = typeof window !== 'undefined' ? window.innerWidth / 2 : 400
    const centerY = typeof window !== 'undefined' ? window.innerHeight / 3 : 200 // Higher up for better effect

    for (let i = 0; i < count; i++) {
      newParticles.push({
        x: centerX + (Math.random() - 0.5) * 150, // Smaller spread
        y: centerY + (Math.random() - 0.5) * 50,
        vx: (Math.random() - 0.5) * 10, // More dynamic spread
        vy: Math.random() * -8 - 2, // Always shoot upward initially
        life: 0,
        maxLife: 90 + Math.random() * 60, // 1.5-2.5 seconds
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        size: 2 + Math.random() * 3, // Smaller particles for better performance
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      })
    }

    return newParticles
  }, [prefersReducedMotion])

  // Update particle physics with requestAnimationFrame
  const updateParticles = useCallback((particles: Particle[], deltaTime: number): Particle[] => {
    const timeFactor = deltaTime / 16 // Normalize to 60fps

    return particles
      .map(particle => ({
        ...particle,
        x: particle.x + particle.vx * timeFactor,
        y: particle.y + particle.vy * timeFactor,
        vy: particle.vy + 0.3 * timeFactor, // Gravity
        vx: particle.vx * (0.99 ** timeFactor), // Air resistance
        rotation: particle.rotation + particle.rotationSpeed * timeFactor,
        life: particle.life + timeFactor
      }))
      .filter(particle => particle.life < particle.maxLife && particle.y < window.innerHeight + 100)
  }, [])

  // Optimized animation loop using requestAnimationFrame
  const animate = useCallback((currentTime: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime
    }

    const deltaTime = currentTime - (startTimeRef.current || currentTime)
    startTimeRef.current = currentTime

    setParticles(prevParticles => {
      if (prevParticles.length === 0) {
        // Animation complete - schedule callback to avoid state update during render
        setTimeout(() => onComplete?.(), 0)
        return []
      }

      return updateParticles(prevParticles, Math.min(deltaTime, 32)) // Cap delta time
    })

    animationRef.current = requestAnimationFrame(animate)
  }, [updateParticles, onComplete])

  // Start confetti animation
  useEffect(() => {
    if (isActive && !animationRef.current) {
      // Show celebration toast (now using standardized function)
      showMilestoneToast(
        `Milestone Achieved!`,
        `Congratulations! You&apos;ve lost ${milestone}kg!`
      )

      // Only create confetti if motion is not reduced
      if (!prefersReducedMotion) {
        setParticles(createParticles())
        startTimeRef.current = undefined
        animationRef.current = requestAnimationFrame(animate)
      } else {
        // Just complete immediately for accessibility
        setTimeout(() => onComplete?.(), 100)
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = undefined
      }
    }
  }, [isActive, milestone, createParticles, animate, onComplete, prefersReducedMotion])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  if (!isActive || particles.length === 0 || prefersReducedMotion) return null

  return (
    <div
      className="fixed inset-0 pointer-events-none z-50"
      role="img"
      aria-label="Celebration confetti animation"
    >
      <svg
        width="100%"
        height="100%"
        className="absolute inset-0"
        style={{
          mixBlendMode: 'multiply' // Better blending with background
        }}
      >
        {particles.map((particle, index) => (
          <rect
            key={index}
            x={particle.x - particle.size / 2}
            y={particle.y - particle.size / 2}
            width={particle.size}
            height={particle.size}
            fill={particle.color}
            opacity={Math.max(0, 1 - (particle.life / particle.maxLife))}
            transform={`rotate(${particle.rotation} ${particle.x} ${particle.y})`}
            rx={particle.size * 0.2} // Slight rounding for better appearance
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
  const [isCheckingMilestone, setIsCheckingMilestone] = useState(false)
  const lastCheckRef = useRef<string>('')

  const checkAndCelebrateMilestone = useCallback(async (
    startingWeight: number,
    currentWeight: number,
    userId: string
  ) => {
    // Debounce milestone checks to prevent race conditions
    const checkKey = `${startingWeight}-${currentWeight}-${userId}`
    if (isCheckingMilestone || lastCheckRef.current === checkKey) {
      return
    }

    lastCheckRef.current = checkKey
    setIsCheckingMilestone(true)

    try {
      const weightLost = startingWeight - currentWeight
      const currentMilestone = Math.floor(weightLost / 3) * 3 // Round down to nearest 3kg milestone

      // Check if we've reached a new milestone (minimum 3kg)
      if (
        currentMilestone >= 3 &&
        currentMilestone > lastCelebratedMilestone &&
        weightLost >= currentMilestone
      ) {
        // Check if this milestone was already recorded in database
        const { data: existingMilestone, error: fetchError } = await supabase
          .from('milestones')
          .select('*')
          .eq('user_id', userId)
          .eq('weight_lost', currentMilestone)
          .maybeSingle() // Use maybeSingle instead of single to avoid errors

        if (fetchError) {
          console.error('Error fetching milestone:', fetchError)
          return
        }

        if (!existingMilestone) {
          // Use upsert to prevent duplicate key errors
          const { error: insertError } = await supabase
            .from('milestones')
            .upsert({
              user_id: userId,
              weight_lost: currentMilestone,
              achieved_at: new Date().toISOString()
            }, {
              onConflict: 'user_id,weight_lost',
              ignoreDuplicates: false
            })

          if (insertError) {
            console.error('Error recording milestone:', insertError)
            // Don't celebrate if we can't record it
            return
          }

          // Only celebrate if successfully recorded
          setCelebratingMilestone(currentMilestone)
          setLastCelebratedMilestone(currentMilestone)
        }
      }
    } catch (error) {
      console.error('Error in milestone check:', error)
    } finally {
      setIsCheckingMilestone(false)
      // Clear check key after a delay to allow for new checks
      setTimeout(() => {
        if (lastCheckRef.current === checkKey) {
          lastCheckRef.current = ''
        }
      }, 5000)
    }
  }, [lastCelebratedMilestone, isCheckingMilestone])

  const completeCelebration = useCallback(() => {
    setCelebratingMilestone(null)
  }, [])

  return {
    celebratingMilestone,
    checkAndCelebrateMilestone,
    completeCelebration,
    isCheckingMilestone
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
    completeCelebration,
    isCheckingMilestone
  } = useMilestoneCelebration()

  // Debounced effect to prevent excessive milestone checks
  useEffect(() => {
    if (startingWeight && currentWeight && user && !isCheckingMilestone) {
      // Add a small delay to debounce rapid weight updates
      const timeoutId = setTimeout(() => {
        checkAndCelebrateMilestone(startingWeight, currentWeight, user.id)
      }, 500)

      return () => clearTimeout(timeoutId)
    }
  }, [startingWeight, currentWeight, user, checkAndCelebrateMilestone, isCheckingMilestone])

  return (
    <ConfettiCelebration
      isActive={celebratingMilestone !== null}
      milestone={celebratingMilestone || 0}
      onComplete={completeCelebration}
    />
  )
}