# StatusBanner Component

## Overview

The StatusBanner displays a prominent, color-coded banner at the top of the dashboard that immediately communicates whether the user's purchasing power is improving or declining, adjusted for inflation.

## Purchasing Power Calculation

### How It Works

The banner uses `statistics.gapPercent` which is calculated as:

```typescript
gapPercent = ((latestPay - inflationAdjustedPay) / inflationAdjustedPay) × 100
```

Where:

- **latestPay**: User's current/latest salary
- **inflationAdjustedPay**: What the starting salary would be worth today if it only grew with cumulative inflation

### Example Calculation

```
Starting Year (2020): 400,000 NOK
Current Year (2024):  500,000 NOK
Cumulative Inflation: 21.2% (factor: 1.212)

inflationAdjustedPay = 400,000 × 1.212 = 484,800 NOK
gapPercent = ((500,000 - 484,800) / 484,800) × 100 = 3.1%
```

**Interpretation**:

- Salary grew 25% (400k → 500k)
- Inflation was 21.2%
- Real purchasing power gain is **3.1%** (shows as "Small Win")

## Banner States

| Gap % Range | State            | Background             | Message                           |
| ----------- | ---------------- | ---------------------- | --------------------------------- |
| ≥ 5%        | **Strong Win**   | Dark Green (#1F7A4D)   | "Du ligger foran inflasjonen"     |
| 1% to 5%    | **Small Win**    | Yellow-Green (#E6F0C9) | "Du er så vidt foran – foreløpig" |
| -3% to 1%   | **Losing**       | Orange (#F4A261)       | "Du taper kjøpekraft"             |
| < -3%       | **Losing Badly** | Dark Red (#8B1E1E)     | "Kjøpekraften din faller"         |

## Real-World Scenarios

### Strong Win (≥ 5%)

- Salary: 400k → 520k (+30%)
- Inflation: ~21%
- Result: +8.3% purchasing power ✅

### Small Win (1-5%)

- Salary: 400k → 495k (+23.8%)
- Inflation: ~21%
- Result: +2.1% purchasing power ⚠️

### Losing (-3% to 1%)

- Salary: 400k → 485k (+21.3%)
- Inflation: ~21%
- Result: -0.4% purchasing power ⚠️

### Losing Badly (< -3%)

- Salary: 400k → 450k (+12.5%)
- Inflation: ~21%
- Result: -7.1% purchasing power 🔥

### No Growth

- Salary: 400k → 400k (0%)
- Inflation: ~21%
- Result: -17.5% purchasing power 🔥

## Component Props

```typescript
interface StatusBannerProps {
  statistics: SalaryStatistics // Contains gapPercent and other metrics
  onCtaClick?: () => void // Optional handler for CTA button
}
```

## Features

- **Dynamic State Detection**: Automatically determines state based on gapPercent
- **Micro-indicator**: Shows exact percentage in top-right corner with +/- sign
- **Norwegian Copy**: User-tested messaging optimized for clarity and motivation
- **Responsive Design**: Mobile-first, works on all screen sizes
- **Material Icons**: Uses material-symbols-outlined for consistent iconography
- **Test Coverage**: 18 tests covering all states, edge cases, and real inflation scenarios

## Usage

```tsx
import StatusBanner from '@/components/dashboard/StatusBanner'

;<StatusBanner
  statistics={statistics}
  onCtaClick={() => {
    // Optional: Handle CTA click
    // Navigate to negotiation page, open modal, etc.
  }}
/>
```

## Integration

The banner is integrated into both:

- `DashboardMobile.tsx`: Below demo banner, above metrics summary
- `DashboardDesktop.tsx`: Below demo banner, above metrics grid

Only displayed when `hasData` is true (user has salary data points).

## Testing

```bash
# Run all StatusBanner tests
bun test tests/components/dashboard/StatusBanner

# Unit tests (12 tests)
bun test tests/components/dashboard/StatusBanner.test.tsx

# Integration tests with real calculations (6 tests)
bun test tests/components/dashboard/StatusBanner.integration.test.tsx
```
