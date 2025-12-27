import { expect, test } from '../../fixtures/test-fixtures'

test.describe('Negotiation draft persistence', () => {
  test('persists arguments across reload', async ({ page }, testInfo) => {
    await page.goto('/negotiation')

    if (testInfo.project.name === 'mobile') {
      const openDrawerButton = page.getByRole('button', { name: /åpne datapanel/i })
      await openDrawerButton.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }

    const argumentText = 'Jeg forbedret prosessen med 20%.'
    const isMobile = testInfo.project.name === 'mobile'
    const container = isMobile ? page.locator('[role="dialog"]') : page.locator('aside')
    const textarea = container.getByPlaceholder(/beskriv nøkkelpunktet ditt/i).first()

    await textarea.fill(argumentText)
    await container.locator('button', { hasText: /legg til argument/i }).click()
    await expect(page.getByText(argumentText)).toBeVisible()

    await page.reload()

    if (isMobile) {
      const openDrawerButton = page.getByRole('button', { name: /åpne datapanel/i })
      await openDrawerButton.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }

    await expect(page.getByText(argumentText)).toBeVisible()
  })
})
