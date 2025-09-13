import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface ChartSkeletonProps {
  title?: string
  showControls?: boolean
  height?: number
}

export function ChartSkeleton({ 
  title = 'Chart Loading', 
  showControls = true,
  height = 256 
}: ChartSkeletonProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
          {showControls && (
            <div className="flex space-x-2">
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Chart area with shimmer effect */}
          <div className="relative">
            <Skeleton className={`w-full`} style={{ height: `${height}px` }} />
            
            {/* Optional: Add some fake chart elements */}
            <div className="absolute inset-4 flex items-end justify-between opacity-20">
              {Array.from({ length: 8 }).map((_, i) => {
                const height = Math.random() * 60 + 20
                return (
                  <Skeleton 
                    key={i} 
                    className="w-4 bg-primary/30"
                    style={{ height: `${height}%` }}
                  />
                )
              })}
            </div>
          </div>
          
          {/* Legend skeleton */}
          <div className="flex items-center justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
            <div className="flex items-center space-x-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}