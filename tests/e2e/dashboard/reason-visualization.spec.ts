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

  test('event baselines toggle preference persists', async ({ dashboardPage, page, isMobile }) => {
    await dashboardPage.addOwnDataButton.click()

    // Add points with events
    await dashboardPage.addSalaryPoint(2020, 500000, 'newJob')
    await dashboardPage.addSalaryPoint(2022, 600000, 'promotion')

    if (isMobile) {
      await dashboardPage.closeDrawerIfOpen()
    }

    await dashboardPage.openChartSettings()

    // Wait for chart
    await expect(dashboardPage.chart).toBeVisible()

    const toggle = dashboardPage.eventBaselinesToggle
    await toggle.check()
    await expect(toggle).toBeChecked()
    expect(await dashboardPage.getLocalStorage('salary-show-event-baselines')).toBe(true)
    await dashboardPage.closeChartSettings()

    // Reload page
    await page.reload()

    // Wait for chart to render
    await expect(dashboardPage.chart).toBeVisible()

    await dashboardPage.openChartSettings()

    // Toggle state should be persisted
    await expect(dashboardPage.eventBaselinesToggle).toBeChecked()
    await dashboardPage.closeChartSettings()
  })
})
