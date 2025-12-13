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
    await page.goto('/')

    // Wait for page to load
    await expect(page).toHaveTitle(/Kjøpekraft/i)

    // Should show welcome message
    await expect(page.getByText('Velkommen til Kjøpekraft')).toBeVisible()

    // Should show both CTA buttons
    await expect(page.getByRole('button', { name: /prøv med eksempeldata/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /legg til min egen lønn/i })).toBeVisible()

    // Should show feature cards
    await expect(page.getByText('Spor lønnsutvikling')).toBeVisible()
    await expect(page.getByText('Sammenlign med inflasjon')).toBeVisible()
    await expect(page.getByText('Forhandle smartere')).toBeVisible()
  })

  test('Try Demo button loads demo data and shows chart', async ({ page, isMobile }) => {
    await page.goto('/')

    // Click the Try Demo button
    await page.getByRole('button', { name: /prøv med eksempeldata/i }).click()

    // Onboarding should disappear
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible()

    // Chart should be visible (canvas element)
    await expect(page.locator('canvas')).toBeVisible()

    // Dashboard header should be visible
    await expect(page.getByRole('heading', { name: 'Lønnsoversikt' })).toBeVisible()

    // Chart section with title should be visible
    await expect(
      page.getByRole('heading', { name: /Årlig lønnsvekst vs. Inflasjon/i }),
    ).toBeVisible()

    // Activity timeline - on mobile it's in the drawer, on desktop it's visible in sidebar
    if (!isMobile) {
      await expect(page.getByRole('heading', { name: 'Nylig aktivitet' }).first()).toBeVisible()
    } else {
      // On mobile, verify bottom nav is visible instead
      await expect(page.getByRole('link', { name: /oversikt/i })).toBeVisible()
    }
  })
})
