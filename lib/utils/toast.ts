import { toast } from 'sonner'

/**
 * Standardized toast notification system
 * Provides consistent messaging and styling across the application
 */

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 4000,
    icon: '✅',
  })
}

export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 6000,
    icon: '❌',
  })
}

export const showInfoToast = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 4000,
    icon: 'ℹ️',
  })
}

export const showWarningToast = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 5000,
    icon: '⚠️',
  })
}

export const showLoadingToast = (message: string, promise?: Promise<any>) => {
  if (promise) {
    return toast.promise(promise, {
      loading: message,
      success: 'Operation completed successfully!',
      error: 'Operation failed. Please try again.',
      duration: 4000,
    })
  } else {
    return toast.loading(message)
  }
}

export const showMilestoneToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 8000,
    icon: '🎉',
    style: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
    },
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