'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePerformanceMetrics } from '@/hooks/use-performance'
import { performanceUtils } from '@/components/performance/web-vitals'
import { RefreshCw, Download, AlertTriangle, CheckCircle } from 'lucide-react'

/**
 * Performance monitoring dashboard for developers
 * Only accessible in development or with special flag
 */
export default function PerformancePage() {
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [navigationTiming, setNavigationTiming] = useState<any>(null)
  const [resourceTiming, setResourceTiming] = useState<any[]>([])
  const [webVitals, setWebVitals] = useState<Record<string, any>>({})
  const { collectAllMetrics, getNavigationTiming, getResourceTiming } = usePerformanceMetrics()

  // Only show in development or with performance flag
  const isAccessible = process.env.NODE_ENV === 'development' ||
                      process.env.NEXT_PUBLIC_SHOW_PERFORMANCE === 'true'

  useEffect(() => {
    if (!isAccessible) return

    const updateMetrics = () => {
      setMetrics(collectAllMetrics())
      setNavigationTiming(getNavigationTiming())
      setResourceTiming(getResourceTiming())
    }

    // Initial load
    updateMetrics()

    // Update every 5 seconds
    const interval = setInterval(updateMetrics, 5000)

    // Listen for custom performance events
    const handlePerformanceUpdate = () => updateMetrics()
    window.addEventListener('performance-update', handlePerformanceUpdate)

    // Collect web vitals from global if available
    if (typeof window !== 'undefined' && (window as any).__webVitals) {
      setWebVitals((window as any).__webVitals)
    }

    return () => {
      clearInterval(interval)
      window.removeEventListener('performance-update', handlePerformanceUpdate)
    }
  }, [isAccessible, collectAllMetrics, getNavigationTiming, getResourceTiming])

  const refreshMetrics = () => {
    setMetrics(collectAllMetrics())
    setNavigationTiming(getNavigationTiming())
    setResourceTiming(getResourceTiming())
  }

  const clearAllMetrics = () => {
    performanceUtils.clearMeasures()
    setMetrics({})
  }

  const exportMetrics = () => {
    const data = {
      timestamp: new Date().toISOString(),
      customMetrics: metrics,
      navigationTiming,
      resourceTiming,
      webVitals,
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-metrics-${new Date().getTime()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getMetricStatus = (name: string, value: number) => {
    const thresholds: Record<string, { good: number; needs_improvement: number }> = {
      'auth-login': { good: 1000, needs_improvement: 2000 },
      'auth-register': { good: 1500, needs_improvement: 3000 },
      'weight-entry-add': { good: 500, needs_improvement: 1000 },
      'chart-render': { good: 300, needs_improvement: 600 },
      'dashboard-page-load': { good: 2000, needs_improvement: 4000 },
    }

    const threshold = thresholds[name]
    if (!threshold) return 'unknown'

    if (value <= threshold.good) return 'good'
    if (value <= threshold.needs_improvement) return 'needs-improvement'
    return 'poor'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'good':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'needs-improvement':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'poor':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  if (!isAccessible) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Performance Dashboard</CardTitle>
            <CardDescription>
              This page is only available in development mode or when NEXT_PUBLIC_SHOW_PERFORMANCE is enabled.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground">Monitor application performance metrics</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refreshMetrics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportMetrics} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={clearAllMetrics} variant="outline" size="sm">
            Clear
          </Button>
        </div>
      </div>

      <Tabs defaultValue="custom" className="space-y-4">
        <TabsList>
          <TabsTrigger value="custom">Custom Metrics</TabsTrigger>
          <TabsTrigger value="navigation">Navigation Timing</TabsTrigger>
          <TabsTrigger value="resources">Resource Timing</TabsTrigger>
          <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Performance Measurements</CardTitle>
              <CardDescription>
                Application-specific performance metrics measured using Performance API
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(metrics).length === 0 ? (
                <p className="text-muted-foreground">No custom metrics recorded yet. Use the application to generate metrics.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(metrics).map(([name, duration]) => {
                    const status = getMetricStatus(name, duration)
                    return (
                      <Card key={name}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              <h3 className="font-medium">{name}</h3>
                            </div>
                            <Badge variant={status === 'good' ? 'default' : status === 'needs-improvement' ? 'secondary' : 'destructive'}>
                              {duration.toFixed(2)}ms
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="navigation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Navigation Timing</CardTitle>
              <CardDescription>
                Browser navigation performance breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {navigationTiming ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.dnsLookup?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">DNS Lookup</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.tcpConnect?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">TCP Connect</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.request?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">Request</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.response?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">Response</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.domParsing?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">DOM Parsing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.domReady?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">DOM Ready</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{navigationTiming.windowLoad?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">Window Load</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">{navigationTiming.total?.toFixed(0)}ms</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">Navigation timing data not available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resource Timing</CardTitle>
              <CardDescription>
                Loading performance of individual resources
              </CardDescription>
            </CardHeader>
            <CardContent>
              {resourceTiming.length > 0 ? (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {resourceTiming
                    .filter(resource => resource.duration > 10) // Filter out very fast resources
                    .sort((a, b) => b.duration - a.duration)
                    .slice(0, 20) // Show top 20 slowest
                    .map((resource, index) => (
                      <div key={index} className="flex items-center justify-between p-2 rounded border">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{resource.name.split('/').pop()}</div>
                          <div className="text-xs text-muted-foreground">
                            {resource.type} • {(resource.size / 1024).toFixed(1)}KB
                          </div>
                        </div>
                        <Badge variant="outline">{resource.duration.toFixed(0)}ms</Badge>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No resource timing data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core Web Vitals</CardTitle>
              <CardDescription>
                Essential metrics for user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(webVitals).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(webVitals).map(([name, data]: [string, any]) => (
                    <Card key={name}>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold">{data.value?.toFixed(2)}</div>
                        <div className="text-sm text-muted-foreground">{name}</div>
                        <Badge
                          className="mt-2"
                          variant={data.rating === 'good' ? 'default' : data.rating === 'needs-improvement' ? 'secondary' : 'destructive'}
                        >
                          {data.rating}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">
                  Web Vitals data will be collected as you use the application.
                  Refresh the page or navigate around to see metrics.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}