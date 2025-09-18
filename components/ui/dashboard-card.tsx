'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DashboardCardProps {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
  variant?: 'default' | 'highlight' | 'metric'
  className?: string
}

/**
 * Standardized dashboard card component with consistent spacing and typography
 * Based on visual tester recommendations for spacing consistency
 */
export function DashboardCard({
  title,
  icon,
  children,
  variant = 'default',
  className
}: DashboardCardProps) {
  return (
    <Card className={cn(
      "transition-all duration-200 hover:shadow-lg",
      variant === 'highlight' && "border-primary/20 bg-primary/5",
      variant === 'metric' && "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-900/10",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className={cn(
          "flex items-center gap-2 font-semibold",
          variant === 'metric' ? "text-lg" : "text-base"
        )}>
          {icon && <span className="text-muted-foreground">{icon}</span>}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        {children}
      </CardContent>
    </Card>
  )
}

interface MetricValueProps {
  value: number | string
  label: string
  icon?: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'error' | 'purple' | 'orange' | 'indigo'
  suffix?: string
  decimals?: number
  className?: string
}

/**
 * Standardized metric value component with enhanced typography hierarchy
 * Addresses visual tester feedback about metric prominence
 */
export function MetricValue({
  value,
  label,
  icon,
  color = 'primary',
  suffix,
  decimals = 0,
  className
}: MetricValueProps) {
  const colorClasses = {
    primary: 'text-foreground',
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    purple: 'text-purple-600 dark:text-purple-400',
    orange: 'text-orange-600 dark:text-orange-400',
    indigo: 'text-indigo-600 dark:text-indigo-400'
  }

  const displayValue = typeof value === 'number'
    ? value.toFixed(decimals)
    : value

  return (
    <div className={cn("space-y-1", className)}>
      <div className="flex items-center gap-2">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className={cn(
          "text-2xl font-bold tracking-tight",
          colorClasses[color]
        )}>
          {displayValue}{suffix}
        </span>
      </div>
      <p className="text-sm font-medium text-muted-foreground">
        {label}
      </p>
    </div>
  )
}

/**
 * Grid container for metric values with consistent spacing
 */
export function MetricGrid({
  children,
  columns = 2,
  className
}: {
  children: React.ReactNode
  columns?: 2 | 3 | 4
  className?: string
}) {
  const gridClasses = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4'
  }

  return (
    <div className={cn(
      "grid gap-6",
      gridClasses[columns],
      className
    )}>
      {children}
    </div>
  )
}