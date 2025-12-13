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

  // Form elements
  get yearInput() {
    return this.page.getByLabel(/år/i).first()
  }

  get salaryInput() {
    return this.page.getByLabel(/lønn|beløp/i).first()
  }

  get addButton() {
    return this.page.getByRole('button', { name: /lagre logg|legg til/i })
  }

  get reasonSelect() {
    return this.page.getByLabel(/hvorfor økte lønnen/i)
  }

  // Metrics
  get metricsGrid() {
    return this.page.locator('text=Total årslønn').locator('..')
  }

  // Timeline
  get activityTimeline() {
    return this.page.locator('text=Nylig aktivitet').locator('..')
  }

  getTimelineEntry(year: number) {
    return this.page.locator(`text=${year}`).first()
  }

  // Controls
  get netGrossToggle() {
    return this.page.getByRole('switch').or(this.page.locator('input[type="checkbox"]')).first()
  }

  get grossBadge() {
    return this.chartSection.getByText('BRUTTO', { exact: true }).first()
  }

  get netBadge() {
    return this.chartSection.getByText('NETTO', { exact: true }).first()
  }

  // View switcher
  get graphViewButton() {
    return this.page.getByRole('button', { name: /graf/i })
  }

  get tableViewButton() {
    return this.page.getByRole('button', { name: /tabell/i })
  }

  get analysisViewButton() {
    return this.page.getByRole('button', { name: /analyse/i })
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
    return this.page.getByRole('button', { name: /legg til|åpne/i }).first()
  }

  // Actions
  async addSalaryPoint(
    year: number,
    salary: number,
    reason: 'adjustment' | 'promotion' | 'newJob' = 'adjustment',
  ) {
    await this.yearInput.fill(String(year))
    await this.salaryInput.fill(String(salary))
    await this.reasonSelect.selectOption(reason)
    await this.addButton.click()
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
      return item ? JSON.parse(item) : null
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
