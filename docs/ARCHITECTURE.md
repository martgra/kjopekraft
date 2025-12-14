# Architecture

Kjøpekraft is a Next.js 16 App Router app built with a layered, feature-based structure. This document captures what is actually implemented today (no future-state or speculative sections).

## Stack (current)

- **Next.js** 16.0.9 (App Router, RSC)
- **React** 19.2.2
- **TypeScript** 5.9 (strict)
- **Bun** (runtime + package manager)
- **Tailwind CSS** 4 (CSS variables, light theme only)
- **Charting**: Chart.js 4.4
- **Client caching**: SWR 2.3
- **AI**: `ai` + `@ai-sdk/openai`

## Layering & dependency rules

- `domain/`: pure business logic (no React, no I/O). Depends on nothing.
- `services/`: server-only data fetching. Depends on `domain/` + Next.js server utilities.
- `features/`: React hooks + feature UI. Depends on `domain/`, shared UI, and `lib/`.
- `components/`: reusable UI (dashboard/layout/ui primitives). Can depend on `features/` and `domain/`.
- `contexts/`: global providers (display mode, reference mode, drawer).
- `lib/`: shared utilities, constants (`lib/constants/text.ts`), schemas, chart config.
- **No feature→feature imports.** Shared logic lives in `domain/` or `lib/`.

## Project structure (high level)

```
app/                     # Routes + API handlers
  layout.tsx             # Root layout (Server)
  page.tsx               # Dashboard entry (Server)
  negotiation/page.tsx   # Client page wrapper (localStorage-heavy)
  api/                   # API routes for client-side fetching & AI
components/              # Reusable UI (dashboard, layout, ui/*)
contexts/                # Global providers (display/reference/drawer)
domain/                  # Pure calculations (salary, tax, inflation, reference)
features/                # Feature modules (salary, tax, referenceSalary, negotiation, onboarding, visualization)
services/                # Server-only fetchers (inflation, storting reference)
lib/                     # Constants, schemas, prompts, chart config, utilities
docs/                    # Documentation set
```

## Data fetching patterns

- **Server Components** call `services/*` directly (no internal API hop). Example: `services/inflation/inflationService.ts` fetches and parses SSB inflation data with `cacheLife('inflation')` and `cacheTag('inflation')`.
- **Client Components** fetch via `app/api/*` + SWR. API routes exist for client-side consumption only (e.g., `app/api/ssb/salary/route.ts`, `app/api/inflation/route.ts`).
- **Client-only pages**: pages that rely on `localStorage` (negotiation) are marked `'use client'` and may use `next/dynamic` with `{ ssr: false }` inside the client file. Do not place `{ ssr: false }` dynamic imports in Server Components.

## Caching

- **Next.js cache profiles** are defined in `next.config.ts` (`cacheLife` entries: `ssb`, `inflation`, `ai`) and used from services.
- **Tagging**: server fetches tag data (`cacheTag('inflation')`, `cacheTag('ssb-salary')`); on-demand revalidation via `POST /api/revalidate` with header `x-revalidate-token` and allowed tags `inflation` or `ssb-salary`.
- **Request memoization**: service fetchers are wrapped in `cache()` to dedupe per request/render.
- **Client cache**: SWR dedupes client-side requests for reference salary data.

## Key flows (implemented)

### Salary + inflation dashboard

- `app/page.tsx` (Server) fetches inflation data via `services/inflation`.
- `components/dashboard/Dashboard.tsx` (Client) manages salary state via `features/salary` hooks.
- Calculations and validation are delegated to `domain/salary` and `domain/inflation`.
- Chart data prep lives in `features/visualization` hooks/components; Chart.js config is shared from `lib/chartjs.ts`.

### Reference salary (SSB)

- Client fetch: `features/referenceSalary/hooks/useReferenceSalary.ts` → `/api/ssb/salary`.
- API route hits SSB table 11418; optional wage-index estimate (table 11654) for future years.
- Business logic for filtering/transforming series is in `domain/reference`.
- Occupation registry lives in `features/referenceSalary/occupations.ts`.
- More implementation detail lives in `docs/wip/reference-salary-implementation.md`.

### Negotiation

- `app/negotiation/page.tsx` is client-only to allow `localStorage`.
- AI endpoints: `app/api/generate/{email|playbook}/route.ts` use the `ai` SDK + OpenAI.
- Prompt building and schemas live in `lib/prompts.ts` and `lib/schemas`.

## UI conventions

- Text comes from `lib/constants/text.ts` (single source of truth).
- Styling: Tailwind CSS v4 with CSS variables; light mode only.
- Atomic UI under `components/ui/*`; dashboard/layout composites live in `components/dashboard` and `components/layout`.

## Testing pointers

- Unit tests target domain/services/logic-heavy hooks (`bun run test`).
- E2E tests live in `tests/e2e` (Playwright, `bun run test:e2e`).
- See `docs/TESTING.md` for scope and commands.
