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
        className="max-w-4xl max-h-[95vh] p-0 overflow-hidden"
        onKeyDown={handleKeyDown}
        aria-describedby="help-description"
      >
        <DialogHeader className="p-6 pb-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-primary" />
            <span>Weight Tracker Help</span>
          </DialogTitle>
          <DialogDescription id="help-description" className="text-base">
            Everything you need to know about tracking your weight effectively
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col lg:flex-row overflow-hidden">
          {/* Mobile-First Navigation */}
          <div className="lg:w-80 border-r bg-muted/30">
            <div className="p-4">
              <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wide">
                Topics
              </h3>
              <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible">
                {helpSections.map((section) => {
                  const Icon = section.icon
                  const isSelected = selectedSection === section.id
                  return (
                    <Button
                      key={section.id}
                      variant={isSelected ? "default" : "ghost"}
                      size="lg"
                      className={`
                        w-full lg:w-auto whitespace-nowrap lg:whitespace-normal lg:justify-start text-left h-auto p-4 min-h-[44px]
                        ${isSelected
                          ? "bg-primary text-primary-foreground shadow-md"
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
                      <Icon className="h-5 w-5 lg:mr-3 shrink-0" />
                      <div className="hidden lg:block">
                        <div className="font-semibold text-sm">{section.title}</div>
                        <div className={`text-xs mt-1 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {section.description}
                        </div>
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
              <div className="p-6 space-y-8">
                {/* Section Header */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <currentSection.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold tracking-tight">{currentSection.title}</h2>
                      <p className="text-muted-foreground text-lg">{currentSection.description}</p>
                    </div>
                  </div>
                </div>

                {/* Content Sections */}
                <div className="space-y-8">
                  {currentSection.content.map((item, index) => (
                    <div key={index} className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-foreground">{item.subtitle}</h3>
                        <p className="text-base leading-relaxed text-muted-foreground">{item.text}</p>
                      </div>

                      {item.tips && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-semibold text-blue-800 dark:text-blue-200">Pro Tips</span>
                          </div>
                          <ul className="space-y-2">
                            {item.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-2 text-sm text-blue-700 dark:text-blue-300">
                                <span className="text-blue-500 mt-1">•</span>
                                <span>{tip}</span>
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

