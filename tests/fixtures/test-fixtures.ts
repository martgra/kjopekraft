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
  { year: 2020, pay: 500000 },
  { year: 2022, pay: 550000 },
  { year: 2024, pay: 600000 },
]

/**
 * Demo data matching the application's demo mode
 */
export const DEMO_SALARY_POINTS = [
  { year: 2020, pay: 550000 },
  { year: 2021, pay: 580000 },
  { year: 2022, pay: 600000 },
  { year: 2023, pay: 650000 },
  { year: 2024, pay: 680000 },
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
    return this.page.locator('text=BRUTTO')
  }

  get netBadge() {
    return this.page.locator('text=NETTO')
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
  async addSalaryPoint(year: number, salary: number) {
    await this.yearInput.fill(String(year))
    await this.salaryInput.fill(String(salary))
    await this.addButton.click()
  }

  async clearLocalStorage() {
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
