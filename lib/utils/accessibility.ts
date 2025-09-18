/**
 * Accessibility utilities for better user experience
 * Provides focus management, ARIA label helpers, and screen reader improvements
 */

/**
 * Trap focus within a container (useful for modals)
 */
export function trapFocus(container: HTMLElement) {
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus()
        e.preventDefault()
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus()
        e.preventDefault()
      }
    }
  }

  container.addEventListener('keydown', handleTabKey)

  // Focus first element
  firstElement?.focus()

  return () => {
    container.removeEventListener('keydown', handleTabKey)
  }
}

/**
 * Focus management for route changes
 */
export function announceRouteChange(routeName: string) {
  // Create a live region for screen readers
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', 'polite')
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = `Navigated to ${routeName}`

  document.body.appendChild(announcement)

  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Generate descriptive ARIA labels for components
 */
export const ariaLabels = {
  stats: {
    weightEntries: (count: number) =>
      `You have logged ${count} weight ${count === 1 ? 'entry' : 'entries'}`,
    activeGoals: (count: number) =>
      `You have ${count} active ${count === 1 ? 'goal' : 'goals'}`,
    dayStreak: (count: number) =>
      `Current streak: ${count} ${count === 1 ? 'day' : 'days'} of consistent tracking`,
  },
  navigation: {
    logout: 'Sign out of your Weight Tracker account',
    themeToggle: 'Switch between light and dark theme',
    help: 'Open help and documentation',
    sync: 'View synchronization status and settings',
  },
  actions: {
    addWeight: 'Add a new weight entry to your tracking log',
    createGoal: 'Create a new weight loss or gain goal',
    viewHistory: 'View your complete goal history and achievements',
    editEntry: (weight: number, date: string) =>
      `Edit weight entry of ${weight} kg recorded on ${date}`,
    deleteEntry: (weight: number, date: string) =>
      `Delete weight entry of ${weight} kg recorded on ${date}`,
  },
  progress: {
    goalProgress: (current: number, target: number, percentage: number) =>
      `Goal progress: ${current} kg of ${target} kg target, ${percentage}% complete`,
    weightLoss: (amount: number, period: string) =>
      `You've lost ${amount} kg ${period}`,
    weightGain: (amount: number, period: string) =>
      `You've gained ${amount} kg ${period}`,
  },
  chart: {
    weightTrend: 'Interactive chart showing your weight progress over time',
    dataPoint: (weight: number, date: string) =>
      `Weight: ${weight} kg on ${date}`,
    noData: 'No weight data available for the selected time period',
  },
  forms: {
    required: 'This field is required',
    weightInput: 'Enter your weight in kilograms',
    dateInput: 'Select the date for this weight entry',
    memoInput: 'Optional notes about this weight entry',
    goalTarget: 'Enter your target weight goal',
    goalDeadline: 'Set a deadline for achieving your goal',
  }
}

/**
 * Screen reader announcement helper
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div')
  announcement.setAttribute('aria-live', priority)
  announcement.setAttribute('aria-atomic', 'true')
  announcement.className = 'sr-only'
  announcement.textContent = message

  document.body.appendChild(announcement)

  setTimeout(() => {
    document.body.removeChild(announcement)
  }, 1000)
}

/**
 * Keyboard navigation helpers
 */
export const keyboardHandlers = {
  /**
   * Handle escape key to close modals/overlays
   */
  escapeKey: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback()
    }
  },

  /**
   * Handle enter/space key for button-like elements
   */
  activationKeys: (callback: () => void) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      callback()
    }
  },

  /**
   * Arrow key navigation for lists/grids
   */
  arrowNavigation: (
    elements: HTMLElement[],
    currentIndex: number,
    callback: (newIndex: number) => void
  ) => (e: KeyboardEvent) => {
    let newIndex = currentIndex

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        newIndex = (currentIndex + 1) % elements.length
        break
      case 'ArrowUp':
      case 'ArrowLeft':
        newIndex = currentIndex === 0 ? elements.length - 1 : currentIndex - 1
        break
      case 'Home':
        newIndex = 0
        break
      case 'End':
        newIndex = elements.length - 1
        break
      default:
        return
    }

    e.preventDefault()
    elements[newIndex]?.focus()
    callback(newIndex)
  }
}

/**
 * Color contrast checker
 */
export function hasGoodContrast(foreground: string, background: string): boolean {
  // Simplified contrast check - in production, use a proper color contrast library
  // This is a basic implementation for demonstration

  const getLuminance = (hex: string): number => {
    const rgb = hex.match(/\w\w/g)?.map(x => parseInt(x, 16)) || [0, 0, 0]
    const [r, g, b] = rgb.map(val => {
      const sRGB = val / 255
      return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4)
    })

    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const l1 = getLuminance(foreground)
  const l2 = getLuminance(background)
  const contrast = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05)

  return contrast >= 4.5 // WCAG AA standard
}

/**
 * Focus visible utility for custom focus indicators
 */
export function addFocusVisibleSupport() {
  // Add focus-visible polyfill behavior if not natively supported
  if (!('focus-visible' in document.createElement('div').style)) {
    // Simple fallback for browsers without focus-visible support
    document.addEventListener('keydown', () => {
      document.body.classList.add('using-keyboard')
    })

    document.addEventListener('mousedown', () => {
      document.body.classList.remove('using-keyboard')
    })
  }
}

/**
 * Reduced motion detection
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * High contrast mode detection
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches
}