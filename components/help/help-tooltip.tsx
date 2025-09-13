import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { HelpCircle, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface HelpTooltipProps {
  content: string | React.ReactNode
  children?: React.ReactNode
  side?: 'top' | 'right' | 'bottom' | 'left'
  variant?: 'default' | 'info'
  size?: 'sm' | 'default'
}

export function HelpTooltip({ 
  content, 
  children, 
  side = 'top',
  variant = 'default',
  size = 'default' 
}: HelpTooltipProps) {
  const Icon = variant === 'info' ? Info : HelpCircle
  const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {children ? (
          <span className="inline-flex items-center">
            {children}
          </span>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto w-auto p-0.5 text-muted-foreground hover:text-foreground"
          >
            <Icon className={iconSize} />
            <span className="sr-only">Help</span>
          </Button>
        )}
      </TooltipTrigger>
      <TooltipContent side={side} className="max-w-xs">
        {content}
      </TooltipContent>
    </Tooltip>
  )
}

// Specialized help tooltips for common use cases
export function WeightHelpTooltip() {
  return (
    <HelpTooltip
      content="Enter your weight in kilograms (kg). If you log multiple entries for the same day, we'll automatically calculate the average."
      size="sm"
    />
  )
}

export function GoalHelpTooltip() {
  return (
    <HelpTooltip
      content="Set a realistic target weight and deadline. We'll track your progress and provide daily recommendations to help you reach your goal."
      size="sm"
    />
  )
}

export function StreakHelpTooltip() {
  return (
    <HelpTooltip
      content="Your current streak of consecutive days with weight entries. Regular logging helps track progress more accurately."
      size="sm"
    />
  )
}

export function MovingAverageHelpTooltip() {
  return (
    <HelpTooltip
      content="Shows the average weight over a selected number of days. This helps smooth out daily fluctuations and reveals long-term trends."
      size="sm"
    />
  )
}

export function MilestoneHelpTooltip() {
  return (
    <HelpTooltip
      content="Green dots indicate milestones - every 3kg of progress toward your goal. These are worth celebrating! 🎉"
      size="sm"
    />
  )
}

export function SyncHelpTooltip() {
  return (
    <HelpTooltip
      content="Shows when your data was last synchronized. The app automatically syncs every hour and when you make changes."
      size="sm"
    />
  )
}