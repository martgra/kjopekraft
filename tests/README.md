# Playwright E2E Tests

This directory contains end-to-end tests for Kjøpekraft using Playwright.

## Installation

Playwright is not included in the main dependencies. Install it separately:

```bash
# Install Playwright
bun add -d @playwright/test

# Install browsers (one-time setup)
bunx playwright install chromium

# Or install all browsers
bunx playwright install
```

## Running Tests

```bash
# Run all tests
bun run test:e2e

# Run tests in UI mode (interactive)
bun run test:e2e:ui

# Run tests in headed mode (watch browser)
bun run test:e2e:headed

# Run tests in debug mode
bun run test:e2e:debug

# View HTML report
bun run test:e2e:report
```

## Test Structure

```
tests/
├── e2e/
│   └── dashboard/
│       └── onboarding.spec.ts    # First-time user experience tests
├── fixtures/                      # Test data (to be added)
└── helpers/                       # Test utilities (to be added)
```

## Current Test Coverage

### Dashboard Onboarding (`onboarding.spec.ts`)
- ✅ Display onboarding screen on first visit
- ✅ Show feature cards with Norwegian text
- ✅ Load demo data (2020-2024 salary points)
- ✅ Open salary entry form (desktop/mobile)
- ✅ Dismiss onboarding after adding real data
- ✅ Persist onboarding state in localStorage
- ✅ Responsive behavior testing
- ✅ Accessibility checks

**Total: 14 test cases**

## Configuration

See `playwright.config.ts` for configuration details including:
- Multi-browser support (Chromium, Firefox, WebKit)
- Mobile device testing (iPhone, Pixel, iPad)
- Automatic dev server startup
- Screenshot/video capture on failure

## Adding New Tests

See `docs/playwright-test-plan.md` for the complete testing roadmap and guidelines.
