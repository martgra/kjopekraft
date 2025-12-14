# Event Baseline Calculation Fixes

This document explains the two critical fixes applied to the event baseline calculation logic.

---

## Issue 1: Duplicate Baseline Lines

### Problem

When the earliest pay point was a promotion or newJob, the system would create **two overlapping inflation baselines**:

1. The main inflation baseline (always starts from the earliest point)
2. An event-specific baseline for that same earliest point

This resulted in duplicate, identical lines on the chart.

### Example of the Problem

```typescript
Pay Points:
- 2020: 500,000 kr (newJob)  ← Earliest point
- 2022: 600,000 kr (promotion)

Before Fix:
✗ Main inflation baseline from 2020
✗ Event baseline for 2020 newJob (duplicate!)
✓ Event baseline for 2022 promotion

Result: Two identical lines from 2020
```

### Solution

Exclude the earliest pay point from event baseline generation, since it's already covered by the main inflation baseline.

```typescript
// In calculateEventBaselines()
const earliestYear = Math.min(...payPoints.map(p => p.year))

const eventPoints = payPoints.filter(
  p => (p.reason === 'promotion' || p.reason === 'newJob') && p.year !== earliestYear, // ← Exclude earliest
)
```

### After Fix

```typescript
Pay Points:
- 2020: 500,000 kr (newJob)  ← Earliest point
- 2022: 600,000 kr (promotion)

After Fix:
✓ Main inflation baseline from 2020 (covers the starting point)
✓ Event baseline for 2022 promotion only

Result: No duplicate lines!
```

---

## Issue 2: Inflation Calculation Accuracy

### Problem (Clarification)

This was actually already correct, but needed verification. The concern was whether event baselines use inflation rates from the event year onwards, or incorrectly from the earliest year.

### Verification

The `buildInflationIndex` function **already correctly** uses inflation from the event year onwards:

```typescript
export function buildInflationIndex(
  inflation: InflationDataPoint[],
  baseYear: number, // ← Event year
  endYear: number,
): Map<number, number> {
  const rateMap = new Map<number, number>(inflation.map(d => [d.year, d.inflation / 100]))

  let idx = 1
  indexMap.set(baseYear, idx) // Start at event year

  for (let y = baseYear + 1; y <= endYear; y++) {
    const r = rateMap.get(y) ?? 0 // ← Use rate from year y
    idx *= 1 + r
    indexMap.set(y, idx)
  }

  return indexMap
}
```

### Example

```typescript
Scenario:
- 2020: First point (adjustment) 400,000 kr
- 2022: Promotion 600,000 kr
- Inflation: 2020: 2%, 2021: 3%, 2022: 5%, 2023: 4%, 2024: 3%

Event Baseline Calculation for 2022 Promotion:
✓ 2022: 600,000 × 1.00 = 600,000 kr (base year)
✓ 2023: 600,000 × 1.04 = 624,000 kr (uses 2023's 4% rate)
✓ 2024: 600,000 × 1.04 × 1.03 = 642,720 kr (uses 2023's 4% and 2024's 3%)

Correctly ignores 2020 (2%) and 2021 (3%) inflation rates!
```

### Why This Matters

This ensures event baselines show accurate "what if you kept that salary and it only adjusted for inflation from that point forward" scenarios, rather than incorrectly compounding inflation from years before the event occurred.

---

## Test Coverage

### New Tests Added

18 total tests for event baselines (up from 15), including:

**Duplicate Prevention:**

- ✅ Excludes earliest point even if promotion
- ✅ Excludes earliest point even if newJob
- ✅ Returns empty array if only earliest point is an event
- ✅ Creates baselines only for non-earliest events

**Inflation Accuracy:**

- ✅ Applies inflation correctly from event start year
- ✅ Verified inflation uses rates from event year onwards
- ✅ Multiple scenarios with different event years

**Edge Cases:**

- ✅ Handles events in same year independently
- ✅ Maintains chronological order (excluding earliest)
- ✅ Works correctly with net/gross mode

---

## Visual Examples

### Before Fix - Duplicate Lines

```
Chart with pay points: [2020 newJob, 2022 promotion]

Salary (kr)
    │
700k│                              ●
    │                            /
600k│            ●─────────────●
    │          /║            /
500k│● ═══════╬═══════════/
    │║        ║
    │║        ║          Legend:
    │║        ║          ─── Actual Salary
    ├╬────────╬──────────────── Year
   2020     2022          ═══ Main Inflation Baseline
                          ║║║ Event Baseline (2020 newJob) ← DUPLICATE!
                          ─ ─ Event Baseline (2022 promotion)
```

### After Fix - No Duplicates

```
Chart with pay points: [2020 newJob, 2022 promotion]

Salary (kr)
    │
700k│                              ●
    │                            /
600k│            ●─────────────●
    │          / ─ ─ ─ ─ ─ ─ /
500k│● ═══════════════════/
    │
    │                      Legend:
    │                      ─── Actual Salary
    ├──────────────────────────── Year
   2020     2022          ═══ Main Inflation Baseline (from 2020)
                          ─ ─ Event Baseline (2022 promotion only)
```

---

## Implementation Files Changed

### 1. `/workspace/features/visualization/utils/eventBaselines.ts`

**Changes:**

- Added earliest year detection
- Filter excludes `year === earliestYear`
- Added documentation comments explaining the logic

### 2. `/workspace/features/visualization/utils/eventBaselines.test.ts`

**Changes:**

- Rewrote 18 comprehensive tests
- Added 3 new tests specifically for earliest point exclusion
- Updated assertions to match new behavior
- Added test for "only earliest point is event" scenario

### 3. `/workspace/TEST_COVERAGE.md`

**Changes:**

- Updated test counts (18 tests, 47 assertions)
- Added "Important Implementation Details" section
- Documented the two key fixes

---

## Verification

All tests pass successfully:

```bash
$ bun test eventBaselines
✓ 18 pass
✓ 0 fail
✓ 47 expect() calls
✓ Ran 18 tests across 1 file. [80.00ms]

$ bun run build
✓ Compiled successfully in 8.2s
✓ No TypeScript errors
```

---

## Summary

✅ **Issue 1 Fixed:** No more duplicate baseline lines when earliest point is a promotion/newJob
✅ **Issue 2 Verified:** Inflation calculation already uses correct years (event year onwards)
✅ **18 comprehensive tests** ensure correctness
✅ **Full backward compatibility** maintained
✅ **Production ready** with all tests passing

The event baseline feature now correctly shows inflation projections from significant salary events without creating redundant visualizations, and uses accurate inflation rates for each projection period.
