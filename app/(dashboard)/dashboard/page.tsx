"use client"

import React, { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/lib/auth/context'
import { ThemeToggle } from '@/components/theme-toggle'
import { ActiveGoalDisplay, ProjectionBanner } from '@/components/goals/active-goal-display'
import { GoalHistorySheet } from '@/components/goals/goal-history-sheet'
import { AddWeightDialog } from '@/components/weight/add-weight-dialog'
import { WeightEntriesTable, type WeightEntriesTableRef } from '@/components/weight/weight-entries-table'
import { EntryReminderBanner } from '@/components/dashboard/entry-reminder-banner'
import { WeightTrendGraph } from '@/components/visualization/weight-trend-graph'
import { MilestoneTracker } from '@/components/effects/confetti-celebration'
import { TrendAnalysis } from '@/components/progress/trend-analysis'
import { ThisWeekProgress } from '@/components/progress/this-week-progress'
import { SyncStatusIndicator } from '@/components/sync/sync-status-indicator'
import { WelcomeModal } from '@/components/welcome/welcome-modal'
import { DashboardErrorBoundary, ChartErrorBoundary } from '@/components/error/error-boundary'
import { HelpModal } from '@/components/help/help-modal'
import { TooltipProvider } from '@/components/ui/tooltip'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { useWeightData } from '@/hooks/use-weight-data'
import { useFirstVisit } from '@/hooks/use-first-visit'
import { useDashboardPerformance } from '@/hooks/use-performance'
import { useStreak } from '@/hooks/use-streak'
import { FadeIn, SlideIn, AnimatedButton } from '@/components/ui/animated-components'
import { LogOut } from 'lucide-react'

export default function DashboardPage() {
  const { logout } = useAuth()
  const { loading: statsLoading } = useDashboardStats()
  const { startingWeight, currentWeight } = useWeightData()
  const { isFirstVisit, loading: firstVisitLoading, markWelcomeCompleted } = useFirstVisit()
  const { trackPageLoad } = useDashboardPerformance()
  // Initialize streak tracking to ensure data is updated
  useStreak()
  const [goalHistoryOpen, setGoalHistoryOpen] = useState(false)
  const [addWeightOpen, setAddWeightOpen] = useState(false)
  const weightEntriesTableRef = useRef<WeightEntriesTableRef>(null)

  // Track dashboard loading performance
  const endPageLoadTracking = trackPageLoad()

  // Mark page as loaded when all critical data is ready
  useEffect(() => {
    if (!statsLoading && !firstVisitLoading) {
      endPageLoadTracking()
    }
  }, [statsLoading, firstVisitLoading, endPageLoadTracking])

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const handleWelcomeGetStarted = () => {
    markWelcomeCompleted()
    // Optionally scroll to quick actions or open goal creation
    document.getElementById('quick-actions')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleWelcomeSkip = () => {
    markWelcomeCompleted()
  }

  return (
    <TooltipProvider>
      <DashboardErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* Optimized Header */}
        <FadeIn>
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto flex h-16 items-center justify-between px-4 max-w-7xl">
              {/* Left Section - Branding */}
              <SlideIn direction="left" delay={100}>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl font-semibold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    Weight Tracker
                  </h1>
                  <span className="text-lg">🏋️‍♀️</span>
                </div>
              </SlideIn>

              {/* Right Section - Actions */}
              <SlideIn direction="right" delay={200}>
                <div className="flex items-center gap-3">
                  {/* Sync Status */}
                  <FadeIn delay={300}>
                    <div className="hidden md:block">
                      <SyncStatusIndicator compact />
                    </div>
                  </FadeIn>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-1">
                    <FadeIn delay={350}>
                      <HelpModal />
                    </FadeIn>
                    <FadeIn delay={400}>
                      <ThemeToggle />
                    </FadeIn>
                    <FadeIn delay={450}>
                      <AnimatedButton
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        className="flex items-center gap-2"
                        hoverScale
                        pressEffect
                      >
                        <LogOut className="h-4 w-4" />
                        <span className="hidden lg:inline">Logout</span>
                      </AnimatedButton>
                    </FadeIn>
                  </div>
                </div>
              </SlideIn>
            </div>
          </header>
        </FadeIn>

        {/* Main Content */}
        <main className="@container/main container mx-auto px-4 py-6 max-w-7xl lg:px-6 lg:py-8">
        {/* Entry Reminder Banner */}
        <FadeIn delay={100}>
          <EntryReminderBanner onQuickAddClick={() => setAddWeightOpen(true)} />
        </FadeIn>

        {/* Balanced Grid Layout */}
        <div className="grid grid-cols-1 gap-4 md:gap-6 @4xl/main:grid-cols-12">
          {/* Left Column - Goals & Progress (5/12 = 42%) */}
          <div className="@4xl/main:col-span-5 space-y-4 md:space-y-6">
            {/* Active Goal Display */}
            <SlideIn delay={300} direction="up">
              <ActiveGoalDisplay />
            </SlideIn>

            {/* Projection Banner - Positioned between Goal and Progress */}
            <FadeIn delay={325}>
              <ProjectionBanner />
            </FadeIn>

            {/* This Week's Progress */}
            <SlideIn delay={350} direction="up">
              <ThisWeekProgress />
            </SlideIn>

            {/* Trend Analysis - Always Visible */}
            <SlideIn delay={400} direction="up">
              <TrendAnalysis />
            </SlideIn>
          </div>

          {/* Right Column - Data & Visualization (7/12 = 58%) */}
          <div className="@4xl/main:col-span-7 space-y-4 md:space-y-6">
            {/* Weight Trend Graph */}
            <SlideIn delay={450} direction="up">
              <ChartErrorBoundary>
                <WeightTrendGraph />
              </ChartErrorBoundary>
            </SlideIn>

            {/* Weight Entries Table */}
            <SlideIn delay={500} direction="up">
              <WeightEntriesTable ref={weightEntriesTableRef} />
            </SlideIn>
          </div>
        </div>
      </main>
      </div>
      
      <GoalHistorySheet 
        open={goalHistoryOpen}
        onOpenChange={setGoalHistoryOpen}
      />
      
      <AddWeightDialog 
        open={addWeightOpen}
        onOpenChange={setAddWeightOpen}
        onSuccess={() => weightEntriesTableRef.current?.refreshEntries()}
      />
      
      {/* Milestone Celebrations */}
      <MilestoneTracker 
        startingWeight={startingWeight}
        currentWeight={currentWeight}
      />
      
      {/* Welcome Modal */}
      <WelcomeModal
        open={!firstVisitLoading && isFirstVisit === true}
        onGetStarted={handleWelcomeGetStarted}
        onSkip={handleWelcomeSkip}
      />
    </DashboardErrorBoundary>
    </TooltipProvider>
  )
}