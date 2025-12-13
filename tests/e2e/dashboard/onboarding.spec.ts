import { test, expect } from '@playwright/test';

/**
 * Onboarding Test Suite
 *
 * Tests the first-time user experience including:
 * - Display of onboarding screen on first visit
 * - Demo data loading
 * - Getting started flow
 * - Onboarding dismissal after adding real data
 */

test.describe('Dashboard Onboarding', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to simulate first-time user
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    await page.reload();
  });

  test('should display onboarding screen on first visit', async ({ page }) => {
    // Check for onboarding welcome title
    await expect(page.getByText('Velkommen til Kjøpekraft')).toBeVisible();

    // Check for welcome message
    await expect(
      page.getByText(/Få innsikt i om lønnen din faktisk har blitt bedre/i)
    ).toBeVisible();

    // Check for both action buttons
    await expect(page.getByRole('button', { name: /Prøv med eksempeldata/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Legg til min egen lønn/i })).toBeVisible();
  });

  test('should display feature cards', async ({ page }) => {
    // Check for the three feature cards
    await expect(page.getByText('Spor lønnsutvikling')).toBeVisible();
    await expect(page.getByText('Sammenlign med inflasjon')).toBeVisible();
    await expect(page.getByText('Forhandle smartere')).toBeVisible();

    // Check feature descriptions
    await expect(page.getByText('Se hvordan lønnen din har utviklet seg over tid')).toBeVisible();
    await expect(page.getByText('Forstå din reelle kjøpekraft')).toBeVisible();
    await expect(page.getByText('Få innsikt til lønnsforhandlinger')).toBeVisible();
  });

  test('should load demo data when "Try Demo" button is clicked', async ({ page }) => {
    // Click the demo data button
    await page.getByRole('button', { name: /Prøv med eksempeldata/i }).click();

    // Wait for chart to appear
    await expect(page.locator('canvas')).toBeVisible();

    // Check that metric cards are displayed (should have 4 metrics)
    const metricCards = page.locator('[class*="metric"]').filter({ hasText: 'kr' });
    await expect(metricCards.first()).toBeVisible();

    // Verify that salary data appears in activity timeline
    // Demo data: 2020-2024 (5 entries)
    const timelineItems = page.getByText(/2020|2021|2022|2023|2024/).first();
    await expect(timelineItems).toBeVisible();

    // Verify localStorage contains demo data
    const storedData = await page.evaluate(() => {
      return localStorage.getItem('salary-calculator-points');
    });
    expect(storedData).toBeTruthy();

    const payPoints = JSON.parse(storedData!);
    expect(payPoints).toHaveLength(5);
    expect(payPoints[0]).toEqual({ year: 2020, pay: 550000 });
    expect(payPoints[4]).toEqual({ year: 2024, pay: 680000 });
  });

  test('should open salary entry form when "Get Started" button is clicked on desktop', async ({
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    // Click the "Get Started" button
    await page.getByRole('button', { name: /Legg til min egen lønn/i }).click();

    // On desktop, it should scroll to top where the form is
    // Verify that the salary entry form is visible
    await expect(page.getByText(/Legg til lønnspunkt/i)).toBeVisible();
  });

  test('should open mobile drawer when "Get Started" button is clicked on mobile', async ({
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Click the "Get Started" button
    await page.getByRole('button', { name: /Legg til min egen lønn/i }).click();

    // On mobile, it should open the bottom drawer
    // Wait for drawer to be visible
    await page.waitForTimeout(300); // Wait for animation

    // Check for drawer content (salary form)
    await expect(page.getByText(/Legg til lønnspunkt/i)).toBeVisible();
  });

  test('should dismiss onboarding when user adds first real data point', async ({ page }) => {
    // Load demo data first
    await page.getByRole('button', { name: /Prøv med eksempeldata/i }).click();

    // Wait for demo data to load
    await expect(page.locator('canvas')).toBeVisible();

    // Add a new salary entry (real data)
    const currentYear = new Date().getFullYear();

    // Find and fill the salary form
    await page.fill('input[type="number"][placeholder*="2023"]', currentYear.toString());
    await page.fill('input[type="number"][placeholder*="550"]', '700000');

    // Click add button
    await page.getByRole('button', { name: /Legg til punkt/i }).click();

    // Wait for the data to be added
    await page.waitForTimeout(500);

    // Reload the page
    await page.reload();

    // Onboarding should not show anymore
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible();

    // Dashboard content should be visible instead
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('should not show onboarding on subsequent visits', async ({ page }) => {
    // Set the onboarding flag manually
    await page.evaluate(() => {
      localStorage.setItem('salary-onboarding-v1', 'true');
    });

    await page.reload();

    // Onboarding should not be visible
    await expect(page.getByText('Velkommen til Kjøpekraft')).not.toBeVisible();
  });

  test('should set onboarding flag in localStorage when demo data is loaded', async ({ page }) => {
    // Click demo button
    await page.getByRole('button', { name: /Prøv med eksempeldata/i }).click();

    // Wait for data to load
    await page.waitForTimeout(500);

    // Check localStorage flag
    const onboardingFlag = await page.evaluate(() => {
      return localStorage.getItem('salary-onboarding-v1');
    });

    expect(onboardingFlag).toBe('true');
  });

  test('should show info box on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();

    // Check for the info box with "Hva er kjøpekraft?" title
    await expect(page.getByText('Hva er kjøpekraft?')).toBeVisible();

    // Check for explanation text
    await expect(
      page.getByText(/Kjøpekraft viser hva lønnen din faktisk er verdt/i)
    ).toBeVisible();
  });

  test('should hide info box on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();

    // Info box should not be visible on mobile
    await expect(page.getByText('Hva er kjøpekraft?')).not.toBeVisible();
  });

  test('should display correct demo data values', async ({ page }) => {
    // Click demo button
    await page.getByRole('button', { name: /Prøv med eksempeldata/i }).click();

    // Wait for data to load
    await expect(page.locator('canvas')).toBeVisible();

    // Verify the stored data matches expected demo data
    const storedData = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('salary-calculator-points') || '[]');
    });

    // Expected demo data based on DEMO_PAY_POINTS
    const expectedData = [
      { year: 2020, pay: 550000 },
      { year: 2021, pay: 580000 },
      { year: 2022, pay: 600000 },
      { year: 2023, pay: 650000 },
      { year: 2024, pay: 680000 },
    ];

    expect(storedData).toEqual(expectedData);
  });

  test('should show emoji logo with gradient background', async ({ page }) => {
    // Check for the money emoji
    const emoji = page.locator('[role="img"][aria-label="Money with wings"]');
    await expect(emoji).toBeVisible();
    await expect(emoji).toHaveText('💸');
  });

  test('should have accessible button labels', async ({ page }) => {
    // Both buttons should be accessible
    const demoButton = page.getByRole('button', { name: /Prøv med eksempeldata/i });
    const getStartedButton = page.getByRole('button', { name: /Legg til min egen lønn/i });

    await expect(demoButton).toBeEnabled();
    await expect(getStartedButton).toBeEnabled();
  });
});
