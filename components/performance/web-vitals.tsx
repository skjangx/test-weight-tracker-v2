'use client'

import { useEffect } from 'react'
import type { CLSMetric, FCPMetric, FIDMetric, LCPMetric, TTFBMetric } from 'web-vitals'

/**
 * Web Vitals monitoring component
 * Tracks Core Web Vitals metrics and sends them to analytics
 */
export function WebVitals() {
  useEffect(() => {
    // Only run in production or when explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.NEXT_PUBLIC_ENABLE_WEB_VITALS) {
      return
    }

    const vitalsUrl = 'https://vitals.vercel-analytics.com/v1/vitals'

    function getConnectionSpeed(): string {
      const connection = (navigator as any)?.connection
      if (!connection) return 'unknown'
      return connection.effectiveType || 'unknown'
    }

    function sendToAnalytics(metric: CLSMetric | FCPMetric | FIDMetric | LCPMetric | TTFBMetric) {
      const analyticsId = process.env.NEXT_PUBLIC_VERCEL_ANALYTICS_ID

      const body = {
        dsn: analyticsId,
        id: metric.id,
        page: window.location.pathname,
        href: window.location.href,
        event_name: metric.name,
        value: metric.value.toString(),
        speed: getConnectionSpeed(),
        timestamp: Date.now(),
      }

      // Send to Vercel Analytics if available
      if (analyticsId) {
        const blob = new Blob([new URLSearchParams(body).toString()], {
          type: 'application/x-www-form-urlencoded',
        })

        if (navigator.sendBeacon) {
          navigator.sendBeacon(vitalsUrl, blob)
        } else {
          fetch(vitalsUrl, {
            body: blob,
            method: 'POST',
            credentials: 'omit',
            keepalive: true,
          }).catch(() => {
            // Ignore errors - analytics should not break the app
          })
        }
      }

      // Console logging in development
      if (process.env.NODE_ENV === 'development') {
        console.group(`🔍 Web Vital: ${metric.name}`)
        console.log(`Value: ${metric.value}`)
        console.log(`Rating: ${metric.rating}`)
        console.log(`Delta: ${metric.delta}`)
        console.log(`Page: ${window.location.pathname}`)
        console.groupEnd()
      }

      // Custom analytics integration point
      if (typeof window !== 'undefined' && (window as any).gtag) {
        ;(window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        })
      }
    }

    // Dynamic import to reduce bundle size
    import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
      onCLS(sendToAnalytics)
      onFCP(sendToAnalytics)
      onFID(sendToAnalytics)
      onLCP(sendToAnalytics)
      onTTFB(sendToAnalytics)
    }).catch(() => {
      // web-vitals library not available
    })
  }, [])

  return null
}

/**
 * Performance marks for measuring custom interactions
 */
export const PerformanceMarks = {
  // Authentication flow
  AUTH_LOGIN_START: 'auth-login-start',
  AUTH_LOGIN_END: 'auth-login-end',
  AUTH_REGISTER_START: 'auth-register-start',
  AUTH_REGISTER_END: 'auth-register-end',

  // Data operations
  WEIGHT_ENTRY_START: 'weight-entry-start',
  WEIGHT_ENTRY_END: 'weight-entry-end',
  GOAL_CREATION_START: 'goal-creation-start',
  GOAL_CREATION_END: 'goal-creation-end',

  // Chart rendering
  CHART_RENDER_START: 'chart-render-start',
  CHART_RENDER_END: 'chart-render-end',
  DASHBOARD_LOAD_START: 'dashboard-load-start',
  DASHBOARD_LOAD_END: 'dashboard-load-end',
} as const

/**
 * Utility functions for performance measurement
 */
export const performanceUtils = {
  /**
   * Mark the start of a performance measurement
   */
  markStart: (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`${name}-start`)
    }
  },

  /**
   * Mark the end of a performance measurement and optionally log duration
   */
  markEnd: (name: string, log = false) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const endMark = `${name}-end`
      const startMark = `${name}-start`

      performance.mark(endMark)

      try {
        performance.measure(name, startMark, endMark)

        if (log || process.env.NODE_ENV === 'development') {
          const measure = performance.getEntriesByName(name, 'measure')[0]
          if (measure) {
            console.log(`⏱️ ${name}: ${measure.duration.toFixed(2)}ms`)
          }
        }
      } catch {
        // Ignore measurement errors
      }
    }
  },

  /**
   * Get performance entries for a specific measurement
   */
  getMeasure: (name: string) => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const measures = performance.getEntriesByName(name, 'measure')
      return measures.length > 0 ? measures[0] : null
    }
    return null
  },

  /**
   * Clear all performance marks and measures
   */
  clearMeasures: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.clearMarks()
      performance.clearMeasures()
    }
  },
}

/**
 * Hook for measuring component render performance
 */
export function usePerformanceMeasure(componentName: string, dependencies: any[] = []) {
  useEffect(() => {
    performanceUtils.markStart(componentName)

    return () => {
      performanceUtils.markEnd(componentName, true)
    }
  }, dependencies)
}