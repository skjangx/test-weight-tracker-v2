'use client'

import { useStreak, formatStreakText, isStreakAtRisk } from '@/hooks/use-streak'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'

interface StreakDisplayProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
  showBest?: boolean
}

/**
 * US-7.1: Streak Tracking Component
 * Displays current streak with fire emoji and optional best streak
 */
export function StreakDisplay({ 
  className = '', 
  size = 'md', 
  showBest = false 
}: StreakDisplayProps) {
  const { currentStreak, bestStreak, loading, error, lastEntryDate } = useStreak()

  // Show loading skeleton
  if (loading) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className={`h-4 ${size === 'sm' ? 'w-16' : size === 'lg' ? 'w-24' : 'w-20'}`} />
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className={`text-xs text-muted-foreground ${className}`}>
        <span>Streak unavailable</span>
      </div>
    )
  }

  const streakText = formatStreakText(currentStreak)
  const atRisk = isStreakAtRisk(lastEntryDate)

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  }

  const badgeSize = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'default'

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Current Streak */}
      <div className="flex items-center space-x-1">
        {atRisk && (
          <AlertTriangle className="h-3 w-3 text-orange-500" />
        )}
        <span 
          className={`${sizeClasses[size]} text-muted-foreground font-medium`}
          data-testid="current-streak"
        >
          {streakText}
        </span>
      </div>

      {/* Best Streak Badge */}
      {showBest && bestStreak > 0 && bestStreak > currentStreak && (
        <Badge 
          variant="secondary" 
          className="text-xs"
          data-testid="best-streak"
        >
          Best: {bestStreak}
        </Badge>
      )}

      {/* At Risk Warning */}
      {atRisk && (
        <Badge 
          variant="outline" 
          className="text-xs text-orange-600 border-orange-200"
          data-testid="streak-at-risk"
        >
          At risk
        </Badge>
      )}
    </div>
  )
}

/**
 * Compact version for goal cards
 */
export function CompactStreakDisplay({ className = '' }: { className?: string }) {
  return (
    <StreakDisplay 
      className={className} 
      size="sm" 
      showBest={false}
      data-testid="compact-streak"
    />
  )
}

/**
 * Detailed version for dedicated streak section
 */
export function DetailedStreakDisplay({ className = '' }: { className?: string }) {
  const { currentStreak, bestStreak, loading } = useStreak()

  if (loading) {
    return (
      <div className={`space-y-2 ${className}`}>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-24" />
      </div>
    )
  }

  return (
    <div className={`space-y-1 ${className}`} data-testid="detailed-streak">
      <StreakDisplay size="lg" showBest={false} />
      
      {bestStreak > 0 && bestStreak !== currentStreak && (
        <div className="text-xs text-muted-foreground">
          Personal best: {bestStreak} days
        </div>
      )}
      
      {currentStreak === 0 && (
        <div className="text-xs text-muted-foreground">
          Log your weight to start building a streak!
        </div>
      )}
      
      {currentStreak > 0 && currentStreak === bestStreak && bestStreak > 1 && (
        <div className="text-xs text-green-600">
          🎉 New personal record!
        </div>
      )}
    </div>
  )
}