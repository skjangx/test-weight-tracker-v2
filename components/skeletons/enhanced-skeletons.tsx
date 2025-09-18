import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/**
 * Enhanced skeleton components with better loading states
 * Provides more realistic loading experiences
 */

interface SkeletonProps {
  className?: string
  animate?: boolean
}

export function DashboardStatsCardSkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <Skeleton className={cn('h-5 w-5 rounded', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-5 w-24', animate && 'animate-pulse')} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className={cn('h-8 w-12', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-4 w-20', animate && 'animate-pulse')} />
        </div>
        <div className="space-y-2">
          <Skeleton className={cn('h-8 w-8', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-4 w-16', animate && 'animate-pulse')} />
        </div>
        <div className="space-y-2">
          <Skeleton className={cn('h-8 w-12', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-4 w-20', animate && 'animate-pulse')} />
        </div>
      </CardContent>
    </Card>
  )
}

export function GoalCardSkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Skeleton className={cn('h-5 w-32', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-8 w-8 rounded', animate && 'animate-pulse')} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Skeleton className={cn('h-6 w-40', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-2 w-full rounded-full', animate && 'animate-pulse')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Skeleton className={cn('h-5 w-16', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-4 w-12', animate && 'animate-pulse')} />
          </div>
          <div className="space-y-1">
            <Skeleton className={cn('h-5 w-20', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-4 w-16', animate && 'animate-pulse')} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function WeightChartSkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className={cn('h-6 w-32', animate && 'animate-pulse')} />
          <div className="flex space-x-2">
            <Skeleton className={cn('h-8 w-16 rounded', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-8 w-16 rounded', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-8 w-16 rounded', animate && 'animate-pulse')} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-end justify-between space-x-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn(
                'w-8 rounded-t',
                animate && 'animate-pulse',
                `h-${Math.floor(Math.random() * 20) + 10}`
              )}
              style={{
                height: `${Math.floor(Math.random() * 200) + 50}px`,
                animationDelay: animate ? `${i * 100}ms` : '0ms'
              }}
            />
          ))}
        </div>
        <div className="mt-4 flex justify-between">
          <Skeleton className={cn('h-4 w-12', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-4 w-16', animate && 'animate-pulse')} />
        </div>
      </CardContent>
    </Card>
  )
}

export function WeightTableSkeleton({ className, animate = true, rows = 5 }: SkeletonProps & { rows?: number }) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Skeleton className={cn('h-6 w-40', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-9 w-24 rounded', animate && 'animate-pulse')} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Table Header */}
          <div className="grid grid-cols-4 gap-4 pb-2 border-b">
            <Skeleton className={cn('h-4 w-12', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-4 w-16', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-4 w-20', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-4 w-16', animate && 'animate-pulse')} />
          </div>

          {/* Table Rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="grid grid-cols-4 gap-4 items-center">
              <Skeleton
                className={cn('h-4 w-20', animate && 'animate-pulse')}
                style={{ animationDelay: animate ? `${i * 150}ms` : '0ms' }}
              />
              <Skeleton
                className={cn('h-4 w-12', animate && 'animate-pulse')}
                style={{ animationDelay: animate ? `${i * 150 + 50}ms` : '0ms' }}
              />
              <Skeleton
                className={cn('h-4 w-24', animate && 'animate-pulse')}
                style={{ animationDelay: animate ? `${i * 150 + 100}ms` : '0ms' }}
              />
              <Skeleton
                className={cn('h-8 w-8 rounded', animate && 'animate-pulse')}
                style={{ animationDelay: animate ? `${i * 150 + 125}ms` : '0ms' }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function WeeklySummarySkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <Skeleton className={cn('h-6 w-32', animate && 'animate-pulse')} />
        <Skeleton className={cn('h-4 w-48', animate && 'animate-pulse')} />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Skeleton className={cn('h-4 w-16', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-6 w-20', animate && 'animate-pulse')} />
          </div>
          <div className="space-y-2">
            <Skeleton className={cn('h-4 w-20', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-6 w-16', animate && 'animate-pulse')} />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className={cn('h-4 w-24', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-6 w-32', animate && 'animate-pulse')} />
        </div>
      </CardContent>
    </Card>
  )
}

export function TrendAnalysisSkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Skeleton className={cn('h-5 w-5 rounded', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-6 w-28', animate && 'animate-pulse')} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Skeleton className={cn('h-10 w-10 rounded-full', animate && 'animate-pulse')} />
          <div className="space-y-2">
            <Skeleton className={cn('h-5 w-32', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-4 w-48', animate && 'animate-pulse')} />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className={cn('h-4 w-40', animate && 'animate-pulse')} />
          <Skeleton className={cn('h-4 w-36', animate && 'animate-pulse')} />
        </div>
      </CardContent>
    </Card>
  )
}

export function QuickActionsSkeleton({ className, animate = true }: SkeletonProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <Skeleton className={cn('h-6 w-28', animate && 'animate-pulse')} />
        <Skeleton className={cn('h-4 w-64', animate && 'animate-pulse')} />
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className={cn('h-10 w-32 rounded', animate && 'animate-pulse')}
              style={{ animationDelay: animate ? `${i * 100}ms` : '0ms' }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardLayoutSkeleton({ animate = true }: { animate?: boolean }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header Skeleton */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Skeleton className={cn('h-8 w-48', animate && 'animate-pulse')} />
          </div>
          <div className="flex items-center space-x-4">
            <Skeleton className={cn('h-8 w-32', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-8 w-8 rounded', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-8 w-8 rounded', animate && 'animate-pulse')} />
            <Skeleton className={cn('h-8 w-20 rounded', animate && 'animate-pulse')} />
          </div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GoalCardSkeleton animate={animate} />
          <DashboardStatsCardSkeleton animate={animate} />
          <QuickActionsSkeleton className="lg:col-span-3" animate={animate} />
          <WeightChartSkeleton className="lg:col-span-2" animate={animate} />
          <div className="space-y-6">
            <WeeklySummarySkeleton animate={animate} />
            <TrendAnalysisSkeleton animate={animate} />
          </div>
          <WeightTableSkeleton className="lg:col-span-3" animate={animate} />
        </div>
      </main>
    </div>
  )
}