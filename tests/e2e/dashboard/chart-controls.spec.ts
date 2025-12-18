import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Chart Controls', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.clearAppState()
    await dashboardPage.goto()
  })

  test('opens settings modal and exposes chart controls', async ({ dashboardPage }) => {
    await dashboardPage.loadDemoData()

    await expect(dashboardPage.chart).toBeVisible()
    await dashboardPage.openChartSettings()
    await expect(dashboardPage.settingsModal).toBeVisible()
    await expect(dashboardPage.netGrossToggle).toBeVisible()
    await expect(dashboardPage.inflationBaseSelect).toBeVisible()
    await expect(dashboardPage.occupationSelect).toBeVisible()
    await dashboardPage.closeChartSettings()
  })

  test('view switcher shows graph, table, and analysis content', async ({ dashboardPage }) => {
    await dashboardPage.loadDemoData()

    // Graph by default
    await expect(dashboardPage.chart).toBeVisible()

    // Table view (desktop = table, mobile = cards)
    await dashboardPage.switchView('table')
    await expect(dashboardPage.tableViewContent).toBeVisible()

    // Analysis view
    await dashboardPage.switchView('analysis')
    await expect(dashboardPage.analysisViewContent).toBeVisible()

    // Back to graph
    await dashboardPage.switchView('graph')
    await expect(dashboardPage.chart).toBeVisible()
  })

  test('net/gross toggle updates badge without breaking chart', async ({ dashboardPage }) => {
    await dashboardPage.loadDemoData()
    await dashboardPage.openChartSettings()

    // Switch to net
    await dashboardPage.netGrossToggle.click()
    // Preference should persist and chart stays visible
    expect(await dashboardPage.getLocalStorage('salaryDisplayMode')).toBe('net')
    await expect(dashboardPage.chart).toBeVisible()

    // Switch back to gross
    await dashboardPage.netGrossToggle.click()
    expect(await dashboardPage.getLocalStorage('salaryDisplayMode')).toBe('gross')
    await expect(dashboardPage.chart).toBeVisible()
  })
})
