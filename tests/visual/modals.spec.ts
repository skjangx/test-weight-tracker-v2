import { test, expect } from '@playwright/test'

/**
 * Visual regression tests for modals, dialogs, and overlay components
 * Tests all modal states and interactions
 */

test.describe('Modal Visual Tests', () => {
  // Use authenticated state
  test.use({ storageState: 'tests/helpers/visual-auth-state.json' })

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 })
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(1000)
  })

  test.describe('Goal Modals', () => {
    test('Goal creation modal', async ({ page }) => {
      // Open goal creation modal
      const createButton = page.locator('[data-testid="create-goal-button"]')
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('goal-creation-modal.png', {
          animations: 'disabled',
        })

        // Test filled form state
        await page.fill('input[name="targetWeight"]', '70')
        await page.fill('input[name="deadline"]', '2025-12-31')

        await expect(page).toHaveScreenshot('goal-creation-modal-filled.png', {
          animations: 'disabled',
        })
      }
    })

    test('Goal update modal', async ({ page }) => {
      // Look for edit goal button
      const editButton = page.locator('[data-testid="edit-goal-button"]')
      if (await editButton.isVisible()) {
        await editButton.click()
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('goal-update-modal.png', {
          animations: 'disabled',
        })
      }
    })

    test('Goal history sheet', async ({ page }) => {
      const historyButton = page.locator('[data-testid="goal-history-button"]')
      if (await historyButton.isVisible()) {
        await historyButton.click()
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('goal-history-sheet.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Weight Entry Modals', () => {
    test('Add weight dialog', async ({ page }) => {
      const addButton = page.locator('[data-testid="add-weight-button"]')
      if (await addButton.isVisible()) {
        await addButton.click()
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('add-weight-dialog.png', {
          animations: 'disabled',
        })

        // Test filled form
        await page.fill('input[name="weight"]', '75.5')
        await page.fill('textarea[name="memo"]', 'Feeling great today!')

        await expect(page).toHaveScreenshot('add-weight-dialog-filled.png', {
          animations: 'disabled',
        })
      }
    })

    test('Edit weight dialog', async ({ page }) => {
      // This would require clicking on an existing weight entry
      const weightEntry = page.locator('[data-testid="weight-entry-row"]').first()
      if (await weightEntry.isVisible()) {
        await weightEntry.click()
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('edit-weight-dialog.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Help and Information Modals', () => {
    test('Help modal', async ({ page }) => {
      const helpButton = page.locator('[data-testid="help-button"]')
      if (await helpButton.isVisible()) {
        await helpButton.click()
        await page.waitForSelector('[role="dialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('help-modal.png', {
          animations: 'disabled',
        })

        // Test different help sections
        const sections = ['Getting Started', 'Tracking Progress', 'Goals', 'Streaks']
        for (const section of sections) {
          const sectionButton = page.locator(`button:has-text("${section}")`)
          if (await sectionButton.isVisible()) {
            await sectionButton.click()
            await page.waitForTimeout(200)

            await expect(page).toHaveScreenshot(`help-modal-${section.toLowerCase().replace(' ', '-')}.png`, {
              animations: 'disabled',
            })
          }
        }
      }
    })

    test('Welcome modal', async ({ page }) => {
      // Test first-time user welcome
      await page.evaluate(() => {
        localStorage.removeItem('weight-tracker-first-visit')
      })

      await page.reload()
      await page.waitForLoadState('networkidle')

      const welcomeModal = page.locator('[data-testid="welcome-modal"]')
      if (await welcomeModal.isVisible()) {
        await expect(page).toHaveScreenshot('welcome-modal.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Confirmation Dialogs', () => {
    test('Delete confirmation dialog', async ({ page }) => {
      // Look for delete buttons
      const deleteButton = page.locator('[data-testid="delete-entry-button"]').first()
      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('delete-confirmation-dialog.png', {
          animations: 'disabled',
        })
      }
    })

    test('Goal deletion confirmation', async ({ page }) => {
      const deleteGoalButton = page.locator('[data-testid="delete-goal-button"]')
      if (await deleteGoalButton.isVisible()) {
        await deleteGoalButton.click()
        await page.waitForSelector('[role="alertdialog"]', { timeout: 5000 })

        await expect(page).toHaveScreenshot('goal-delete-confirmation.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Modal States', () => {
    test('Modal loading states', async ({ page }) => {
      const createButton = page.locator('[data-testid="create-goal-button"]')
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForSelector('[role="dialog"]')

        // Fill and submit form to capture loading state
        await page.fill('input[name="targetWeight"]', '70')
        await page.fill('input[name="deadline"]', '2025-12-31')

        // Click submit and quickly capture loading state
        await Promise.all([
          page.click('button[type="submit"]'),
          page.waitForSelector('button:disabled', { timeout: 2000 })
        ])

        await expect(page).toHaveScreenshot('modal-loading-state.png', {
          animations: 'disabled',
        })
      }
    })

    test('Modal validation errors', async ({ page }) => {
      const createButton = page.locator('[data-testid="create-goal-button"]')
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForSelector('[role="dialog"]')

        // Submit empty form to trigger validation
        await page.click('button[type="submit"]')
        await page.waitForTimeout(200)

        await expect(page).toHaveScreenshot('modal-validation-errors.png', {
          animations: 'disabled',
        })
      }
    })
  })

  test.describe('Mobile Modal Layouts', () => {
    test('Modals on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })

      const createButton = page.locator('[data-testid="create-goal-button"]')
      if (await createButton.isVisible()) {
        await createButton.click()
        await page.waitForSelector('[role="dialog"]')

        await expect(page).toHaveScreenshot('goal-modal-mobile.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })

    test('Help modal on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 })

      const helpButton = page.locator('[data-testid="help-button"]')
      if (await helpButton.isVisible()) {
        await helpButton.click()
        await page.waitForSelector('[role="dialog"]')

        await expect(page).toHaveScreenshot('help-modal-tablet.png', {
          fullPage: true,
          animations: 'disabled',
        })
      }
    })
  })
})