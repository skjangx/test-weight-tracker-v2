'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  HelpCircle, 
  Target, 
  TrendingDown, 
  Calendar,
  BarChart3,
  Zap,
  Trophy,
  Flame,
  Scale,
  Info
} from 'lucide-react'

interface HelpSection {
  id: string
  title: string
  icon: React.ComponentType<any>
  description: string
  content: Array<{
    subtitle: string
    text: string
    tips?: string[]
  }>
}

const helpSections: HelpSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: Scale,
    description: 'Learn the basics of weight tracking',
    content: [
      {
        subtitle: 'Setting Your First Goal',
        text: 'Click "Create Goal" to set your target weight and deadline. Choose realistic goals that motivate you without being overwhelming.',
        tips: [
          'Aim for 0.5-1kg loss per week for sustainable results',
          'Set deadlines that give you enough time to reach your goal healthily',
          'You can update your goal anytime as you progress'
        ]
      },
      {
        subtitle: 'Logging Your Weight',
        text: 'Use "Add Weight" to log your daily weight. Consistency is key - try to weigh yourself at the same time each day.',
        tips: [
          'Weigh yourself in the morning after using the bathroom',
          'Use the same scale and wear similar clothing each time',
          'Don\'t worry about daily fluctuations - focus on weekly trends'
        ]
      }
    ]
  },
  {
    id: 'tracking-progress',
    title: 'Tracking Progress',
    icon: BarChart3,
    description: 'Understand your weight journey',
    content: [
      {
        subtitle: 'Weight Trend Graph',
        text: 'The graph shows your weight over time with trend lines to help you visualize progress.',
        tips: [
          'Green dots represent 3kg milestones - celebrate these wins!',
          'The moving average line smooths out daily fluctuations',
          'Use time period buttons to zoom in/out on your data'
        ]
      },
      {
        subtitle: 'Moving Averages',
        text: 'Moving averages help you see the bigger picture by smoothing out daily weight fluctuations caused by water retention, food intake, and other factors.',
        tips: [
          '7-day average is good for weekly trends',
          '14-day average shows longer-term patterns',
          'Don\'t get discouraged by single-day increases'
        ]
      }
    ]
  },
  {
    id: 'goals-deadlines',
    title: 'Goals & Deadlines',
    icon: Target,
    description: 'Manage your weight targets effectively',
    content: [
      {
        subtitle: 'Setting Realistic Goals',
        text: 'Effective weight goals are specific, measurable, and achievable within your timeframe.',
        tips: [
          'Use the SMART goal framework: Specific, Measurable, Achievable, Relevant, Time-bound',
          'Consider your lifestyle, work schedule, and other commitments',
          'Break large goals into smaller milestones'
        ]
      },
      {
        subtitle: 'Deadline Management',
        text: 'Your deadline helps calculate daily requirements and keeps you motivated with progress tracking.',
        tips: [
          'Allow flexibility - extend deadlines if needed rather than giving up',
          'Celebrate achieving goals early',
          'Set new goals when you reach your targets'
        ]
      }
    ]
  },
  {
    id: 'streaks-habits',
    title: 'Streaks & Habits',
    icon: Flame,
    description: 'Build consistent tracking habits',
    content: [
      {
        subtitle: 'Daily Streaks',
        text: 'Your streak counts consecutive days of weight logging. Consistency helps you stay accountable and notice patterns.',
        tips: [
          'Aim for at least 7 days to see initial patterns',
          'Don\'t break your streak for special occasions - just log honestly',
          'Missing a day? Start a new streak immediately'
        ]
      },
      {
        subtitle: 'Building Habits',
        text: 'Regular weight tracking becomes automatic when you link it to existing daily routines.',
        tips: [
          'Link weighing to morning routines like brushing teeth',
          'Set phone reminders until the habit forms',
          'Keep your scale in a visible, accessible location'
        ]
      }
    ]
  },
  {
    id: 'data-insights',
    title: 'Data & Insights',
    icon: TrendingDown,
    description: 'Make sense of your weight data',
    content: [
      {
        subtitle: 'Understanding Weight Fluctuations',
        text: 'Daily weight can vary by 1-3kg due to factors unrelated to fat loss or gain.',
        tips: [
          'Water retention from sodium, carbs, or hormones',
          'Food volume in your digestive system',
          'Muscle gain from exercise can mask fat loss',
          'Focus on weekly averages, not daily changes'
        ]
      },
      {
        subtitle: 'Progress Indicators',
        text: 'Look for multiple signs of progress beyond just the scale number.',
        tips: [
          'How your clothes fit',
          'Energy levels and mood',
          'Strength and endurance improvements',
          'Consistency with healthy habits'
        ]
      }
    ]
  }
]

export function HelpModal() {
  const [selectedSection, setSelectedSection] = useState<string>('getting-started')
  const [isOpen, setIsOpen] = useState(false)

  const currentSection = helpSections.find(section => section.id === selectedSection)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  // Handle section selection with keyboard
  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="flex items-center gap-1.5 hover:bg-primary/10 focus:bg-primary/10 focus:ring-2 focus:ring-primary/20"
          aria-label="Open help documentation"
          aria-expanded={isOpen}
        >
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[95vw] sm:max-w-2xl lg:max-w-4xl h-[90vh] max-h-[90vh] p-0 overflow-hidden flex flex-col"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader className="flex items-center gap-2 px-4 py-3 border-b bg-background flex-none space-y-0">
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <HelpCircle className="h-5 w-5 text-primary flex-none" />
            Help & Documentation
          </DialogTitle>
          <DialogDescription className="sr-only">
            Weight tracking help documentation and user guide
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row overflow-hidden flex-1">
          {/* Compact Navigation */}
          <div className="lg:w-52 lg:border-r bg-muted/30">
            <div className="p-2">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-col gap-2">
                {helpSections.map((section) => {
                  const Icon = section.icon
                  const isSelected = selectedSection === section.id
                  return (
                    <Button
                      key={section.id}
                      variant={isSelected ? "default" : "ghost"}
                      size="lg"
                      className={`
                        justify-start text-left h-auto p-2 lg:p-3 min-h-[44px] flex-col lg:flex-row
                        ${isSelected
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "hover:bg-muted focus:bg-muted"
                        }
                      `}
                      onClick={() => handleSectionSelect(section.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSectionSelect(section.id)
                        }
                      }}
                      aria-selected={isSelected}
                      role="tab"
                    >
                      <Icon className="h-4 w-4 lg:mr-2 shrink-0 mb-1 lg:mb-0" />
                      <div className="text-center lg:text-left">
                        <div className="font-medium text-sm leading-tight">{section.title}</div>
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Enhanced Content Area */}
          <div className="flex-1 overflow-y-auto" role="tabpanel">
            {currentSection && (
              <div className="p-4 space-y-4">
                {/* Content Sections */}
                <div className="space-y-6">
                  {currentSection.content.map((item, index) => (
                    <div key={index} className="space-y-3">
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-foreground">{item.subtitle}</h3>
                        <p className="text-base leading-relaxed text-muted-foreground">{item.text}</p>
                      </div>

                      {item.tips && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-2">
                            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            <span className="font-medium text-sm text-blue-800 dark:text-blue-200">Tips</span>
                          </div>
                          <ul className="space-y-1.5">
                            {item.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                                <span className="text-blue-500 mt-1 text-xs">•</span>
                                <span className="leading-relaxed">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

