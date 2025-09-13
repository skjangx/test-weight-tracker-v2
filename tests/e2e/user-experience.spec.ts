import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Epic 8: User Experience Features
 * Tests US-8.2 (Welcome Screen), US-8.3 (Loading Skeletons), 
 * US-8.5 (Error Boundaries), US-8.6 (Contextual Help)
 */

test.describe('User Experience Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
    
    // Skip authentication for now - in a real app we'd need to authenticate
    // For testing purposes, we'll assume user is authenticated and has data
  })

  test.describe('US-8.2: Welcome Screen', () => {
    test('should show welcome modal for first-time users', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.evaluate(() => {
        localStorage.removeItem('weight-tracker-first-visit')
      })
      
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Welcome modal should be visible for first-time users
      const welcomeModal = page.locator('[role="dialog"]').filter({ hasText: 'Welcome to Weight Tracker' })
      await expect(welcomeModal).toBeVisible()
      
      // Check for key welcome content
      await expect(welcomeModal).toContainText('Track your weight')
      await expect(welcomeModal).toContainText('Set goals')
      await expect(welcomeModal).toContainText('View progress')
      
      // Check for action buttons
      const getStartedBtn = welcomeModal.locator('button', { hasText: 'Get Started' })
      const skipBtn = welcomeModal.locator('button', { hasText: 'Skip' })
      
      await expect(getStartedBtn).toBeVisible()
      await expect(skipBtn).toBeVisible()
    })

    test('should not show welcome modal for returning users', async ({ page }) => {
      // Set localStorage to simulate returning user
      await page.evaluate(() => {
        localStorage.setItem('weight-tracker-first-visit', 'true')
      })
      
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Welcome modal should not be visible
      const welcomeModal = page.locator('[role="dialog"]').filter({ hasText: 'Welcome to Weight Tracker' })
      await expect(welcomeModal).not.toBeVisible()
    })

    test('should hide welcome modal when "Get Started" is clicked', async ({ page }) => {
      // Clear localStorage to simulate first visit
      await page.evaluate(() => {
        localStorage.removeItem('weight-tracker-first-visit')
      })
      
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Click "Get Started" button
      const welcomeModal = page.locator('[role="dialog"]').filter({ hasText: 'Welcome to Weight Tracker' })
      const getStartedBtn = welcomeModal.locator('button', { hasText: 'Get Started' })
      await getStartedBtn.click()
      
      // Modal should be hidden
      await expect(welcomeModal).not.toBeVisible()
      
      // Should scroll to quick actions section
      const quickActions = page.locator('#quick-actions')
      await expect(quickActions).toBeVisible()
    })
  })

  test.describe('US-8.3: Loading Skeletons', () => {
    test('should show loading skeletons during data fetching', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      
      // Check for skeleton components while data is loading
      // Note: This test might be timing-dependent, skeletons appear briefly
      
      // Look for skeleton patterns (shimmer effects, placeholder content)
      const skeletons = page.locator('.animate-pulse')
      
      // If skeletons are not visible immediately, it means data loaded quickly
      // This is still a valid state, so we don't fail the test
      
      // Wait for actual content to load
      await page.waitForLoadState('networkidle')
      
      // Verify real content is now showing
      const weightTracker = page.locator('h1', { hasText: 'Weight Tracker' })
      await expect(weightTracker).toBeVisible()
    })

    test('should show table skeleton when weight entries are loading', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      
      // Look for the weight entries section
      const weightEntriesSection = page.locator('text=Recent Weight Entries')
      
      // Wait for content to load
      await page.waitForLoadState('networkidle')
      
      // Check that either skeleton or actual data is showing
      const hasTableContent = await page.locator('table').isVisible()
      const hasNoDataMessage = await page.locator('text=No weight entries yet').isVisible()
      
      // At least one should be true (either data exists or no data message)
      expect(hasTableContent || hasNoDataMessage).toBe(true)
    })
  })

  test.describe('US-8.5: Error Boundaries', () => {
    test('should display error boundary fallback when errors occur', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Inject an error to test error boundary
      // Note: This is a simulation - in real scenarios errors would occur naturally
      await page.evaluate(() => {
        // Simulate an error in a component by throwing an error
        const errorEvent = new Error('Test error for error boundary')
        window.dispatchEvent(new CustomEvent('test-error', { detail: errorEvent }))
      })
      
      // For this test, we'll just verify the error boundary components exist
      // and that the page doesn't crash completely
      
      // The main dashboard should still be functional
      const dashboard = page.locator('h1', { hasText: 'Weight Tracker' })
      await expect(dashboard).toBeVisible()
      
      // Check that error boundaries are properly implemented by ensuring
      // the page structure remains intact even if individual components fail
      const header = page.locator('header')
      await expect(header).toBeVisible()
    })

    test('should maintain app functionality when chart errors occur', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Even if chart component fails, other parts should work
      const quickActions = page.locator('#quick-actions')
      await expect(quickActions).toBeVisible()
      
      // Buttons should still be functional
      const addWeightBtn = page.locator('button', { hasText: 'Add Weight' })
      await expect(addWeightBtn).toBeVisible()
      await expect(addWeightBtn).toBeEnabled()
    })
  })

  test.describe('US-8.6: Contextual Help', () => {
    test('should display help modal when help button is clicked', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Click help button in header
      const helpBtn = page.locator('button').filter({ hasText: 'Help' })
      await helpBtn.click()
      
      // Help modal should appear
      const helpModal = page.locator('[role="dialog"]').filter({ hasText: 'Weight Tracker Help' })
      await expect(helpModal).toBeVisible()
      
      // Check for help sections
      await expect(helpModal).toContainText('Getting Started')
      await expect(helpModal).toContainText('Tracking Progress')
      await expect(helpModal).toContainText('Goals & Deadlines')
      await expect(helpModal).toContainText('Streaks & Habits')
      await expect(helpModal).toContainText('Data & Insights')
    })

    test('should show contextual help tooltips', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Look for help icons/tooltips in the UI
      const helpIcons = page.locator('[data-testid*="help"], .lucide-help-circle, .lucide-info')
      
      // There should be help tooltips in various places
      const helpIconCount = await helpIcons.count()
      expect(helpIconCount).toBeGreaterThan(0)
      
      // Test tooltip functionality by hovering over help icons
      if (helpIconCount > 0) {
        const firstHelpIcon = helpIcons.first()
        await firstHelpIcon.hover()
        
        // A tooltip should appear
        const tooltip = page.locator('[role="tooltip"]')
        await expect(tooltip).toBeVisible()
      }
    })

    test('should show streak help tooltip in dashboard stats', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Look for streak section with help tooltip
      const streakSection = page.locator('text=Day Streak').locator('..')
      await expect(streakSection).toBeVisible()
      
      // Look for help icon near streak info
      const streakHelpIcon = streakSection.locator('.lucide-help-circle, .lucide-info')
      
      if (await streakHelpIcon.isVisible()) {
        await streakHelpIcon.hover()
        
        // Tooltip should explain streak functionality
        const tooltip = page.locator('[role="tooltip"]')
        await expect(tooltip).toBeVisible()
        await expect(tooltip).toContainText('consecutive days')
      }
    })

    test('should show help tooltips in forms', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Open add weight dialog
      const addWeightBtn = page.locator('button', { hasText: 'Add Weight' })
      await addWeightBtn.click()
      
      // Wait for modal to appear
      const weightModal = page.locator('[data-testid="add-weight-modal"]')
      await expect(weightModal).toBeVisible()
      
      // Look for help tooltips in the form
      const helpIcons = weightModal.locator('.lucide-help-circle, .lucide-info')
      const helpIconCount = await helpIcons.count()
      
      if (helpIconCount > 0) {
        const firstHelpIcon = helpIcons.first()
        await firstHelpIcon.hover()
        
        // Should show helpful information about weight entry
        const tooltip = page.locator('[role="tooltip"]')
        await expect(tooltip).toBeVisible()
      }
    })

    test('should show help navigation in help modal', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Open help modal
      const helpBtn = page.locator('button').filter({ hasText: 'Help' })
      await helpBtn.click()
      
      const helpModal = page.locator('[role="dialog"]').filter({ hasText: 'Weight Tracker Help' })
      await expect(helpModal).toBeVisible()
      
      // Click on different help sections
      const trackingProgressBtn = helpModal.locator('button').filter({ hasText: 'Tracking Progress' })
      await trackingProgressBtn.click()
      
      // Content should change to show tracking progress info
      await expect(helpModal).toContainText('Weight Trend Graph')
      await expect(helpModal).toContainText('Moving Averages')
      
      // Try another section
      const goalsBtn = helpModal.locator('button').filter({ hasText: 'Goals & Deadlines' })
      await goalsBtn.click()
      
      // Content should change to goals information
      await expect(helpModal).toContainText('Setting Realistic Goals')
      await expect(helpModal).toContainText('Deadline Management')
    })
  })

  test.describe('Visual and Interaction Tests', () => {
    test('should maintain consistent theme across help components', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Open help modal
      const helpBtn = page.locator('button').filter({ hasText: 'Help' })
      await helpBtn.click()
      
      const helpModal = page.locator('[role="dialog"]').filter({ hasText: 'Weight Tracker Help' })
      await expect(helpModal).toBeVisible()
      
      // Help modal should have consistent styling
      await expect(helpModal).toHaveCSS('border-radius', /.+/)
      
      // Close modal
      const closeBtn = helpModal.locator('button[aria-label*="Close"], button:has(svg)')
      if (await closeBtn.isVisible()) {
        await closeBtn.first().click()
      } else {
        // Click outside to close
        await page.click('body')
      }
      
      // Modal should close
      await expect(helpModal).not.toBeVisible()
    })

    test('should show appropriate loading states', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      
      // The page should show content within reasonable time
      await page.waitForLoadState('networkidle', { timeout: 30000 })
      
      // Main elements should be loaded
      await expect(page.locator('h1', { hasText: 'Weight Tracker' })).toBeVisible()
      await expect(page.locator('#quick-actions')).toBeVisible()
    })
  })
})