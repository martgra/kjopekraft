import { test, expect, STORAGE_KEYS, TEST_SALARY_POINTS } from '../../fixtures/test-fixtures'

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

  test('event baselines toggle controls visualization', async ({ dashboardPage, isMobile }) => {
    await dashboardPage.addOwnDataButton.click()

    // Add points with events
    await dashboardPage.addSalaryPoint(2020, 500000, 'newJob')
    await dashboardPage.addSalaryPoint(2022, 600000, 'promotion')

    if (isMobile) {
      await dashboardPage.closeDrawerIfOpen()
    }

    // Wait for chart
    await expect(dashboardPage.chart).toBeVisible()

    // Toggle should be visible in graph view
    const toggle = dashboardPage.eventBaselinesToggle
    await expect(toggle).toBeVisible()

    // Toggle off (default is false)
    await expect(toggle).not.toBeChecked()

    // Toggle on
    await toggle.check()
    await expect(toggle).toBeChecked()

    // Toggle back off
    await toggle.uncheck()
    await expect(toggle).not.toBeChecked()
  })

  test('event baselines toggle preference persists', async ({ dashboardPage, page, isMobile }) => {
    await dashboardPage.addOwnDataButton.click()

    // Add points with events
    await dashboardPage.addSalaryPoint(2020, 500000, 'newJob')
    await dashboardPage.addSalaryPoint(2022, 600000, 'promotion')

    if (isMobile) {
      await dashboardPage.closeDrawerIfOpen()
    }

    // Wait for chart
    await expect(dashboardPage.chart).toBeVisible()

    // Enable event baselines
    const toggle = dashboardPage.eventBaselinesToggle
    await toggle.check()
    await expect(toggle).toBeChecked()

    // Reload page
    await page.reload()

    // Wait for chart to render
    await expect(dashboardPage.chart).toBeVisible()

    // Toggle state should be persisted
    await expect(dashboardPage.eventBaselinesToggle).toBeChecked()
  })
})
