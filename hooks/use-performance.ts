'use client'

import { useEffect, useCallback } from 'react'
import { performanceUtils, PerformanceMarks } from '@/components/performance/web-vitals'

/**
 * Hook for measuring and tracking component performance
 */
export function usePerformanceTracking(componentName: string, enabled = true) {
  const markStart = useCallback((operation?: string) => {
    if (!enabled) return

    const markName = operation ? `${componentName}-${operation}` : componentName
    performanceUtils.markStart(markName)
  }, [componentName, enabled])

  const markEnd = useCallback((operation?: string, log = false) => {
    if (!enabled) return

    const markName = operation ? `${componentName}-${operation}` : componentName
    performanceUtils.markEnd(markName, log)
  }, [componentName, enabled])

  const getMeasure = useCallback((operation?: string) => {
    if (!enabled) return null

    const markName = operation ? `${componentName}-${operation}` : componentName
    return performanceUtils.getMeasure(markName)
  }, [componentName, enabled])

  return {
    markStart,
    markEnd,
    getMeasure,
  }
}

/**
 * Hook for tracking authentication performance
 */
export function useAuthPerformance() {
  const { markStart, markEnd, getMeasure } = usePerformanceTracking('auth')

  const trackLogin = useCallback(() => {
    markStart('login')
    return () => markEnd('login', true)
  }, [markStart, markEnd])

  const trackRegister = useCallback(() => {
    markStart('register')
    return () => markEnd('register', true)
  }, [markStart, markEnd])

  const trackLogout = useCallback(() => {
    markStart('logout')
    return () => markEnd('logout', true)
  }, [markStart, markEnd])

  return {
    trackLogin,
    trackRegister,
    trackLogout,
    getMeasure,
  }
}

/**
 * Hook for tracking weight entry performance
 */
export function useWeightEntryPerformance() {
  const { markStart, markEnd, getMeasure } = usePerformanceTracking('weight-entry')

  const trackAdd = useCallback(() => {
    markStart('add')
    return () => markEnd('add', true)
  }, [markStart, markEnd])

  const trackEdit = useCallback(() => {
    markStart('edit')
    return () => markEnd('edit', true)
  }, [markStart, markEnd])

  const trackDelete = useCallback(() => {
    markStart('delete')
    return () => markEnd('delete', true)
  }, [markStart, markEnd])

  const trackLoad = useCallback(() => {
    markStart('load')
    return () => markEnd('load', true)
  }, [markStart, markEnd])

  return {
    trackAdd,
    trackEdit,
    trackDelete,
    trackLoad,
    getMeasure,
  }
}

/**
 * Hook for tracking chart rendering performance
 */
export function useChartPerformance() {
  const { markStart, markEnd, getMeasure } = usePerformanceTracking('chart')

  const trackRender = useCallback((chartType?: string) => {
    const operation = chartType ? `render-${chartType}` : 'render'
    markStart(operation)
    return () => markEnd(operation, true)
  }, [markStart, markEnd])

  const trackDataLoad = useCallback(() => {
    markStart('data-load')
    return () => markEnd('data-load', true)
  }, [markStart, markEnd])

  const trackInteraction = useCallback((interactionType: string) => {
    markStart(`interaction-${interactionType}`)
    return () => markEnd(`interaction-${interactionType}`, true)
  }, [markStart, markEnd])

  return {
    trackRender,
    trackDataLoad,
    trackInteraction,
    getMeasure,
  }
}

/**
 * Hook for tracking goal operations performance
 */
export function useGoalPerformance() {
  const { markStart, markEnd, getMeasure } = usePerformanceTracking('goal')

  const trackCreate = useCallback(() => {
    markStart('create')
    return () => markEnd('create', true)
  }, [markStart, markEnd])

  const trackUpdate = useCallback(() => {
    markStart('update')
    return () => markEnd('update', true)
  }, [markStart, markEnd])

  const trackDelete = useCallback(() => {
    markStart('delete')
    return () => markEnd('delete', true)
  }, [markStart, markEnd])

  const trackProgressCalculation = useCallback(() => {
    markStart('progress-calc')
    return () => markEnd('progress-calc', true)
  }, [markStart, markEnd])

  return {
    trackCreate,
    trackUpdate,
    trackDelete,
    trackProgressCalculation,
    getMeasure,
  }
}

/**
 * Hook for tracking dashboard loading performance
 */
export function useDashboardPerformance() {
  const { markStart, markEnd, getMeasure } = usePerformanceTracking('dashboard')

  const trackPageLoad = useCallback(() => {
    markStart('page-load')
    return () => markEnd('page-load', true)
  }, [markStart, markEnd])

  const trackStatsLoad = useCallback(() => {
    markStart('stats-load')
    return () => markEnd('stats-load', true)
  }, [markStart, markEnd])

  const trackChartsLoad = useCallback(() => {
    markStart('charts-load')
    return () => markEnd('charts-load', true)
  }, [markStart, markEnd])

  return {
    trackPageLoad,
    trackStatsLoad,
    trackChartsLoad,
    getMeasure,
  }
}

/**
 * Global performance metrics collector
 */
export function usePerformanceMetrics() {
  const collectAllMetrics = useCallback(() => {
    if (typeof window === 'undefined') return {}

    const measurements = performance.getEntriesByType('measure')
    const metrics: Record<string, number> = {}

    measurements.forEach((measure) => {
      metrics[measure.name] = measure.duration
    })

    return metrics
  }, [])

  const getNavigationTiming = useCallback(() => {
    if (typeof window === 'undefined') return null

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    if (!navigation) return null

    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnect: navigation.connectEnd - navigation.connectStart,
      request: navigation.responseStart - navigation.requestStart,
      response: navigation.responseEnd - navigation.responseStart,
      domParsing: navigation.domInteractive - navigation.responseEnd,
      domReady: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      windowLoad: navigation.loadEventEnd - navigation.loadEventStart,
      total: navigation.loadEventEnd - navigation.navigationStart,
    }
  }, [])

  const getResourceTiming = useCallback(() => {
    if (typeof window === 'undefined') return []

    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]

    return resources.map((resource) => ({
      name: resource.name,
      duration: resource.duration,
      size: resource.transferSize,
      type: resource.initiatorType,
    }))
  }, [])

  return {
    collectAllMetrics,
    getNavigationTiming,
    getResourceTiming,
  }
}