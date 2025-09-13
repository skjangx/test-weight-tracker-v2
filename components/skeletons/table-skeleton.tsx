import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface TableSkeletonProps {
  rows?: number
  columns?: number
  title?: string
  showHeader?: boolean
  showPagination?: boolean
}

export function TableSkeleton({ 
  rows = 5, 
  columns = 4, 
  title,
  showHeader = true,
  showPagination = false 
}: TableSkeletonProps) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-8 w-24" />
          </div>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          {showHeader && (
            <div className={`grid grid-cols-${columns} gap-4 border-b pb-2`}>
              {Array.from({ length: columns }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
          )}
          
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className={`grid grid-cols-${columns} gap-4 py-2`}>
              {Array.from({ length: columns }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </div>
          ))}
          
          {/* Pagination */}
          {showPagination && (
            <div className="flex items-center justify-between pt-4 border-t">
              <Skeleton className="h-4 w-32" />
              <div className="flex space-x-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}