import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for dashboard and main application layout
 * Tests the complete dashboard experience with data
 */

const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
  { name: 'large-desktop', width: 1920, height: 1080 },
]

test.describe('Dashboard Visual Tests', () => {
  // Use authenticated state
  test.use({ storageState: 'tests/helpers/visual-auth-state.json' })

  test.describe('Main Dashboard Layout', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`Dashboard layout - ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('/dashboard')
        await page.waitForLoadState('networkidle')

        // Wait for all components to load
        await page.waitForSelector('[data-testid="active-goal"]', { timeout: 10000 })
        await page.waitForSelector('[data-testid="weekly-summary"]', { timeout: 10000 })
        await page.waitForSelector('[data-testid="trend-analysis"]', { timeout: 10000 })

        // Wait for any animations to complete
        await page.waitForTimeout(1000)

        await expect(page).toHaveScreenshot(`dashboard-${name}-${width}x${height}.png`, {
          fullPage: true,
          animations: 'disabled',
        })
      })
    })
  })

  test.describe('Dashboard Components', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })

    test('Active goal display states', async ({ page }) => {
      // Test with active goal
      const activeGoal = page.locator('[data-testid="active-goal"]')
      await expect(activeGoal).toBeVisible()

      await expect(activeGoal).toHaveScreenshot('active-goal-with-data.png', {
        animations: 'disabled',
      })
    })

    test('Weekly summary card', async ({ page }) => {
      const weeklySummary = page.locator('[data-testid="weekly-summary"]')
      await expect(weeklySummary).toBeVisible()

      await expect(weeklySummary).toHaveScreenshot('weekly-summary-card.png', {
        animations: 'disabled',
      })
    })

    test('Trend analysis section', async ({ page }) => {
      const trendAnalysis = page.locator('[data-testid="trend-analysis"]')
      await expect(trendAnalysis).toBeVisible()

      await expect(trendAnalysis).toHaveScreenshot('trend-analysis-section.png', {
        animations: 'disabled',
      })
    })

    test('Dashboard statistics header', async ({ page }) => {
      const statsHeader = page.locator('[data-testid="dashboard-stats"]')
      await expect(statsHeader).toBeVisible()

      await expect(statsHeader).toHaveScreenshot('dashboard-stats-header.png', {
        animations: 'disabled',
      })
    })
  })

  test.describe('Loading States', () => {
    test('Dashboard skeleton loading', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })

      // Intercept API calls to simulate loading state
      await page.route('**/api/**', route => {
        setTimeout(() => route.continue(), 2000)
      })

      await page.goto('/dashboard')

      // Capture loading skeletons
      await page.waitForSelector('.animate-pulse', { timeout: 5000 })

      await expect(page).toHaveScreenshot('dashboard-loading-skeletons.png', {
        animations: 'disabled',
      })
    })
  })

  test.describe('Empty States', () => {
    test('Dashboard with no data', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })

      // This would need to be tested with a fresh user account
      // For now, we'll test the empty state components if they exist
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Look for empty state indicators
      const emptyStates = page.locator('[data-testid*="empty"]')
      const count = await emptyStates.count()

      if (count > 0) {
        await expect(page).toHaveScreenshot('dashboard-empty-states.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Dark Mode', () => {
    test('Dashboard in dark mode', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Switch to dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })

      await page.waitForTimeout(500) // Wait for theme transition

      await expect(page).toHaveScreenshot('dashboard-dark-mode.png', {
        fullPage: true,
        animations: 'disabled',
      })
    })
  })

  test.describe('Interactive States', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })

    test('Modals and overlays', async ({ page }) => {
      // Test goal creation modal
      const createGoalButton = page.locator('[data-testid="create-goal-button"]')
      if (await createGoalButton.isVisible()) {
        await createGoalButton.click()
        await page.waitForSelector('[role="dialog"]')

        await expect(page).toHaveScreenshot('goal-creation-modal.png', {
          animations: 'disabled',
        })

        // Close modal
        await page.keyboard.press('Escape')
      }

      // Test weight entry dialog
      const addWeightButton = page.locator('[data-testid="add-weight-button"]')
      if (await addWeightButton.isVisible()) {
        await addWeightButton.click()
        await page.waitForSelector('[role="dialog"]')

        await expect(page).toHaveScreenshot('add-weight-dialog.png', {
          animations: 'disabled',
        })
      }
    })
  })
})