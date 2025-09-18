'use client'

import { forwardRef, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

/**
 * Enhanced animated components for better UX
 * Provides smooth micro-interactions and visual feedback
 */

interface AnimatedProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
}

export function FadeIn({ children, className, delay = 0, duration = 300 }: AnimatedProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-opacity ease-in-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

export function SlideIn({
  children,
  className,
  delay = 0,
  duration = 300,
  direction = 'up'
}: AnimatedProps & { direction?: 'up' | 'down' | 'left' | 'right' }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const getTransform = () => {
    if (!isVisible) {
      switch (direction) {
        case 'up': return 'translateY(20px)'
        case 'down': return 'translateY(-20px)'
        case 'left': return 'translateX(20px)'
        case 'right': return 'translateX(-20px)'
        default: return 'translateY(20px)'
      }
    }
    return 'translateY(0)'
  }

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
      style={{
        transitionDuration: `${duration}ms`,
        transform: getTransform()
      }}
    >
      {children}
    </div>
  )
}

export function ScaleIn({ children, className, delay = 0, duration = 200 }: AnimatedProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div
      className={cn(
        'transition-all ease-out',
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95',
        className
      )}
      style={{ transitionDuration: `${duration}ms` }}
    >
      {children}
    </div>
  )
}

interface StaggeredChildrenProps {
  children: React.ReactNode[]
  className?: string
  childDelay?: number
  childDuration?: number
}

export function StaggeredChildren({
  children,
  className,
  childDelay = 100,
  childDuration = 300
}: StaggeredChildrenProps) {
  return (
    <div className={className}>
      {children.map((child, index) => (
        <FadeIn
          key={index}
          delay={index * childDelay}
          duration={childDuration}
        >
          {child}
        </FadeIn>
      ))}
    </div>
  )
}

// Enhanced Button with micro-interactions
export const AnimatedButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button> & {
    pressEffect?: boolean
    hoverScale?: boolean
  }
>(({ className, pressEffect = true, hoverScale = true, children, ...props }, ref) => {
  return (
    <Button
      ref={ref}
      className={cn(
        'transition-all duration-200 ease-out',
        pressEffect && 'active:scale-95',
        hoverScale && 'hover:scale-105',
        'hover:shadow-md focus:ring-2 focus:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
})

AnimatedButton.displayName = 'AnimatedButton'

// Enhanced Card with hover effects
export const AnimatedCard = forwardRef<
  HTMLDivElement,
  React.ComponentProps<typeof Card> & {
    hoverEffect?: boolean
    clickable?: boolean
  }
>(({ className, hoverEffect = true, clickable = false, children, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        'transition-all duration-300 ease-out',
        hoverEffect && 'hover:shadow-lg hover:-translate-y-1',
        clickable && 'cursor-pointer hover:shadow-xl active:scale-98',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  )
})

AnimatedCard.displayName = 'AnimatedCard'

// Number counter animation
interface CountUpProps {
  value: number
  duration?: number
  className?: string
  decimals?: number
  suffix?: string
  prefix?: string
}

export function CountUp({
  value,
  duration = 1000,
  className,
  decimals = 0,
  suffix = '',
  prefix = ''
}: CountUpProps) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Easing function for smooth animation
      const easeOut = 1 - Math.pow(1 - progress, 3)
      const current = value * easeOut

      setCount(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  const displayValue = decimals > 0
    ? count.toFixed(decimals)
    : Math.floor(count).toString()

  return (
    <span className={className}>
      {prefix}{displayValue}{suffix}
    </span>
  )
}

// Progress bar with animation
interface AnimatedProgressProps {
  value: number
  max?: number
  className?: string
  showValue?: boolean
  duration?: number
}

export function AnimatedProgress({
  value,
  max = 100,
  className,
  showValue = false,
  duration = 1000
}: AnimatedProgressProps) {
  const [animatedValue, setAnimatedValue] = useState(0)
  const percentage = Math.min((value / max) * 100, 100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage)
    }, 100)

    return () => clearTimeout(timer)
  }, [percentage])

  return (
    <div className={cn('relative', className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className="h-full bg-primary transition-all ease-out rounded-full"
          style={{
            width: `${animatedValue}%`,
            transitionDuration: `${duration}ms`
          }}
        />
      </div>
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium">
            <CountUp value={value} suffix={`/${max}`} />
          </span>
        </div>
      )}
    </div>
  )
}

// Success checkmark animation
export function SuccessCheckmark({ className, size = 24 }: { className?: string; size?: number }) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        'rounded-full bg-green-100 dark:bg-green-900',
        'transition-all duration-500 ease-out',
        isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0',
        className
      )}
      style={{ width: size * 2, height: size * 2 }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="text-green-600 dark:text-green-400"
      >
        <path
          d="M20 6L9 17L4 12"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn(
            'transition-all duration-700 ease-out',
            isVisible ? 'stroke-dasharray-0' : 'stroke-dasharray-24 stroke-dashoffset-24'
          )}
          style={{
            strokeDasharray: isVisible ? 'none' : '24',
            strokeDashoffset: isVisible ? '0' : '24'
          }}
        />
      </svg>
    </div>
  )
}

// Loading spinner with better animation
export function LoadingSpinner({ className, size = 20 }: { className?: string; size?: number }) {
  return (
    <div
      className={cn('animate-spin rounded-full border-2 border-muted border-t-primary', className)}
      style={{ width: size, height: size }}
    />
  )
}

// Pulse effect for notifications
export function PulseIndicator({
  className,
  color = 'bg-red-500',
  size = 8
}: {
  className?: string
  color?: string
  size?: number
}) {
  return (
    <div className={cn('relative', className)}>
      <div
        className={cn('rounded-full', color)}
        style={{ width: size, height: size }}
      />
      <div
        className={cn(
          'absolute top-0 left-0 rounded-full animate-ping',
          color,
          'opacity-75'
        )}
        style={{ width: size, height: size }}
      />
    </div>
  )
}