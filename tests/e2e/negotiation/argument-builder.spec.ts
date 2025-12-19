import { expect, test } from '../../fixtures/test-fixtures'

test.describe('Negotiation argument builder', () => {
  test('adds an argument to the list', async ({ page }, testInfo) => {
    await page.goto('/negotiation')

    if (testInfo.project.name === 'mobile') {
      const openDrawerButton = page.getByRole('button', { name: /åpne datapanel/i })
      await openDrawerButton.click()
      await expect(page.locator('[role="dialog"]')).toBeVisible()
    }

    const argumentText = 'Jeg leverte et prosjekt før frist.'
    const isMobile = testInfo.project.name === 'mobile'
    const container = isMobile ? page.locator('[role="dialog"]') : page.locator('aside')
    const textarea = container.getByPlaceholder(/beskriv nøkkelpunktet ditt/i).first()
    await textarea.fill(argumentText)

    const addButton = container.locator('button', { hasText: /legg til argument/i })
    await expect(addButton).toBeVisible()
    await addButton.click()

    await expect(page.getByText(argumentText)).toBeVisible()
  })
})
