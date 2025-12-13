# Kjøpekraft Agent Instructions (Next.js App Router)

\*Last updated: **December 13, 2025\***

These instructions are tailored to **this repository’s architecture** (feature-based + layered: `domain/`, `services/`, `features/`, `components/`) and to the **actual toolchain** in `package.json`.

They also follow GitHub’s guidance for effective `agents.md`: put commands early, prefer real examples, be specific about the stack, and set clear boundaries. ([The GitHub Blog][1])

---

## Commands (run these first when relevant)

- **Dev:** `bun dev` (runs `next dev --turbopack`)
- **Build:** `bun run build`
- **Start:** `bun start`
- **Lint:** `bun run lint` / **Fix:** `bun run lint:fix`
- **Format:** `bun run format` / **Check:** `bun run format:check`
- **Typecheck:** `bun run typecheck`
- **Secrets scan:** `bun run secrets`
- **Dead code / unused exports:** `bun run knip`

---

## Stack (be explicit, use these versions)

- **Next.js:** `16.0.9` (App Router)
- **React:** `19.2.2`
- **TypeScript:** `5.9.3` (strict)
- **Tailwind CSS:** `4.x` (light theme only; design tokens via CSS variables)
- **Charts:** `chart.js 4.4.9`
- **Client caching:** `swr 2.3.3`
- **Validation:** `zod 4.1.13`
- **AI:** `ai 5.0.112` + `@ai-sdk/openai 2.0.85`
- **Runtime/PM:** **Bun**

---

## Project Structure (match the repo)

- `app/` — routing/layouts/pages + route handlers (`app/api/**/route.ts`)
- `services/` — **server-only data fetching**, cached via Next.js caching APIs
- `domain/` — **pure business logic** (no React, no I/O, no side effects)
- `features/` — feature modules (hooks + feature UI + feature utils)
- `components/` — reusable UI (Atomic design system under `components/ui/*`)
- `contexts/` — global providers (display/reference/drawer)
- `lib/` — shared utilities + shared models/types + `lib/constants/text.ts`
- `docs/` — architecture + functional docs

**Colocation rules**

- Feature-specific UI and hooks live in `features/<feature>/...`
- Shared UI primitives live in `components/ui/...`
- Cross-cutting pure logic must go to `domain/` (preferred) or `lib/` (shared utilities)

---

## Architecture Rules (do not break layering)

**Dependency direction**

- `domain/` depends on **nothing**
- `services/` depends on **domain only** (+ Next server-only utilities)
- `features/` depends on **domain**, shared UI, and `lib/` (avoid feature→feature imports)
- `components/` can depend on `features/` and `domain/`

**Never introduce feature→feature imports**. If logic is shared, move it into `domain/` or `lib/`.

---

## Data Fetching Rules (Kjøpekraft-specific)

- **Server Components:** call `services/*` directly (no internal API hop).
- **Client Components:** use `app/api/*` route handlers + SWR when caching is needed client-side.
- **API routes exist for client-side fetching only** (per repo architecture).

---

## Next.js App Router: Server/Client Component Integration

### Dynamic imports and `{ ssr: false }`

**Factual constraint:** `next/dynamic` with `{ ssr: false }` is **not supported inside Server Components**; Next.js will error and instruct you to move it to a Client Component. ([The GitHub Blog][1])

**Correct pattern (use in this repo)**

1. Put browser-only logic in a **Client wrapper** (`'use client'`).
2. If needed, do `dynamic(..., { ssr: false })` **inside the Client wrapper**.
3. Import the Client wrapper from `app/.../page.tsx`.

This preserves the repo’s “client-only page” approach for pages that rely heavily on `localStorage`.

---

## Caching (server-side)

In `services/*`, use Next’s server caching primitives (e.g., `"use cache"` and `cacheLife()` where appropriate) consistently for SSB/inflation data.

---

## Code Style & Conventions

- TypeScript everywhere, strict types, prefer `import type` for type-only imports.
- Naming:
  - Components: `PascalCase.tsx`
  - Hooks: `useXyz.ts`
  - Utilities: `camelCase.ts`
  - Context providers: `XyzProvider`

- UI text: **must** come from `lib/constants/text.ts` (single source of truth).
- Styling: Tailwind v4 + CSS variables; **no dark mode**.

---

## Testing Setup (current + expected)

- The repo is structured for testability (domain is pure), but automated tests may be sparse.
- When adding tests, prefer:
  - **domain/**: pure unit tests first (fast, deterministic)
  - hooks/components: test only critical flows

(If/when a test runner is added/standardized, align with the repo’s existing preferences and scripts.)

---

## Git Workflow Expectations (guardrails)

- Keep changes minimal and scoped to the request.
- Avoid refactors unless required to meet architecture rules (layering, boundaries, correctness).
- Preserve formatting (Prettier) and lint rules; run `bun run lint` + `bun run typecheck` when changing TS/React.

---

## Boundaries (must follow)

- **Never commit secrets**; respect `secretlint` rules and `.env.local` usage. ([The GitHub Blog][1])
- Do not add demo/example files unless explicitly requested.
- Do not introduce new dependencies unless necessary and justified.
- Do not move code across layers unless it improves correctness with the architecture rules (e.g., shared logic into `domain/`).

---

## Documentation Freshness Rule

When answering Next.js-specific questions (App Router, caching, Server/Client boundaries), consult **official Next.js documentation** first and align recommendations with **Next.js 16** behavior.
