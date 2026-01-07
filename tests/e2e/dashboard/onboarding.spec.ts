import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Onboarding Experience', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies + localStorage before each test to simulate first visit
    await page.context().clearCookies()
    await page.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('shows onboarding screen on first visit', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Wait for page to load
    await expect(page).toHaveTitle(/Kjøpekraft/i)

    // Should show welcome message
    await expect(page.getByText('Velkommen til Kjøpekraft')).toBeVisible()

    // Should show primary CTA button
    await expect(page.getByRole('button', { name: /kom i gang/i })).toBeVisible()
  })
})
