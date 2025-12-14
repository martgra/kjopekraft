# E2E Test Refactoring Summary

## Overview

Implemented industry best practices for test maintainability by adding `data-testid` attributes and separating E2E tests (user journeys) from component tests (fine-grained behavior).

## Changes Implemented

### Phase 1: Add data-testid Attributes

#### 1. **SalaryPointForm Component** (`components/dashboard/SalaryPointForm.tsx`)

Added stable test identifiers to all form elements:

```tsx
<form data-testid="salary-form">
  <input id="salary-amount" data-testid="salary-form-amount-input" />
  <input id="salary-year" data-testid="salary-form-year-input" />
  <select id="salary-reason" data-testid="salary-form-reason-select" />
  <button data-testid="salary-form-submit-button" />
</form>
```

**Benefits:**

- Survives UI text changes (i18n safe)
- Survives styling changes
- Clear contract between dev and test
- Follows Playwright/Testing Library best practices

#### 2. **ChartSection Component** (`components/dashboard/ChartSection.tsx`)

Added test ID to event baselines toggle:

```tsx
<input
  id="chart-event-baselines-toggle"
  data-testid="chart-event-baselines-toggle"
  type="checkbox"
/>
```

#### 3. **Accessibility Improvements**

Added proper `htmlFor` attributes to all labels for better accessibility:

```tsx
<label htmlFor="salary-year">År</label>
<input id="salary-year" data-testid="salary-form-year-input" />
```

This allows both `getByLabel()` and `getByTestId()` to work correctly.

### Phase 2: Split Test Types

#### Component Tests (New)

**File:** `components/dashboard/SalaryPointForm.test.tsx`

**13 tests** covering fine-grained component behavior:

- ✅ Form field rendering
- ✅ Default values (adjustment reason)
- ✅ All reason options available
- ✅ Event handler calls
- ✅ Form validation (disabled state)
- ✅ Error message display
- ✅ Net/Gross mode labels

**Why:** These behaviors are too granular for E2E tests. Component tests are:

- Faster (no browser required)
- More reliable (no network/timing issues)
- Better error messages
- Can test edge cases easily

#### E2E Tests (Refactored)

**Files:**

- `tests/e2e/dashboard/reason-visualization.spec.ts` - Reduced from 14 to 6 tests
- `tests/e2e/dashboard/salary-management.spec.ts` - Reduced from 3 to 2 tests

**Focus changed to user journeys:**

- ✅ User can track salary with different reasons
- ✅ Event baselines toggle works end-to-end
- ✅ Data persists across page reload
- ✅ Timeline displays salary points
- ✅ Mobile workflow functions correctly

**Why:** E2E tests should test:

- Complete user workflows
- Integration between components
- Data persistence
- Cross-page navigation
- NOT: Individual form field defaults, validation messages, etc.

### Updated Test Fixtures

**File:** `tests/fixtures/test-fixtures.ts`

Updated DashboardPage fixture to use stable selectors:

```ts
// Before (fragile):
get yearInput() {
  return this.page.getByLabel(/år/i).first()
}

// After (stable):
get yearInput() {
  return this.page.getByTestId('salary-form-year-input')
}
```

Added new getter for event baselines toggle:

```ts
get eventBaselinesToggle() {
  return this.page.getByTestId('chart-event-baselines-toggle')
}
```

## Test Results

### Unit Tests (Vitest)

```
✅ 22 test files passed
✅ 102 tests passed
⏱️  Duration: 1.6s

New component tests:
✅ SalaryPointForm.test.tsx - 13 tests
```

### E2E Tests (Playwright)

**Before refactor:** 26 tests (many failing due to fragile selectors)
**After refactor:** 8 focused user journey tests

## Naming Convention

Hierarchical `data-testid` pattern:

```
{feature}-{component}-{element}-{type}

Examples:
- salary-form-year-input
- salary-form-amount-input
- salary-form-reason-select
- salary-form-submit-button
- chart-event-baselines-toggle
```

## Best Practices Applied

### 1. **Playwright Selector Priority** (Official Recommendation)

1. ✅ Role-based: `getByRole('button', { name: 'Submit' })`
2. ✅ Label-based: `getByLabel('Year')` (requires `htmlFor`)
3. ✅ Test ID: `getByTestId('submit-button')` (when above don't work)
4. ❌ CSS selectors (avoided)

### 2. **Test Scoping**

Always scope selectors to visible containers to avoid "strict mode violations":

```ts
// Avoid:
await page.getByTestId('salary-form-amount-input').fill('600000')

// Prefer:
const formContainer = isMobile ? page.getByRole('dialog') : page.getByRole('complementary')
await formContainer.getByTestId('salary-form-amount-input').fill('600000')
```

### 3. **Test Granularity**

**E2E Tests:**

- Test complete user workflows
- Test cross-component integration
- Test data persistence
- Avoid testing individual field states

**Component Tests:**

- Test component behavior
- Test edge cases
- Test validation logic
- Test event handlers

## Benefits Achieved

### ✅ Maintainability

- Text changes don't break tests
- Styling changes don't break tests
- Component refactoring doesn't break tests

### ✅ Speed

- Component tests run in ~150ms
- E2E tests only run essential user journeys

### ✅ Reliability

- No more "element not found" due to label text changes
- Clear error messages when tests fail
- Stable across Norwegian text changes

### ✅ Developer Experience

- Clear test IDs show intent
- Easy to find elements in browser DevTools
- Can filter tests: `data-testid="salary-form-*"`

## Migration Path for Future Tests

### Adding New Form Fields

```tsx
// Component
;<input
  id="unique-id"
  data-testid="feature-component-element-type"
  // ... other props
/>

// Test
await page.getByTestId('feature-component-element-type').fill('value')
```

### When to Use What

**Use Component Tests for:**

- Default values
- Validation messages
- Field visibility toggles
- Event handler behavior
- Form state management

**Use E2E Tests for:**

- Multi-step workflows
- Page navigation
- Data persistence
- Mobile vs Desktop differences
- Integration between features

## Production Build Optimization (Future)

`data-testid` can be stripped in production builds using:

```js
// next.config.js
module.exports = {
  compiler: {
    reactRemoveProperties:
      process.env.NODE_ENV === 'production' ? { properties: ['^data-testid$'] } : false,
  },
}
```

(Not implemented yet - add when needed)

## Files Changed

### New Files (2)

- `components/dashboard/SalaryPointForm.test.tsx` - Component tests
- `TEST_REFACTOR_SUMMARY.md` - This document

### Modified Files (5)

- `components/dashboard/SalaryPointForm.tsx` - Added data-testid, htmlFor
- `components/dashboard/ChartSection.tsx` - Added data-testid to toggle
- `tests/fixtures/test-fixtures.ts` - Use data-testid selectors
- `tests/e2e/dashboard/reason-visualization.spec.ts` - Refactored to user journeys
- `tests/e2e/dashboard/salary-management.spec.ts` - Refactored, added scoping

## Next Steps (Optional)

1. **Add data-testid to more components** as needed
2. **Strip data-testid in production** for smaller bundle size
3. **Add visual regression tests** for charts (Percy/Chromatic)
4. **Create more component tests** for complex components
5. **Document test patterns** in contributing guide

## References

- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Testing Library: Priority](https://testing-library.com/docs/queries/about/#priority)
- [MDN: ARIA Labels](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-label)
