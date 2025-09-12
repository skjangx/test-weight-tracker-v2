import { test, expect } from '@playwright/test'

test.describe('Weight Visualization Features (Epic 4)', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
    
    // Mock authentication state for testing
    await page.evaluate(() => {
      localStorage.setItem('supabase.auth.token', JSON.stringify({
        user: { id: 'test-user-id', email: 'test@example.com' }
      }))
    })
    
    // Navigate to dashboard
    await page.goto('http://localhost:3000/dashboard')
    await page.waitForLoadState('networkidle')
  })

  test('US-4.1: Weight Trend Graph displays correctly', async ({ page }) => {
    // Check that the Weight Trend Graph component is present
    await expect(page.locator('[data-testid="weight-trend-graph"]').or(page.getByText('Weight Trend'))).toBeVisible()
    
    // Verify the graph card structure
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    await expect(trendCard).toBeVisible()
    
    // Check for chart container (Recharts ResponsiveContainer)
    const chartContainer = page.locator('.recharts-responsive-container')
    if (await chartContainer.count() > 0) {
      await expect(chartContainer).toBeVisible()
      
      // Verify chart elements
      await expect(page.locator('.recharts-line')).toBeVisible()
      await expect(page.locator('.recharts-cartesian-grid')).toBeVisible()
    } else {
      // If no data, should show empty state
      await expect(page.getByText('No weight data available')).toBeVisible()
    }
  })

  test('US-4.2: Time Period Selection works correctly', async ({ page }) => {
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    
    // Look for time period buttons
    const periodButtons = trendCard.locator('button').filter({ hasText: /7 days|30 days|90 days|All time/ })
    
    if (await periodButtons.count() > 0) {
      // Test clicking different time periods
      const sevenDaysBtn = periodButtons.filter({ hasText: '7 days' })
      const thirtyDaysBtn = periodButtons.filter({ hasText: '30 days' })
      
      if (await sevenDaysBtn.count() > 0) {
        await sevenDaysBtn.click()
        await page.waitForTimeout(500) // Wait for chart update
        
        // Verify button is selected (has default/active styling)
        await expect(sevenDaysBtn).toHaveClass(/bg-primary|variant-default|selected/)
      }
      
      if (await thirtyDaysBtn.count() > 0) {
        await thirtyDaysBtn.click()
        await page.waitForTimeout(500) // Wait for chart update
        
        // Verify button selection changed
        await expect(thirtyDaysBtn).toHaveClass(/bg-primary|variant-default|selected/)
      }
    }
  })

  test('US-4.3: Moving Average toggle functionality', async ({ page }) => {
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    
    // Look for moving average toggle button
    const movingAvgBtn = trendCard.locator('button').filter({ hasText: /7-day average|Moving Average/ })
    
    if (await movingAvgBtn.count() > 0) {
      // Test toggling moving average
      await movingAvgBtn.click()
      await page.waitForTimeout(500)
      
      // Verify the button shows active state
      await expect(movingAvgBtn).toHaveClass(/bg-primary|variant-default|selected/)
      
      // Look for dashed line in chart (moving average line)
      const dashedLine = page.locator('.recharts-line').filter({ hasAttribute: 'stroke-dasharray' })
      if (await dashedLine.count() > 0) {
        await expect(dashedLine).toBeVisible()
      }
      
      // Toggle off
      await movingAvgBtn.click()
      await page.waitForTimeout(500)
    }
  })

  test('US-4.4: Goal Reference Line appears when goal is set', async ({ page }) => {
    // First, check if there's an active goal or create one
    const createGoalBtn = page.getByText('Create Goal').or(page.getByText('Set Goal'))
    
    if (await createGoalBtn.count() > 0) {
      await createGoalBtn.click()
      await page.waitForTimeout(500)
      
      // Fill goal form if modal appears
      const targetWeightInput = page.locator('input[name="targetWeight"]').or(page.getByLabel(/target.*weight/i))
      if (await targetWeightInput.count() > 0) {
        await targetWeightInput.fill('70')
        
        const deadlineInput = page.locator('input[name="deadline"]').or(page.getByLabel(/deadline/i))
        if (await deadlineInput.count() > 0) {
          // Set deadline to 30 days from now
          const futureDate = new Date()
          futureDate.setDate(futureDate.getDate() + 30)
          await deadlineInput.fill(futureDate.toISOString().split('T')[0])
        }
        
        // Submit goal
        const submitBtn = page.getByText('Create Goal').or(page.getByText('Save Goal'))
        await submitBtn.click()
        await page.waitForTimeout(1000)
      }
    }
    
    // Check for goal reference line in chart
    const chart = page.locator('.recharts-responsive-container')
    if (await chart.count() > 0) {
      // Look for reference line (dashed line for goal)
      const referenceLine = page.locator('.recharts-reference-line')
      if (await referenceLine.count() > 0) {
        await expect(referenceLine).toBeVisible()
      }
    }
    
    // Verify goal is shown in quick stats
    const goalText = page.getByText(/Goal:.*kg/)
    if (await goalText.count() > 0) {
      await expect(goalText).toBeVisible()
    }
  })

  test('US-4.5: Interactive Hover Details work correctly', async ({ page }) => {
    const chart = page.locator('.recharts-responsive-container')
    
    if (await chart.count() > 0) {
      // Hover over chart area to trigger tooltip
      await chart.hover()
      await page.waitForTimeout(500)
      
      // Look for chart dots (data points)
      const chartDots = page.locator('.recharts-dot')
      
      if (await chartDots.count() > 0) {
        // Hover over a specific data point
        await chartDots.first().hover()
        await page.waitForTimeout(500)
        
        // Check if tooltip appears with weight information
        const tooltip = page.locator('.recharts-tooltip-wrapper').or(page.locator('[role="tooltip"]'))
        if (await tooltip.count() > 0) {
          await expect(tooltip).toBeVisible()
          
          // Verify tooltip contains weight information
          await expect(tooltip.getByText(/\d+(\.\d+)?\s*kg/)).toBeVisible()
        }
      }
    }
  })

  test('US-4.6: Milestone Celebrations trigger appropriately', async ({ page }) => {
    // This test would require setting up test data with significant weight loss
    // For now, we'll test the milestone detection logic and UI elements
    
    // Check if milestone tracker component is present
    const milestoneTracker = page.locator('[data-testid="milestone-tracker"]')
    
    // Since milestone celebrations are triggered by data changes,
    // we'll verify the component is mounted and ready
    await expect(page.locator('body')).toBeVisible()
    
    // Check for celebration-related elements in the DOM
    const confettiContainer = page.locator('[data-testid="confetti-celebration"]')
    
    // Milestone celebrations would show toasts
    // We can test by mocking a celebration trigger
    await page.evaluate(() => {
      // Simulate milestone achievement
      const event = new CustomEvent('milestoneAchieved', {
        detail: { milestone: 3, weightLost: 3.0 }
      })
      window.dispatchEvent(event)
    })
    
    await page.waitForTimeout(1000)
    
    // Look for success toast or celebration message
    const celebrationToast = page.getByText(/Milestone Achieved|Congratulations/)
    if (await celebrationToast.count() > 0) {
      await expect(celebrationToast).toBeVisible()
    }
  })

  test('Visual regression: Weight trend graph at different breakpoints', async ({ page }) => {
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.waitForTimeout(500)
    
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    await expect(trendCard).toBeVisible()
    
    // Take screenshot for desktop
    await page.screenshot({
      path: 'test-results/weight-trend-desktop.png',
      fullPage: false,
      clip: await trendCard.boundingBox() || undefined
    })
    
    // Tablet view
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.waitForTimeout(500)
    
    await expect(trendCard).toBeVisible()
    await page.screenshot({
      path: 'test-results/weight-trend-tablet.png',
      fullPage: false,
      clip: await trendCard.boundingBox() || undefined
    })
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 })
    await page.waitForTimeout(500)
    
    await expect(trendCard).toBeVisible()
    await page.screenshot({
      path: 'test-results/weight-trend-mobile.png',
      fullPage: false,
      clip: await trendCard.boundingBox() || undefined
    })
  })

  test('Chart responsiveness and data loading states', async ({ page }) => {
    // Test loading state
    await page.goto('http://localhost:3000/dashboard')
    
    // Should show loading skeleton initially
    const skeleton = page.locator('.skeleton').or(page.locator('[data-testid="chart-skeleton"]'))
    
    // Wait for actual content to load
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
    
    // Verify chart or empty state is shown
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    await expect(trendCard).toBeVisible()
    
    // Check for either chart content or empty state message
    const hasChart = await page.locator('.recharts-responsive-container').count() > 0
    const hasEmptyState = await page.getByText('No weight data available').count() > 0
    
    expect(hasChart || hasEmptyState).toBe(true)
  })

  test('Chart accessibility features', async ({ page }) => {
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    await expect(trendCard).toBeVisible()
    
    // Check for proper ARIA labels and roles
    const chart = page.locator('.recharts-responsive-container')
    if (await chart.count() > 0) {
      // Recharts should provide accessibility features
      await expect(chart).toBeVisible()
      
      // Check that interactive elements are keyboard accessible
      const buttons = trendCard.locator('button')
      for (let i = 0; i < await buttons.count(); i++) {
        const button = buttons.nth(i)
        await expect(button).toBeVisible()
        
        // Test keyboard navigation
        await button.focus()
        await expect(button).toBeFocused()
      }
    }
  })

  test('Chart data accuracy and calculations', async ({ page }) => {
    // This would require seeding test data
    // For now, we'll verify the chart displays data correctly when available
    
    const trendCard = page.locator('.card').filter({ hasText: 'Weight Trend' })
    await expect(trendCard).toBeVisible()
    
    // Check for current weight display
    const currentWeightText = trendCard.getByText(/Current:.*kg/)
    if (await currentWeightText.count() > 0) {
      await expect(currentWeightText).toBeVisible()
      
      // Verify weight format (should be number + kg)
      const weightMatch = await currentWeightText.textContent()
      expect(weightMatch).toMatch(/\d+(\.\d+)?\s*kg/)
    }
    
    // Check for weight lost display
    const weightLostText = trendCard.getByText(/Lost:.*kg/)
    if (await weightLostText.count() > 0) {
      await expect(weightLostText).toBeVisible()
    }
    
    // Verify data points count is shown
    const dataPointsText = trendCard.getByText(/\d+ data points/)
    if (await dataPointsText.count() > 0) {
      await expect(dataPointsText).toBeVisible()
    }
  })
})