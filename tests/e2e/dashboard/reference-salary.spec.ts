import { test, expect } from '../../fixtures/test-fixtures'

const STORTING_ROUTE = '**/api/reference/storting**'
const STORTING_PAYLOAD = {
  source: { provider: 'Stortinget', table: 'Lonnsutvikling' },
  occupation: { code: 'stortingsrepresentant', label: 'Stortingsrepresentant' },
  filters: {
    column: 'Stortingsrepresentanter',
    source:
      'https://www.stortinget.no/no/Stortinget-og-demokratiet/Representantene/Okonomiske-rettigheter/Lonnsutvikling/',
  },
  unit: 'NOK/year',
  reference: { effectiveFrom: '01.05.2025' },
  series: [
    { year: 2024, value: 1171000, status: null, type: 'official' },
    { year: 2025, value: 1214977, status: null, type: 'official' },
  ],
  notes: ['Stubbed in e2e test'],
}

test.describe('Reference salary (Stortinget)', () => {
  test.beforeEach(async ({ page }) => {
    await page.context().clearCookies()
    await page.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('enables reference line when Stortinget data loads', async ({ page }) => {
    await page.route(STORTING_ROUTE, route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(STORTING_PAYLOAD),
      }),
    )

    await page.goto('/')
    await page.getByRole('button', { name: /prøv med eksempeldata/i }).click()
    await expect(page.locator('canvas')).toBeVisible()

    // Open occupation selector and choose Stortingsrepresentant
    await page.getByRole('button', { name: /referanse|ingen referanse/i }).click()
    await page.getByRole('button', { name: /stortingsrepresentant/i }).click()

    // Wait for the API call to complete
    await page.waitForResponse(resp => resp.url().includes('/api/reference/storting') && resp.ok())

    // Selector button should now show the chosen occupation
    await expect(page.getByRole('button', { name: /stortingsrepresentant/i })).toBeVisible()
    // URL should carry the reference flag
    await expect(page).toHaveURL(/reference=true/)
  })

  test('shows error and disables reference when Stortinget fetch fails', async ({ page }) => {
    await page.route(STORTING_ROUTE, route =>
      route.fulfill({
        status: 502,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'upstream failed' }),
      }),
    )

    await page.goto('/')
    await page.getByRole('button', { name: /prøv med eksempeldata/i }).click()
    await expect(page.locator('canvas')).toBeVisible()

    await page.getByRole('button', { name: /referanse|ingen referanse/i }).click()
    await page.getByRole('button', { name: /stortingsrepresentant/i }).click()

    // Error banner should appear and reference comparison should be turned off
    await expect(
      page.getByText('Kunne ikke laste referansedata. Referansesammenligningen er deaktivert.'),
    ).toBeVisible()
    // Dropdown should reset to "Ingen referanse"
    await expect(page.getByRole('button', { name: /ingen referanse/i })).toBeVisible()
    await expect(page).not.toHaveURL(/reference=true/)
  })
})
