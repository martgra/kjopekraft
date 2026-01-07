import { test, expect } from '../../fixtures/test-fixtures'

/**
 * E2E tests for reason-based salary tracking user journeys
 *
 * Note: Fine-grained component behavior (default values, validation, etc.)
 * is tested in component tests (SalaryPointForm.test.tsx).
 * These E2E tests focus on end-to-end user workflows.
 */
test.describe('Salary Tracking with Reasons', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.clearAppState()
    await dashboardPage.goto()
  })

  test('inflation base selection persists', async ({ dashboardPage, page, isMobile }) => {
    await dashboardPage.primaryCtaButton.click()

    // Add points with events
    await dashboardPage.addSalaryPoint(2020, 500000, 'newJob')
    await dashboardPage.addSalaryPoint(2022, 600000, 'promotion')

    if (isMobile) {
      await dashboardPage.closeDrawerIfOpen()
    }

    await dashboardPage.openChartSettings()

    // Wait for chart
    await expect(dashboardPage.chart).toBeVisible()

    await dashboardPage.setInflationBase('2020')
    expect(await dashboardPage.getLocalStorage('salary-inflation-base-year')).toBe(2020)
    await dashboardPage.closeChartSettings()

    // Reload page
    await page.reload()

    // Wait for chart to render
    await expect(dashboardPage.chart).toBeVisible()

    await dashboardPage.openChartSettings()

    // Selection should be persisted
    await expect(dashboardPage.inflationBaseSelect).toHaveValue('2020')
    await dashboardPage.closeChartSettings()
  })

  test('shows validation when inflation base is outside available years', async ({
    dashboardPage,
    isMobile,
  }) => {
    await dashboardPage.primaryCtaButton.click()
    await dashboardPage.addSalaryPoint(2020, 500000, 'newJob')
    await dashboardPage.addSalaryPoint(2022, 600000, 'promotion')

    if (isMobile) {
      await dashboardPage.closeDrawerIfOpen()
    }

    await dashboardPage.openChartSettings()
    await dashboardPage.setInflationBase('1999')

    await expect(
      dashboardPage.settingsModal.getByText(/Bruk et år du har registrert/i),
    ).toBeVisible()
    expect(await dashboardPage.getLocalStorage('salary-inflation-base-year')).toBe('auto')
  })
})
