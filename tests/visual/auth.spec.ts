import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for authentication pages
 * Tests all authentication forms across different viewports and themes
 */

const breakpoints = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 720 },
]

const themes = ['light', 'dark']

test.describe('Authentication Visual Tests', () => {

  test.describe('Login Page', () => {
    breakpoints.forEach(({ name, width, height }) => {
      themes.forEach(theme => {
        test(`Login page ${theme} theme - ${name} (${width}x${height})`, async ({ page }) => {
          // Set viewport
          await page.setViewportSize({ width, height })

          // Set theme
          await page.goto('/login')
          await page.waitForLoadState('networkidle')

          if (theme === 'dark') {
            await page.evaluate(() => {
              document.documentElement.classList.add('dark')
            })
            await page.waitForTimeout(100) // Wait for theme transition
          }

          // Wait for animations to complete
          await page.waitForTimeout(500)

          // Take screenshot
          await expect(page).toHaveScreenshot(`login-${theme}-${name}-${width}x${height}.png`, {
            fullPage: true,
            animations: 'disabled',
          })
        })
      })
    })

    test('Login form validation states', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Test invalid email state
      await page.fill('input[type="email"]', 'invalid-email')
      await page.fill('input[type="password"]', 'password')
      await page.click('button[type="submit"]')
      await page.waitForTimeout(100)

      await expect(page).toHaveScreenshot('login-validation-error.png', {
        animations: 'disabled',
      })
    })
  })

  test.describe('Register Page', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`Register page - ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('/register')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot(`register-${name}-${width}x${height}.png`, {
          fullPage: true,
          animations: 'disabled',
        })
      })
    })

    test('Register form with password visibility toggle', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/register')
      await page.waitForLoadState('networkidle')

      // Fill form
      await page.fill('input[type="email"]', 'test@example.com')
      await page.fill('input[type="password"]', 'SecurePassword123!')
      await page.fill('input[name="confirmPassword"]', 'SecurePassword123!')

      // Show passwords
      await page.click('button:has-text("Show password"):first')
      await page.click('button:has-text("Show password"):last')
      await page.waitForTimeout(100)

      await expect(page).toHaveScreenshot('register-passwords-visible.png', {
        animations: 'disabled',
      })
    })
  })

  test.describe('Reset Password Page', () => {
    breakpoints.forEach(({ name, width, height }) => {
      test(`Reset password page - ${name} (${width}x${height})`, async ({ page }) => {
        await page.setViewportSize({ width, height })
        await page.goto('/reset-password')
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(500)

        await expect(page).toHaveScreenshot(`reset-password-${name}-${width}x${height}.png`, {
          fullPage: true,
          animations: 'disabled',
        })
      })
    })
  })

  test.describe('Loading States', () => {
    test('Login form loading state', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 720 })
      await page.goto('/login')
      await page.waitForLoadState('networkidle')

      // Fill valid credentials and start submission
      await page.fill('input[type="email"]', 'testuser3@gmail.com')
      await page.fill('input[type="password"]', 'TestPass123!')

      // Click submit and quickly capture loading state
      await Promise.all([
        page.click('button[type="submit"]'),
        page.waitForSelector('button:has-text("Signing in...")', { timeout: 2000 })
      ])

      await expect(page).toHaveScreenshot('login-loading-state.png', {
        animations: 'disabled',
      })
    })
  })
})