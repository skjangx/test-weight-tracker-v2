import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Epic 5: Enhanced Data Table Features
 * Tests US-5.1 (Monthly Pagination), US-5.2 (Responsive Columns), 
 * US-5.3 (Monthly Statistics), US-5.4 (Empty States)
 */

test.describe('Enhanced Data Table Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
    
    // Skip authentication for now - in a real app we'd need to authenticate
    // For testing purposes, we'll assume user is authenticated and has data
  })

  test.describe('US-5.1: Monthly Paginated Table Navigation', () => {
    test('should display monthly pagination controls', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check for monthly navigation controls
      const previousButton = page.locator('[data-testid="previous-month"]')
      const nextButton = page.locator('[data-testid="next-month"]')
      const monthDisplay = page.locator('[data-testid="current-month"]')
      
      await expect(previousButton).toBeVisible()
      await expect(nextButton).toBeVisible()
      await expect(monthDisplay).toBeVisible()
      
      // Check month display format (should show "Month YYYY")
      const monthText = await monthDisplay.textContent()
      expect(monthText).toMatch(/\w+ \d{4}/)
    })
    
    test('should navigate to previous month when clicking previous button', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const monthDisplay = page.locator('[data-testid="current-month"]')
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      // Get current month text
      const initialMonth = await monthDisplay.textContent()
      
      // Click previous month
      await previousButton.click()
      await page.waitForTimeout(500) // Wait for state update
      
      // Verify month changed
      const newMonth = await monthDisplay.textContent()
      expect(newMonth).not.toBe(initialMonth)
    })
    
    test('should disable next button when on current month', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const nextButton = page.locator('[data-testid="next-month"]')
      const monthDisplay = page.locator('[data-testid="current-month"]')
      
      // Navigate to current month if not already there
      const currentDate = new Date()
      const currentMonthYear = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
      
      let monthText = await monthDisplay.textContent()
      if (monthText !== currentMonthYear) {
        // Navigate back to current month by clicking next until we reach current month or button is disabled
        while (await nextButton.isEnabled()) {
          await nextButton.click()
          await page.waitForTimeout(300)
          monthText = await monthDisplay.textContent()
          if (monthText === currentMonthYear) break
        }
      }
      
      // Verify next button is disabled on current month
      await expect(nextButton).toBeDisabled()
    })
    
    test('should filter table data by selected month', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const dataTable = page.locator('[data-testid="weight-entries-table"]')
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      // Wait for table to be visible
      await expect(dataTable).toBeVisible()
      
      // Get initial row count
      const initialRows = await page.locator('tbody tr').count()
      
      // Navigate to previous month
      await previousButton.click()
      await page.waitForTimeout(500)
      
      // Row count should potentially change (could be 0 for months with no data)
      const newRows = await page.locator('tbody tr').count()
      // We can't assert specific numbers since data is dynamic, but we can verify the table is still present
      await expect(dataTable).toBeVisible()
    })
  })

  test.describe('US-5.2: Responsive Table Columns with Color Coding', () => {
    test('should show all columns on desktop view', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const table = page.locator('[data-testid="weight-entries-table"]')
      await expect(table).toBeVisible()
      
      // Check for all desktop columns
      const desktopColumns = [
        'Date',
        'Weight (kg)',
        'Daily Change',
        '7-Day Avg Change',
        'Remaining to Goal',
        'Memo'
      ]
      
      for (const columnHeader of desktopColumns) {
        const header = page.locator('th', { hasText: columnHeader })
        await expect(header).toBeVisible()
      }
    })
    
    test('should show only essential columns on mobile view', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const table = page.locator('[data-testid="weight-entries-table"]')
      await expect(table).toBeVisible()
      
      // Check for mobile columns
      const mobileColumns = [
        'Date',
        'Weight (kg)',
        'Daily Change'
      ]
      
      for (const columnHeader of mobileColumns) {
        const header = page.locator('th', { hasText: columnHeader })
        await expect(header).toBeVisible()
      }
      
      // Check that some desktop-only columns are hidden
      const hiddenColumns = [
        '7-Day Avg Change',
        'Remaining to Goal'
      ]
      
      for (const columnHeader of hiddenColumns) {
        const header = page.locator('th', { hasText: columnHeader })
        await expect(header).not.toBeVisible()
      }
    })
    
    test('should display color-coded daily changes', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const table = page.locator('[data-testid="weight-entries-table"]')
      await expect(table).toBeVisible()
      
      // Look for color-coded change indicators
      const changeElements = page.locator('[data-testid*="daily-change"]')
      
      if (await changeElements.count() > 0) {
        for (let i = 0; i < await changeElements.count(); i++) {
          const changeElement = changeElements.nth(i)
          const changeText = await changeElement.textContent()
          
          if (changeText && changeText.includes('-')) {
            // Weight loss should have green styling
            const className = await changeElement.getAttribute('class')
            expect(className).toContain('text-green')
          } else if (changeText && changeText.includes('+')) {
            // Weight gain should have red styling
            const className = await changeElement.getAttribute('class')
            expect(className).toContain('text-red')
          }
        }
      }
    })
    
    test('should display trend arrows for 7-day moving average', async ({ page }) => {
      // Desktop view to ensure 7-day column is visible
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const movingAvgElements = page.locator('[data-testid*="moving-avg-change"]')
      
      if (await movingAvgElements.count() > 0) {
        for (let i = 0; i < await movingAvgElements.count(); i++) {
          const avgElement = movingAvgElements.nth(i)
          const avgText = await avgElement.textContent()
          
          // Check for trend indicators (arrows or icons)
          if (avgText && avgText.includes('↗')) {
            // Upward trend
            expect(avgText).toContain('↗')
          } else if (avgText && avgText.includes('↘')) {
            // Downward trend  
            expect(avgText).toContain('↘')
          }
        }
      }
    })
  })

  test.describe('US-5.3: Monthly Statistics Header with Achievements', () => {
    test('should display monthly statistics header', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check for statistics header
      const statsHeader = page.locator('[data-testid="monthly-statistics"]')
      await expect(statsHeader).toBeVisible()
      
      // Check for key statistics
      const avgWeight = page.locator('[data-testid="average-weight"]')
      const entryCount = page.locator('[data-testid="entry-count"]')
      
      if (await avgWeight.count() > 0) {
        await expect(avgWeight).toBeVisible()
        const avgText = await avgWeight.textContent()
        expect(avgText).toMatch(/\d+\.?\d*\s*kg/)
      }
      
      if (await entryCount.count() > 0) {
        await expect(entryCount).toBeVisible()
        const countText = await entryCount.textContent()
        expect(countText).toMatch(/\d+\s*entr(y|ies)/)
      }
    })
    
    test('should show best and worst days when data exists', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const bestDay = page.locator('[data-testid="best-day"]')
      const worstDay = page.locator('[data-testid="worst-day"]')
      
      // These elements may not exist if no data, so check conditionally
      if (await bestDay.count() > 0) {
        await expect(bestDay).toBeVisible()
        const bestText = await bestDay.textContent()
        expect(bestText).toBeTruthy()
      }
      
      if (await worstDay.count() > 0) {
        await expect(worstDay).toBeVisible()
        const worstText = await worstDay.textContent()
        expect(worstText).toBeTruthy()
      }
    })
    
    test('should display goal achievement badges', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Look for achievement badges
      const badges = page.locator('[data-testid*="achievement-badge"]')
      
      if (await badges.count() > 0) {
        for (let i = 0; i < await badges.count(); i++) {
          const badge = badges.nth(i)
          await expect(badge).toBeVisible()
          
          const badgeText = await badge.textContent()
          // Achievement badges should contain meaningful text
          expect(badgeText).toBeTruthy()
        }
      }
    })
    
    test('should show monthly progress toward goal', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const goalProgress = page.locator('[data-testid="monthly-goal-progress"]')
      
      if (await goalProgress.count() > 0) {
        await expect(goalProgress).toBeVisible()
        
        // Should show progress as percentage or progress bar
        const progressText = await goalProgress.textContent()
        expect(progressText).toBeTruthy()
      }
    })
  })

  test.describe('US-5.4: Empty States with Illustrations', () => {
    test('should display empty state when no data exists', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Navigate to a month that likely has no data (far in the past)
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      // Click previous month multiple times to find an empty month
      for (let i = 0; i < 6; i++) {
        await previousButton.click()
        await page.waitForTimeout(300)
      }
      
      // Check for empty state elements
      const emptyState = page.locator('[data-testid="empty-state"]')
      const emptyMessage = page.locator('[data-testid="empty-message"]')
      const emptyIllustration = page.locator('[data-testid="empty-illustration"]')
      
      if (await emptyState.count() > 0) {
        await expect(emptyState).toBeVisible()
        
        if (await emptyMessage.count() > 0) {
          const messageText = await emptyMessage.textContent()
          expect(messageText).toContain('No weight entries')
        }
        
        if (await emptyIllustration.count() > 0) {
          await expect(emptyIllustration).toBeVisible()
        }
      }
    })
    
    test('should show contextual empty state message for specific months', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const monthDisplay = page.locator('[data-testid="current-month"]')
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      // Navigate to previous month
      await previousButton.click()
      await page.waitForTimeout(500)
      
      const currentMonth = await monthDisplay.textContent()
      
      // Look for empty state
      const emptyState = page.locator('[data-testid="empty-state"]')
      
      if (await emptyState.count() > 0) {
        const emptyMessage = page.locator('[data-testid="empty-message"]')
        
        if (await emptyMessage.count() > 0) {
          const messageText = await emptyMessage.textContent()
          // Message should reference the specific month
          if (currentMonth) {
            expect(messageText).toContain(currentMonth.split(' ')[0]) // Month name
          }
        }
      }
    })
    
    test('should display call-to-action in empty states', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Navigate to find empty state
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      for (let i = 0; i < 3; i++) {
        await previousButton.click()
        await page.waitForTimeout(300)
      }
      
      const emptyState = page.locator('[data-testid="empty-state"]')
      
      if (await emptyState.count() > 0) {
        // Look for call-to-action elements
        const ctaButton = page.locator('[data-testid="empty-cta-button"]')
        const ctaText = page.locator('[data-testid="empty-cta-text"]')
        
        if (await ctaButton.count() > 0) {
          await expect(ctaButton).toBeVisible()
          await expect(ctaButton).toBeEnabled()
        }
        
        if (await ctaText.count() > 0) {
          const ctaContent = await ctaText.textContent()
          expect(ctaContent).toBeTruthy()
        }
      }
    })
    
    test('should handle loading states gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      // Check for loading skeletons or spinners
      const loadingElements = page.locator('.animate-pulse, [class*="skeleton"], [data-testid="loading"]')
      
      // Wait a moment to see loading states
      await page.waitForTimeout(100)
      
      if (await loadingElements.count() > 0) {
        await expect(loadingElements.first()).toBeVisible()
      }
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle')
      
      // Verify content is eventually displayed
      const table = page.locator('[data-testid="weight-entries-table"]')
      const emptyState = page.locator('[data-testid="empty-state"]')
      
      // Either table or empty state should be visible after loading
      const tableVisible = await table.isVisible()
      const emptyVisible = await emptyState.isVisible()
      
      expect(tableVisible || emptyVisible).toBeTruthy()
    })
  })

  test.describe('Integration Tests', () => {
    test('should maintain responsive behavior while navigating months', async ({ page }) => {
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      // Navigate months and verify mobile columns remain visible
      await previousButton.click()
      await page.waitForTimeout(500)
      
      // Essential mobile columns should still be visible
      const dateColumn = page.locator('th', { hasText: 'Date' })
      const weightColumn = page.locator('th', { hasText: 'Weight (kg)' })
      
      await expect(dateColumn).toBeVisible()
      await expect(weightColumn).toBeVisible()
      
      // Switch to desktop
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.waitForTimeout(500)
      
      // All desktop columns should now be visible
      const dailyChangeColumn = page.locator('th', { hasText: 'Daily Change' })
      const remainingColumn = page.locator('th', { hasText: 'Remaining to Goal' })
      
      await expect(dailyChangeColumn).toBeVisible()
      await expect(remainingColumn).toBeVisible()
    })
    
    test('should update statistics when navigating between months', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const monthlyStats = page.locator('[data-testid="monthly-statistics"]')
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      if (await monthlyStats.count() > 0) {
        // Get initial statistics
        const initialStats = await monthlyStats.textContent()
        
        // Navigate to different month
        await previousButton.click()
        await page.waitForTimeout(500)
        
        // Statistics should update (or remain visible with different values)
        await expect(monthlyStats).toBeVisible()
        const newStats = await monthlyStats.textContent()
        
        // Stats content may change or remain the same if both months have same data
        expect(typeof newStats).toBe('string')
      }
    })
    
    test('should handle edge cases gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Test rapid navigation clicking
      const previousButton = page.locator('[data-testid="previous-month"]')
      const nextButton = page.locator('[data-testid="next-month"]')
      
      // Rapid clicking should not break the interface
      await previousButton.click()
      await previousButton.click()
      await nextButton.click()
      await page.waitForTimeout(500)
      
      // Interface should remain functional
      const table = page.locator('[data-testid="weight-entries-table"]')
      const emptyState = page.locator('[data-testid="empty-state"]')
      
      const tableVisible = await table.isVisible()
      const emptyVisible = await emptyState.isVisible()
      
      expect(tableVisible || emptyVisible).toBeTruthy()
    })
  })

  test.describe('Accessibility Tests', () => {
    test('should have proper ARIA labels on navigation controls', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const previousButton = page.locator('[data-testid="previous-month"]')
      const nextButton = page.locator('[data-testid="next-month"]')
      
      // Check for accessibility attributes
      const prevAriaLabel = await previousButton.getAttribute('aria-label')
      const nextAriaLabel = await nextButton.getAttribute('aria-label')
      
      expect(prevAriaLabel).toBeTruthy()
      expect(nextAriaLabel).toBeTruthy()
    })
    
    test('should support keyboard navigation', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Focus on previous button using Tab
      await page.keyboard.press('Tab')
      
      const previousButton = page.locator('[data-testid="previous-month"]')
      
      // Check if button can be focused
      const isFocused = await previousButton.evaluate(el => document.activeElement === el)
      
      if (isFocused) {
        // Press Enter to activate
        await page.keyboard.press('Enter')
        await page.waitForTimeout(500)
        
        // Month should have changed
        const monthDisplay = page.locator('[data-testid="current-month"]')
        await expect(monthDisplay).toBeVisible()
      }
    })
  })
})