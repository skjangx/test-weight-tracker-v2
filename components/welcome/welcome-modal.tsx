'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Scale, Target, TrendingDown, BarChart3 } from 'lucide-react'

interface WelcomeModalProps {
  open: boolean
  onGetStarted: () => void
  onSkip: () => void
}

export function WelcomeModal({ open, onGetStarted, onSkip }: WelcomeModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Scale className="h-8 w-8 text-primary" />
          </div>
          
          <DialogTitle className="text-2xl font-bold">
            Welcome to Weight Tracker 🏋️‍♀️
          </DialogTitle>
          
          <DialogDescription className="text-center text-base">
            Your personal weight management companion. Track your progress, set goals, 
            and celebrate milestones on your fitness journey.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          <div className="grid gap-4">
            {/* Feature highlights */}
            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h4 className="font-medium">Set Your Goals</h4>
                <p className="text-sm text-muted-foreground">
                  Define target weights and deadlines to stay motivated
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                <TrendingDown className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-medium">Track Your Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Log daily weights and see trends with interactive graphs
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-100 dark:bg-purple-900/20">
                <BarChart3 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h4 className="font-medium">Celebrate Milestones</h4>
                <p className="text-sm text-muted-foreground">
                  Get confetti celebrations for every 3kg lost!
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            <Button 
              onClick={onGetStarted} 
              className="w-full"
              size="lg"
            >
              Get Started
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={onSkip}
              className="w-full text-sm"
            >
              Skip for now
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-muted-foreground">
              This welcome screen will only show once
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}