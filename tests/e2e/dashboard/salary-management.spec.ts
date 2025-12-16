import { test, expect, STORAGE_KEYS } from '../../fixtures/test-fixtures'

/**
 * E2E tests for salary management user journeys
 *
 * Note: Fine-grained form behavior (defaults, validation) is tested
 * in component tests (SalaryPointForm.test.tsx).
 */
test.describe('Salary Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear cookies + localStorage before each test
    await page.context().clearCookies()
    await page.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('user can add a salary point and see dashboard', async ({ page, isMobile }) => {
    await page.goto('/')

    // On mobile, we need to open the drawer to access the form
    if (isMobile) {
      await page.getByRole('button', { name: /åpne datapanel/i }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
    }

    // Scope to the visible form container to avoid duplicate element errors
    const formContainer = isMobile ? page.getByRole('dialog') : page.getByRole('complementary')

    // Use data-testid for stable selectors
    await formContainer.getByTestId('salary-form-amount-input').fill('600000')
    await formContainer.getByTestId('salary-form-year-input').fill('2024')
    await formContainer.getByTestId('salary-form-reason-select').selectOption('promotion')
    await formContainer.getByTestId('salary-form-submit-button').click()

    // If on mobile, close the drawer first to see the chart
    if (isMobile) {
      await page.getByRole('button', { name: /lukk/i }).click()
    }

    // Onboarding should be gone since we have data now
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible()

    // Dashboard should show the data (desktop only has the heading)
    if (!isMobile) {
      await expect(page.getByRole('heading', { name: 'Lønnsoversikt' })).toBeVisible()
    }
  })

  test('salary point is saved with correct reason in localStorage', async ({ page, isMobile }) => {
    await page.goto('/')

    if (isMobile) {
      await page.getByRole('button', { name: /åpne datapanel/i }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
    }

    // Scope to the visible form container to avoid duplicate element errors
    const formContainer = isMobile ? page.getByRole('dialog') : page.getByRole('complementary')

    // Use data-testid for stable selectors
    await formContainer.getByTestId('salary-form-amount-input').fill('550000')
    await formContainer.getByTestId('salary-form-year-input').fill('2023')
    await formContainer.getByTestId('salary-form-reason-select').selectOption('newJob')
    await formContainer.getByTestId('salary-form-submit-button').click()

    // Verify data is stored correctly in localStorage
    const storedData = await page.evaluate(key => {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    }, STORAGE_KEYS.SALARY_POINTS)

    expect(storedData).toHaveLength(1)
    expect(storedData[0].year).toBe(2023)
    expect(storedData[0].pay).toBe(550000)
    expect(storedData[0].reason).toBe('newJob')
  })
})
