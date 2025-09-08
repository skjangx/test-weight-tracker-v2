import { test, expect } from '@playwright/test'

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Weight Tracker')
  await expect(page.locator('p')).toContainText('Track your weight journey with ease')
})