import { expect, test, STORAGE_KEYS, DEMO_SALARY_POINTS } from '../../fixtures/test-fixtures'

test.describe('Negotiation email generation', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/generate/email', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          result: 'Hei, dette er et testforslag for e-post.',
          prompt: 'test-prompt',
        }),
      }),
    )
  })

  test('generates email with stubbed API and prefilled salary data', async ({ page }) => {
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.evaluate(
      ([key, points]) => {
        localStorage.setItem(key, JSON.stringify(points))
      },
      [STORAGE_KEYS.SALARY_POINTS, DEMO_SALARY_POINTS] as const,
    )

    await page.goto('/negotiation')

    // Generate email
    const generateButton = page.getByRole('button', { name: /generer forslag/i }).first()
    await expect(generateButton).toBeVisible()
    await generateButton.click()

    await expect(page.getByText(/testforslag for e-post/i)).toBeVisible()
  })
})
