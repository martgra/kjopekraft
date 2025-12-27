import { expect, test, STORAGE_KEYS, DEMO_SALARY_POINTS } from '../../fixtures/test-fixtures'

test.describe('Negotiation email generation', () => {
  let requestPayload: Record<string, unknown> | null = null

  test.beforeEach(async ({ page }) => {
    requestPayload = null
    await page.route('**/api/generate/email', route =>
      route.fulfill({
        status: 200,
        json: {
          result: 'Hei, dette er et testforslag for e-post.',
          prompt: 'test-prompt',
        },
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
    const [response] = await Promise.all([
      page.waitForResponse('**/api/generate/email'),
      generateButton.click(),
    ])
    expect(response.ok()).toBe(true)
    requestPayload = (await response.request().postDataJSON()) as Record<string, unknown>

    expect(requestPayload?.points).toBeDefined()
    expect(requestPayload?.userInfo).toBeDefined()
    await expect(generateButton).toBeEnabled()
  })
})
