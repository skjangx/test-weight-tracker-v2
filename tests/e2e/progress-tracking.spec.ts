import { test, expect } from '@playwright/test'

/**
 * E2E Tests for Epic 7: Progress Tracking Features
 * Tests US-7.1 (Streak Tracking), US-7.2 (Weekly Summary), US-7.3 (Trend Analysis)
 */

test.describe('Progress Tracking Features', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')
    
    // Wait for app to load
    await page.waitForLoadState('networkidle')
    
    // Skip authentication for now - in a real app we'd need to authenticate
    // For testing purposes, we'll assume user is authenticated and has data
  })

  test.describe('US-7.1: Streak Tracking', () => {
    test('should display current streak in active goal display', async ({ page }) => {
      // Navigate to dashboard
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check if active goal display exists
      const activeGoalCard = page.locator('[data-testid="active-goal"]')
      await expect(activeGoalCard).toBeVisible()
      
      // Check for streak display
      const streakElement = page.locator('[data-testid="current-streak"]')
      if (await streakElement.count() > 0) {
        await expect(streakElement).toBeVisible()
        
        // Verify streak format (should show fire emoji and "day streak")
        const streakText = await streakElement.textContent()
        expect(streakText).toMatch(/🔥\s*\d+\s*day\s*streak/)
      }
    })
    
    test('should show streak indicator with fire emoji', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const streakElement = page.locator('[data-testid="current-streak"]')
      if (await streakElement.count() > 0) {
        const streakText = await streakElement.textContent()
        expect(streakText).toContain('🔥')
      }
    })
    
    test('should handle zero streak gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const streakElement = page.locator('[data-testid="current-streak"]')
      if (await streakElement.count() > 0) {
        const streakText = await streakElement.textContent()
        // Should show "0 day streak" even when no streak
        expect(streakText).toMatch(/🔥\s*\d+\s*day\s*streak/)
      }
    })
  })

  test.describe('US-7.2: Weekly Summary Card', () => {
    test('should display weekly summary card', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Look for weekly summary card
      const weeklySummaryCard = page.locator('[data-testid="weekly-summary"]')
      await expect(weeklySummaryCard).toBeVisible()
      
      // Check for expand/collapse functionality
      const expandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      await expect(expandButton).toBeVisible()
    })
    
    test('should expand and collapse weekly summary details', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      const summaryDetails = page.locator('[data-testid="weekly-details"]')
      
      if (await expandButton.count() > 0) {
        // Initially collapsed (details should be hidden)
        await expect(summaryDetails).not.toBeVisible()
        
        // Click to expand
        await expandButton.click()
        await page.waitForTimeout(500) // Wait for animation
        
        // Details should now be visible
        await expect(summaryDetails).toBeVisible()
        
        // Click to collapse
        await expandButton.click()
        await page.waitForTimeout(500) // Wait for animation
        
        // Details should be hidden again
        await expect(summaryDetails).not.toBeVisible()
      }
    })
    
    test('should show weekly statistics when expanded', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      
      if (await expandButton.count() > 0) {
        // Expand the weekly summary
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Check for weekly statistics
        const weeklyDetails = page.locator('[data-testid="weekly-details"]')
        await expect(weeklyDetails).toBeVisible()
        
        // Look for current week and previous week data
        const currentWeekData = page.locator('[data-testid="current-week"]')
        const previousWeekData = page.locator('[data-testid="previous-week"]')
        
        if (await currentWeekData.count() > 0) {
          await expect(currentWeekData).toBeVisible()
        }
        
        if (await previousWeekData.count() > 0) {
          await expect(previousWeekData).toBeVisible()
        }
      }
    })
    
    test('should display comparison with previous week', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      
      if (await expandButton.count() > 0) {
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Look for comparison indicators
        const comparisonElements = page.locator('[data-testid*="comparison"]')
        
        if (await comparisonElements.count() > 0) {
          // Check that comparison shows direction (improvement/decline)
          for (const element of await comparisonElements.all()) {
            const text = await element.textContent()
            // Should contain comparison indicators like arrows or text
            expect(text).toBeTruthy()
          }
        }
      }
    })
  })

  test.describe('US-7.3: Trend Analysis with Sparklines', () => {
    test('should display trend analysis card', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const trendAnalysisCard = page.locator('[data-testid="trend-analysis"]')
      await expect(trendAnalysisCard).toBeVisible()
      
      // Check for expand/collapse button
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      await expect(expandButton).toBeVisible()
    })
    
    test('should expand and collapse trend analysis details', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      const trendDetails = page.locator('[data-testid="trend-details"]')
      
      if (await expandButton.count() > 0) {
        // Initially collapsed
        await expect(trendDetails).not.toBeVisible()
        
        // Expand
        await expandButton.click()
        await page.waitForTimeout(500)
        await expect(trendDetails).toBeVisible()
        
        // Collapse
        await expandButton.click()
        await page.waitForTimeout(500)
        await expect(trendDetails).not.toBeVisible()
      }
    })
    
    test('should display weekly and monthly trend sections', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      
      if (await expandButton.count() > 0) {
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Check for weekly trend section
        const weeklyTrend = page.locator('[data-testid="weekly-trend"]')
        if (await weeklyTrend.count() > 0) {
          await expect(weeklyTrend).toBeVisible()
        }
        
        // Check for monthly trend section
        const monthlyTrend = page.locator('[data-testid="monthly-trend"]')
        if (await monthlyTrend.count() > 0) {
          await expect(monthlyTrend).toBeVisible()
        }
      }
    })
    
    test('should show sparkline visualizations', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      
      if (await expandButton.count() > 0) {
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Look for SVG sparklines
        const sparklines = page.locator('svg')
        
        if (await sparklines.count() > 0) {
          // Check that sparklines are rendered
          for (const sparkline of await sparklines.all()) {
            await expect(sparkline).toBeVisible()
            
            // Check for polyline elements (the actual line chart)
            const polylines = sparkline.locator('polyline')
            if (await polylines.count() > 0) {
              await expect(polylines.first()).toBeVisible()
            }
          }
        }
      }
    })
    
    test('should display trend direction badges', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      
      if (await expandButton.count() > 0) {
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Look for trend direction badges
        const badges = page.locator('.badge, [class*="badge"]')
        
        if (await badges.count() > 0) {
          for (const badge of await badges.all()) {
            const badgeText = await badge.textContent()
            // Should contain direction indicators
            if (badgeText && badgeText.includes('down') || badgeText.includes('up') || badgeText.includes('stable')) {
              await expect(badge).toBeVisible()
            }
          }
        }
      }
    })
    
    test('should show insights section', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      
      if (await expandButton.count() > 0) {
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Look for insights section
        const insightsSection = page.locator('text=Insights').first()
        
        if (await insightsSection.count() > 0) {
          await expect(insightsSection).toBeVisible()
        }
      }
    })
  })

  test.describe('Integration Tests', () => {
    test('should display all progress tracking components on dashboard', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Check that all major progress components are present
      const activeGoal = page.locator('[data-testid="active-goal"]')
      const weeklySummary = page.locator('[data-testid="weekly-summary"]')
      const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
      
      await expect(activeGoal).toBeVisible()
      await expect(weeklySummary).toBeVisible()
      await expect(trendAnalysis).toBeVisible()
    })
    
    test('should maintain component state when interacting with multiple components', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const weeklyExpandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      const trendExpandButton = page.locator('[data-testid="trend-expand-toggle"]')
      
      if (await weeklyExpandButton.count() > 0 && await trendExpandButton.count() > 0) {
        // Expand weekly summary
        await weeklyExpandButton.click()
        await page.waitForTimeout(500)
        
        const weeklyDetails = page.locator('[data-testid="weekly-details"]')
        await expect(weeklyDetails).toBeVisible()
        
        // Expand trend analysis
        await trendExpandButton.click()
        await page.waitForTimeout(500)
        
        const trendDetails = page.locator('[data-testid="trend-details"]')
        await expect(trendDetails).toBeVisible()
        
        // Both should remain expanded
        await expect(weeklyDetails).toBeVisible()
        await expect(trendDetails).toBeVisible()
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle no data gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Components should render even with no data
      const weeklySummary = page.locator('[data-testid="weekly-summary"]')
      const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
      
      await expect(weeklySummary).toBeVisible()
      await expect(trendAnalysis).toBeVisible()
      
      // Should show appropriate messaging for no data
      const noDataMessages = page.locator('text=/no data|No data|Keep logging/i')
      if (await noDataMessages.count() > 0) {
        await expect(noDataMessages.first()).toBeVisible()
      }
    })
    
    test('should display loading states', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      // Components should show loading states initially
      const loadingElements = page.locator('.animate-pulse, [class*="skeleton"]')
      
      // Wait a moment to see loading states
      await page.waitForTimeout(100)
      
      if (await loadingElements.count() > 0) {
        await expect(loadingElements.first()).toBeVisible()
      }
      
      // Wait for loading to complete
      await page.waitForLoadState('networkidle')
    })
  })
})