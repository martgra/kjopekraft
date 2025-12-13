# Testing Strategy

This repo follows a lean, layered test pyramid that avoids duplicating coverage across levels.

- **Unit (Vitest, `bun run test`)**: primary focus on `domain/**`, `services/**`, and logic-heavy hooks/utils in `features/**`. Tests are colocated with code and use `happy-dom` + Testing Library for client hooks/components. Services mock `fetch`/Next cache primitives.
- **E2E (Playwright, `bun run test:e2e`)**: user journeys and page wiring only. No re-testing of pure calculations or API mappers already covered by unit tests.

## Commands

- Unit/coverage: `bun run test` / `bun run test -- --coverage`
- E2E: `bun run test:e2e` (see `tests/e2e` for structure)
- Type/lint/format: `bun run typecheck` / `bun run lint` / `bun run format:check`

## What to Test (and What Not)

- **Do test**
  - Pure calculations in `domain/**`
  - Service fetch/mapping/error branches in `services/**`
  - Hooks/components with branching states (loading/error/toggle) in `features/**`—keep assertions narrow
  - SSB mappers/schemas in `lib/ssb/**` and `lib/schemas/**`
- **Avoid**
  - Retesting flows already covered in Playwright (full forms, navigation)
  - Snapshots of large UI trees; favor specific assertions
  - Presentational-only components (excluded from coverage)

## Coverage Scope

`vitest.config.ts` includes domain/services/features/libs and excludes presentational components/constants. Coverage is a signal for logic areas, not a goal for UI.

## Patterns

- Colocate unit tests next to code (`*.test.ts[x]`).
- Mock I/O: `fetch`, `next/cache`, and cookies in services/actions.
- Keep fixtures small; prefer hand-written arrays/objects over factories.
- Client-only code that needs `window/localStorage`: use `happy-dom` (default) and wrap state updates in `act`.

## Fast Start Checklist

1. Add/modify logic → write/adjust colocated unit test.
2. Run `bun run test` (or targeted `vitest run path/to/file.test.ts`).
3. If user flow changes → add/adjust Playwright spec instead of duplicating in unit tests.
