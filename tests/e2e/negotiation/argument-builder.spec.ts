import { expect, test } from '../../fixtures/test-fixtures'

test.describe('Negotiation argument builder', () => {
  test('adds an argument to the list', async ({ page }, testInfo) => {
    await page.goto('/negotiation')

    if (testInfo.project.name === 'mobile') {
      const openDrawerButton = page.getByRole('button', { name: /åpne datapanel/i })
      await openDrawerButton.click()
      await expect(page.getByText('Argumenter', { exact: true })).toBeVisible()
    }

    const argumentText = 'Jeg leverte et prosjekt før frist.'
    const isMobile = testInfo.project.name === 'mobile'
    const textarea = isMobile
      ? page
          .locator('[aria-labelledby="drawer-title"]')
          .getByPlaceholder(/beskriv nøkkelpunktet ditt/i)
          .first()
      : page
          .locator('aside')
          .getByPlaceholder(/beskriv nøkkelpunktet ditt/i)
          .first()
    await textarea.fill(argumentText)

    const addButton = page.getByRole('button', { name: /legg til argument/i })
    await addButton.click()

    await expect(page.getByText(argumentText)).toBeVisible()
  })
})
