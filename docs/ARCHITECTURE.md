# Architecture Documentation

## Overview

Kjøpekraft is built using a feature-based architecture with Next.js 15 App Router. The application follows modern React best practices with clear separation of concerns, server-side rendering where appropriate, and client-side interactivity for dynamic features.

## Technical Stack

### Core Framework

- **Next.js 15**: App Router with React Server Components and Server Actions
- **React 19**: Latest React with concurrent features
- **TypeScript**: Strict type checking throughout

### Styling & UI

- **Tailwind CSS 4**: Utility-first styling with CSS variables for theming
- **CSS Modules**: Component-scoped styles where needed
- **Material Icons**: Icon library for UI elements
- **CSS Variables**: Design system tokens (colors, spacing, etc.)

### Data Visualization

- **Chart.js 4**: Chart rendering with custom configurations
- **Responsive Charts**: Separate mobile/desktop chart components

### State Management

- **React Context**: Display mode and reference mode toggles
- **Custom Hooks**: Feature-specific state management
- **localStorage**: Client-side persistence
- **SWR**: Client-side data fetching with caching

### Data Fetching

- **Server Components**: SSB inflation and salary data fetching
- **Next.js Cache**: Server-side caching with `"use cache"` directive and `cacheLife()`
- **SWR**: Client-side caching with deduplication
- **API Routes**: Internal APIs for external data sources

### AI Integration

- **Vercel AI SDK**: Structured AI generation
- **OpenAI**: LLM provider for negotiation content

### Package Manager

- **Bun**: Fast package manager and runtime

## Project Structure

```
/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout with providers
│   ├── page.tsx                 # Homepage (salary dashboard)
│   ├── globals.css              # Global styles and CSS variables
│   ├── negotiation/             # Negotiation page
│   └── api/                     # API routes
│       ├── inflation/           # SSB inflation data
│       ├── ssb/salary/          # SSB salary reference data
│       └── generate/            # AI generation endpoints
│           ├── email/
│           └── playbook/
│
├── components/                   # Reusable UI components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── Dashboard.tsx        # Main dashboard orchestrator
│   │   ├── ChartSection.tsx     # Chart with controls
│   │   ├── MetricGrid.tsx       # Statistics display
│   │   ├── MetricCard.tsx       # Individual metric card
│   │   ├── RightPanel.tsx       # Data entry panel
│   │   ├── SalaryPointForm.tsx  # Salary input form
│   │   └── ActivityTimeline.tsx # Recent activity list
│   │
│   ├── layout/                  # Layout components
│   │   ├── DashboardLayout.tsx  # Main layout wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   └── MobileBottomNav.tsx  # Mobile navigation
│   │
│   └── ui/                      # Atomic design system
│       ├── atoms/               # Basic UI elements
│       │   ├── Badge/
│       │   ├── Button/
│       │   ├── Card/
│       │   ├── Icon/
│       │   ├── Input/
│       │   └── Spinner/
│       ├── molecules/           # Composite UI elements
│       │   ├── FormField/
│       │   ├── MetricCard/
│       │   └── PointItem/
│       ├── organisms/           # Complex UI sections
│       │   ├── ArgumentBuilder/
│       │   └── GeneratedContent/
│       └── common/              # Shared utilities
│           ├── LoadingSpinner.tsx
│           └── MobileMetaScript.tsx
│
├── features/                     # Feature modules
│   ├── salary/                  # Salary tracking
│   │   └── hooks/
│   │       ├── useSalaryData.ts           # Central salary state
│   │       ├── usePaypointChartData.ts    # Chart data prep
│   │       └── useSalaryCalculations.ts   # Calculations
│   │
│   ├── inflation/               # Inflation data
│   │   ├── inflationCalc.ts     # Inflation calculations
│   │   ├── inflationParser.ts   # SSB data parser
│   │   └── hooks/
│   │       └── useInflation.ts
│   │
│   ├── tax/                     # Tax calculations
│   │   ├── taxCalculator.ts     # Norwegian tax logic
│   │   └── config/
│   │       ├── YEARLY_TAX_CONFIG.ts
│   │       └── TRYGDE_CONFIG.ts
│   │
│   ├── referenceSalary/         # SSB salary comparison
│   │   ├── types.ts
│   │   ├── occupations.ts       # Occupation registry
│   │   ├── referenceCalculator.ts
│   │   └── hooks/
│   │       └── useReferenceSalary.ts
│   │
│   ├── visualization/           # Charts
│   │   └── components/
│   │       ├── ResponsiveChartWrapper.tsx
│   │       ├── DesktopPayChart.tsx
│   │       ├── MobilePayChart.tsx
│   │       └── PaypointChart.tsx
│   │
│   ├── negotiation/             # Negotiation tools
│   │   ├── components/
│   │   │   ├── NegotiationPage.tsx
│   │   │   ├── CollapsibleSection.tsx
│   │   │   ├── CopyPromptButton.tsx
│   │   │   ├── CopyRichButton.tsx
│   │   │   └── DownloadDocxButton.tsx
│   │   ├── hooks/
│   │   │   └── useNegotiationData.ts
│   │   └── utils/
│   │       └── negotiationUtils.ts
│   │
│   └── onboarding/              # User onboarding
│       ├── OnboardingEmptyState.tsx
│       └── demoData.ts
│
├── contexts/                     # React Context providers
│   ├── displayMode/             # Net/Gross toggle
│   │   └── DisplayModeContext.tsx
│   └── referenceMode/           # Reference salary toggle
│       └── ReferenceModeContext.tsx
│
├── lib/                          # Shared utilities
│   ├── constants/
│   │   └── text.ts              # All UI text constants
│   ├── models/
│   │   ├── types.ts             # Shared TypeScript types
│   │   ├── inflation.ts         # Inflation types
│   │   └── getInflationData.ts  # Server-side data fetcher
│   ├── utils/
│   │   ├── cn.ts                # Tailwind class merge
│   │   └── index.ts
│   ├── chartjs.ts               # Chart.js configuration
│   ├── prompts.ts               # AI prompt builders
│   └── examples.ts              # Example data
│
└── docs/                         # Documentation
    ├── ARCHITECTURE.md          # This file
    ├── GETTING_STARTED.md       # Setup guide
    ├── FUNCTIONAL_DESCRIPTION.md
    ├── ci-cd-pipeline.md
    └── reference-salary-implementation.md
```

## Design Patterns

### Feature-Based Organization

Each feature is self-contained with:

- Components specific to that feature
- Custom hooks for state and logic
- Utilities and calculators
- Type definitions (when not shared)

Benefits:

- **Cohesion**: Related code stays together
- **Independence**: Features can be modified without affecting others
- **Scalability**: New features can be added easily
- **Testability**: Features can be tested in isolation

### Atomic Design System

UI components follow atomic design principles:

- **Atoms**: Basic building blocks (Button, Input, Badge, Icon)
- **Molecules**: Simple combinations (FormField, MetricCard)
- **Organisms**: Complex sections (ArgumentBuilder, GeneratedContent)
- **Templates**: Page layouts (DashboardLayout)
- **Pages**: Full pages (Dashboard, NegotiationPage)

### Server-First Data Fetching

```typescript
// Server Component (app/page.tsx)
async function DashboardWithData() {
  const inflationData = await getInflationData() // Server-side fetch
  const currentYear = new Date().getFullYear()   // Server-side date

  return <Dashboard inflationData={inflationData} currentYear={currentYear} />
}
```

Benefits:

- Faster initial load (no client-side waterfall)
- Better SEO
- Reduced client bundle size
- Server-side caching

### Client-Side State Management

Client components use hooks for state:

```typescript
// Custom hook pattern
export function useSalaryData(inflationData, currentYear) {
  const [payPoints, setPayPoints] = useState<PayPoint[]>([])

  // localStorage persistence
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setPayPoints(JSON.parse(stored))
  }, [])

  // Memoized calculations
  const statistics = useMemo(() =>
    computeStatistics(salaryData, inflationData, currentYear),
    [salaryData, inflationData, currentYear]
  )

  return { payPoints, statistics, addPoint, removePoint, ... }
}
```

### Context for Global State

Two context providers manage global toggles:

```typescript
// Display Mode Context (Net vs Gross)
const DisplayModeContext = createContext<DisplayModeContextType | undefined>(undefined)

export function DisplayModeProvider({ children }) {
  const [isNetMode, setIsNetMode] = useState(() => {
    const stored = localStorage.getItem('salaryDisplayMode')
    return stored === 'net'
  })

  const toggleMode = () => setIsNetMode(prev => !prev)

  return (
    <DisplayModeContext.Provider value={{ isNetMode, toggleMode }}>
      {children}
    </DisplayModeContext.Provider>
  )
}
```

### Text Constants System

All user-facing text lives in `/lib/constants/text.ts`:

```typescript
export const TEXT = {
  dashboard: {
    title: 'Lønnsoversikt',
    subtitle: 'Følg din lønnsutvikling over tid...',
  },
  forms: {
    labels: { year: 'År', salary: 'Årslønn' },
    validation: { yearRequired: 'År er påkrevd' },
  },
  // ...
}
```

Benefits:

- Single source of truth
- Easy to update text
- i18n-ready structure
- Searchable and maintainable

## Data Flow

### Salary Tracking Flow

```
User Input (SalaryPointForm)
    ↓
useSalaryData hook
    ↓
localStorage persistence
    ↓
Calculate statistics (inflation-adjusted)
    ↓
usePaypointChartData transforms for Chart.js
    ↓
ResponsiveChartWrapper determines mobile/desktop
    ↓
MobilePayChart or DesktopPayChart renders
```

### Inflation Data Flow

```
Server Component (page.tsx)
    ↓
getInflationData() → /api/inflation/route.ts
    ↓
SSB API fetch with server-side caching (1h)
    ↓
Parse JSON-stat2 format
    ↓
Return InflationDataPoint[]
    ↓
Pass to client Dashboard component
    ↓
usePaypointChartData combines with salary data
    ↓
Chart renders inflation line
```

### Reference Salary Flow

```
User toggles reference mode (Context)
    ↓
useReferenceSalary hook (conditional fetch)
    ↓
/api/ssb/salary?occupation=2223
    ↓
SSB table 11418 fetch (server cache 1h)
    ↓
Estimate 2025 via wage index (table 11654)
    ↓
Return yearly salary series
    ↓
referenceCalculator.filterByYearRange()
    ↓
Convert to net if needed (same tax calc)
    ↓
usePaypointChartData adds as third dataset
    ↓
Chart renders amber dashed reference line
```

### Negotiation Generation Flow

```
User adds arguments + details (NegotiationPage)
    ↓
useNegotiationData manages state
    ↓
Generate email/playbook button
    ↓
POST /api/generate/email or /api/generate/playbook
    ↓
buildEmailPrompt() or buildPlaybookPrompt()
    ↓
Vercel AI SDK + OpenAI
    ↓
Stream markdown response
    ↓
Display in CollapsibleSection
    ↓
Copy/download actions available
```

## State Management Strategy

### Local Component State

- Form inputs
- UI toggles (expand/collapse)
- Loading states

### Custom Hooks

- Feature-specific state (salary data, negotiation points)
- Business logic
- Data transformations

### React Context

- Global toggles (display mode, reference mode)
- Theme/settings

### localStorage

- User data persistence
- Settings persistence
- Onboarding flags

### Server Cache

- SSB inflation data (Next.js cache, 1h)
- SSB salary data (Next.js cache, 1h)
- Shared across all users

### Client Cache (SWR)

- Reference salary data (24h dedupe)
- Per-user, in-memory

## Caching Strategy

### Server-Side Caching (Next.js 15)

```typescript
import 'server-only'
import { unstable_cacheLife as cacheLife, unstable_cacheTag as cacheTag } from 'next/cache'

export async function getInflationData() {
  'use cache'
  cacheLife('hours') // Cache for 1 hour
  cacheTag('inflation') // Tag for invalidation

  const response = await fetch(SSB_API_URL)
  return parseInflationData(response)
}
```

Benefits:

- Shared across all users (efficient)
- Reduces external API calls
- Tagged invalidation support
- Built-in revalidation

### Client-Side Caching (SWR)

```typescript
export function useReferenceSalary(enabled: boolean, occupation: string, fromYear: number) {
  const shouldFetch = enabled && occupation && fromYear

  const { data, error, isLoading } = useSwr(
    shouldFetch ? `/api/ssb/salary?occupation=${occupation}&fromYear=${fromYear}` : null,
    fetcher,
    { dedupingInterval: 86400000 }, // 24h
  )

  return { data, error, isLoading }
}
```

Benefits:

- Automatic revalidation
- Deduplication of requests
- Error retry logic
- Loading states

## API Architecture

### Internal API Routes

All API routes follow Next.js App Router conventions:

```typescript
// app/api/inflation/route.ts
import 'server-only'

export async function GET() {
  try {
    const data = await getInflationData() // Cached internally
    return Response.json(data)
  } catch (error) {
    return Response.json({ error: 'Failed to fetch' }, { status: 502 })
  }
}
```

### External API Integration

SSB (Statistics Norway) integration:

- **Table 11418**: Earnings by occupation (monthly)
- **Table 11654**: Wage index (quarterly)
- **PxWebApi v2**: JSON-stat2 format
- **Parameter ordering**: Critical for SSB API (see reference-salary-implementation.md)

## Type System

### Shared Types (`lib/models/types.ts`)

```typescript
export interface PayPoint {
  id?: string // Optional UUID for editing
  year: number
  pay: number
}

export interface SalaryDataPoint {
  year: number
  originalPay: number
  adjustedPay: number
  inflationRate: number
}

export interface SalaryStatistics {
  currentSalary: number
  realAnnualValue: number
  totalGrowthPercent: number
  inflationAdjustedGrowth: number
  yearlyChange: number
  // ...
}

export interface ValidationResult {
  isValid: boolean
  errorMessage?: string
}
```

### Feature-Specific Types

Each feature can define its own types when not shared:

```typescript
// features/referenceSalary/types.ts
export interface ReferenceDataPoint {
  year: number
  value: number
  type: 'official' | 'estimated'
}

export interface OccupationDefinition {
  code: string
  labelNo: string
  labelEn: string
}
```

## Responsive Design

### Breakpoints

Using Tailwind's default breakpoints:

- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

### Mobile-First Approach

Components built mobile-first, enhanced for desktop:

```tsx
<div className="p-4 md:p-6">
  {' '}
  {/* Padding scales up */}
  <h1 className="text-lg md:text-2xl">
    {' '}
    {/* Font size scales up */}
    Title
  </h1>
</div>
```

### Conditional Rendering

Separate mobile/desktop components where needed:

```tsx
// ResponsiveChartWrapper.tsx
export default function ResponsiveChartWrapper() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile ? <MobilePayChart /> : <DesktopPayChart />
}
```

### Mobile Navigation

- Desktop: Sidebar navigation
- Mobile: Bottom tab navigation (`MobileBottomNav`)
- Collapsible panels on mobile to maximize chart space

## Performance Optimizations

### Server-Side

- Data fetching at request time (no client waterfall)
- Aggressive caching (1h for SSB data)
- Tagged cache invalidation
- Server Components for static content

### Client-Side

- `useMemo` for expensive calculations
- `useCallback` for stable function references
- Conditional data fetching (reference salary only when enabled)
- localStorage for instant hydration
- Separated mobile/desktop chart code (smaller bundles per viewport)

### Bundle Optimization

- Dynamic imports where beneficial
- Tree-shaking via ES modules
- Minimal dependencies (see package.json)
- Bun for faster installs and execution

## Security Considerations

### Secret Management

- Gitleaks scans for committed secrets
- Pre-commit hooks prevent secret commits
- Environment variables for API keys
- `.secretlintrc.json` configuration

### Client-Side

- No sensitive data in localStorage
- API keys never exposed to client
- Input validation before processing
- XSS protection via React's automatic escaping

### API Routes

- Rate limiting considerations for AI endpoints
- Error messages don't leak internal details
- Type validation on all inputs

## Error Handling

### Server Components

```typescript
async function DashboardWithData() {
  let inflationData = []

  try {
    inflationData = await getInflationData()
  } catch (error) {
    console.error('Failed to fetch inflation data:', error)
    // Component handles empty data gracefully
  }

  return <Dashboard inflationData={inflationData} />
}
```

### Client Components

```typescript
const { data, error } = useSwr(url, fetcher)

if (error) {
  return <ErrorMessage>{TEXT.common.errorLoading}</ErrorMessage>
}
```

### API Routes

```typescript
export async function GET() {
  try {
    const data = await fetchExternal()
    return Response.json(data)
  } catch (error) {
    console.error('API error:', error)
    return Response.json({ error: 'Failed to fetch data' }, { status: 502 })
  }
}
```

## Testing Strategy

### Current State

- No automated tests yet
- Code structured for testability
- CI pipeline ready for test integration

### Future Testing Approach

**Unit Tests**:

- Utility functions (tax calculations, inflation calculations)
- Custom hooks
- Data transformers

**Integration Tests**:

- API routes
- Feature modules
- Data flow

**E2E Tests**:

- User workflows
- Form submissions
- Chart interactions

**Preferred Tools**:

- Vitest for unit/integration
- Playwright for E2E
- React Testing Library for components

## Build & Deployment

### Development

```bash
bun dev          # Development server with Turbopack
```

### Production Build

```bash
bun run build    # Creates optimized production build
bun start        # Runs production server
```

### CI/CD Pipeline

- GitHub Actions on push/PR
- Secret scanning (Gitleaks)
- Linting (ESLint)
- Formatting (Prettier)
- Type checking (TypeScript)
- Build verification

### Deployment

- Docker support (`Dockerfile`)
- Azure App Service deployment
- GitHub Container Registry for images
- See [ci-cd-pipeline.md](ci-cd-pipeline.md) for details

## Code Quality Standards

### TypeScript

- Strict mode enabled
- Explicit types for all function signatures
- Shared types in `lib/models/types.ts`
- Feature-specific types in feature folders

### ESLint

- Next.js recommended rules
- React recommended rules
- Prettier integration
- Custom rules for imports

### Prettier

- Consistent code formatting
- Runs on pre-commit hook
- Enforced in CI

### Pre-commit Hooks (Husky)

- Secret detection (secretlint)
- Auto-fix linting (ESLint)
- Auto-format (Prettier)
- Prevents bad commits

## Conventions

### File Naming

- Components: PascalCase (e.g., `Dashboard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useSalaryData.ts`)
- Utilities: camelCase (e.g., `inflationCalc.ts`)
- Types: PascalCase (e.g., `types.ts`)
- Constants: SCREAMING_SNAKE_CASE for values, `text.ts` for UI text

### Import Order

1. External dependencies
2. Internal absolute imports (`@/...`)
3. Relative imports
4. Type imports (using `import type`)

### Component Structure

```typescript
'use client' // If client component

import { useState } from 'react'
import { ComponentProps } from './types'
import { TEXT } from '@/lib/constants/text'

interface Props {
  // Props definition
}

export default function Component({ prop1, prop2 }: Props) {
  // Hooks
  // Handlers
  // Render
  return <div>...</div>
}
```

### CSS Variables

Design tokens in `app/globals.css`:

```css
:root {
  --background-light: #f8f9fa;
  --text-main: #1f2937;
  --text-muted: #6b7280;
  --border-light: #e5e7eb;
  --primary: #10b981;
}
```

## Future Architectural Considerations

### Potential Enhancements

- Database integration (PostgreSQL/Supabase)
- User authentication
- Multi-user support
- Internationalization (i18n)
- More SSB occupations in reference data
- Advanced analytics
- Data export functionality
- Shared salary comparisons

### Scalability

- Current localStorage approach works for single-user
- Database migration path is clear
- Feature architecture supports growth
- API routes can be extracted to microservices if needed

---

For implementation details of specific features, see:

- [Reference Salary Implementation](reference-salary-implementation.md)
- [Functional Description](FUNCTIONAL_DESCRIPTION.md)
- [Getting Started](GETTING_STARTED.md)
