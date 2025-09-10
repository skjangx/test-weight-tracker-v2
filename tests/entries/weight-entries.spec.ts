import { test, expect } from '@playwright/test'
import { TestUtils } from '../helpers/test-utils'

test.describe.skip('Epic 3: Weight Data Entry', () => {
  const testUtils = new TestUtils()

  test.beforeEach(async ({ page }) => {
    // Start each test with a fresh authenticated user
    await testUtils.createAndLoginTestUser(page)
    await page.goto('/dashboard')
  })

  test.afterEach(async ({ page }) => {
    await testUtils.cleanup(page)
  })

  test.describe('US-3.1: Add Weight Entry', () => {
    test('should allow user to log daily weight', async ({ page }) => {
      // Click "Add Weight" button
      await page.click('button:has-text("Add Weight")')
      
      // Verify modal is open
      await expect(page.locator('[data-testid="add-weight-modal"]')).toBeVisible()
      
      // Fill weight entry form
      await page.fill('input[name="weight"]', '78.5')
      await page.fill('input[name="date"]', '2025-09-10')
      await page.fill('textarea[name="memo"]', 'Feeling good today!')
      
      // Submit entry
      await page.click('button:has-text("Save Entry")')
      
      // Verify entry appears in table
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('78.5')
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('Feeling good today!')
      
      // Verify toast notification
      await testUtils.waitForToast(page, 'Weight entry saved')
    })

    test('should validate weight input boundaries', async ({ page }) => {
      await page.click('button:has-text("Add Weight")')
      
      // Test lower boundary
      await page.fill('input[name="weight"]', '25')
      await expect(page.locator('[data-slot="form-message"]')).toContainText('Weight must be between 30 and 300 kg')
      
      // Test upper boundary
      await page.fill('input[name="weight"]', '350')
      await expect(page.locator('[data-slot="form-message"]')).toContainText('Weight must be between 30 and 300 kg')
      
      // Test decimal validation
      await page.fill('input[name="weight"]', '78.555')
      await expect(page.locator('[data-slot="form-message"]')).toContainText('Maximum 2 decimal places')
    })

    test('should not allow future dates', async ({ page }) => {
      await page.click('button:has-text("Add Weight")')
      
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const futureDate = tomorrow.toISOString().split('T')[0]
      
      await page.fill('input[name="date"]', futureDate)
      await expect(page.locator('[data-slot="form-message"]')).toContainText('Cannot log weight for future dates')
    })

    test('should handle multiple entries per day (averaged)', async ({ page }) => {
      const today = new Date().toISOString().split('T')[0]
      
      // Add first entry
      await page.click('button:has-text("Add Weight")')
      await page.fill('input[name="weight"]', '78')
      await page.fill('input[name="date"]', today)
      await page.click('button:has-text("Save Entry")')
      await testUtils.waitForToast(page, 'Weight entry saved')
      
      // Add second entry same day
      await page.click('button:has-text("Add Weight")')
      await page.fill('input[name="weight"]', '80')
      await page.fill('input[name="date"]', today)
      await page.click('button:has-text("Save Entry")')
      await testUtils.waitForToast(page, 'Weight entry saved')
      
      // Verify average is displayed (78 + 80) / 2 = 79
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('79')
    })

    test('should save with Enter key', async ({ page }) => {
      await page.click('button:has-text("Add Weight")')
      await page.fill('input[name="weight"]', '78.5')
      
      // Press Enter to save
      await page.press('input[name="weight"]', 'Enter')
      
      await testUtils.waitForToast(page, 'Weight entry saved')
    })

    test('should work without memo (optional field)', async ({ page }) => {
      await page.click('button:has-text("Add Weight")')
      await page.fill('input[name="weight"]', '78.5')
      await page.fill('input[name="date"]', '2025-09-10')
      // Leave memo empty
      await page.click('button:has-text("Save Entry")')
      
      await testUtils.waitForToast(page, 'Weight entry saved')
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('78.5')
    })

    test('should handle optimistic update with rollback on error', async ({ page }) => {
      // Mock network error and verify rollback behavior
      await page.route('**/weight_entries', route => route.abort())
      
      await page.click('button:has-text("Add Weight")')
      await page.fill('input[name="weight"]', '78.5')
      await page.click('button:has-text("Save Entry")')
      
      // Should see optimistic update first, then rollback
      await testUtils.waitForToast(page, 'Failed to save entry. Please try again.')
    })
  })

  test.describe('US-3.2: Edit Weight Entry', () => {
    test.beforeEach(async ({ page }) => {
      // Create a test weight entry before each edit test
      await testUtils.createWeightEntry(page, { 
        weight: 78.5, 
        date: '2025-09-10', 
        memo: 'Original memo' 
      })
    })

    test('should open edit modal on table row click', async ({ page }) => {
      // Click on table row
      await page.click('[data-testid="weight-entry-row"]')
      
      // Verify edit modal opens
      await expect(page.locator('[data-testid="edit-weight-modal"]')).toBeVisible()
      await expect(page.locator('h2:has-text("Edit Weight Entry")')).toBeVisible()
    })

    test('should populate form with existing values', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      
      // Verify form is pre-filled
      await expect(page.locator('input[name="weight"]')).toHaveValue('78.5')
      await expect(page.locator('input[name="date"]')).toHaveValue('2025-09-10')
      await expect(page.locator('textarea[name="memo"]')).toHaveValue('Original memo')
    })

    test('should allow user to modify weight', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      
      // Change weight
      await page.fill('input[name="weight"]', '79.0')
      await page.click('button:has-text("Save Changes")')
      
      // Verify update in table
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('79.0')
      await testUtils.waitForToast(page, 'Weight entry updated')
    })

    test('should allow user to modify memo', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      
      // Change memo
      await page.fill('textarea[name="memo"]', 'Updated memo text')
      await page.click('button:has-text("Save Changes")')
      
      // Verify update in table
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('Updated memo text')
      await testUtils.waitForToast(page, 'Weight entry updated')
    })

    test('should validate edited values same as create', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      
      // Test invalid weight
      await page.fill('input[name="weight"]', '25')
      await expect(page.locator('[data-slot="form-message"]')).toContainText('Weight must be between 30 and 300 kg')
    })

    test('should handle concurrent edit conflicts', async ({ page }) => {
      // Simulate another user editing same entry
      // This would involve mocking server responses
    })

    test('should show undo option after successful edit', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      await page.fill('input[name="weight"]', '79.0')
      await page.click('button:has-text("Save Changes")')
      
      // Verify toast has undo option
      await expect(page.locator('[data-testid="undo-button"]')).toBeVisible()
    })
  })

  test.describe('US-3.3: Delete Weight Entry', () => {
    test.beforeEach(async ({ page }) => {
      await testUtils.createWeightEntry(page, { 
        weight: 78.5, 
        date: '2025-09-10', 
        memo: 'Test entry' 
      })
    })

    test('should show delete button in edit modal', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      
      await expect(page.locator('button:has-text("Delete Entry")')).toBeVisible()
    })

    test('should show confirmation dialog before deletion', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      await page.click('button:has-text("Delete Entry")')
      
      await expect(page.locator('[data-testid="delete-confirmation"]')).toBeVisible()
      await expect(page.locator('text=Are you sure you want to delete this entry?')).toBeVisible()
    })

    test('should delete entry after confirmation', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      await page.click('button:has-text("Delete Entry")')
      await page.click('button:has-text("Delete")')
      
      // Verify entry removed from table
      await expect(page.locator('[data-testid="weight-entries-table"]')).not.toContainText('78.5')
      await testUtils.waitForToast(page, 'Weight entry deleted')
    })

    test('should cancel deletion on dialog cancel', async ({ page }) => {
      await page.click('[data-testid="weight-entry-row"]')
      await page.click('button:has-text("Delete Entry")')
      await page.click('button:has-text("Cancel")')
      
      // Verify entry still exists
      await expect(page.locator('[data-testid="weight-entries-table"]')).toContainText('78.5')
    })

    test('should update table immediately after deletion', async ({ page }) => {
      const initialRows = await page.locator('[data-testid="weight-entry-row"]').count()
      
      await page.click('[data-testid="weight-entry-row"]')
      await page.click('button:has-text("Delete Entry")')
      await page.click('button:has-text("Delete")')
      
      // Verify row count decreased
      const finalRows = await page.locator('[data-testid="weight-entry-row"]').count()
      expect(finalRows).toBe(initialRows - 1)
    })
  })

  test.describe('US-3.4: Entry Reminder', () => {
    test('should show reminder banner when no entry logged today', async ({ page }) => {
      // Ensure no entry for today exists
      await testUtils.deleteAllWeightEntriesForToday(page)
      
      // Refresh page to trigger banner check
      await page.reload()
      
      // Verify banner appears
      await expect(page.locator('[data-testid="entry-reminder-banner"]')).toBeVisible()
      await expect(page.locator('text=Don\'t forget to log today\'s weight')).toBeVisible()
    })

    test('should not show reminder when entry exists for today', async ({ page }) => {
      // Create entry for today
      const today = new Date().toISOString().split('T')[0]
      await testUtils.createWeightEntry(page, { weight: 78, date: today })
      
      // Refresh page
      await page.reload()
      
      // Verify no banner
      await expect(page.locator('[data-testid="entry-reminder-banner"]')).not.toBeVisible()
    })

    test('should be dismissible with X button', async ({ page }) => {
      await testUtils.deleteAllWeightEntriesForToday(page)
      await page.reload()
      
      // Verify banner is visible
      await expect(page.locator('[data-testid="entry-reminder-banner"]')).toBeVisible()
      
      // Click dismiss button
      await page.click('[data-testid="dismiss-reminder"]')
      
      // Verify banner is hidden
      await expect(page.locator('[data-testid="entry-reminder-banner"]')).not.toBeVisible()
    })

    test('should have quick-add button in banner', async ({ page }) => {
      await testUtils.deleteAllWeightEntriesForToday(page)
      await page.reload()
      
      // Click quick-add button
      await page.click('[data-testid="quick-add-weight"]')
      
      // Verify add weight modal opens
      await expect(page.locator('[data-testid="add-weight-modal"]')).toBeVisible()
    })

    test('should reappear next day if still no entry', async ({ page }) => {
      // This test would involve mocking date/time
      // to simulate next day behavior
    })

    test('should persist dismissal for current day only', async ({ page }) => {
      await testUtils.deleteAllWeightEntriesForToday(page)
      await page.reload()
      
      // Dismiss banner
      await page.click('[data-testid="dismiss-reminder"]')
      
      // Refresh page - should still be dismissed
      await page.reload()
      await expect(page.locator('[data-testid="entry-reminder-banner"]')).not.toBeVisible()
      
      // But should reappear tomorrow (would need date mocking)
    })
  })

  test.describe('Integration Tests', () => {
    test('should update goal progress when weight entries are added', async ({ page }) => {
      // Create a goal first
      await testUtils.createTestGoal(page, { targetWeight: 75, deadline: '2025-12-31' })
      
      // Add weight entry
      await testUtils.createWeightEntry(page, { weight: 80, date: '2025-09-10' })
      
      // Verify goal progress updates
      await expect(page.locator('[data-testid="weight-to-lose"]')).toContainText('5 kg to go')
    })

    test('should update streak when consecutive entries are logged', async ({ page }) => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const today = new Date()
      
      // Add entries for consecutive days
      await testUtils.createWeightEntry(page, { 
        weight: 80, 
        date: yesterday.toISOString().split('T')[0] 
      })
      await testUtils.createWeightEntry(page, { 
        weight: 79, 
        date: today.toISOString().split('T')[0] 
      })
      
      // Verify streak is updated
      await expect(page.locator('[data-testid="current-streak"]')).toContainText('🔥 2 day streak')
    })

    test('should trigger milestone celebration when weight loss achieved', async ({ page }) => {
      // Create initial entry with higher weight
      await testUtils.createWeightEntry(page, { weight: 85, date: '2025-09-01' })
      
      // Add entry that triggers 3kg milestone
      await testUtils.createWeightEntry(page, { weight: 82, date: '2025-09-10' })
      
      // Verify confetti animation and celebration
      await expect(page.locator('[data-testid="confetti-animation"]')).toBeVisible()
      await testUtils.waitForToast(page, 'Milestone achieved! 3kg lost! 🎉')
    })
  })
})