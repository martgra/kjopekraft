import { test, expect } from '@playwright/test'

test.describe('Hello World - Basic E2E Tests', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/')

    // Check that we get a successful page load
    await expect(page).toHaveTitle(/Kjøpekraft/i)
  })

  test('should navigate to negotiation page', async ({ page }) => {
    await page.goto('/negotiation')

    // Verify we're on the negotiation page
    await expect(page).toHaveURL(/.*negotiation/)
  })

  test('should have responsive viewport', async ({ page }) => {
    await page.goto('/')

    // Check that the page renders (has html content)
    const html = page.locator('html')
    await expect(html).toBeVisible()
  })
})
