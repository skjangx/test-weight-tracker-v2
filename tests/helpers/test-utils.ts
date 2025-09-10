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

export { expect }