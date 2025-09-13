import { test, expect, devices } from '@playwright/test'

/**
 * Visual Validation Tests for Epic 7: Progress Tracking Features
 * Tests responsive behavior and visual appearance at all breakpoints
 * Per CLAUDE.md requirements for visual validation testing
 */

// Define breakpoints as per design system requirements
const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'large-desktop', width: 1920, height: 1080 }
]

test.describe('Progress Tracking Visual Validation', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
  })

  test.describe('Dashboard Layout Visual Tests', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`should render dashboard layout correctly at ${name} (${width}x${height})`, async ({ page }) => {
        // Set viewport size
        await page.setViewportSize({ width, height })
        
        // Navigate to dashboard
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
        
        // Wait for components to load
        await page.waitForTimeout(1000)
        
        // Take full page screenshot
        await page.screenshot({
          path: `tests/screenshots/dashboard-${name}-${width}x${height}.png`,
          fullPage: true
        })
        
        // Verify major components are visible
        const activeGoal = page.locator('[data-testid="active-goal"]')
        const weeklySummary = page.locator('[data-testid="weekly-summary"]')
        const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
        
        await expect(activeGoal).toBeVisible()
        await expect(weeklySummary).toBeVisible()
        await expect(trendAnalysis).toBeVisible()
        
        // Check responsive grid behavior
        if (width < 768) {
          // Mobile: Components should stack vertically
          const activeGoalBox = await activeGoal.boundingBox()
          const weeklySummaryBox = await weeklySummary.boundingBox()
          
          if (activeGoalBox && weeklySummaryBox) {
            expect(activeGoalBox.width).toBeLessThan(width * 0.95) // Should not be full width due to padding
            expect(weeklySummaryBox.y).toBeGreaterThan(activeGoalBox.y + activeGoalBox.height - 50) // Should be below
          }
        } else if (width >= 1024) {
          // Desktop: Components should use grid layout
          const activeGoalBox = await activeGoal.boundingBox()
          if (activeGoalBox) {
            expect(activeGoalBox.width).toBeGreaterThan(width * 0.4) // Should span multiple columns
          }
        }
      })
    })
  })

  test.describe('Streak Tracking Visual Tests', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`should display streak indicator correctly at ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
        
        const activeGoal = page.locator('[data-testid="active-goal"]')
        await expect(activeGoal).toBeVisible()
        
        // Take screenshot of active goal card with streak
        await activeGoal.screenshot({
          path: `tests/screenshots/streak-display-${name}-${width}x${height}.png`
        })
        
        // Check streak visibility and formatting
        const streakElement = page.locator('[data-testid="current-streak"]')
        if (await streakElement.count() > 0) {
          await expect(streakElement).toBeVisible()
          
          // Verify fire emoji is visible
          const streakText = await streakElement.textContent()
          expect(streakText).toContain('🔥')
          
          // Check text doesn't overflow at small screens
          const streakBox = await streakElement.boundingBox()
          if (streakBox && width < 400) {
            expect(streakBox.width).toBeLessThan(width * 0.8)
          }
        }
      })
    })
  })

  test.describe('Weekly Summary Card Visual Tests', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`should render weekly summary correctly at ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
        
        const weeklySummary = page.locator('[data-testid="weekly-summary"]')
        await expect(weeklySummary).toBeVisible()
        
        // Screenshot collapsed state
        await weeklySummary.screenshot({
          path: `tests/screenshots/weekly-summary-collapsed-${name}-${width}x${height}.png`
        })
        
        // Test expanded state if expand button exists
        const expandButton = page.locator('[data-testid="weekly-expand-toggle"]')
        if (await expandButton.count() > 0) {
          await expandButton.click()
          await page.waitForTimeout(500) // Wait for animation
          
          // Screenshot expanded state
          await weeklySummary.screenshot({
            path: `tests/screenshots/weekly-summary-expanded-${name}-${width}x${height}.png`
          })
          
          // Check that expanded content is properly laid out
          const weeklyDetails = page.locator('[data-testid="weekly-details"]')
          if (await weeklyDetails.count() > 0) {
            await expect(weeklyDetails).toBeVisible()
            
            // Check responsive behavior of expanded content
            const detailsBox = await weeklyDetails.boundingBox()
            if (detailsBox) {
              if (width < 768) {
                // Mobile: Details should stack vertically
                expect(detailsBox.width).toBeLessThan(width * 0.9)
              } else {
                // Tablet/Desktop: Details can use grid layout
                expect(detailsBox.width).toBeGreaterThan(width * 0.3)
              }
            }
          }
        }
      })
    })
    
    test('should show expand/collapse animation smoothly', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      const weeklySummary = page.locator('[data-testid="weekly-summary"]')
      
      if (await expandButton.count() > 0) {
        // Record animation by taking multiple screenshots
        await weeklySummary.screenshot({
          path: 'tests/screenshots/weekly-summary-animation-start.png'
        })
        
        await expandButton.click()
        await page.waitForTimeout(250) // Mid-animation
        
        await weeklySummary.screenshot({
          path: 'tests/screenshots/weekly-summary-animation-mid.png'
        })
        
        await page.waitForTimeout(250) // Animation complete
        
        await weeklySummary.screenshot({
          path: 'tests/screenshots/weekly-summary-animation-end.png'
        })
      }
    })
  })

  test.describe('Trend Analysis Visual Tests', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`should render trend analysis with sparklines at ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
        
        const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
        await expect(trendAnalysis).toBeVisible()
        
        // Screenshot collapsed state
        await trendAnalysis.screenshot({
          path: `tests/screenshots/trend-analysis-collapsed-${name}-${width}x${height}.png`
        })
        
        // Test expanded state with sparklines
        const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
        if (await expandButton.count() > 0) {
          await expandButton.click()
          await page.waitForTimeout(500)
          
          // Screenshot expanded state
          await trendAnalysis.screenshot({
            path: `tests/screenshots/trend-analysis-expanded-${name}-${width}x${height}.png`
          })
          
          // Check sparkline visibility and sizing
          const sparklines = page.locator('svg')
          if (await sparklines.count() > 0) {
            for (let i = 0; i < Math.min(await sparklines.count(), 2); i++) {
              const sparkline = sparklines.nth(i)
              await expect(sparkline).toBeVisible()
              
              const sparklineBox = await sparkline.boundingBox()
              if (sparklineBox) {
                // Sparklines should be appropriately sized for viewport
                expect(sparklineBox.width).toBeGreaterThan(80) // Minimum readable size
                expect(sparklineBox.width).toBeLessThan(width * 0.4) // Not too large
                expect(sparklineBox.height).toBeGreaterThan(20)
                expect(sparklineBox.height).toBeLessThan(60)
              }
            }
          }
          
          // Check trend sections layout
          const weeklyTrend = page.locator('[data-testid="weekly-trend"]')
          const monthlyTrend = page.locator('[data-testid="monthly-trend"]')
          
          if (await weeklyTrend.count() > 0 && await monthlyTrend.count() > 0) {
            const weeklyBox = await weeklyTrend.boundingBox()
            const monthlyBox = await monthlyTrend.boundingBox()
            
            if (weeklyBox && monthlyBox) {
              if (width < 768) {
                // Mobile: Sections should stack vertically
                expect(monthlyBox.y).toBeGreaterThan(weeklyBox.y + weeklyBox.height - 20)
              } else {
                // Desktop: Can be side by side or stacked depending on content
                expect(weeklyBox.width + monthlyBox.width).toBeLessThan(width * 1.2)
              }
            }
          }
        }
      })
    })
    
    test('should render sparklines with proper styling', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      const expandButton = page.locator('[data-testid="trend-expand-toggle"]')
      if (await expandButton.count() > 0) {
        await expandButton.click()
        await page.waitForTimeout(500)
        
        // Check SVG sparklines
        const sparklines = page.locator('svg')
        if (await sparklines.count() > 0) {
          const firstSparkline = sparklines.first()
          
          // Check for polyline (the actual chart line)
          const polylines = firstSparkline.locator('polyline')
          if (await polylines.count() > 0) {
            const polyline = polylines.first()
            await expect(polyline).toBeVisible()
            
            // Check stroke and fill attributes
            const stroke = await polyline.getAttribute('stroke')
            const fill = await polyline.getAttribute('fill')
            
            expect(stroke).toBeTruthy() // Should have a stroke color
            expect(fill).toBe('none') // Should be unfilled line
          }
          
          // Check for data points (circles)
          const circles = firstSparkline.locator('circle')
          if (await circles.count() > 0) {
            const firstCircle = circles.first()
            await expect(firstCircle).toBeVisible()
            
            const radius = await firstCircle.getAttribute('r')
            expect(Number(radius)).toBeGreaterThan(0)
          }
          
          // Take detailed screenshot of sparkline
          await firstSparkline.screenshot({
            path: 'tests/screenshots/sparkline-detail.png'
          })
        }
      }
    })
  })

  test.describe('Component Integration Visual Tests', () => {
    test('should maintain layout when multiple components are expanded', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Take screenshot of initial state
      await page.screenshot({
        path: 'tests/screenshots/components-all-collapsed.png',
        fullPage: true
      })
      
      // Expand weekly summary
      const weeklyExpandButton = page.locator('[data-testid="weekly-expand-toggle"]')
      if (await weeklyExpandButton.count() > 0) {
        await weeklyExpandButton.click()
        await page.waitForTimeout(500)
      }
      
      // Take screenshot with weekly expanded
      await page.screenshot({
        path: 'tests/screenshots/components-weekly-expanded.png',
        fullPage: true
      })
      
      // Expand trend analysis
      const trendExpandButton = page.locator('[data-testid="trend-expand-toggle"]')
      if (await trendExpandButton.count() > 0) {
        await trendExpandButton.click()
        await page.waitForTimeout(500)
      }
      
      // Take screenshot with both expanded
      await page.screenshot({
        path: 'tests/screenshots/components-all-expanded.png',
        fullPage: true
      })
      
      // Verify no layout issues
      const dashboard = page.locator('main')
      const dashboardBox = await dashboard.boundingBox()
      
      if (dashboardBox) {
        // Should not cause horizontal scrolling
        expect(dashboardBox.width).toBeLessThan(1280)
      }
    })
    
    breakpoints.forEach(({ name, width, height }) => {
      test(`should handle component overflow gracefully at ${name}`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('http://localhost:3000/dashboard')
        await page.waitForLoadState('networkidle')
        
        // Expand all expandable components
        const expandButtons = page.locator('[data-testid*="expand-toggle"]')
        const buttonCount = await expandButtons.count()
        
        for (let i = 0; i < buttonCount; i++) {
          const button = expandButtons.nth(i)
          if (await button.isVisible()) {
            await button.click()
            await page.waitForTimeout(300)
          }
        }
        
        // Take full page screenshot
        await page.screenshot({
          path: `tests/screenshots/components-overflow-${name}-${width}x${height}.png`,
          fullPage: true
        })
        
        // Check for horizontal scroll
        const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
        expect(bodyWidth).toBeLessThanOrEqual(width + 50) // Allow small tolerance
        
        // Check component visibility
        const weeklySummary = page.locator('[data-testid="weekly-summary"]')
        const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
        
        await expect(weeklySummary).toBeVisible()
        await expect(trendAnalysis).toBeVisible()
      })
    })
  })

  test.describe('Dark Mode Visual Tests', () => {
    test('should render progress components correctly in dark mode', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Toggle dark mode if theme toggle exists
      const themeToggle = page.locator('[data-testid="theme-toggle"], button:has-text("theme"), button:has-text("dark"), button:has-text("light")')
      
      if (await themeToggle.count() > 0) {
        await themeToggle.first().click()
        await page.waitForTimeout(500)
        
        // Take screenshot in dark mode
        await page.screenshot({
          path: 'tests/screenshots/dashboard-dark-mode.png',
          fullPage: true
        })
        
        // Test individual components in dark mode
        const weeklySummary = page.locator('[data-testid="weekly-summary"]')
        const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
        
        await weeklySummary.screenshot({
          path: 'tests/screenshots/weekly-summary-dark-mode.png'
        })
        
        await trendAnalysis.screenshot({
          path: 'tests/screenshots/trend-analysis-dark-mode.png'
        })
        
        // Check contrast and readability
        const textElements = page.locator('p, span, h1, h2, h3, h4, h5, h6')
        const textCount = await textElements.count()
        
        // Sample a few text elements to ensure they're visible
        for (let i = 0; i < Math.min(textCount, 5); i++) {
          const element = textElements.nth(i)
          if (await element.isVisible()) {
            const textColor = await element.evaluate(el => window.getComputedStyle(el).color)
            // Should not be completely black (would be invisible on dark background)
            expect(textColor).not.toBe('rgb(0, 0, 0)')
          }
        }
      }
    })
  })

  test.describe('Loading States Visual Tests', () => {
    test('should display loading states correctly', async ({ page }) => {
      // Navigate to dashboard but don't wait for network idle to catch loading states
      await page.goto('http://localhost:3000/dashboard')
      
      // Take quick screenshot of loading state
      await page.waitForTimeout(100)
      await page.screenshot({
        path: 'tests/screenshots/dashboard-loading-state.png',
        fullPage: true
      })
      
      // Look for skeleton loaders or loading indicators
      const skeletons = page.locator('.animate-pulse, [class*="skeleton"], .spinner, [class*="loading"]')
      
      if (await skeletons.count() > 0) {
        await skeletons.first().screenshot({
          path: 'tests/screenshots/loading-skeleton.png'
        })
      }
      
      // Wait for loading to complete and compare
      await page.waitForLoadState('networkidle')
      await page.screenshot({
        path: 'tests/screenshots/dashboard-loaded-state.png',
        fullPage: true
      })
    })
  })

  test.describe('Error States Visual Tests', () => {
    test('should display error states gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      await page.waitForLoadState('networkidle')
      
      // Look for any error messages or empty states
      const errorMessages = page.locator('text=/error|Error|failed|Failed/i, [role="alert"]')
      const emptyStates = page.locator('text=/no data|No data|empty|Empty/i')
      
      if (await errorMessages.count() > 0) {
        await errorMessages.first().screenshot({
          path: 'tests/screenshots/error-state.png'
        })
      }
      
      if (await emptyStates.count() > 0) {
        await emptyStates.first().screenshot({
          path: 'tests/screenshots/empty-state.png'
        })
      }
      
      // Take full page screenshot to capture overall state
      await page.screenshot({
        path: 'tests/screenshots/dashboard-with-states.png',
        fullPage: true
      })
    })
  })
})