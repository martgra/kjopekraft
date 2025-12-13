import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Chart Controls', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.addInitScript(() => {
      localStorage.clear()
    })
  })

  test('net/gross toggle updates chart badge', async ({ page }) => {
    await page.goto('/')

    // Load demo data to have chart visible
    await page.getByRole('button', { name: /prøv med eksempeldata/i }).click()

    // Chart should be visible
    await expect(page.locator('canvas')).toBeVisible()

    // By default should show NETTO badge (exact match)
    await expect(page.getByText('NETTO', { exact: true })).toBeVisible()

    // Find and click the toggle switch
    const toggle = page.getByRole('switch')
    await toggle.click()

    // Should now show BRUTTO badge
    await expect(page.getByText('BRUTTO', { exact: true })).toBeVisible()

    // Toggle back
    await toggle.click()

    // Should show NETTO again
    await expect(page.getByText('NETTO', { exact: true })).toBeVisible()
  })
})
