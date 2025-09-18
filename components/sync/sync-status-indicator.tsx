'use client'

import { useSync } from '@/lib/sync/context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { showSuccessToast, showErrorToast, showInfoToast, ToastMessages } from '@/lib/utils/toast'
import { PulseIndicator, AnimatedButton } from '@/components/ui/animated-components'
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react'
import { useState, useEffect } from 'react'

interface SyncStatusIndicatorProps {
  showRefreshButton?: boolean
  showLastSynced?: boolean
  compact?: boolean
}

export function SyncStatusIndicator({ 
  showRefreshButton = true, 
  showLastSynced = true,
  compact = false
}: SyncStatusIndicatorProps) {
  const { syncStatus, manualSync, clearError, getTimeSinceLastSync } = useSync()
  const [isClient, setIsClient] = useState(false)

  // Prevent hydration mismatch by only showing online status after client hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleManualSync = async () => {
    try {
      await manualSync()
      showSuccessToast(ToastMessages.sync.success)
    } catch (error) {
      showErrorToast(ToastMessages.sync.error)
    }
  }

  const handleClearError = () => {
    clearError()
    showInfoToast('Error cleared')
  }

  const getSyncStatusIcon = () => {
    if (syncStatus.isSyncing) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }
    
    if (syncStatus.error) {
      return <AlertCircle className="h-4 w-4 text-red-500" />
    }
    
    if (syncStatus.lastSynced) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    
    return <Clock className="h-4 w-4 text-muted-foreground" />
  }

  const getSyncStatusText = () => {
    if (syncStatus.isSyncing) {
      return 'Syncing...'
    }
    
    if (syncStatus.error) {
      return 'Sync failed'
    }
    
    return `Last synced: ${getTimeSinceLastSync()}`
  }

  const getSyncStatusVariant = (): "default" | "secondary" | "destructive" | "outline" => {
    if (syncStatus.error) return 'destructive'
    if (syncStatus.isSyncing) return 'secondary'
    return 'outline'
  }

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        {/* Online/Offline indicator */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center relative">
                {isClient ? (
                  syncStatus.isOnline ? (
                    <div className="relative">
                      <Wifi className="h-4 w-4 text-green-500" />
                      <PulseIndicator
                        className="absolute -top-1 -right-1"
                        color="bg-green-500"
                        size={6}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <PulseIndicator
                        className="absolute -top-1 -right-1"
                        color="bg-red-500"
                        size={6}
                      />
                    </div>
                  )
                ) : (
                  <div className="h-4 w-4 bg-muted animate-pulse rounded" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isClient ? (syncStatus.isOnline ? 'Online' : 'Offline') : 'Loading...'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Sync status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center">
                {getSyncStatusIcon()}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{getSyncStatusText()}</p>
              {syncStatus.error && (
                <p className="text-xs text-muted-foreground mt-1">
                  {syncStatus.error}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Manual refresh button */}
        {showRefreshButton && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualSync}
            disabled={syncStatus.isSyncing || !syncStatus.isOnline}
            data-testid="manual-refresh-button"
          >
            <RefreshCw className={`h-4 w-4 ${syncStatus.isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Connection status badge */}
      <Badge 
        variant={isClient ? (syncStatus.isOnline ? 'default' : 'destructive') : 'secondary'}
        className="flex items-center space-x-1"
      >
        {isClient ? (
          syncStatus.isOnline ? (
            <>
              <Wifi className="h-3 w-3" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3" />
              <span>Offline</span>
            </>
          )
        ) : (
          <>
            <div className="h-3 w-3 bg-muted animate-pulse rounded" />
            <span>Loading...</span>
          </>
        )}
      </Badge>

      {/* Sync status */}
      <div className="flex items-center space-x-2">
        <Badge 
          variant={getSyncStatusVariant()}
          className="flex items-center space-x-1"
          data-testid="sync-status-badge"
        >
          {getSyncStatusIcon()}
          <span className="text-xs">
            {syncStatus.isSyncing ? 'Syncing' : syncStatus.error ? 'Error' : 'Synced'}
          </span>
        </Badge>

        {showLastSynced && !syncStatus.isSyncing && (
          <span 
            className="text-xs text-muted-foreground"
            data-testid="last-synced-text"
          >
            {getSyncStatusText()}
          </span>
        )}
      </div>

      {/* Error details and actions */}
      {syncStatus.error && (
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearError}
                  data-testid="clear-error-button"
                >
                  <AlertCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="font-medium">Sync Error</p>
                <p className="text-xs">{syncStatus.error}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Retry #{syncStatus.retryCount} 
                  {syncStatus.retryCount < 5 && ' - Auto-retry in progress'}
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      {/* Manual refresh button */}
      {showRefreshButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={handleManualSync}
          disabled={syncStatus.isSyncing || !syncStatus.isOnline}
          data-testid="manual-refresh-button"
        >
          {syncStatus.isSyncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      )}
    </div>
  )
}

export function SyncStatusSkeleton({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    )
  }

  return (
    <div className="flex items-center space-x-3">
      <Skeleton className="h-6 w-16 rounded-full" />
      <div className="flex items-center space-x-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-8 w-24 rounded-md" />
    </div>
  )
}