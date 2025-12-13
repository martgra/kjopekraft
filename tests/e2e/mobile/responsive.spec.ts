import { test, expect } from '../../fixtures/test-fixtures'

// Only run on mobile viewport
test.describe('Mobile Experience', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('mobile drawer opens via FAB button', async ({ page, isMobile }) => {
    // Skip this test on desktop
    test.skip(!isMobile, 'This test is for mobile only')

    await page.goto('/')

    // Load demo data first
    await page.getByRole('button', { name: /prøv med eksempeldata/i }).click()

    // Verify we're on the dashboard
    await expect(page.getByRole('heading', { name: 'Lønnsoversikt' })).toBeVisible()

    // Wait for any auto-opening drawer to settle, then close it if open
    await page.waitForTimeout(500)

    // Check if dialog is open and close via keyboard
    const dialog = page.getByRole('dialog')
    if (await dialog.isVisible().catch(() => false)) {
      // Press escape to close any open dialog
      await page.keyboard.press('Escape')
      await page.waitForTimeout(500)
    }

    // Click the FAB button to open drawer
    await page.getByRole('button', { name: /åpne datapanel/i }).click()

    // Drawer should be visible
    await expect(dialog).toBeVisible({ timeout: 3000 })
  })

  test('mobile bottom navigation is visible', async ({ page, isMobile }) => {
    // Skip this test on desktop
    test.skip(!isMobile, 'This test is for mobile only')

    await page.goto('/')

    // Bottom navigation should be visible on mobile (the fixed nav at bottom)
    const bottomNav = page.locator('nav.fixed')
    await expect(bottomNav).toBeVisible()

    // Should show both main tabs
    await expect(page.getByRole('link', { name: /oversikt/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /forhandling/i })).toBeVisible()
  })
})
