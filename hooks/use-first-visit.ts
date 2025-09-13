'use client'

import { useState, useEffect } from 'react'

const FIRST_VISIT_KEY = 'weight-tracker-first-visit-completed'

/**
 * Hook to manage first-visit detection and welcome screen display
 */
export function useFirstVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      // Check if user has completed the welcome flow
      const hasCompletedWelcome = localStorage.getItem(FIRST_VISIT_KEY)
      const isFirst = !hasCompletedWelcome
      
      setIsFirstVisit(isFirst)
    } catch (error) {
      // If localStorage is not available, assume not first visit
      console.warn('localStorage not available:', error)
      setIsFirstVisit(false)
    } finally {
      setLoading(false)
    }
  }, [])

  const markWelcomeCompleted = () => {
    try {
      localStorage.setItem(FIRST_VISIT_KEY, 'true')
      setIsFirstVisit(false)
    } catch (error) {
      console.warn('Could not save welcome completion:', error)
      // Still update state even if localStorage fails
      setIsFirstVisit(false)
    }
  }

  const resetFirstVisit = () => {
    try {
      localStorage.removeItem(FIRST_VISIT_KEY)
      setIsFirstVisit(true)
    } catch (error) {
      console.warn('Could not reset first visit:', error)
    }
  }

  return {
    isFirstVisit,
    loading,
    markWelcomeCompleted,
    resetFirstVisit
  }
}