# Playwright Test Plan for Kjøpekraft

## Executive Summary

This document outlines a comprehensive Playwright testing strategy for Kjøpekraft, a Next.js 15 web application for Norwegian salary tracking and negotiation preparation.

**Current Status**: No automated tests exist
**Priority**: High - Critical user flows involve financial calculations and AI-powered features
**Target Coverage**: E2E user flows, UI interactions, data persistence, responsive design

---

## Test Suite Structure

```
tests/
├── e2e/
│   ├── dashboard/
│   │   ├── onboarding.spec.ts
│   │   ├── salary-management.spec.ts
│   │   ├── chart-interactions.spec.ts
│   │   ├── metrics-calculation.spec.ts
│   │   └── display-modes.spec.ts
│   ├── negotiation/
│   │   ├── form-filling.spec.ts
│   │   ├── argument-builder.spec.ts
│   │   ├── ai-generation.spec.ts
│   │   └── export-features.spec.ts
│   ├── mobile/
│   │   ├── responsive-layout.spec.ts
│   │   ├── bottom-navigation.spec.ts
│   │   └── drawer-interactions.spec.ts
│   └── data-persistence/
│       ├── localstorage.spec.ts
│       └── data-reset.spec.ts
├── fixtures/
│   ├── salary-data.json
│   ├── inflation-data.json
│   └── reference-salary-data.json
└── helpers/
    ├── test-data.ts
    ├── calculations.ts
    └── page-objects.ts
```

---

## Priority 1: Critical User Flows (Must Have)

### 1.1 Dashboard - First Time User Journey
**File**: `tests/e2e/dashboard/onboarding.spec.ts`

**Test Cases**:
- ✅ Display onboarding screen on first visit
- ✅ Show 3 feature cards with correct Norwegian text
- ✅ "Try Demo Data" button populates sample data (2020-2024)
- ✅ "Get Started" button shows salary entry form
- ✅ Onboarding dismissed when user adds first real data point
- ✅ Demo data auto-clears when real data is added
- ✅ Onboarding doesn't show on subsequent visits (localStorage check)

**Key Assertions**:
```typescript
// Check onboarding displays
await expect(page.getByText('Velkommen til Kjøpekraft')).toBeVisible();

// Verify demo data populates chart
await page.click('text=Prøv demodata');
await expect(page.locator('[data-testid="chart-canvas"]')).toBeVisible();
await expect(page.locator('[data-testid="metric-card"]')).toHaveCount(4);

// Verify localStorage set
const onboardingFlag = await page.evaluate(() =>
  localStorage.getItem('salary-onboarding-v1')
);
expect(onboardingFlag).toBe('true');
```

---

### 1.2 Dashboard - Salary Data Management
**File**: `tests/e2e/dashboard/salary-management.spec.ts`

**Test Cases**:
- ✅ Add new salary entry (valid year + amount)
- ✅ Form validation: Reject year < 2000 or > current year + 1
- ✅ Form validation: Reject negative salary amounts
- ✅ Form validation: Reject non-numeric inputs
- ✅ Salary appears in activity timeline after adding
- ✅ Chart updates with new data point
- ✅ Metrics recalculate automatically
- ✅ Edit existing salary entry
- ✅ Delete salary entry with confirmation
- ✅ Data persists after page reload (localStorage)
- ✅ Multiple entries for same year not allowed (validation)

**Test Data**:
```typescript
const validSalaryEntry = { year: 2023, pay: 650000 };
const invalidEntries = [
  { year: 1999, pay: 500000 }, // Too old
  { year: 2027, pay: 500000 }, // Too far future
  { year: 2023, pay: -50000 }, // Negative
  { year: 2023, pay: 0 },      // Zero
];
```

**Key Assertions**:
```typescript
// Add salary and verify
await page.fill('[data-testid="year-input"]', '2023');
await page.fill('[data-testid="pay-input"]', '650000');
await page.click('[data-testid="add-salary-button"]');

// Check timeline entry
await expect(page.locator('[data-testid="timeline-item"]')).toContainText('2023');
await expect(page.locator('[data-testid="timeline-item"]')).toContainText('650 000 kr');

// Verify persistence
await page.reload();
await expect(page.locator('[data-testid="timeline-item"]')).toHaveCount(1);
```

---

### 1.3 Dashboard - Net vs Gross Display Mode
**File**: `tests/e2e/dashboard/display-modes.spec.ts`

**Test Cases**:
- ✅ Default mode is "Gross" (brutto)
- ✅ Toggle to "Net" mode (netto)
- ✅ All metrics recalculate with Norwegian tax rates
- ✅ Chart Y-axis updates with net values
- ✅ Timeline entries show net amounts
- ✅ Mode persists after reload (localStorage: `salaryDisplayMode`)
- ✅ Tax calculation accuracy for 2024 rates
  - Standard deduction: 16,400 kr
  - Bracket tax (trinnskatt) applied correctly
  - Social security ~8.2%
  - Municipal tax ~22%

**Tax Calculation Validation**:
```typescript
// Example: 650,000 kr gross should calculate to ~460,000 kr net
const testCases = [
  { gross: 650000, expectedNet: 460000, tolerance: 5000 },
  { gross: 500000, expectedNet: 365000, tolerance: 5000 },
  { gross: 800000, expectedNet: 550000, tolerance: 5000 },
];

for (const testCase of testCases) {
  await addSalary(testCase.gross);
  await toggleToNetMode();

  const displayedNet = await getMetricValue('Annual Salary');
  expect(Math.abs(displayedNet - testCase.expectedNet)).toBeLessThan(testCase.tolerance);
}
```

---

### 1.4 Dashboard - Chart Interactions
**File**: `tests/e2e/dashboard/chart-interactions.spec.ts`

**Test Cases**:
- ✅ Chart renders with salary data (blue line)
- ✅ Time range filter: "1Y" shows last year only
- ✅ Time range filter: "3Y" shows last 3 years
- ✅ Time range filter: "ALL" shows all data
- ✅ Inflation baseline displays (green line) when enabled
- ✅ Reference salary displays (amber dashed line) when enabled
- ✅ Chart legend toggles data series visibility
- ✅ Responsive: Desktop chart on large screens
- ✅ Responsive: Mobile chart on small screens
- ✅ Chart updates when new salary added
- ✅ Chart updates when salary edited/deleted

**Viewport Tests**:
```typescript
test.describe('Chart Responsiveness', () => {
  test('Desktop chart at 1920x1080', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('[data-testid="desktop-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-chart"]')).not.toBeVisible();
  });

  test('Mobile chart at 375x667', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('[data-testid="mobile-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="desktop-chart"]')).not.toBeVisible();
  });
});
```

---

### 1.5 Dashboard - Metrics Calculation Accuracy
**File**: `tests/e2e/dashboard/metrics-calculation.spec.ts`

**Test Cases**:
- ✅ **Annual Salary**: Shows latest year's salary
- ✅ **Real Annual Value**: Inflation-adjusted to baseline year
- ✅ **vs. Inflation %**: (salary growth - inflation rate)
- ✅ **Yearly Change %**: Year-over-year growth percentage
- ✅ Metrics display correct formatting (e.g., "650 000 kr")
- ✅ Percentage metrics show + or - sign
- ✅ Color coding: Green (positive), Red (negative), Blue (neutral)
- ✅ Metrics update when display mode changes (net/gross)

**Calculation Validation**:
```typescript
// Test data: 2020: 500k, 2021: 520k, 2022: 550k, 2023: 600k
// Assume inflation: 2020-2023 cumulative = 10%

const expectedMetrics = {
  annualSalary: 600000,
  realValue: 545455, // 600k / 1.10
  vsInflation: 10, // ((600/500 - 1) - 0.10) * 100 = 10%
  yearlyChange: 9.09 // (600/550 - 1) * 100
};

await verifyMetric('Annual Salary', '600 000 kr');
await verifyMetric('Real Annual Value', '545 455 kr');
await verifyMetric('vs. Inflation', '+10.0%');
await verifyMetric('Yearly Change', '+9.1%');
```

---

### 1.6 Dashboard - Reference Salary Comparison
**File**: `tests/e2e/dashboard/reference-salary.spec.ts`

**Test Cases**:
- ✅ Reference salary toggle OFF by default
- ✅ Toggle ON shows reference salary selector
- ✅ Select occupation (e.g., "Sykepleiere" - Nurses)
- ✅ SSB data fetches and displays on chart (amber dashed line)
- ✅ Chart shows reference salary values from 2015-2025
- ✅ Reference salary persists after reload
- ✅ Toggle OFF hides reference line from chart
- ✅ Handle SSB API errors gracefully

**API Mocking** (for reliable tests):
```typescript
await page.route('**/api/ssb/salary*', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify({
      years: [2020, 2021, 2022, 2023],
      salaries: [500000, 515000, 530000, 548000]
    })
  });
});
```

---

## Priority 2: Negotiation Feature (High Priority)

### 2.1 Negotiation - Form Filling & Validation
**File**: `tests/e2e/negotiation/form-filling.spec.ts`

**Test Cases**:
- ✅ Navigate to `/negotiation` page
- ✅ Current salary auto-populated from dashboard data
- ✅ Fill job title, industry, desired salary
- ✅ Validation: Required fields highlighted
- ✅ Validation: Desired salary must be numeric
- ✅ Market data context fields (optional)
- ✅ Benefits field accepts multi-line text
- ✅ Form state persists in localStorage (`negotiation_data_*`)
- ✅ Form pre-fills on return visit

---

### 2.2 Negotiation - Argument Builder
**File**: `tests/e2e/negotiation/argument-builder.spec.ts`

**Test Cases**:
- ✅ Add argument with type selection (Experience, Education, etc.)
- ✅ Add up to 10 arguments
- ✅ Argument types: Experience, Education, Performance, Responsibility, Market, Unique Skills, Other
- ✅ Badge shows argument count (e.g., "3 argumenter")
- ✅ Edit existing argument
- ✅ Delete argument
- ✅ Arguments persist in localStorage
- ✅ Arguments display in correct order
- ✅ Empty state shows placeholder text

**Test Data**:
```typescript
const sampleArguments = [
  { type: 'Experience', text: '5 years as senior developer' },
  { type: 'Education', text: 'Master's degree in Computer Science' },
  { type: 'Performance', text: 'Delivered 3 major projects on time' }
];
```

---

### 2.3 Negotiation - AI Generation
**File**: `tests/e2e/negotiation/ai-generation.spec.ts`

**Test Cases**:
- ✅ Generate Email button triggers AI generation
- ✅ Loading spinner shows during generation
- ✅ Email content displays in markdown format
- ✅ Email is 200-300 words (validate length)
- ✅ Generate Playbook button works
- ✅ Playbook is 800-1200 words
- ✅ Generation limit: 3 emails per session
- ✅ Generation limit: 3 playbooks per session
- ✅ Limit badge updates after each generation
- ✅ Disable button when limit reached
- ✅ Generated content persists in localStorage
- ✅ SSB tools integration (AI fetches market data)

**API Mocking for Reliable Tests**:
```typescript
await page.route('**/api/generate/email', async route => {
  await route.fulfill({
    status: 200,
    contentType: 'text/plain',
    body: 'Mock negotiation email content...'
  });
});
```

**Without Mocking** (integration test):
```typescript
test('AI generates realistic email', async ({ page }) => {
  await fillNegotiationForm({
    jobTitle: 'Senior Software Developer',
    currentSalary: 650000,
    desiredSalary: 750000
  });

  await page.click('[data-testid="generate-email-button"]');
  await expect(page.locator('[data-testid="spinner"]')).toBeVisible();

  // Wait for generation (max 30s)
  await expect(page.locator('[data-testid="generated-email"]')).toBeVisible({ timeout: 30000 });

  const emailContent = await page.textContent('[data-testid="generated-email"]');

  // Validate content
  expect(emailContent).toBeTruthy();
  expect(emailContent.split(' ').length).toBeGreaterThan(150); // ~200-300 words
  expect(emailContent).toContain('kr'); // Should mention salary
});
```

---

### 2.4 Negotiation - Export Features
**File**: `tests/e2e/negotiation/export-features.spec.ts`

**Test Cases**:
- ✅ Copy as Rich Text button copies to clipboard (for Word/Outlook)
- ✅ Download as DOCX button downloads file
- ✅ DOCX file is valid and contains correct content
- ✅ Copy Markdown button copies markdown source
- ✅ Copy Prompt button copies full AI prompt
- ✅ Buttons disabled when no content generated
- ✅ Success feedback after copy/download

**Download Verification**:
```typescript
test('Download DOCX file', async ({ page }) => {
  // Generate content first
  await generateEmail();

  // Set up download listener
  const downloadPromise = page.waitForEvent('download');
  await page.click('[data-testid="download-docx-button"]');

  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/negotiation.*\.docx$/);

  // Verify file size is reasonable
  const path = await download.path();
  const stats = await fs.stat(path);
  expect(stats.size).toBeGreaterThan(1000); // At least 1KB
});
```

---

## Priority 3: Mobile Experience (Medium Priority)

### 3.1 Mobile - Responsive Layout
**File**: `tests/e2e/mobile/responsive-layout.spec.ts`

**Test Cases**:
- ✅ Mobile viewport (375x667): Bottom navigation visible
- ✅ Mobile viewport: Desktop sidebar hidden
- ✅ Mobile viewport: Chart switches to mobile version
- ✅ Mobile viewport: Metric grid stacks vertically
- ✅ Tablet viewport (768x1024): Hybrid layout
- ✅ Desktop viewport (1920x1080): Desktop layout
- ✅ Touch interactions work on mobile

**Devices to Test**:
```typescript
const devices = [
  { name: 'iPhone 12', width: 390, height: 844 },
  { name: 'Samsung Galaxy S21', width: 360, height: 800 },
  { name: 'iPad', width: 768, height: 1024 },
  { name: 'Desktop', width: 1920, height: 1080 }
];
```

---

### 3.2 Mobile - Bottom Navigation
**File**: `tests/e2e/mobile/bottom-navigation.spec.ts`

**Test Cases**:
- ✅ Bottom nav shows on mobile viewports only
- ✅ Navigate to Dashboard tab
- ✅ Navigate to Negotiation tab
- ✅ Active tab highlighted
- ✅ FAB (Floating Action Button) visible
- ✅ FAB opens salary entry drawer
- ✅ Tab state persists in localStorage (`salary-last-tab`)

---

### 3.3 Mobile - Drawer Interactions
**File**: `tests/e2e/mobile/drawer-interactions.spec.ts`

**Test Cases**:
- ✅ FAB click opens bottom drawer
- ✅ Drawer slides up animation
- ✅ Drawer contains salary entry form
- ✅ Fill form and submit from drawer
- ✅ Drawer closes after submission
- ✅ Close drawer by tapping overlay
- ✅ Close drawer by swipe down gesture
- ✅ Drawer state managed by context

---

## Priority 4: Data Persistence & State (Medium Priority)

### 4.1 localStorage Management
**File**: `tests/e2e/data-persistence/localstorage.spec.ts`

**Test Cases**:
- ✅ `salary-calculator-points` - Salary data array persists
- ✅ `salaryDisplayMode` - Net/Gross mode persists
- ✅ `salaryReferenceEnabled` - Reference toggle persists
- ✅ `salary-onboarding-v1` - Onboarding flag persists
- ✅ `negotiation_data_points` - Arguments persist
- ✅ `negotiation_data_email` - Generated email persists
- ✅ `negotiation_data_playbook` - Generated playbook persists
- ✅ `salary-last-tab` - Last active tab persists
- ✅ Data survives page reload
- ✅ Data survives browser tab close/reopen
- ✅ Multiple tabs sync data (test in multi-tab scenario)

---

### 4.2 Data Reset & Clearing
**File**: `tests/e2e/data-persistence/data-reset.spec.ts`

**Test Cases**:
- ✅ "Reset All Data" button shows confirmation dialog
- ✅ Confirm reset clears all salary data
- ✅ Confirm reset clears all localStorage keys
- ✅ Confirm reset returns to onboarding screen
- ✅ Cancel reset keeps data intact
- ✅ Demo data can be re-added after reset
- ✅ Individual entry delete doesn't affect other entries

---

## Priority 5: Accessibility & Internationalization

### 5.1 Accessibility
**File**: `tests/e2e/accessibility/a11y.spec.ts`

**Test Cases**:
- ✅ All interactive elements keyboard navigable
- ✅ Focus indicators visible
- ✅ ARIA labels on buttons and form fields
- ✅ Form validation errors announced
- ✅ Color contrast ratios meet WCAG AA
- ✅ Screen reader compatibility (basic)
- ✅ Chart has text alternative

**Tools**: Use `@axe-core/playwright` for automated a11y testing

---

### 5.2 Norwegian Localization
**File**: `tests/e2e/i18n/norwegian.spec.ts`

**Test Cases**:
- ✅ All UI text in Norwegian (Bokmål)
- ✅ Number formatting: "650 000 kr" (spaces, not commas)
- ✅ Date formatting: Norwegian conventions
- ✅ Currency symbol: "kr" (Norwegian krone)
- ✅ Error messages in Norwegian
- ✅ AI-generated content in Norwegian
- ✅ Form labels and placeholders in Norwegian

---

## Test Configuration

### Playwright Config (`playwright.config.ts`)

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }]
  ],

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Desktop browsers
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile devices
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablet
    {
      name: 'iPad',
      use: { ...devices['iPad (gen 7)'] },
    },
  ],

  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## Test Data & Fixtures

### Shared Test Data
**File**: `tests/fixtures/salary-data.json`

```json
{
  "demoData": [
    { "year": 2020, "pay": 500000 },
    { "year": 2021, "pay": 520000 },
    { "year": 2022, "pay": 550000 },
    { "year": 2023, "pay": 600000 },
    { "year": 2024, "pay": 650000 }
  ],
  "singleEntry": [
    { "year": 2024, "pay": 700000 }
  ],
  "invalidEntries": [
    { "year": 1999, "pay": 500000, "error": "Year too old" },
    { "year": 2030, "pay": 500000, "error": "Year too far future" },
    { "year": 2024, "pay": -10000, "error": "Negative salary" }
  ]
}
```

### Page Object Model
**File**: `tests/helpers/page-objects.ts`

```typescript
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly yearInput: Locator;
  readonly payInput: Locator;
  readonly addButton: Locator;
  readonly netGrossToggle: Locator;
  readonly referenceToggle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.yearInput = page.locator('[data-testid="year-input"]');
    this.payInput = page.locator('[data-testid="pay-input"]');
    this.addButton = page.locator('[data-testid="add-salary-button"]');
    this.netGrossToggle = page.locator('[data-testid="display-mode-toggle"]');
    this.referenceToggle = page.locator('[data-testid="reference-toggle"]');
  }

  async addSalary(year: number, pay: number) {
    await this.yearInput.fill(year.toString());
    await this.payInput.fill(pay.toString());
    await this.addButton.click();
  }

  async toggleToNetMode() {
    await this.netGrossToggle.click();
  }

  async getMetricValue(metricName: string): Promise<string> {
    const metric = this.page.locator(`[data-testid="metric-${metricName}"]`);
    return await metric.textContent();
  }
}

export class NegotiationPage {
  readonly page: Page;
  readonly jobTitleInput: Locator;
  readonly currentSalaryInput: Locator;
  readonly desiredSalaryInput: Locator;
  readonly generateEmailButton: Locator;
  readonly generatePlaybookButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.jobTitleInput = page.locator('[data-testid="job-title-input"]');
    this.currentSalaryInput = page.locator('[data-testid="current-salary-input"]');
    this.desiredSalaryInput = page.locator('[data-testid="desired-salary-input"]');
    this.generateEmailButton = page.locator('[data-testid="generate-email-button"]');
    this.generatePlaybookButton = page.locator('[data-testid="generate-playbook-button"]');
  }

  async fillForm(data: { jobTitle: string, currentSalary: number, desiredSalary: number }) {
    await this.jobTitleInput.fill(data.jobTitle);
    await this.currentSalaryInput.fill(data.currentSalary.toString());
    await this.desiredSalaryInput.fill(data.desiredSalary.toString());
  }

  async generateEmail() {
    await this.generateEmailButton.click();
  }
}
```

---

## CI/CD Integration

### GitHub Actions Workflow
**File**: `.github/workflows/playwright.yml`

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Install Playwright Browsers
        run: bunx playwright install --with-deps

      - name: Run Playwright tests
        run: bunx playwright test

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30

      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: test-results
          path: test-results/
          retention-days: 30
```

---

## Testing Strategy

### Test Pyramid Approach
```
         /\
        /E2E\          ← Playwright (20 test files, ~150 tests)
       /------\
      /Integration\   ← Future: API route testing
     /------------\
    /  Unit Tests  \  ← Future: Hook/utility testing
   /----------------\
```

**Playwright Focus**: User-facing flows, critical business logic, visual validation

---

## Estimated Test Coverage

| Category | Test Files | Estimated Tests | Priority |
|----------|-----------|-----------------|----------|
| Dashboard | 5 | 40 | P1 - Critical |
| Negotiation | 4 | 30 | P1 - Critical |
| Mobile | 3 | 20 | P2 - High |
| Data Persistence | 2 | 15 | P2 - High |
| Accessibility | 2 | 10 | P3 - Medium |
| **Total** | **16** | **~115** | |

---

## Success Criteria

✅ **Coverage Goals**:
- All critical user flows tested
- 90%+ of UI interactions covered
- All calculation logic validated
- Mobile + desktop responsive tests
- Data persistence verified

✅ **Quality Goals**:
- Tests run in < 10 minutes locally
- Tests run in < 15 minutes in CI
- 95%+ test stability (no flaky tests)
- Clear test failure messages

✅ **CI/CD Integration**:
- Tests run on every PR
- Block merge on test failures
- Generate HTML reports
- Capture screenshots/videos on failure

---

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Set up Playwright config
- Create page object models
- Implement onboarding tests
- Implement salary management tests

### Phase 2: Core Features (Week 2)
- Chart interaction tests
- Metrics calculation tests
- Display mode tests
- Reference salary tests

### Phase 3: Negotiation (Week 3)
- Form validation tests
- Argument builder tests
- AI generation tests (with mocking)
- Export feature tests

### Phase 4: Mobile & Polish (Week 4)
- Responsive layout tests
- Mobile navigation tests
- Drawer interaction tests
- Accessibility tests

### Phase 5: CI/CD & Documentation (Week 5)
- GitHub Actions workflow
- Test documentation
- Best practices guide
- Team training

---

## Next Steps

1. **Install Playwright**: `bun add -d @playwright/test`
2. **Initialize config**: `bunx playwright install`
3. **Add test:e2e script**: Update `package.json`
4. **Create first test**: `tests/e2e/dashboard/onboarding.spec.ts`
5. **Run tests**: `bunx playwright test`
6. **Review report**: `bunx playwright show-report`

---

## Additional Considerations

### Mocking vs Integration
- **Mock APIs** for fast, reliable tests (inflation, SSB data)
- **Integration tests** for AI generation (verify real behavior)
- Use `page.route()` for selective mocking

### Flaky Test Prevention
- Use `waitFor` assertions with explicit timeouts
- Avoid hardcoded `wait(ms)` - use element visibility
- Retry on network failures only
- Clear localStorage between tests

### Performance
- Run tests in parallel (workers)
- Use fixtures for common setup
- Share browser contexts when safe
- Skip unnecessary navigation

### Maintenance
- Use data-testid for stable selectors
- Centralize test data in fixtures
- Page Object Model for reusability
- Document complex test logic

---

**Document Version**: 1.0
**Last Updated**: 2025-12-13
**Author**: Claude (Playwright Test Planning Agent)
