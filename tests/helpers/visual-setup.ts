import { chromium, FullConfig } from '@playwright/test'
import { loginWithTestUser } from './test-utils'

/**
 * Global setup for visual regression tests
 * Ensures consistent test environment and pre-authentication
 */
async function globalSetup(_config: FullConfig) {
  const browser = await chromium.launch()
  const context = await browser.newContext()
  const page = await context.newPage()

  try {
    console.log('🔧 Setting up visual testing environment...')

    // Navigate to the app and wait for it to load
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')

    // Ensure we have test data available
    // This could include creating a test user session or seeding data
    await loginWithTestUser(page)

    // Store authentication state for reuse in tests
    await context.storageState({
      path: 'tests/helpers/visual-auth-state.json'
    })

    console.log('✅ Visual testing environment ready')
  } catch (error) {
    console.error('❌ Failed to setup visual testing environment:', error)
    throw error
  } finally {
    await context.close()
    await browser.close()
  }
}

export default globalSetup