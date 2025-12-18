import { test as base, expect, type Page } from '@playwright/test'

/**
 * Storage keys used by the application
 */
export const STORAGE_KEYS = {
  SALARY_POINTS: 'salary-calculator-points',
  DISPLAY_MODE: 'salaryDisplayMode',
  REFERENCE_ENABLED: 'salaryReferenceEnabled',
  ONBOARDING: 'salary-onboarding-v1',
  LAST_TAB: 'salary-last-tab',
} as const

/**
 * Test data: standard salary points for testing
 */
export const TEST_SALARY_POINTS = [
  { year: 2020, pay: 500000, reason: 'newJob' },
  { year: 2022, pay: 550000, reason: 'adjustment' },
  { year: 2024, pay: 600000, reason: 'promotion' },
]

/**
 * Demo data matching the application's demo mode
 */
export const DEMO_SALARY_POINTS = [
  { year: 2020, pay: 550000, reason: 'newJob' },
  { year: 2021, pay: 580000, reason: 'adjustment' },
  { year: 2022, pay: 600000, reason: 'promotion' },
  { year: 2023, pay: 650000, reason: 'adjustment' },
  { year: 2024, pay: 680000, reason: 'promotion' },
]

/**
 * Dashboard Page Object Model
 */
export class DashboardPage {
  constructor(private page: Page) {}

  // Navigation
  async goto() {
    await this.page.goto('/')
  }

  // Onboarding elements
  get onboardingScreen() {
    return this.page.locator('text=Velkommen til Kjøpekraft')
  }

  get tryDemoButton() {
    return this.page.getByRole('button', { name: /prøv med eksempeldata/i })
  }

  get addOwnDataButton() {
    return this.page.getByRole('button', { name: /legg til min egen lønn/i })
  }

  // Chart elements
  get chart() {
    return this.page.locator('canvas')
  }

  get chartSection() {
    return this.page
      .locator('[data-testid="chart-section"]')
      .or(this.page.locator('text=Årlig lønnsvekst vs. Inflasjon').locator('..'))
  }

  // Form elements - using data-testid for stability
  get yearInput() {
    return this.page.getByTestId('salary-form-year-input')
  }

  get salaryInput() {
    return this.page.getByTestId('salary-form-amount-input')
  }

  get addButton() {
    return this.page.getByTestId('salary-form-submit-button')
  }

  get reasonSelect() {
    return this.page.getByTestId('salary-form-reason-select')
  }

  get settingsButton() {
    return this.page.getByTestId('chart-section-open-settings')
  }

  get settingsModal() {
    return this.page.getByTestId('chart-settings-modal-container')
  }

  get settingsCloseButton() {
    return this.page.getByTestId('chart-settings-modal-close')
  }

  async openChartSettings() {
    if (await this.settingsModal.isVisible().catch(() => false)) return
    await this.settingsButton.click()
    await expect(this.settingsModal).toBeVisible()
  }

  get netGrossToggle() {
    return this.settingsModal.getByTestId('chart-settings-mode-toggle')
  }

  get grossBadge() {
    return this.chartSection.getByText('FØR SKATT', { exact: true }).first()
  }

  get netBadge() {
    return this.chartSection.getByText('ETTER SKATT', { exact: true }).first()
  }

  get occupationSelect() {
    return this.settingsModal.getByTestId('chart-settings-reference-search')
  }

  get selectedOccupation() {
    return this.settingsModal.getByTestId('chart-settings-reference-selected')
  }

  get inflationBaseSelect() {
    return this.settingsModal.getByTestId('chart-settings-inflation-base-select')
  }

  async setInflationBase(value: string) {
    const input = this.inflationBaseSelect
    await input.fill('')
    await input.fill(value)
  }

  async closeChartSettings() {
    if (await this.settingsModal.isVisible().catch(() => false)) {
      await this.settingsCloseButton.click()
      await expect(this.settingsModal).not.toBeVisible()
    }
  }

  // Metrics
  get metricsGrid() {
    return this.page.locator('text=Total årslønn').locator('..')
  }

  // View switcher
  get graphViewButton() {
    return this.page.getByTestId('chart-view-switcher-option-graph')
  }

  get tableViewButton() {
    return this.page.getByTestId('chart-view-switcher-option-table')
  }

  get analysisViewButton() {
    return this.page.getByTestId('chart-view-switcher-option-analysis')
  }

  // View content
  get tableViewContent() {
    return this.page.getByTestId('salary-table-view')
  }

  get analysisViewContent() {
    return this.page.getByTestId('salary-analysis-view')
  }

  // Demo mode indicator
  get demoBanner() {
    return this.page.locator('text=eksempeldata').or(this.page.locator('text=demo'))
  }

  // Mobile elements
  get mobileBottomNav() {
    return this.page.locator('nav').filter({ has: this.page.locator('text=Oversikt') })
  }

  get mobileDrawerTrigger() {
    return this.page.getByRole('button', { name: /åpne datapanel/i })
  }

  private get mobileDrawerCloseButton() {
    return this.page.getByRole('button', { name: /lukk/i })
  }

  private async getFormContainer() {
    const dialog = this.page.getByRole('dialog')
    const dialogExists = (await dialog.count()) > 0
    const isDialogOpen =
      dialogExists &&
      (await dialog.evaluate(el => {
        return el.classList.contains('translate-y-0')
      }))

    // If drawer exists but isn't open, open it to ensure we target the visible form
    if (dialogExists && !isDialogOpen && (await this.mobileDrawerTrigger.isVisible())) {
      await this.mobileDrawerTrigger.click()
      await expect(dialog).toHaveClass(/translate-y-0/)
    }

    if (
      dialogExists &&
      (await dialog.evaluate(el => {
        return el.classList.contains('translate-y-0')
      }))
    ) {
      return dialog
    }

    // Desktop sidebar
    const sidebar = this.page
      .getByRole('complementary')
      .filter({ has: this.page.getByTestId('salary-form-container') })
    if ((await sidebar.count()) > 0) {
      return sidebar.first()
    }

    // Fallback: first visible form container
    return this.page.getByTestId('salary-form-container').first()
  }

  async closeDrawerIfOpen() {
    const dialog = this.page.getByRole('dialog')
    const dialogCount = await dialog.count()
    const dialogExists = dialogCount > 0

    if (
      dialogExists &&
      (await dialog.evaluate(el => {
        return el.classList.contains('translate-y-0')
      }))
    ) {
      await this.mobileDrawerCloseButton.click()
      // Drawer may either slide out of view or unmount entirely depending on route change timing
      try {
        await expect(dialog).toHaveClass(/translate-y-full/)
      } catch (err) {
        // If the drawer unmounted, confirm it's gone
        const remaining = await dialog.count()
        if (remaining > 0) throw err
      }
    }

    // Treat missing dialog as already closed for test stability
    if (!dialogExists) {
      return
    }
  }

  // Actions
  async addSalaryPoint(
    year: number,
    salary: number,
    reason: 'adjustment' | 'promotion' | 'newJob' = 'adjustment',
  ) {
    const formContainer = await this.getFormContainer()

    await formContainer.getByTestId('salary-form-year-input').fill(String(year))
    await formContainer.getByTestId('salary-form-amount-input').fill(String(salary))
    await formContainer.getByTestId('salary-form-reason-select').selectOption(reason)
    await formContainer.getByTestId('salary-form-submit-button').click()
  }

  async loadDemoData() {
    await this.tryDemoButton.click()
  }

  async switchView(mode: 'graph' | 'table' | 'analysis') {
    const map: Record<'graph' | 'table' | 'analysis', () => Promise<void>> = {
      graph: () => this.graphViewButton.click(),
      table: () => this.tableViewButton.click(),
      analysis: () => this.analysisViewButton.click(),
    }
    await map[mode]()
  }

  async clearLocalStorage() {
    // Ensure we're on an origin before touching localStorage (about:blank blocks access)
    if (this.page.url() === 'about:blank') {
      await this.goto()
    }

    await this.page.evaluate(() => {
      localStorage.clear()
    })
  }

  async clearAppState() {
    await this.page.context().clearCookies()
    await this.clearLocalStorage()
  }

  async setLocalStorage(key: string, value: unknown) {
    await this.page.evaluate(
      ([k, v]: [string, unknown]) => {
        localStorage.setItem(k, JSON.stringify(v))
      },
      [key, value] as [string, unknown],
    )
  }

  async getLocalStorage(key: string) {
    return this.page.evaluate(k => {
      const item = localStorage.getItem(k)
      if (!item) return null
      try {
        return JSON.parse(item)
      } catch {
        return item
      }
    }, key)
  }
}

/**
 * Extended test fixture with DashboardPage
 */
export const test = base.extend<{ dashboardPage: DashboardPage }>({
  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page)
    await use(dashboardPage)
  },
})

export { expect }
