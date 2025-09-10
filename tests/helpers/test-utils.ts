import { test as base, expect } from '@playwright/test'

export interface TestCredentials {
  email: string
  password: string
}

export const testUser: TestCredentials = {
  email: 'testuser3@gmail.com',
  password: 'TestPass123!'
}

// Generate unique email for registration tests to avoid conflicts
export const generateUniqueTestUser = (): TestCredentials => ({
  email: `testuser${Date.now()}@example.com`,
  password: 'TestPass123!'
})

export const test = base.extend({
  // Add custom fixtures if needed
})

export const authHelpers = {
  /**
   * Navigate to registration page and fill form
   */
  async register(page: any, credentials: TestCredentials) {
    await page.goto('/register')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[name="email"]', credentials.email)
    await page.fill('input[name="password"]', credentials.password)
    await page.fill('input[name="confirmPassword"]', credentials.password)
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
  },

  /**
   * Navigate to login page and fill form
   */
  async login(page: any, credentials: TestCredentials) {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    
    await page.fill('input[name="email"]', credentials.email)
    await page.fill('input[name="password"]', credentials.password)
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
  },

  /**
   * Verify user is on dashboard page
   */
  async verifyDashboardAccess(page: any, expectedEmail: string) {
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Weight Tracker')
    await expect(page.locator('text=Welcome,')).toBeVisible()
    await expect(page.locator(`text=${expectedEmail}`)).toBeVisible()
  },

  /**
   * Verify user is redirected to login
   */
  async verifyRedirectToLogin(page: any) {
    await expect(page).toHaveURL('/login')
    await expect(page.locator('.text-2xl')).toContainText('Welcome Back')
  },

  /**
   * Verify loading state on root page
   */
  async verifyLoadingState(page: any) {
    await expect(page.locator('text=Loading your dashboard...')).toBeVisible()
    await expect(page.locator('[data-testid="loader"]')).toBeVisible()
  },

  /**
   * Take screenshots at different breakpoints
   */
  async takeResponsiveScreenshots(page: any, testName: string) {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.screenshot({ 
        path: `test-results/${testName}-${viewport.name}.png`,
        fullPage: true 
      })
    }
  },

  /**
   * Wait for toast notification
   */
  async waitForToast(page: any, expectedText: string) {
    // Wait for specific toast content to appear
    await page.waitForSelector(`[data-sonner-toast]:has-text("${expectedText}")`, { timeout: 10000 })
    await expect(page.locator(`[data-sonner-toast]:has-text("${expectedText}")`)).toBeVisible()
  }
}

export class TestUtils {
  /**
   * Create and login a test user
   */
  async createAndLoginTestUser(page: any) {
    const credentials = generateUniqueTestUser()
    await authHelpers.register(page, credentials)
    await authHelpers.verifyDashboardAccess(page, credentials.email)
    return credentials
  }

  /**
   * Create a test goal
   */
  async createTestGoal(page: any, goal: { 
    targetWeight: number
    deadline: string
    isActive?: boolean 
  }) {
    await page.click('button:has-text("Set Goal")')
    
    // Fill target weight
    await page.fill('input[type="number"]', goal.targetWeight.toString())
    
    // Handle date picker - click to open and select date
    await page.click('button:has(span:has-text("Pick a date"))')
    await page.waitForSelector('[role="gridcell"]')
    
    // Parse the deadline date to navigate to correct month/year
    const targetDate = new Date(goal.deadline)
    const targetYear = targetDate.getFullYear()
    const targetMonth = targetDate.getMonth() // 0-based (0 = January)
    const targetDay = targetDate.getDate()
    
    // Navigate to target year/month
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth() // 0-based
    
    // Calculate months difference
    const monthDiff = (targetYear - currentYear) * 12 + (targetMonth - currentMonth)
    
    if (monthDiff > 0) {
      // Navigate forward
      for (let i = 0; i < monthDiff; i++) {
        await page.locator('button[aria-label="Go to the Next Month"]').first().click()
        await page.waitForTimeout(300)
      }
    } else if (monthDiff < 0) {
      // Navigate backward  
      for (let i = 0; i < Math.abs(monthDiff); i++) {
        await page.locator('button[aria-label="Go to the Previous Month"]').first().click()
        await page.waitForTimeout(300)
      }
    }
    
    // Click the target day
    await page.locator(`[role="gridcell"]:has-text("${targetDay}")`).last().click()
    
    await page.click('button:has-text("Create Goal")')
    await this.waitForToast(page, 'Goal created successfully')
  }

  /**
   * Create a weight entry
   */
  async createWeightEntry(page: any, entry: {
    weight: number
    date: string
    memo?: string
  }) {
    await page.click('button:has-text("Add Weight")')
    await page.fill('input[name="weight"]', entry.weight.toString())
    await page.fill('input[name="date"]', entry.date)
    if (entry.memo) {
      await page.fill('textarea[name="memo"]', entry.memo)
    }
    await page.click('button:has-text("Save Entry")')
    await this.waitForToast(page, 'Weight entry saved')
  }

  /**
   * Delete all weight entries for today
   */
  async deleteAllWeightEntriesForToday(page: any) {
    // Implementation would depend on how we structure the deletion flow
    // For now, this is a placeholder for the reminder tests
  }

  /**
   * Wait for toast notification
   */
  async waitForToast(page: any, expectedText: string) {
    await page.waitForSelector(`[data-sonner-toast]:has-text("${expectedText}")`, { timeout: 10000 })
    await expect(page.locator(`[data-sonner-toast]:has-text("${expectedText}")`)).toBeVisible()
  }

  /**
   * Clean up test data
   */
  async cleanup(page: any) {
    // Clean up any test data if needed
    // This could involve API calls to delete test entries
  }

  /**
   * Take responsive screenshots for visual validation
   */
  async takeResponsiveScreenshots(page: any, testName: string) {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ]

    for (const viewport of viewports) {
      await page.setViewportSize(viewport)
      await page.screenshot({ 
        path: `test-results/${testName}-${viewport.name}.png`,
        fullPage: true 
      })
    }
  }
}

export { expect }