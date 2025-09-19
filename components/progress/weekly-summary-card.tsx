'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useWeeklySummary, formatWeightChange, formatComparison } from '@/hooks/use-weekly-summary'
import { ChevronDown, ChevronUp, Calendar, TrendingDown, Scale, Target } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface WeeklySummaryCardProps {
  className?: string
}

/**
 * US-7.2: Weekly Summary Card Component
 * Shows weekly progress with expandable details
 */
export function WeeklySummaryCard({ className = '' }: WeeklySummaryCardProps) {
  const { currentWeek, previousWeek, loading, error } = useWeeklySummary()
  const [isExpanded, setIsExpanded] = useState(false)

  if (loading) {
    return (
      <Card className={className} data-testid="weekly-summary-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <Skeleton className="h-5 w-32" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className={className} data-testid="weekly-summary-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-red-600">
            <Calendar className="h-5 w-5" />
            <span>Weekly Summary</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!currentWeek) {
    return (
      <Card className={className} data-testid="weekly-summary-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weekly Summary</span>
          </CardTitle>
          <CardDescription>
            Your weekly progress will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Start logging weight entries to see your weekly summary
          </p>
        </CardContent>
      </Card>
    )
  }

  const weekRange = `${new Date(currentWeek.week_start).toLocaleDateString()} - ${new Date(currentWeek.week_end).toLocaleDateString()}`
  const weightChange = formatWeightChange(currentWeek.total_weight_change)
  const comparison = formatComparison(currentWeek.comparison)

  return (
    <Card className={className} data-testid="weekly-summary-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <CardTitle>This Week&apos;s Progress</CardTitle>
          </div>
          
          {currentWeek.comparison && (
            <Badge 
              variant={currentWeek.comparison.is_improvement ? 'default' : 'secondary'}
              className="text-xs"
              data-testid="improvement-badge"
            >
              {comparison.icon} {comparison.text.split(' ').slice(-2).join(' ')}
            </Badge>
          )}
        </div>
        
        <CardDescription className="text-xs text-muted-foreground">
          {weekRange}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Average Weight */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <Scale className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Avg Weight</span>
              </div>
              <div className="text-lg font-semibold" data-testid="avg-weight">
                {currentWeek.avg_weight ? `${currentWeek.avg_weight}kg` : 'No data'}
              </div>
            </div>

            {/* Weight Change */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <TrendingDown className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Change</span>
              </div>
              <div 
                className={`text-lg font-semibold ${weightChange.color}`}
                data-testid="weight-change"
              >
                {weightChange.text}
              </div>
            </div>

            {/* Days Logged */}
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1">
                <Target className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Days</span>
              </div>
              <div className="text-lg font-semibold" data-testid="days-logged">
                {currentWeek.days_logged}/7
              </div>
            </div>
          </div>

          {/* Expandable Details */}
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-full justify-between"
                data-testid="expand-details"
              >
                <span>
                  {isExpanded ? 'Hide' : 'Show'} Details
                </span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="space-y-3 pt-3" data-testid="expanded-details">
              {/* Detailed Comparison */}
              {currentWeek.comparison && previousWeek && (
                <div className="space-y-2 text-sm">
                  <h4 className="font-medium">Comparison vs Last Week</h4>
                  
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Weight Change:</span>
                      <div className={`font-medium ${formatWeightChange(currentWeek.comparison.weight_change).color}`}>
                        {formatWeightChange(currentWeek.comparison.weight_change).text}
                        {currentWeek.comparison.weight_change && (
                          <span className="ml-1">
                            vs {previousWeek.avg_weight ? `${previousWeek.avg_weight}kg` : 'No data'}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-muted-foreground">Days Logged:</span>
                      <div className="font-medium">
                        {currentWeek.days_logged} days
                        <span 
                          className={`ml-1 ${
                            currentWeek.comparison.days_logged_change >= 0 
                              ? 'text-green-600' 
                              : 'text-red-600'
                          }`}
                        >
                          ({currentWeek.comparison.days_logged_change >= 0 ? '+' : ''}
                          {currentWeek.comparison.days_logged_change})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Additional Stats */}
              <div className="space-y-2 text-sm">
                <h4 className="font-medium">Additional Stats</h4>
                
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Entries:</span>
                    <div className="font-medium">{currentWeek.entries_count}</div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Consistency:</span>
                    <div className="font-medium">
                      {Math.round((currentWeek.days_logged / 7) * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Message */}
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                {currentWeek.days_logged === 7 ? (
                  <div className="text-green-700">
                    🎉 Perfect week! You logged your weight every day.
                  </div>
                ) : currentWeek.days_logged >= 5 ? (
                  <div className="text-blue-700">
                    💪 Great consistency! You&apos;re building a strong habit.
                  </div>
                ) : currentWeek.days_logged >= 3 ? (
                  <div className="text-orange-700">
                    📈 Good start! Try to log more days this week.
                  </div>
                ) : currentWeek.days_logged > 0 ? (
                  <div className="text-gray-700">
                    ✨ Every entry counts! Keep building your habit.
                  </div>
                ) : (
                  <div className="text-gray-700">
                    📝 Start logging your weight to track weekly progress.
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
    </Card>
  )
}