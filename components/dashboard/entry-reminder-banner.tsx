'use client'

import { useEffect, useState } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/lib/auth/context'
import { format } from 'date-fns'

interface EntryReminderBannerProps {
  onQuickAddClick: () => void
}

export function EntryReminderBanner({ onQuickAddClick }: EntryReminderBannerProps) {
  const [showBanner, setShowBanner] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const checkTodayEntry = async () => {
      if (!user) return

      try {
        const today = format(new Date(), 'yyyy-MM-dd')
        
        // Check if user has dismissed banner today
        const dismissalKey = `entry-reminder-dismissed-${today}`
        const dismissed = localStorage.getItem(dismissalKey)
        if (dismissed) {
          setIsDismissed(true)
          return
        }

        // Check if user has any weight entries for today
        const { data, error } = await supabase
          .from('weight_entries')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', today)
          .limit(1)

        if (error) {
          console.error('Error checking today\'s entries:', error)
          return
        }

        // Show banner if no entries exist for today
        setShowBanner(!data || data.length === 0)
      } catch (error) {
        console.error('Error in checkTodayEntry:', error)
      }
    }

    checkTodayEntry()

    // Listen for weight entry changes to hide banner
    const handleWeightEntryCreated = () => {
      setShowBanner(false)
    }

    window.addEventListener('weightEntryCreated', handleWeightEntryCreated)
    window.addEventListener('weightEntryUpdated', handleWeightEntryCreated)

    return () => {
      window.removeEventListener('weightEntryCreated', handleWeightEntryCreated)
      window.removeEventListener('weightEntryUpdated', handleWeightEntryCreated)
    }
  }, [user])

  const handleDismiss = () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const dismissalKey = `entry-reminder-dismissed-${today}`
    localStorage.setItem(dismissalKey, 'true')
    setIsDismissed(true)
    setShowBanner(false)
  }

  if (!showBanner || isDismissed) {
    return null
  }

  return (
    <div 
      className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6"
      data-testid="entry-reminder-banner"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-300">📊</span>
            </div>
          </div>
          <div>
            <p className="text-blue-800 dark:text-blue-200 font-medium">
              Don&apos;t forget to log today&apos;s weight
            </p>
            <p className="text-blue-600 dark:text-blue-300 text-sm">
              Keep your tracking streak going!
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            onClick={onQuickAddClick}
            data-testid="quick-add-weight"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Quick Add
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            data-testid="dismiss-reminder"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-800"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}