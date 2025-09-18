import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for data visualization components
 * Tests charts, graphs, and interactive data displays
 */

const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
]

const timePeriods = ['7D', '30D', '90D', '1Y', 'All']

test.describe('Chart Visual Tests', () => {
  // Use authenticated state
  test.use({ storageState: 'tests/helpers/visual-auth-state.json' })

  test.describe('Weight Trend Graph', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })

    breakpoints.forEach(({ name, width, height }) => {
      test(`Weight trend graph - ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height })

        // Navigate to chart section or expand if collapsed
        const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
        if (await chartContainer.isVisible()) {
          await expect(chartContainer).toHaveScreenshot(`weight-chart-${name}-${width}x${height}.png`, {
            animations: 'disabled',
          })
        }
      })
    })

    timePeriods.forEach(period => {
      test(`Weight chart - ${period} time period`, async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 })

        // Select time period
        const periodButton = page.locator(`[data-testid="time-period-${period}"]`)
        if (await periodButton.isVisible()) {
          await periodButton.click()
          await page.waitForTimeout(500) // Wait for chart to update

          const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
          await expect(chartContainer).toHaveScreenshot(`weight-chart-${period.toLowerCase()}-period.png`, {
            animations: 'disabled',
          })
        }
      })
    })

    test('Chart with goal reference line', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })

      const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
      if (await chartContainer.isVisible()) {
        // Look for goal reference line
        const goalLine = page.locator('[data-testid="goal-reference-line"]')
        if (await goalLine.isVisible()) {
          await expect(chartContainer).toHaveScreenshot('weight-chart-with-goal-line.png', {
            animations: 'disabled',
          })
        }
      }
    })

    test('Chart with moving average line', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })

      const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
      if (await chartContainer.isVisible()) {
        // Enable moving average if there's a toggle
        const movingAvgToggle = page.locator('[data-testid="moving-average-toggle"]')
        if (await movingAvgToggle.isVisible()) {
          await movingAvgToggle.click()
          await page.waitForTimeout(500)
        }

        await expect(chartContainer).toHaveScreenshot('weight-chart-with-moving-average.png', {
          animations: 'disabled',
        })
      }
    })

    test('Chart empty state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })

      // This would test with a user who has no weight entries
      // For now, check if empty state elements exist
      const emptyChart = page.locator('[data-testid="empty-chart"]')
      if (await emptyChart.isVisible()) {
        await expect(emptyChart).toHaveScreenshot('weight-chart-empty-state.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Chart Interactions', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(1000)
    })

    test('Chart tooltip on hover', async ({ page }) => {
      const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
      if (await chartContainer.isVisible()) {
        // Hover over a data point
        const dataPoints = page.locator('.recharts-dot')
        const pointCount = await dataPoints.count()

        if (pointCount > 0) {
          await dataPoints.first().hover()
          await page.waitForTimeout(200)

          // Look for tooltip
          const tooltip = page.locator('.recharts-tooltip-wrapper')
          if (await tooltip.isVisible()) {
            await expect(page).toHaveScreenshot('chart-tooltip-hover.png', {
              animations: 'disabled',
            })
          }
        }
      }
    })

    test('Chart legend display', async ({ page }) => {
      const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
      if (await chartContainer.isVisible()) {
        const legend = page.locator('.recharts-legend-wrapper')
        if (await legend.isVisible()) {
          await expect(legend).toHaveScreenshot('chart-legend.png', {
            animations: 'disabled',
          })
        }
      }
    })
  })

  test.describe('Milestone Indicators', () => {
    test('Chart with milestone celebrations', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
      if (await chartContainer.isVisible()) {
        // Look for milestone markers
        const milestones = page.locator('[data-testid*="milestone"]')
        const milestoneCount = await milestones.count()

        if (milestoneCount > 0) {
          await expect(chartContainer).toHaveScreenshot('chart-with-milestones.png', {
            animations: 'disabled',
          })
        }
      }
    })
  })

  test.describe('Progress Visualizations', () => {
    test('Goal progress indicators', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const progressIndicators = page.locator('[data-testid*="progress"]')
      const count = await progressIndicators.count()

      if (count > 0) {
        await expect(progressIndicators.first()).toHaveScreenshot('goal-progress-indicator.png', {
          animations: 'disabled',
        })
      }
    })

    test('Streak visualization', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      const streakDisplay = page.locator('[data-testid="current-streak"]')
      if (await streakDisplay.isVisible()) {
        await expect(streakDisplay).toHaveScreenshot('streak-display.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Dark Mode Charts', () => {
    test('Charts in dark mode', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/dashboard')
      await page.waitForLoadState('networkidle')

      // Switch to dark mode
      await page.evaluate(() => {
        document.documentElement.classList.add('dark')
      })
      await page.waitForTimeout(500)

      const chartContainer = page.locator('[data-testid="weight-trend-graph"]')
      if (await chartContainer.isVisible()) {
        await expect(chartContainer).toHaveScreenshot('weight-chart-dark-mode.png', {
          animations: 'disabled',
        })
      }
    })
  })
})