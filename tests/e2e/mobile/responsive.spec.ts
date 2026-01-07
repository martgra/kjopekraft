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

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Open the drawer via the onboarding CTA
    await page.getByRole('button', { name: /kom i gang/i }).click()

    // Drawer should be visible
    const dialog = page.getByRole('dialog')
    await expect(dialog).toBeVisible({ timeout: 3000 })
  })

  test('mobile bottom navigation is visible', async ({ page, isMobile }) => {
    // Skip this test on desktop
    test.skip(!isMobile, 'This test is for mobile only')

    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Bottom navigation should be visible on mobile (the fixed nav at bottom)
    const bottomNav = page.locator('nav.fixed')
    await expect(bottomNav).toBeVisible()

    // Should show both main tabs
    await expect(page.getByRole('link', { name: /oversikt/i })).toBeVisible()
    await expect(page.getByRole('link', { name: /forhandling/i })).toBeVisible()
  })
})
