"use client"

import { useState, useRef } from 'react'
import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { GoalCreationModal } from '@/components/goals/goal-creation-modal'
import { ActiveGoalDisplay } from '@/components/goals/active-goal-display'
import { GoalHistorySheet } from '@/components/goals/goal-history-sheet'
import { AddWeightDialog } from '@/components/weight/add-weight-dialog'
import { WeightEntriesTable, type WeightEntriesTableRef } from '@/components/weight/weight-entries-table'
import { useDashboardStats } from '@/hooks/use-dashboard-stats'
import { LogOut, User, TrendingDown, History } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { stats, loading: statsLoading } = useDashboardStats()
  const [goalHistoryOpen, setGoalHistoryOpen] = useState(false)
  const [addWeightOpen, setAddWeightOpen] = useState(false)
  const weightEntriesTableRef = useRef<WeightEntriesTableRef>(null)

  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">Weight Tracker</h1>
            <span className="text-muted-foreground">🏋️‍♀️</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4" />
              <span>Welcome, {user?.email}!</span>
            </div>
            <ThemeToggle />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Active Goal Display */}
          <ActiveGoalDisplay />

          {/* Quick Stats Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingDown className="h-5 w-5 text-green-500" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : stats.weightEntries}
                  </p>
                  <p className="text-sm text-muted-foreground">Weight Entries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : stats.activeGoals}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : stats.dayStreak}
                  </p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Start your weight tracking journey by setting a goal or logging your weight.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <GoalCreationModal />
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setAddWeightOpen(true)}
                >
                  Add Weight
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setGoalHistoryOpen(true)}
                >
                  <History className="mr-2 h-4 w-4" />
                  Goal History
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Weight Entries Table */}
          <div className="lg:col-span-3">
            <WeightEntriesTable ref={weightEntriesTableRef} />
          </div>
        </div>
      </main>
      
      <GoalHistorySheet 
        open={goalHistoryOpen}
        onOpenChange={setGoalHistoryOpen}
      />
      
      <AddWeightDialog 
        open={addWeightOpen}
        onOpenChange={setAddWeightOpen}
        onSuccess={() => weightEntriesTableRef.current?.refreshEntries()}
      />
    </div>
  )
}