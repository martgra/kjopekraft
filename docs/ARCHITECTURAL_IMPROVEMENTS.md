# Architectural Improvements for Next.js Application

**Date**: December 13, 2025  
**Status**: Recommendations

## Executive Summary

Your application has grown well but shows common patterns that can cause scaling issues in Next.js applications. The main areas needing improvement are:

1. **Data Layer Separation** - Mixed server/client data fetching
2. **Feature Coupling** - Features importing from each other
3. **Shared Logic Organization** - Business logic scattered across features
4. **API Layer Consistency** - Inconsistent patterns for data access
5. **Type Safety** - Duplicate type definitions across layers

## Current Architecture Analysis

### Strengths ✅

- **Feature-based organization**: Good separation of concerns at high level
- **Atomic design for UI**: Clear component hierarchy
- **Server-first approach**: Using RSC effectively for initial data
- **Type safety**: TypeScript throughout
- **Caching strategy**: Using Next.js cache directives

### Issues ❌

#### 1. Mixed Data Fetching Patterns

**Problem**: You have 3 different ways to fetch data:

```typescript
// Pattern 1: Server Component direct fetch (good)
export async function getInflationData() {
  'use cache'
  const res = await fetch('https://data.ssb.no/...')
}

// Pattern 2: API Route + Client Hook (unnecessary layer)
// /api/inflation/route.ts -> useInflation() hook
// Why? Server components can fetch directly!

// Pattern 3: API Route for client-side fetch (correct for client)
// /api/ssb/salary -> useReferenceSalary()

// Pattern 4: Query functions wrapping API routes (wrong layer)
// lib/ssb/ssbQueryFunctions.ts calls /api/ssb/salary
// These should be services, not query functions
```

**Impact**:

- Confusion about where to fetch data
- Extra network hops (server → API route → external API)
- Harder to understand data flow

#### 2. Feature Coupling

**Problem**: Features import from each other directly:

```typescript
// features/salary/hooks/useSalaryData.ts
import { adjustSalaries } from '@/features/inflation/inflationCalc'
import { calculateNetIncome } from '@/features/tax/taxCalculator'

// features/visualization/components/PaypointChart.tsx
import { calculateNetIncome } from '@/features/tax/taxCalculator'
import { usePaypointChartData } from '@/features/salary/hooks/usePaypointChartData'
import { OCCUPATIONS } from '@/features/referenceSalary/occupations'
```

**Impact**:

- Features aren't independent
- Can't modify one feature without checking all others
- Testing becomes harder
- Circular dependency risk

#### 3. Business Logic Location

**Problem**: Core business logic lives in feature hooks:

```typescript
// features/salary/hooks/useSalaryData.ts (211 lines!)
// Contains:
// - State management
// - Calculations
// - Persistence
// - Validation
// - Chart data prep
```

**Impact**:

- Hard to test business logic (tied to React)
- Can't reuse calculations outside hooks
- Violates single responsibility principle

#### 4. Type Duplication

**Problem**: Same types defined in multiple places:

```typescript
// lib/models/types.ts
export type PayPoint = { year: number; pay: number }

// app/api/ssb/salary/route.ts
type SalarySeriesPoint = { year: number; value: number | null; ... }

// features/referenceSalary/types.ts
type ReferenceDataPoint = { year: number; value: number }
```

## Recommended Architecture

### 1. Clear Data Layer Separation

```
┌─────────────────────────────────────────────────────┐
│                  Presentation Layer                  │
│  (Server Components, Client Components, Pages)      │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│                  Data Access Layer                   │
│                                                      │
│  Server Side              Client Side               │
│  ┌─────────────┐         ┌──────────────┐          │
│  │  Services   │         │  API Routes  │          │
│  │  (SSR)      │         │  (Client)    │          │
│  └─────────────┘         └──────────────┘          │
│                                                      │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│               Business Logic Layer                   │
│  (Pure functions, calculators, validators)          │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────┴──────────────────────────────────┐
│                   Domain Layer                       │
│              (Types, Constants, Utils)              │
└─────────────────────────────────────────────────────┘
```

### 2. Proposed Directory Structure

```
/workspace
├── app/                          # Next.js App Router (Presentation)
│   ├── (routes)/
│   └── api/                      # Only for CLIENT-side fetching
│       └── ssb/
│           └── salary/
│
├── services/                     # NEW: Server-side data fetching
│   ├── inflation/
│   │   └── inflationService.ts  # Server-side SSB inflation fetch
│   ├── ssb/
│   │   ├── ssbSalaryService.ts  # Server-side SSB salary fetch
│   │   └── ssbTypes.ts          # SSB-specific types
│   └── ai/
│       └── generationService.ts
│
├── domain/                       # NEW: Core business logic (pure functions)
│   ├── salary/
│   │   ├── salaryCalculator.ts  # Pure calculation functions
│   │   ├── salaryValidator.ts   # Validation logic
│   │   └── salaryTypes.ts       # Salary domain types
│   ├── inflation/
│   │   ├── inflationCalculator.ts
│   │   └── inflationTypes.ts
│   ├── tax/
│   │   ├── taxCalculator.ts
│   │   └── taxTypes.ts
│   └── reference/
│       ├── referenceCalculator.ts
│       └── referenceTypes.ts
│
├── features/                     # Feature modules (UI + Hooks)
│   ├── salary/
│   │   ├── components/          # Feature-specific UI
│   │   └── hooks/               # React hooks (state only, delegates to domain)
│   ├── negotiation/
│   └── visualization/
│
├── components/                   # Shared UI components
│   └── ui/
│
├── lib/                         # Shared utilities
│   ├── constants/
│   └── utils/
│
└── contexts/                    # Global state
```

### 3. Data Fetching Guidelines

#### For Server Components (SSR)

```typescript
// ❌ DON'T: Create API route for server-to-server calls
// app/api/inflation/route.ts (DELETE THIS)
export async function GET() {
  const res = await fetch('https://data.ssb.no/...')
}

// ✅ DO: Create service function for direct use
// services/inflation/inflationService.ts
export async function getInflationData() {
  'use cache'
  cacheLife('hours')
  const res = await fetch('https://data.ssb.no/...')
  return parseInflationData(await res.json())
}

// app/page.tsx
import { getInflationData } from '@/services/inflation/inflationService'
async function DashboardWithData() {
  const data = await getInflationData()
  return <Dashboard data={data} />
}
```

#### For Client Components

```typescript
// ✅ KEEP: API routes for client-side fetching
// app/api/ssb/salary/route.ts
export async function GET(req: NextRequest) {
  'use cache'
  // Fetch from SSB
}

// features/referenceSalary/hooks/useReferenceSalary.ts
export function useReferenceSalary() {
  const { data } = useSWR('/api/ssb/salary?...', fetcher)
  return data
}
```

### 4. Business Logic Extraction

#### Before (Mixed Concerns)

```typescript
// features/salary/hooks/useSalaryData.ts
export function useSalaryData(inflationData, currentYear) {
  const [payPoints, setPayPoints] = useState([])

  // Mixing: State, persistence, calculations, validation
  const validatePoint = (point) => { /* validation logic */ }
  const statistics = useMemo(() => computeStatistics(...), [])

  useEffect(() => { /* localStorage */ }, [])

  return { payPoints, statistics, addPoint, ... }
}
```

#### After (Separated Concerns)

```typescript
// domain/salary/salaryValidator.ts (Pure function)
export function validatePayPoint(
  point: PayPoint,
  existingPoints: PayPoint[],
  minYear: number,
  maxYear: number
): ValidationResult {
  if (!point.year || !point.pay) {
    return { isValid: false, error: 'Required fields missing' }
  }
  // ... pure validation logic
  return { isValid: true }
}

// domain/salary/salaryCalculator.ts (Pure function)
export function calculateSalaryStatistics(
  points: PayPoint[],
  inflationData: InflationDataPoint[],
  currentYear: number
): SalaryStatistics {
  // Pure calculation logic
  const adjusted = adjustForInflation(points, inflationData)
  return {
    totalGrowth: calculateGrowth(adjusted),
    averageIncrease: calculateAverage(adjusted),
    // ...
  }
}

// features/salary/hooks/useSalaryData.ts (Hook - state only)
export function useSalaryData(inflationData: InflationDataPoint[], currentYear: number) {
  const [payPoints, setPayPoints] = useState<PayPoint[]>([])

  // Delegate to domain layer
  const statistics = useMemo(
    () => calculateSalaryStatistics(payPoints, inflationData, currentYear),
    [payPoints, inflationData, currentYear]
  )

  const addPoint = (point: PayPoint) => {
    const validation = validatePayPoint(point, payPoints, MIN_YEAR, currentYear)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }
    setPayPoints(prev => [...prev, point])
  }

  return { payPoints, statistics, addPoint, ... }
}
```

### 5. Feature Independence

#### Shared Logic Location

```typescript
// ❌ DON'T: Feature imports from another feature
// features/salary/hooks/useSalaryData.ts
import { calculateNetIncome } from '@/features/tax/taxCalculator'

// ✅ DO: Both import from domain layer
// domain/tax/taxCalculator.ts
export function calculateNetIncome(grossPay: number, year: number): number {
  // Tax calculation logic
}

// features/salary/hooks/useSalaryData.ts
import { calculateNetIncome } from '@/domain/tax/taxCalculator'

// features/visualization/components/PaypointChart.tsx
import { calculateNetIncome } from '@/domain/tax/taxCalculator'
```

#### Feature Communication

```typescript
// ❌ DON'T: Feature calls feature hook directly
import { useSalaryData } from '@/features/salary/hooks/useSalaryData'

// ✅ DO: Pass data via props (parent orchestrates)
// app/page.tsx
function DashboardWithData() {
  return (
    <DashboardLayout>
      <SalaryDashboard onDataChange={(data) => { /* ... */ }} />
      <NegotiationPanel salaryData={data} />
    </DashboardLayout>
  )
}
```

### 6. Type Organization

```typescript
// domain/salary/salaryTypes.ts
export type PayPoint = {
  id?: string
  year: number
  pay: number
}

export type SalaryDataPoint = {
  year: number
  originalPay: number
  adjustedPay: number
  netPay?: number
}

export type SalaryStatistics = {
  totalGrowth: number
  realGrowth: number
  averageIncrease: number
}

// services/ssb/ssbTypes.ts
export type SsbSalaryResponse = {
  source: { provider: 'SSB'; table: string }
  occupation: { code: string; label?: string }
  series: Array<{ year: number; value: number | null }>
}

// domain/reference/referenceTypes.ts
export type ReferenceDataPoint = {
  year: number
  value: number
  type: 'official' | 'estimated'
}
```

## Migration Plan

### Phase 1: Create Foundation (No Breaking Changes)

1. **Create new directories**

   ```bash
   mkdir -p services/{inflation,ssb,ai}
   mkdir -p domain/{salary,inflation,tax,reference}
   ```

2. **Extract pure business logic**
   - Move calculation functions from hooks to `domain/`
   - Keep existing hooks working (they import from new location)
   - Add tests for domain functions

3. **Create service layer**
   - Extract SSB data fetching to `services/ssb/`
   - Create reusable service functions
   - Keep API routes for now (backward compatibility)

### Phase 2: Refactor Features (Controlled Breaking)

4. **Refactor salary feature**
   - Split `useSalaryData` hook (state vs logic)
   - Update imports to use domain layer
   - Test thoroughly

5. **Refactor other features similarly**
   - One feature at a time
   - Update imports progressively

### Phase 3: Cleanup (Remove Duplication)

6. **Consolidate data fetching**
   - Remove unnecessary API routes
   - Direct server component fetching
   - Keep only client-side API routes

7. **Remove feature cross-dependencies**
   - All shared logic in domain layer
   - Features only import from domain/components/lib

## Detailed Examples

### Example 1: Salary Service

```typescript
// services/ssb/ssbSalaryService.ts
import { cacheLife, cacheTag } from 'next/cache'
import { SsbSalaryResponse } from './ssbTypes'

export async function getSsbSalaryData(params: {
  occupation: string
  fromYear: number
  stat?: '01' | '02' // median or average
  sector?: string
}): Promise<SsbSalaryResponse> {
  'use cache'
  cacheLife('hours')
  cacheTag('ssb-salary')

  const url = buildSsbUrl(params)
  const res = await fetch(url)

  if (!res.ok) {
    throw new Error(`SSB fetch failed: ${res.statusText}`)
  }

  const data = await res.json()
  return parseSsbResponse(data)
}

// For server components
export async function getOccupationSalaryTrend(
  occupation: string,
  fromYear: number,
): Promise<SalaryTrend> {
  const data = await getSsbSalaryData({ occupation, fromYear, stat: '01' })
  return calculateTrend(data.series)
}
```

### Example 2: Salary Domain

```typescript
// domain/salary/salaryCalculator.ts
import type { PayPoint, SalaryDataPoint } from './salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation/inflationTypes'
import { adjustForInflation } from '@/domain/inflation/inflationCalculator'

export function calculateSalaryGrowth(
  points: PayPoint[],
  inflationData: InflationDataPoint[],
): SalaryGrowthResult {
  if (points.length < 2) {
    return { totalGrowth: 0, realGrowth: 0, annualAverage: 0 }
  }

  const sorted = [...points].sort((a, b) => a.year - b.year)
  const first = sorted[0]
  const last = sorted[sorted.length - 1]

  const nominalGrowth = ((last.pay - first.pay) / first.pay) * 100

  // Adjust for inflation
  const adjustedFirst = adjustForInflation(first.pay, first.year, last.year, inflationData)
  const realGrowth = ((last.pay - adjustedFirst) / adjustedFirst) * 100

  const years = last.year - first.year
  const annualAverage = years > 0 ? realGrowth / years : 0

  return {
    totalGrowth: nominalGrowth,
    realGrowth,
    annualAverage,
  }
}

// domain/salary/salaryValidator.ts
export function validatePayPoint(
  point: PayPoint,
  existingPoints: PayPoint[],
  constraints: {
    minYear: number
    maxYear: number
    minPay?: number
  },
): ValidationResult {
  if (!point.year || !point.pay) {
    return {
      isValid: false,
      error: 'Year and pay are required',
    }
  }

  if (point.year < constraints.minYear || point.year > constraints.maxYear) {
    return {
      isValid: false,
      error: `Year must be between ${constraints.minYear} and ${constraints.maxYear}`,
    }
  }

  if (point.pay <= 0) {
    return {
      isValid: false,
      error: 'Pay must be positive',
    }
  }

  const duplicate = existingPoints.find(p => p.year === point.year && p.pay === point.pay)
  if (duplicate) {
    return {
      isValid: false,
      error: 'A point with this year and pay already exists',
    }
  }

  return { isValid: true }
}
```

### Example 3: Refactored Hook

```typescript
// features/salary/hooks/useSalaryData.ts
import { useState, useEffect, useMemo } from 'react'
import { calculateSalaryGrowth } from '@/domain/salary/salaryCalculator'
import { validatePayPoint } from '@/domain/salary/salaryValidator'
import { calculateNetIncome } from '@/domain/tax/taxCalculator'
import type { PayPoint } from '@/domain/salary/salaryTypes'
import type { InflationDataPoint } from '@/domain/inflation/inflationTypes'

const STORAGE_KEY = 'salary-calculator-points'

export function useSalaryData(inflationData: InflationDataPoint[], currentYear: number) {
  const [payPoints, setPayPoints] = useState<PayPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      setPayPoints(JSON.parse(stored))
    }
    setIsLoading(false)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payPoints))
    }
  }, [payPoints, isLoading])

  // Delegate calculations to domain layer
  const growth = useMemo(
    () => calculateSalaryGrowth(payPoints, inflationData),
    [payPoints, inflationData],
  )

  const pointsWithNet = useMemo(
    () =>
      payPoints.map(p => ({
        ...p,
        netPay: calculateNetIncome(p.pay, p.year),
      })),
    [payPoints],
  )

  // State management functions
  const addPoint = (point: Omit<PayPoint, 'id'>) => {
    const validation = validatePayPoint(point as PayPoint, payPoints, {
      minYear: 1900,
      maxYear: currentYear,
    })

    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    const newPoint = { ...point, id: crypto.randomUUID() }
    setPayPoints(prev => [...prev, newPoint].sort((a, b) => a.year - b.year))
  }

  const removePoint = (id: string) => {
    setPayPoints(prev => prev.filter(p => p.id !== id))
  }

  return {
    payPoints: pointsWithNet,
    growth,
    hasData: payPoints.length > 0,
    isLoading,
    addPoint,
    removePoint,
  }
}
```

## Testing Benefits

With separated concerns, testing becomes much easier:

```typescript
// domain/salary/salaryCalculator.test.ts
import { calculateSalaryGrowth } from './salaryCalculator'

describe('calculateSalaryGrowth', () => {
  it('calculates nominal growth correctly', () => {
    const points = [
      { year: 2020, pay: 100000 },
      { year: 2023, pay: 115000 },
    ]
    const inflationData = []

    const result = calculateSalaryGrowth(points, inflationData)

    expect(result.totalGrowth).toBe(15)
  })

  it('handles inflation adjustment', () => {
    // Test with inflation data
  })

  it('returns zero for single point', () => {
    const points = [{ year: 2023, pay: 100000 }]
    const result = calculateSalaryGrowth(points, [])

    expect(result.totalGrowth).toBe(0)
  })
})
```

## Key Principles

### 1. Separation of Concerns

- **Domain**: Pure business logic, no React, no side effects
- **Services**: Data fetching, caching
- **Features**: UI + React state management
- **Components**: Reusable UI elements

### 2. Dependency Direction

```
Components → Features → Domain
                     ↘
API Routes → Services → Domain
```

- Everything can depend on domain
- Features can depend on components
- Domain depends on nothing (pure functions)

### 3. Data Fetching Rules

**Server Components (SSR)**:

- Use service functions directly
- No API routes needed
- Cache with `'use cache'`

**Client Components**:

- Use API routes + hooks (useSWR)
- API routes cache on server
- SWR caches on client

### 4. Type Safety

- Define types once in domain layer
- Export from barrel files
- Use strict TypeScript config

## Implementation Checklist

- [ ] Create `services/` directory structure
- [ ] Create `domain/` directory structure
- [ ] Move tax calculator to `domain/tax/`
- [ ] Move inflation calculator to `domain/inflation/`
- [ ] Create salary domain layer
- [ ] Create reference salary domain layer
- [ ] Refactor `useSalaryData` hook
- [ ] Remove inflation API route (use service directly)
- [ ] Update imports across codebase
- [ ] Add tests for domain functions
- [ ] Update architecture documentation
- [ ] Remove unused API routes

## Questions to Answer

Before starting migration:

1. **Which data needs client-side fetching?**
   - Reference salary (user selects occupation) → Keep API route
   - Inflation data (static, loaded once) → Use service directly

2. **Which calculations need to be reactive?**
   - Everything in hooks should be reactive
   - Pure functions in domain can be tested independently

3. **Where does validation live?**
   - Domain layer (business rules)
   - Components can have UI-level validation (format, required fields)

## Next Steps

1. Review this document with the team
2. Decide on migration timeline (incremental vs big bang)
3. Start with Phase 1 (create foundation)
4. Pick one feature to refactor completely as proof of concept
5. Apply learnings to remaining features
6. Update documentation as you go

## Resources

- [Next.js Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)
- [React Server Components](https://react.dev/reference/rsc/server-components)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
