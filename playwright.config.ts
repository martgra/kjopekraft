import { defineConfig, devices } from '@playwright/test'

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const PLAYWRIGHT_PORT = process.env.PLAYWRIGHT_PORT || '3000'

export default defineConfig({
  testDir: './tests/e2e',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? 'github' : 'list',
  /* Global timeout for tests */
  timeout: 30000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: 'http://localhost:3000',
    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    /* Action timeout */
    actionTimeout: 10000,
  },

  /* Configure projects for Chromium only (desktop + mobile) */
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    // Default to Node for stability; opt into Bun via PLAYWRIGHT_USE_BUN=true
    command:
      process.env.CI || process.env.PLAYWRIGHT_USE_BUN !== 'true' ? 'npm run dev' : 'bun run dev',
    url: `http://localhost:${PLAYWRIGHT_PORT}`,
    env: {
      PORT: PLAYWRIGHT_PORT,
    },
    reuseExistingServer: !process.env.CI,
    timeout: 120000, // 2 minutes to start the server
    stdout: 'ignore',
    stderr: 'pipe',
  },
})
