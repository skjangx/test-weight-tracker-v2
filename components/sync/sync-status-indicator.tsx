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
import { toast } from 'sonner'
import { 
  RefreshCw, 
  Wifi, 
  WifiOff, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Clock
} from 'lucide-react'

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

  const handleManualSync = async () => {
    try {
      await manualSync()
      toast.success('Data refreshed successfully', {
        icon: <CheckCircle className="h-4 w-4" />
      })
    } catch (error) {
      toast.error('Failed to refresh data', {
        icon: <AlertCircle className="h-4 w-4" />
      })
    }
  }

  const handleClearError = () => {
    clearError()
    toast.info('Error cleared')
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
              <div className="flex items-center">
                {syncStatus.isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{syncStatus.isOnline ? 'Online' : 'Offline'}</p>
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
        variant={syncStatus.isOnline ? 'default' : 'destructive'}
        className="flex items-center space-x-1"
      >
        {syncStatus.isOnline ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Online</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Offline</span>
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