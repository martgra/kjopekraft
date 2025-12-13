# Next.js 16 Best Practices Improvement Plan

## Executive Summary

This document analyzes the kjopekraft application against Next.js 16 best practices and provides actionable improvements for server-side rendering, caching, state management, type safety, and logging.

**Current State**: The application is well-architected with good foundational patterns. It already leverages Next.js 16 features like `'use cache'` directive, React Compiler, and proper Server/Client Component separation.

---

## 1. Server-Side Rendering (SSR)

### Current State ✅
- Uses App Router with hybrid Server/Client Components
- Proper `Suspense` boundaries with loading states
- `ErrorBoundary` for error handling
- Dynamic imports with `ssr: false` for localStorage-dependent components
- Uses `connection()` from `next/server` for dynamic rendering

### Recommended Improvements

#### 1.1 Implement Streaming with Multiple Suspense Boundaries
**Priority: Medium** | **Effort: Low**

Currently, the home page has a single Suspense boundary. Break it into granular boundaries for faster Time to First Byte (TTFB).

```tsx
// Current (app/page.tsx)
<Suspense fallback={<FullPageLoader />}>
  <DashboardWithData />
</Suspense>

// Improved - Multiple boundaries for progressive loading
<div className="grid">
  <Suspense fallback={<ChartSkeleton />}>
    <SalaryChart />
  </Suspense>
  <Suspense fallback={<StatsSkeleton />}>
    <InflationStats />
  </Suspense>
  <Suspense fallback={<TableSkeleton />}>
    <DataTable />
  </Suspense>
</div>
```

**Files to modify**: `app/page.tsx`, create new skeleton components in `components/ui/skeletons/`

#### 1.2 Add Loading UI Files
**Priority: High** | **Effort: Low**

Create `loading.tsx` files for automatic loading states per route.

```
app/
├── loading.tsx           # Root loading state
├── negotiation/
│   └── loading.tsx       # Negotiation page loading state
```

**Benefit**: Instant navigation feedback without manual Suspense management.

#### 1.3 Implement Partial Prerendering (PPR)
**Priority: High** | **Effort: Medium**

Next.js 16 supports PPR for combining static and dynamic content. Enable it for pages with mixed content.

```ts
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: true,
  },
}

// app/page.tsx
export const experimental_ppr = true
```

**Files to modify**: `next.config.ts`, `app/page.tsx`

#### 1.4 Convert More Components to Server Components
**Priority: Medium** | **Effort: Medium**

Audit components that don't need interactivity and convert to Server Components.

**Candidates identified**:
- `SalaryChart` - Could fetch data server-side, pass to client for rendering
- Static parts of `DashboardWithDrawer` - Header, footer sections
- `InflationDisplay` components that only display data

---

## 2. Caching

### Current State ✅
- Uses `'use cache'` directive with `cacheLife` and `cacheTag`
- Inflation data cached for 1 hour
- SSB salary data cached for 1 day
- Client-side SWR with 24h deduping

### Recommended Improvements

#### 2.1 Define Custom Cache Profiles
**Priority: High** | **Effort: Low**

Next.js 16 allows defining custom cache profiles. Create application-specific profiles.

```ts
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    cacheLife: {
      ssb: {
        stale: 3600,      // 1 hour stale
        revalidate: 86400, // 24 hour revalidate
        expire: 604800,    // 7 day expire
      },
      inflation: {
        stale: 1800,       // 30 min stale
        revalidate: 3600,  // 1 hour revalidate
        expire: 86400,     // 1 day expire
      },
      ai: {
        stale: 0,          // Never stale (dynamic)
        revalidate: false, // No automatic revalidation
        expire: 3600,      // 1 hour expire
      },
    },
  },
}
```

**Files to modify**: `next.config.ts`, then update services to use named profiles.

#### 2.2 Implement On-Demand Revalidation API
**Priority: Medium** | **Effort: Low**

Create an admin endpoint for manual cache invalidation.

```ts
// app/api/revalidate/route.ts
import { revalidateTag } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const token = request.headers.get('x-revalidate-token')

  if (token !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { tag } = await request.json()

  if (tag === 'inflation' || tag === 'ssb-salary') {
    revalidateTag(tag)
    return NextResponse.json({ revalidated: true, tag })
  }

  return NextResponse.json({ error: 'Invalid tag' }, { status: 400 })
}
```

**New file**: `app/api/revalidate/route.ts`

#### 2.3 Add Cache Headers for Static Assets
**Priority: Low** | **Effort: Low**

Configure cache headers in next.config.ts for static files.

```ts
// next.config.ts
headers: async () => [
  {
    source: '/:all*(svg|jpg|png|woff2)',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=31536000, immutable',
      },
    ],
  },
],
```

#### 2.4 Implement Request Memoization
**Priority: Medium** | **Effort: Low**

Use React's `cache()` for request-level memoization in Server Components.

```ts
// services/inflation/inflationService.ts
import { cache } from 'react'

export const getInflationData = cache(async (): Promise<InflationDataPoint[]> => {
  'use cache'
  cacheLife('inflation')
  cacheTag('inflation')
  // ... existing implementation
})
```

---

## 3. State Management

### Current State ✅
- Three React Context providers (DisplayMode, ReferenceMode, Drawer)
- Custom hooks for complex state (useSalaryData, useNegotiationData)
- localStorage persistence with error handling
- Memoized context values

### Recommended Improvements

#### 3.1 Migrate to `nuqs` for URL State
**Priority: High** | **Effort: Medium**

Replace localStorage for shareable state with URL search params using `nuqs`.

```bash
npm install nuqs
```

```tsx
// Before: localStorage
const [displayMode, setDisplayMode] = useState(() =>
  localStorage.getItem('salaryDisplayMode') || 'net'
)

// After: URL state with nuqs
import { useQueryState, parseAsStringLiteral } from 'nuqs'

const displayModes = ['net', 'gross'] as const
const [displayMode, setDisplayMode] = useQueryState(
  'display',
  parseAsStringLiteral(displayModes).withDefault('net')
)
```

**Benefits**:
- Shareable URLs (e.g., `?display=gross&reference=true`)
- Back/forward navigation support
- No hydration mismatches
- Server-side access to state

**Files to modify**: `contexts/DisplayModeContext.tsx`, `contexts/ReferenceModeContext.tsx`

#### 3.2 Use Server Actions for Form State
**Priority: Medium** | **Effort: Medium**

For the negotiation form, consider Server Actions with `useActionState`.

```tsx
// app/actions/negotiation.ts
'use server'

import { z } from 'zod'

const schema = z.object({
  jobTitle: z.string().min(1),
  currentSalary: z.string(),
  desiredSalary: z.string(),
})

export async function saveNegotiationData(prevState: any, formData: FormData) {
  const validated = schema.safeParse(Object.fromEntries(formData))

  if (!validated.success) {
    return { error: validated.error.flatten() }
  }

  // Process data...
  return { success: true }
}

// Component
'use client'
import { useActionState } from 'react'

function NegotiationForm() {
  const [state, formAction, pending] = useActionState(saveNegotiationData, null)

  return (
    <form action={formAction}>
      <input name="jobTitle" disabled={pending} />
      <button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

#### 3.3 Implement Optimistic Updates
**Priority: Low** | **Effort: Medium**

For better UX during form submissions, use `useOptimistic`.

```tsx
import { useOptimistic } from 'react'

function NegotiationPoints({ points }) {
  const [optimisticPoints, addOptimisticPoint] = useOptimistic(
    points,
    (state, newPoint) => [...state, { ...newPoint, pending: true }]
  )

  async function addPoint(point) {
    addOptimisticPoint(point)
    await savePoint(point) // Server action
  }

  return (
    <ul>
      {optimisticPoints.map(point => (
        <li key={point.id} className={point.pending ? 'opacity-50' : ''}>
          {point.description}
        </li>
      ))}
    </ul>
  )
}
```

#### 3.4 Create Compound Context Provider
**Priority: Low** | **Effort: Low**

Reduce provider nesting with a compound provider.

```tsx
// contexts/AppProviders.tsx
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <DisplayModeProvider>
      <ReferenceModeProvider>
        <DrawerProvider>
          {children}
        </DrawerProvider>
      </ReferenceModeProvider>
    </DisplayModeProvider>
  )
}

// app/layout.tsx
<AppProviders>
  {children}
</AppProviders>
```

---

## 4. Type Safety

### Current State ✅
- TypeScript strict mode enabled
- Domain types defined (PayPoint, SalaryDataPoint, etc.)
- Zod validation in AI tools
- ESLint TypeScript rules

### Recommended Improvements

#### 4.1 Add Runtime Validation at API Boundaries
**Priority: High** | **Effort: Medium**

Validate all external API responses with Zod.

```ts
// lib/schemas/ssb.ts
import { z } from 'zod'

export const SSBSalaryResponseSchema = z.object({
  dataset: z.object({
    dimension: z.object({
      Yrke: z.object({
        category: z.object({
          index: z.record(z.number()),
          label: z.record(z.string()),
        }),
      }),
    }),
    value: z.array(z.number().nullable()),
  }),
})

export type SSBSalaryResponse = z.infer<typeof SSBSalaryResponseSchema>

// services/ssb/ssbService.ts
export async function fetchSSBSalary(params: SSBSalaryParams) {
  const response = await fetch(url)
  const json = await response.json()

  const result = SSBSalaryResponseSchema.safeParse(json)

  if (!result.success) {
    console.error('Invalid SSB response:', result.error)
    throw new Error('Invalid API response format')
  }

  return result.data
}
```

**New file**: `lib/schemas/ssb.ts`, `lib/schemas/inflation.ts`

#### 4.2 Type API Route Handlers
**Priority: Medium** | **Effort: Low**

Add explicit return types to API routes.

```ts
// app/api/inflation/route.ts
import { NextResponse } from 'next/server'
import type { InflationDataPoint } from '@/domain/inflation/inflationTypes'

type InflationResponse =
  | { data: InflationDataPoint[] }
  | { error: string; message?: string }

export async function GET(): Promise<NextResponse<InflationResponse>> {
  try {
    const data = await getInflationData()
    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch', message: String(error) },
      { status: 500 }
    )
  }
}
```

#### 4.3 Enable Stricter TypeScript Options
**Priority: Medium** | **Effort: Low**

Add additional strict options to tsconfig.json.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "noPropertyAccessFromIndexSignature": true
  }
}
```

**Note**: This may require fixing some existing code.

#### 4.4 Create Discriminated Union Types for API States
**Priority: Medium** | **Effort: Low**

Better typing for loading/error/success states.

```ts
// lib/types/apiState.ts
export type ApiState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

// Usage in hooks
function useSalaryData(): ApiState<SalaryData> {
  // ...
}

// Component
function SalaryDisplay({ state }: { state: ApiState<SalaryData> }) {
  switch (state.status) {
    case 'idle':
      return null
    case 'loading':
      return <Spinner />
    case 'error':
      return <ErrorMessage error={state.error} />
    case 'success':
      return <SalaryChart data={state.data} />
  }
}
```

---

## 5. Logging

### Current State ⚠️
- Only console.log/warn/error
- No structured logging
- No log aggregation
- No performance monitoring
- Basic error boundaries

### Recommended Improvements

#### 5.1 Implement Structured Logging
**Priority: High** | **Effort: Medium**

Create a logging utility with structured output.

```ts
// lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  component?: string
  action?: string
  userId?: string
  [key: string]: unknown
}

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development'

  private log(level: LogLevel, message: string, context: LogContext = {}, error?: Error) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: this.isDev ? error.stack : undefined,
        },
      }),
    }

    if (this.isDev) {
      // Pretty print in development
      const color = { debug: '36', info: '32', warn: '33', error: '31' }[level]
      console.log(`\x1b[${color}m[${level.toUpperCase()}]\x1b[0m`, message, context)
      if (error) console.error(error)
    } else {
      // JSON in production for log aggregation
      console[level](JSON.stringify(entry))
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.isDev) this.log('debug', message, context)
  }

  info(message: string, context?: LogContext) {
    this.log('info', message, context)
  }

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context)
  }

  error(message: string, error: Error, context?: LogContext) {
    this.log('error', message, context, error)
  }
}

export const logger = new Logger()
```

**New file**: `lib/logger.ts`

#### 5.2 Add Error Reporting Service
**Priority: High** | **Effort: Medium**

Integrate Sentry or similar for production error tracking.

```bash
npm install @sentry/nextjs
```

```ts
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  integrations: [
    Sentry.replayIntegration(),
  ],
})

// instrumentation.ts (Next.js 16)
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }
}
```

**Files to create**: `sentry.client.config.ts`, `sentry.server.config.ts`, `instrumentation.ts`

#### 5.3 Implement Request Logging Middleware
**Priority: Medium** | **Effort: Low**

Log all API requests for debugging and analytics.

```ts
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { logger } from '@/lib/logger'

export function middleware(request: NextRequest) {
  const start = Date.now()

  const response = NextResponse.next()

  // Log after response
  const duration = Date.now() - start

  logger.info('API Request', {
    method: request.method,
    path: request.nextUrl.pathname,
    duration,
    status: response.status,
  })

  return response
}

export const config = {
  matcher: '/api/:path*',
}
```

**New file**: `middleware.ts`

#### 5.4 Add Performance Monitoring
**Priority: Medium** | **Effort: Low**

Track Core Web Vitals and custom metrics.

```tsx
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  )
}
```

Or custom implementation:

```tsx
// components/WebVitals.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'
import { logger } from '@/lib/logger'

export function WebVitals() {
  useReportWebVitals((metric) => {
    logger.info('Web Vital', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
    })

    // Send to analytics
    if (window.gtag) {
      window.gtag('event', metric.name, {
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        event_label: metric.id,
        non_interaction: true,
      })
    }
  })

  return null
}
```

**New file**: `components/WebVitals.tsx`

#### 5.5 Create Logging Hooks for Client Components
**Priority: Low** | **Effort: Low**

```tsx
// hooks/useLoggedEffect.ts
import { useEffect } from 'react'
import { logger } from '@/lib/logger'

export function useLoggedEffect(
  effect: () => void | (() => void),
  deps: unknown[],
  component: string
) {
  useEffect(() => {
    logger.debug(`Effect triggered`, { component })
    const cleanup = effect()
    return () => {
      if (cleanup) {
        logger.debug(`Effect cleanup`, { component })
        cleanup()
      }
    }
  }, deps)
}
```

---

## Implementation Priority

### Phase 1: Quick Wins (1-2 days)
1. ✅ Add loading.tsx files for routes
2. ✅ Define custom cache profiles in next.config.ts
3. ✅ Create structured logger utility
4. ✅ Add stricter TypeScript options
5. ✅ Create AppProviders compound component

### Phase 2: Core Improvements (3-5 days)
1. 🔲 Implement runtime validation with Zod schemas
2. 🔲 Add on-demand revalidation API
3. 🔲 Migrate to nuqs for URL state
4. 🔲 Add multiple Suspense boundaries
5. 🔲 Enable Partial Prerendering (PPR)

### Phase 3: Production Hardening (1 week)
1. 🔲 Integrate Sentry for error reporting
2. 🔲 Add request logging middleware
3. 🔲 Implement Web Vitals monitoring
4. 🔲 Convert more components to Server Components
5. 🔲 Add Server Actions for form handling

### Phase 4: Advanced Optimizations (Ongoing)
1. 🔲 Implement optimistic updates
2. 🔲 Add request memoization with React cache()
3. 🔲 Create discriminated union types for API states
4. 🔲 Add performance budgets and monitoring

---

## Summary of Key Changes

| Area | Current | Recommended |
|------|---------|-------------|
| **SSR** | Single Suspense | Multiple boundaries + PPR |
| **Caching** | Basic use cache | Custom profiles + revalidation API |
| **State** | localStorage + Context | nuqs for URL state + Server Actions |
| **Types** | Good interfaces | + Zod runtime validation |
| **Logging** | console.* only | Structured logging + Sentry |

---

## References

- [Next.js 16 Caching Documentation](https://nextjs.org/docs/app/building-your-application/caching)
- [Partial Prerendering](https://nextjs.org/docs/app/building-your-application/rendering/partial-prerendering)
- [Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- [nuqs - Type-safe search params](https://nuqs.47ng.com/)
- [Sentry Next.js SDK](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
