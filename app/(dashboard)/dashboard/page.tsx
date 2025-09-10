"use client"

import { useAuth } from '@/lib/auth/context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeToggle } from '@/components/theme-toggle'
import { LogOut, User, Target, TrendingDown } from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()

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
          {/* Welcome Card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-primary" />
                <span>Welcome to Weight Tracker!</span>
              </CardTitle>
              <CardDescription>
                Your weight management journey starts here. Track progress, set goals, and achieve success.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  🎉 Authentication system successfully implemented! You can now:
                </p>
                <ul className="list-disc list-inside space-y-2 text-sm">
                  <li>Register new accounts with secure password requirements</li>
                  <li>Log in with email and password</li>
                  <li>Reset passwords via email</li>
                  <li>Switch between light and dark themes</li>
                  <li>Enjoy secure session management with Supabase Auth</li>
                </ul>
                <div className="pt-4">
                  <p className="text-xs text-muted-foreground">
                    🚀 Ready for Phase 2: Core weight tracking features coming next!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

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
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Weight Entries</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Active Goals</p>
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps Card */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>What&apos;s Coming Next</CardTitle>
              <CardDescription>
                Phase 1 (Foundation) is complete! Here&apos;s what we&apos;ll build in Phase 2:
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold">Weight Goals</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Set target weight & deadline</li>
                    <li>• Track daily/weekly progress</li>
                    <li>• Visual progress indicators</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Data Entry</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Quick weight logging</li>
                    <li>• Daily memo notes</li>
                    <li>• Edit/delete entries</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Sync & Updates</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Optimistic UI updates</li>
                    <li>• Hourly background sync</li>
                    <li>• Manual refresh option</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}