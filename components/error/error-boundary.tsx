'use client'

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
}

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const router = useRouter()

  const handleGoHome = () => {
    router.push('/')
  }

  const handleReportIssue = () => {
    // In a real app, this could open a feedback modal or link to issue tracker
    const subject = encodeURIComponent(`Bug Report: ${error.name}`)
    const body = encodeURIComponent(`
Error: ${error.message}

Stack Trace:
${error.stack}

URL: ${window.location.href}
User Agent: ${navigator.userAgent}
Timestamp: ${new Date().toISOString()}
    `)
    window.open(`mailto:support@example.com?subject=${subject}&body=${body}`)
  }

  const isChunkLoadError = error.message.includes('Loading chunk') || 
                          error.message.includes('Loading CSS chunk')
  
  const isNetworkError = error.message.includes('NetworkError') || 
                         error.message.includes('fetch')

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <CardTitle className="text-2xl">Something went wrong</CardTitle>
          <CardDescription>
            We encountered an unexpected error. Don't worry, our team has been notified.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error-specific messages */}
          {isChunkLoadError && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Update Available</AlertTitle>
              <AlertDescription>
                The app has been updated. Please refresh your browser to get the latest version.
              </AlertDescription>
            </Alert>
          )}
          
          {isNetworkError && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Network Error</AlertTitle>
              <AlertDescription>
                Please check your internet connection and try again.
              </AlertDescription>
            </Alert>
          )}

          {/* Error details for development */}
          {process.env.NODE_ENV === 'development' && (
            <Alert variant="destructive">
              <Bug className="h-4 w-4" />
              <AlertTitle>Development Error Details</AlertTitle>
              <AlertDescription className="mt-2">
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">
                    {error.name}: {error.message}
                  </summary>
                  <pre className="mt-2 text-xs overflow-auto bg-muted p-2 rounded">
                    {error.stack}
                  </pre>
                </details>
              </AlertDescription>
            </Alert>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button 
              onClick={resetErrorBoundary} 
              className="flex-1"
              variant="default"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Button>
            
            <Button 
              onClick={handleGoHome} 
              variant="outline" 
              className="flex-1"
            >
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
            
            <Button 
              onClick={handleReportIssue} 
              variant="outline"
              className="flex-1"
            >
              <Bug className="mr-2 h-4 w-4" />
              Report Issue
            </Button>
          </div>

          {/* Additional help text */}
          <div className="text-center text-sm text-muted-foreground pt-4 border-t">
            <p>
              If this problem persists, please try refreshing your browser or clearing your cache.
              You can also contact our support team for assistance.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<ErrorFallbackProps>
  onError?: (error: Error, errorInfo: { componentStack: string }) => void
  resetKeys?: Array<string | number | boolean | undefined | null>
  resetOnPropsChange?: boolean
}

export function ErrorBoundary({ 
  children, 
  fallback = ErrorFallback,
  onError,
  resetKeys,
  resetOnPropsChange = true 
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: { componentStack: string }) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error)
      console.error('Error Info:', errorInfo)
    }

    // Call custom error handler if provided
    onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry, LogRocket, etc.
      // Sentry.captureException(error, { extra: errorInfo })
    }
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback}
      onError={handleError}
      resetKeys={resetKeys}
      resetOnPropsChange={resetOnPropsChange}
    >
      {children}
    </ReactErrorBoundary>
  )
}

// Specialized error boundaries for different sections
export function DashboardErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      onError={(error) => {
        console.error('Dashboard error:', error)
      }}
      resetKeys={[]} // Reset when user navigates
    >
      {children}
    </ErrorBoundary>
  )
}

export function ChartErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Chart Error</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Unable to load the chart. This might be due to invalid data or a temporary issue.
              </AlertDescription>
            </Alert>
            <Button onClick={resetErrorBoundary} variant="outline" size="sm">
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function FormErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Form Error</AlertTitle>
          <AlertDescription className="mb-3">
            There was an error with the form. Please try again.
          </AlertDescription>
          <Button onClick={resetErrorBoundary} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset Form
          </Button>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}