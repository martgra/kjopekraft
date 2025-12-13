import { test, expect } from '../../fixtures/test-fixtures'

test.describe('Chart Controls', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    await dashboardPage.clearAppState()
    await dashboardPage.goto()
  })

  test('net/gross toggle updates chart badge', async ({ dashboardPage }) => {
    await dashboardPage.loadDemoData()

    await expect(dashboardPage.chart).toBeVisible()
    await expect(dashboardPage.netBadge).toBeVisible()

    await dashboardPage.netGrossToggle.click()
    await expect(dashboardPage.grossBadge).toBeVisible()

    await dashboardPage.netGrossToggle.click()
    await expect(dashboardPage.netBadge).toBeVisible()
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
})
