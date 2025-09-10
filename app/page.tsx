"use client"

import { useAuth } from '@/lib/auth/context'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading state while determining authentication status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
      <Card className="p-6">
        <CardContent className="flex flex-col items-center space-y-4 p-0">
          <Loader2 className="h-8 w-8 animate-spin" />
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">Weight Tracker</h1>
            <p className="text-sm text-muted-foreground">
              Loading your dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
