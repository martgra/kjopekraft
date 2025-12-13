import { test, expect, STORAGE_KEYS, TEST_SALARY_POINTS } from '../../fixtures/test-fixtures'

test.describe('Salary Management', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('can add a salary point', async ({ page, isMobile }) => {
    await page.goto('/')

    // On mobile, we need to open the drawer to access the form
    if (isMobile) {
      // Click the add button in bottom nav to open drawer
      await page.getByRole('button', { name: /åpne datapanel/i }).click()
      // Wait for the drawer to open
      await expect(page.getByRole('dialog')).toBeVisible()
    }

    // Find the form - scope to the visible section
    // On desktop, it's in the complementary sidebar; on mobile, it's in the dialog
    const formContainer = isMobile ? page.getByRole('dialog') : page.getByRole('complementary')

    const salaryInput = formContainer.locator('input[placeholder="0"]')
    const yearInput = formContainer.locator('input[type="number"]')

    await salaryInput.fill('600000')
    await yearInput.fill('2024')

    // Submit the form
    await formContainer.getByRole('button', { name: /lagre logg/i }).click()

    // If on mobile, close the drawer first to see the chart
    if (isMobile) {
      await page.getByRole('button', { name: /lukk/i }).click()
    }

    // Onboarding should be gone since we have data now
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible()

    // Dashboard should show the data
    await expect(page.getByRole('heading', { name: 'Lønnsoversikt' })).toBeVisible()
  })
})
