# E2E Testing with Playwright

## Setup

Playwright is configured to run end-to-end tests for the Next.js application.

### Prerequisites

- Node.js 20+ (installed in devcontainer)
- Bun (for package management and running scripts)
- Playwright browsers (auto-installed via `postCreateCommand.sh`)

### Configuration

- **Config file:** `playwright.config.ts`
- **Test directory:** `tests/e2e/`
- **Browser:** Chromium (default)

## Running Tests

```bash
# Run all E2E tests
bun run test:e2e

# Run tests in UI mode (interactive)
bun run test:e2e:ui

# Run tests in headed mode (see browser)
bun run test:e2e:headed

# Run specific test file
bunx playwright test tests/e2e/hello-world.spec.ts

# Debug a specific test
bun run test:e2e:debug
```

## Viewing Reports

After tests run, view the HTML report:

```bash
npx playwright show-report
```

## Writing Tests

Example test structure:

```typescript
import { test, expect } from '@playwright/test'

test.describe('Feature Name', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/Expected Title/)
  })
})
```

## Dashboard form interactions (desktop + mobile)

- The salary form is rendered twice (desktop sidebar + mobile drawer). Always scope to the visible container to avoid Playwright strict-mode errors.
- Prefer the shared `DashboardPage.addSalaryPoint` helper from `tests/fixtures/test-fixtures.ts` instead of raw selectors. It opens the drawer when needed and uses `data-testid` selectors (`salary-form-*`).
- When asserting chart/timeline on mobile, close the drawer first (`dashboardPage.closeDrawerIfOpen()`) so the backdrop does not intercept clicks.

## DevContainer Setup

The devcontainer automatically:

1. Installs Playwright dependencies (system libraries)
2. Installs Chromium browser via `postCreateCommand.sh`
3. Configures Node.js for Playwright CLI compatibility

If you rebuild the container, Playwright browsers will be reinstalled automatically.

## Troubleshooting

**Tests hang or don't start:**

- Ensure Node.js is installed (`node --version` should show v20.x)
- Verify browsers are installed: `bunx playwright install chromium`

**Dev server won't start:**

- Check if port 3000 is available
- Verify `.env.local` exists with required environment variables

**Browser launch failures:**

- Ensure all Playwright dependencies are installed
- Run: `bunx playwright install --with-deps chromium`
