import { expect, test } from '../../fixtures/test-fixtures'

test.describe('Negotiation email generation', () => {
  let requestPayload: Record<string, unknown> | null = null

  test.beforeEach(async ({ page }) => {
    requestPayload = null
    await page.route('**/api/generate/email**', async route => {
      try {
        requestPayload = (route.request().postDataJSON() ?? {}) as Record<string, unknown>
      } catch {
        requestPayload = {}
      }
      await route.fulfill({
        status: 200,
        json: {
          result: 'Hei, dette er et testforslag for e-post.',
          prompt: 'test-prompt',
        },
      })
    })
  })

  test('generates email with stubbed API and prefilled salary data', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => localStorage.clear())
    await page.evaluate(() => {
      localStorage.setItem(
        'salary-calculator-points',
        JSON.stringify([
          { year: 2020, pay: 550000, reason: 'newJob' },
          { year: 2021, pay: 580000, reason: 'adjustment' },
          { year: 2022, pay: 600000, reason: 'promotion' },
          { year: 2023, pay: 650000, reason: 'adjustment' },
          { year: 2024, pay: 680000, reason: 'promotion' },
        ]),
      )
      const draft = encodeURIComponent(
        JSON.stringify({
          points: [
            {
              description: 'Resultatene mine økte inntektene med 12 %',
              type: 'Achievement',
            },
          ],
          emailContent: '',
          emailPrompt: '',
          userInfo: {
            jobTitle: 'Utvikler',
            industry: 'IT',
            isNewJob: false,
            currentSalary: '650 000',
            desiredSalary: '700 000',
            achievements: '',
            marketData: '',
            benefits: [],
            otherBenefits: '',
          },
        }),
      )
      document.cookie = `negotiation_draft=${draft}; path=/; samesite=lax`
    })

    await page.goto('/negotiation', { waitUntil: 'domcontentloaded' })

    // Generate email
    const generateButton = page.getByRole('button', { name: /generer forslag/i }).first()
    await expect(page.getByText(/Resultatene mine økte inntektene med 12 %/i)).toBeVisible()
    await expect(generateButton).toBeVisible()
    await generateButton.click()
    await expect.poll(() => requestPayload).not.toBeNull()

    expect(requestPayload?.points).toBeDefined()
    expect(requestPayload?.userInfo).toBeDefined()
    await expect(generateButton).toBeEnabled()
  })
})
