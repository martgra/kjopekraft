import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Data Persistence', () => {
  test('salary data persists across page reload', async ({ page, isMobile }) => {
    // Clear cookies, then navigate and clear localStorage in-origin
    await page.context().clearCookies()
    await page.goto('/')
    await page.evaluate(() => localStorage.clear())
    await page.reload()

    // Ensure clean state
    await expect(page.getByText('Velkommen til Kjøpekraft')).toBeVisible()

    // On mobile, open drawer
    if (isMobile) {
      await page.getByRole('button', { name: /åpne datapanel/i }).click()
      await expect(page.getByRole('dialog')).toBeVisible()
    }

    // Add a salary point
    const formContainer = isMobile ? page.getByRole('dialog') : page.getByRole('complementary')

    await formContainer.getByTestId('salary-form-amount-input').fill('550000')
    await formContainer.getByTestId('salary-form-year-input').fill('2023')
    await formContainer.getByTestId('salary-form-reason-select').selectOption('adjustment')
    await formContainer.getByTestId('salary-form-submit-button').click()

    // Verify data is shown
    if (isMobile) {
      await page.getByRole('button', { name: /lukk/i }).click()
    }

    // Verify onboarding is gone (data added successfully)
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible()
    if (!isMobile) {
      await expect(page.getByRole('heading', { name: 'Lønnsoversikt' })).toBeVisible()
    }

    // Reload the page - this is the key persistence test
    await page.reload()

    // Data should persist: onboarding should NOT appear, dashboard header should show (desktop only)
    // This is the core assertion that proves localStorage persistence works
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible()
    if (!isMobile) {
      await expect(page.getByRole('heading', { name: 'Lønnsoversikt' })).toBeVisible()
    }
  })
})
