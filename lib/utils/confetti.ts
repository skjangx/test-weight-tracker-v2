import confetti from 'canvas-confetti'

export interface ConfettiOptions {
  particleCount?: number
  spread?: number
  origin?: { x: number; y: number }
  colors?: string[]
  duration?: number
}

/**
 * Trigger confetti animation for milestone celebrations
 */
export function triggerMilestoneConfetti(options?: ConfettiOptions) {
  const defaults = {
    particleCount: 100,
    spread: 70,
    origin: { x: 0.5, y: 0.6 },
    colors: ['#22c55e', '#16a34a', '#15803d', '#166534'],
    duration: 3000
  }

  const config = { ...defaults, ...options }

  // Create a burst effect with multiple confetti bursts
  const duration = config.duration
  const animationEnd = Date.now() + duration
  const particleCount = config.particleCount

  // Function to create confetti bursts
  const createBurst = () => {
    confetti({
      particleCount: Math.floor(particleCount / 3),
      spread: config.spread,
      origin: config.origin,
      colors: config.colors,
      gravity: 0.7,
      scalar: 1.2,
      drift: 0.1
    })
  }

  // Create multiple bursts over the duration
  const interval = setInterval(() => {
    if (Date.now() > animationEnd) {
      clearInterval(interval)
      return
    }
    createBurst()
  }, 150)

  // Initial burst
  createBurst()
}

/**
 * Trigger celebration confetti for weight goals achieved
 */
export function triggerGoalConfetti() {
  triggerMilestoneConfetti({
    particleCount: 200,
    spread: 90,
    colors: ['#3b82f6', '#1d4ed8', '#1e40af', '#1e3a8a'],
    duration: 4000
  })
}

/**
 * Trigger subtle confetti for smaller achievements
 */
export function triggerSubtleConfetti() {
  triggerMilestoneConfetti({
    particleCount: 50,
    spread: 50,
    colors: ['#f59e0b', '#d97706', '#b45309'],
    duration: 2000
  })
}