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

  const currentSection = helpSections.find(section => section.id === selectedSection)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <HelpCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Help</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <HelpCircle className="h-5 w-5" />
            <span>Weight Tracker Help</span>
          </DialogTitle>
          <DialogDescription>
            Everything you need to know about tracking your weight effectively
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 mt-6 overflow-hidden">
          {/* Help Navigation */}
          <div className="md:w-1/3 space-y-2">
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">Topics</h3>
            {helpSections.map((section) => {
              const Icon = section.icon
              return (
                <Button
                  key={section.id}
                  variant={selectedSection === section.id ? "default" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setSelectedSection(section.id)}
                >
                  <Icon className="h-4 w-4 mr-3 shrink-0" />
                  <div>
                    <div className="font-medium">{section.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {section.description}
                    </div>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Help Content */}
          <div className="md:w-2/3 overflow-y-auto">
            {currentSection && (
              <div className="space-y-6">
                <div className="flex items-start space-x-3">
                  <currentSection.icon className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h2 className="text-xl font-semibold">{currentSection.title}</h2>
                    <p className="text-muted-foreground">{currentSection.description}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6">
                  {currentSection.content.map((item, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="text-lg">{item.subtitle}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm leading-relaxed">{item.text}</p>
                        
                        {item.tips && (
                          <div>
                            <div className="flex items-center space-x-2 mb-3">
                              <Info className="h-4 w-4 text-blue-500" />
                              <Badge variant="secondary" className="text-xs">
                                Pro Tips
                              </Badge>
                            </div>
                            <ul className="space-y-2">
                              {item.tips.map((tip, tipIndex) => (
                                <li key={tipIndex} className="text-sm flex items-start space-x-2">
                                  <span className="text-primary mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Quick Tips Card */}
                <Card className="bg-gradient-to-r from-primary/5 to-blue-50 dark:to-blue-950/20 border-primary/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-primary">
                      <Trophy className="h-5 w-5" />
                      <span>Remember</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm leading-relaxed">
                      Weight loss is a journey, not a race. Small, consistent changes compound over time. 
                      Focus on building sustainable habits rather than seeking quick fixes. 
                      Your health and well-being are more important than any number on a scale.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}