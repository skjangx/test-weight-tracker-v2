import { toast } from 'sonner'

/**
 * Standardized toast notification system
 * Provides consistent messaging and styling across the application
 */

// Toast debouncing to prevent spam
const toastCache = new Map<string, number>()
const DEBOUNCE_DELAY = 2000 // 2 seconds between same toast messages

const shouldShowToast = (message: string): boolean => {
  const now = Date.now()
  const lastShown = toastCache.get(message)

  if (!lastShown || (now - lastShown) > DEBOUNCE_DELAY) {
    toastCache.set(message, now)
    return true
  }

  return false
}

// Standard durations for consistency
const DURATIONS = {
  SHORT: 3000,
  MEDIUM: 4000,
  LONG: 6000,
  MILESTONE: 5000, // Reduced from 8000 for better UX
} as const

export const showSuccessToast = (message: string, description?: string) => {
  if (!shouldShowToast(message)) return

  toast.success(message, {
    description,
    duration: DURATIONS.MEDIUM,
    icon: '✅',
  })
}

export const showErrorToast = (message: string, description?: string) => {
  if (!shouldShowToast(message)) return

  toast.error(message, {
    description,
    duration: DURATIONS.LONG,
    icon: '❌',
  })
}

export const showInfoToast = (message: string, description?: string) => {
  if (!shouldShowToast(message)) return

  toast.info(message, {
    description,
    duration: DURATIONS.MEDIUM,
    icon: 'ℹ️',
  })
}

export const showWarningToast = (message: string, description?: string) => {
  if (!shouldShowToast(message)) return

  toast.warning(message, {
    description,
    duration: DURATIONS.LONG,
    icon: '⚠️',
  })
}

export const showLoadingToast = (message: string, promise?: Promise<any>) => {
  if (promise) {
    return toast.promise(promise, {
      loading: message,
      success: 'Operation completed successfully!',
      error: 'Operation failed. Please try again.',
      duration: DURATIONS.MEDIUM,
    })
  } else {
    return toast.loading(message)
  }
}

export const showMilestoneToast = (message: string, description?: string) => {
  // Don't debounce milestone toasts as they're special celebrations
  toast.success(message, {
    description,
    duration: DURATIONS.MILESTONE,
    icon: '🎉',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
    },
    className: 'milestone-toast',
  })
}

// Predefined toast messages for common actions
export const ToastMessages = {
  // Authentication
  auth: {
    registerSuccess: 'Account created successfully!',
    loginError: 'Invalid email or password',
    passwordResetSent: 'Reset email sent to your inbox',
    logoutSuccess: 'Logged out successfully',
    sessionExpired: 'Session expired. Please log in again.',
  },

  // Weight Entries
  weight: {
    addSuccess: 'Weight entry saved!',
    editSuccess: 'Entry updated successfully!',
    deleteSuccess: 'Entry deleted',
    validationError: 'Weight must be between 30-300 kg',
    duplicateDate: 'Entry for this date will be averaged with existing data',
  },

  // Goals
  goals: {
    createSuccess: 'Goal created! Let\'s achieve it together!',
    updateSuccess: 'Goal updated successfully!',
    deleteSuccess: 'Goal removed',
    deleteError: 'Cannot delete goal with active entries',
    milestone5kg: 'Congratulations! 5kg milestone reached! 🎉',
    milestone10kg: 'Amazing! 10kg milestone achieved! 🏆',
    goalAchieved: 'Goal achieved! You did it! 🎯',
  },

  // Sync
  sync: {
    syncing: 'Syncing data...',
    success: 'Data synced successfully!',
    error: 'Sync failed. Retrying...',
    offline: 'You\'re offline. Changes will sync when connection is restored.',
    online: 'Connection restored. Syncing changes...',
  },

  // General
  general: {
    saveSuccess: 'Changes saved successfully!',
    saveError: 'Failed to save changes. Please try again.',
    networkError: 'Network error. Please check your connection.',
    unexpectedError: 'Something went wrong. Please try again.',
    featureNotAvailable: 'This feature is coming soon!',
  },
} as const