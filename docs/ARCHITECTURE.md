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
- **CSS Variables**: Figma-aligned design system with consistent light mode
  - Primary: `#3b82f6` (Blue-500)
  - Semantic colors: emerald (#10b981), orange (#f97316), indigo (#6366f1), blue (#3b82f6)
  - Surface and text color variables for consistent theming
  - No dark mode - consistent light theme throughout
- **Material Symbols Outlined**: Consistent icon system (`material-symbols-outlined`)
- **Atomic Design Pattern**: Components organized by complexity
  - Atoms: Badge (with ring-inset variants), Button, Card, Icon, Input, Select, Spinner
  - Molecules: FormField, MetricCard (with colored icon pills), PointItem
  - Organisms: ArgumentBuilder, GeneratedContent
- **Component Features**:
  - MetricCard: Icon pills in top-right with colored backgrounds, hover border transitions
  - Badge: Ring-inset design, multiple color variants (info, warning, success, error, primary)
  - Select: Dropdown with left/right icon support, work icon for occupation selector
  - Charts: Integrated legend, controls menu with occupation selector and toggles

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
│   └── api/                     # API routes (client-side fetching only)
│       ├── ssb/salary/          # SSB salary reference data (for client)
│       └── generate/            # AI generation endpoints
│           ├── email/
│           └── playbook/
│
├── services/                     # Server-side data fetching
│   ├── inflation/
│   │   └── inflationService.ts  # SSB inflation data fetching
│   └── ssb/
│       └── ssbTypes.ts          # SSB service types
│
├── domain/                       # Pure business logic (no React, no I/O)
│   ├── salary/
│   │   ├── salaryCalculator.ts  # Salary calculations
│   │   ├── salaryValidator.ts   # Validation logic
│   │   └── salaryTypes.ts       # Salary types
│   ├── inflation/
│   │   ├── inflationCalculator.ts # Inflation calculations
│   │   ├── inflationParser.ts   # SSB data parser
│   │   └── inflationTypes.ts    # Inflation types
│   ├── tax/
│   │   ├── taxCalculator.ts     # Norwegian tax calculations
│   │   ├── taxConfig.ts         # Tax configuration data
│   │   └── taxTypes.ts          # Tax types
│   └── reference/
│       ├── referenceCalculator.ts # Reference salary calculations
│       └── referenceTypes.ts    # Reference types
│
├── components/                   # Reusable UI components
│   ├── dashboard/               # Dashboard-specific components
│   │   ├── Dashboard.tsx        # Main dashboard orchestrator
│   │   ├── DashboardWithDrawer.tsx # Client wrapper with drawer integration
│   │   ├── ChartSection.tsx     # Chart with controls menu below
│   │   ├── MetricGrid.tsx       # Statistics display
│   │   ├── MetricCard.tsx       # Individual metric card (colored icon pills)
│   │   ├── RightPanel.tsx       # Data entry panel
│   │   ├── SalaryPointForm.tsx  # Salary input form
│   │   └── ActivityTimeline.tsx # Recent activity with timeline line
│   │
│   ├── layout/                  # Layout components
│   │   ├── DashboardLayout.tsx  # Main layout wrapper
│   │   ├── Sidebar.tsx          # Navigation sidebar
│   │   ├── MobileBottomNav.tsx  # Mobile navigation with FAB
│   │   ├── MobileBottomDrawer.tsx # Slide-up drawer for mobile
│   │   └── ClientLayoutWrapper.tsx # Client wrapper for drawer integration
│   │
│   └── ui/                      # Atomic design system
│       ├── atoms/               # Basic UI elements
│       │   ├── Badge/           # Status badges with ring-inset variants
│       │   ├── Button/
│       │   ├── Card/
│       │   ├── Icon/
│       │   ├── Input/
│       │   ├── Select/          # Dropdown with icon support
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
│   ├── referenceMode/           # Reference salary toggle
│   │   └── ReferenceModeContext.tsx
│   └── drawer/                  # Mobile drawer state
│       └── DrawerContext.tsx    # Global drawer open/close state
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

### Layered Architecture

The application follows a strict layered architecture to ensure separation of concerns and maintainability:

#### 1. Domain Layer (`domain/`)

Pure business logic with **no dependencies** on React, Next.js, or external I/O.

- **Purpose**: Core business rules, calculations, and validations
- **Characteristics**:
  - Pure functions only
  - No side effects (no API calls, no localStorage, no Date.now())
  - Highly testable
  - Framework-agnostic
- **Examples**:
  - `domain/salary/salaryCalculator.ts` - Salary growth calculations
  - `domain/tax/taxCalculator.ts` - Norwegian tax calculations
  - `domain/inflation/inflationCalculator.ts` - Inflation adjustments

```typescript
// Example: Pure domain function
export function calculateSalaryGrowth(
  points: PayPoint[],
  inflationData: InflationDataPoint[],
): SalaryStatistics {
  // Pure calculation logic - no side effects
  const adjusted = adjustForInflation(points, inflationData)
  return computeStatistics(adjusted)
}
```

#### 2. Services Layer (`services/`)

Server-side data fetching for use in Server Components and API Routes.

- **Purpose**: External data access with caching
- **Characteristics**:
  - Uses Next.js cache directives (`'use cache'`, `cacheLife()`)
  - Server-side only
  - Returns domain types
- **Examples**:
  - `services/inflation/inflationService.ts` - Fetch SSB inflation data
  - `services/ssb/*` - SSB API integration

```typescript
// Example: Service function
export async function getInflationData(): Promise<InflationDataPoint[]> {
  'use cache'
  cacheLife('hours')
  const res = await fetch('https://data.ssb.no/...')
  return parseJsonInflation(await res.json())
}
```

#### 3. Feature Layer (`features/`)

React-specific logic, hooks, and feature components.

- **Purpose**: State management and UI composition
- **Characteristics**:
  - React hooks for state
  - Delegates calculations to domain layer
  - Feature-specific UI components
- **Examples**:
  - `features/salary/hooks/useSalaryData.ts` - Salary state management
  - `features/negotiation/components/*` - Negotiation UI

```typescript
// Example: Feature hook
export function useSalaryData(inflationData: InflationDataPoint[]) {
  const [payPoints, setPayPoints] = useState<PayPoint[]>([])

  // Delegate calculation to domain layer
  const statistics = useMemo(
    () => calculateSalaryStatistics(payPoints, inflationData),
    [payPoints, inflationData],
  )

  return { payPoints, statistics, addPoint, removePoint }
}
```

#### 4. Component Layer (`components/`)

Reusable UI components following atomic design.

#### 5. API Routes (`app/api/`)

**Only for client-side data fetching**. Server Components should use services directly.

- **When to use**: Client components need dynamic data
- **When NOT to use**: Server Components (use services instead)

#### Dependency Direction

```
┌─────────────────────────────────────┐
│  Presentation (Components/Pages)    │
│         ↓                            │
│  Features (Hooks + Feature UI)      │
│         ↓                            │
│  Services (Server) | API (Client)   │
│         ↓                            │
│  Domain (Pure Business Logic)       │
└─────────────────────────────────────┘
```

**Rules**:

- Domain depends on NOTHING
- Services depend only on domain
- Features depend on domain (not other features)
- Components depend on features and domain
- Everything can import from domain

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

  // localStorage persistence - load after mount
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

### Client-Only Pages (No SSR)

For pages that heavily depend on localStorage and client-side state (e.g., negotiation page), disable SSR entirely:

```typescript
// app/negotiation/page.tsx (Server Component)
import dynamic from 'next/dynamic'

// Disable SSR for this page to prevent hydration issues
const NegotiationPageWrapper = dynamic(
  () => import('@/features/negotiation/components/NegotiationPageWrapper'),
  { ssr: false }
)

export default function Page() {
  return <NegotiationPageWrapper />
}
```

This approach:

- Prevents hydration mismatches with localStorage
- Keeps code simple without hydration workarounds
- Client component fetches its own data
- Use sparingly - only for truly client-only pages

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
Vercel AI SDK + OpenAI (with SSB tools)
    ↓
AI agent analyzes prompt
    ↓
[OPTIONAL] AI calls SSB tools autonomously:
    - findOccupationCode(jobTitle) → SSB code
    - getMedianSalary(occupation, year) → median salary
    - compareToMarket(occupation, salary, year) → market position
    - getSalaryTrend(occupation, fromYear, toYear) → growth analysis
    ↓
Tool executes → queries SSB API → returns data
    ↓
AI synthesizes market data into response
    ↓
Stream markdown response
    ↓
Display in CollapsibleSection
    ↓
Copy/download actions available
```

### AI Agent Tools Architecture

**Overview**: The application uses Vercel AI SDK's `tool()` function to enable AI agents to autonomously query SSB (Statistics Norway) salary data during negotiation content generation.

**Tool Infrastructure** (`/lib/ssb/`):

1. **ssbQueryFunctions.ts** - Low-level SSB API wrappers
   - `queryMedianSalary(occupationCode, year)`: Fetch median salary for occupation/year
   - `querySalaryTrend(occupationCode, fromYear, toYear)`: Analyze salary development over time
   - `calculateMarketGap(occupationCode, userSalary, year)`: Compare user salary to market median
   - All functions call existing `/api/ssb/salary` route with median stat parameter

2. **occupationMapper.ts** - Fuzzy occupation matching
   - `mapJobTitleToOccupation(jobTitle)`: Map free-text job title to SSB code
   - Keyword-based matching (Norwegian + English)
   - Confidence scoring (1.0 = exact, 0.9 = word match, 0.7 = partial, 0.6 = fuzzy)
   - Returns `{ code, label, confidence, isApproximate }` or `null`
   - Supported occupations: Sykepleiere (2223), Programvareutviklere (2512), Lærere (2330), Ingeniører (2146)

3. **ssbTools.ts** - Tool definitions for AI SDK
   - `getMedianSalary`: Fetch market salary (accepts code or job title)
   - `getSalaryTrend`: Analyze salary growth over time range
   - `compareToMarket`: Calculate user's position vs. market (above/below/at market)
   - `findOccupationCode`: Translate job title to SSB code
   - Each tool uses Zod schemas for parameter validation
   - Tools return structured JSON with error handling

**Integration Flow**:

```
User fills negotiation form (job title: "Senior Developer")
    ↓
POST to /api/generate/playbook with tools=ssbToolset, maxSteps=5
    ↓
OpenAI model receives prompt + tool schemas
    ↓
Model decides to call: findOccupationCode({ jobTitle: "Senior Developer" })
    ↓
Tool executes: maps "Developer" → code "2512" (confidence: 0.9, approximate)
    ↓
Model calls: getMedianSalary({ occupation: "2512", year: 2024 })
    ↓
Tool queries SSB API → returns { yearly: 820000, confidence: "official" }
    ↓
Model synthesizes: "Basert på SSB-data for nærmeste kategori (Programvareutviklere),
                    er medianlønnen 820,000 NOK i 2024..."
    ↓
Final playbook includes data-backed market analysis
```

**Tool Call Transparency**:

- Tool execution logs **NOT** exposed to users (clean UX)
- Approximate matches notified in content: "Basert på SSB-data for nærmeste kategori..."
- Source citations included: "Kilde: SSB Tabell 11418"
- AI prompts instruct model to inform users when using approximate occupations

**Error Handling**:

- Missing occupation match → AI proceeds without market data, uses user-provided info
- SSB API failure → Tool returns `{ error: true, message: "..." }`
- AI adapts response based on available data

**Future Enhancements** (not yet implemented):

- **Tool call caching**: Deduplicate redundant SSB queries within same generation session
- **Expanded occupation registry**: Add more SSB codes beyond current 4 occupations
- **Multi-occupation comparison**: Support comparing across different roles
- **Streaming tool calls**: Show real-time tool execution to users for transparency

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

**Client-Only Pages with localStorage:**

When a page heavily depends on localStorage (like the negotiation tool), disable SSR entirely to avoid hydration mismatches:

```typescript
// app/negotiation/page.tsx
import dynamic from 'next/dynamic'

const NegotiationPageClient = dynamic(
  () => import('@/features/negotiation/components/NegotiationPageWrapper'),
  {
    ssr: false, // Completely disable SSR
    loading: () => <LoadingSpinner />,
  },
)

export default function Page() {
  return <NegotiationPageClient />
}
```

Benefits:

- No hydration mismatches
- localStorage available immediately in component
- Simpler state management
- Consistent behavior

Trade-offs:

- No SEO for that page (acceptable for authenticated/tool pages)
- Slightly slower initial render
- No server-side data prefetching

Use this approach when:

- Page relies on localStorage for core functionality
- SEO is not critical (tools, dashboards, settings)
- All data is user-specific

For pages needing both SSR and localStorage, use progressive enhancement with careful state initialization.

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
- **Sector Codes**: Valid sector codes from SSB Table 11418:
  - `ALLE`: Sum alle sektorer (all sectors)
  - `A+B+D+E`: Privat sektor og offentlige eide foretak (private sector)
  - `6500`: Kommuneforvaltningen (municipal administration)
  - `6100`: Statsforvaltningen (state administration)
  - Note: These codes are defined by SSB and must match exactly. Incorrect codes will result in 400 errors.

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

- **Desktop**: Sidebar navigation with right panel for data entry/tools
- **Mobile**:
  - Bottom tab navigation (`MobileBottomNav`) with centered floating action button (FAB)
  - Bottom drawer (`MobileBottomDrawer`) - slides up from bottom to show context-specific content
  - Drawer replaces right panel on mobile for better screen space utilization
  - Drawer content changes based on current route:
    - Dashboard: Salary data entry form + activity timeline
    - Negotiation: Argument builder + generation buttons
  - Drawer state managed via `DrawerContext` shared across the app
  - FAB shows badge count (number of data points/arguments)
  - Smooth slide-up animation with backdrop and escape/swipe-to-close support
  - Right panel hidden on mobile (drawer provides the same functionality)

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
