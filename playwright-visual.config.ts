import { defineConfig, devices } from '@playwright/test'

/**
 * Visual regression testing configuration for Weight Tracker
 * Separate from functional E2E tests to enable focused visual testing
 */
export default defineConfig({
  testDir: './tests/visual',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'test-results/visual-report' }],
    ['json', { outputFile: 'test-results/visual-results.json' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Desktop Chrome
    {
      name: 'Desktop Chrome',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Desktop Safari
    {
      name: 'Desktop Safari',
      use: {
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      },
    },

    // Tablet
    {
      name: 'Tablet',
      use: {
        ...devices['iPad Pro'],
        viewport: { width: 768, height: 1024 }
      },
    },

    // Mobile
    {
      name: 'Mobile Chrome',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 375, height: 667 }
      },
    },

    // Large Desktop (for dashboard layouts)
    {
      name: 'Large Desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1920, height: 1080 }
      },
    },
  ],

  // Global test setup
  globalSetup: require.resolve('./tests/helpers/visual-setup.ts'),

  // Configure visual comparison
  expect: {
    // Threshold for pixel comparison (0-1, where 1 = identical)
    threshold: 0.2,

    // Max allowed pixel difference
    toHaveScreenshot: {
      threshold: 0.2,
      mode: 'pixel',
      animations: 'disabled',
    },

    // Match screenshot options
    toMatchSnapshot: {
      threshold: 0.2,
      mode: 'pixel',
    }
  },

  // Test timeout
  timeout: 30 * 1000,

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})