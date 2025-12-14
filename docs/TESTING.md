# Testing Strategy

This repo follows a lean, layered test pyramid that avoids duplicating coverage across levels.

- **Unit & component (Vitest, `bun run test`)**: primary focus on `domain/**`, `services/**`, and logic-heavy hooks/utils in `features/**`. Fine-grained UI behavior (form defaults, validation, toggle states) lives here. Tests are colocated with code and use `happy-dom` + Testing Library for client hooks/components. Services mock `fetch`/Next cache primitives.
- **E2E (Playwright, `bun run test:e2e`)**: end-to-end user journeys and page wiring only. Keep assertions high-level (navigation, persistence, integration) and avoid field-by-field checks already covered by Vitest.

## What to Test (and What Not)

- **Do test**
  - Pure calculations in `domain/**`
  - Service fetch/mapping/error branches in `services/**`
  - Hooks/components with branching states (loading/error/toggle) in `features/**`—keep assertions narrow and keep these in Vitest
  - SSB mappers/schemas in `lib/ssb/**` and `lib/schemas/**`
- **Avoid**
  - Retesting flows already covered in Playwright (full forms, navigation)
  - Using Playwright for fine-grained component states (defaults, validation, single-field visibility) → keep these in Vitest
  - Snapshots of large UI trees; favor specific assertions
  - Presentational-only components (excluded from coverage)

## Coverage Scope

`vitest.config.ts` includes domain/services/features/libs and excludes presentational components/constants. Coverage is a signal for logic areas and component behavior; Playwright suites are reserved for user journeys.

## Patterns

- Colocate unit/component tests next to code (`*.test.ts[x]`).
- Mock I/O: `fetch`, `next/cache`, and cookies in services/actions.
- Keep fixtures small; prefer hand-written arrays/objects over factories.
- Client-only code that needs `window/localStorage`: use `happy-dom` (default) and wrap state updates in `act`.

## Commands

- Unit/coverage: `bun run test` / `bun run test -- --coverage`
- E2E (headless): `bun run test:e2e`
- E2E (UI/headed/debug): `bun run test:e2e:ui` / `bun run test:e2e:headed` / `bun run test:e2e:debug`
- Reports: `npx playwright show-report` after an E2E run
- Type/lint/format: `bun run typecheck` / `bun run lint` / `bun run format:check`

## E2E coverage snapshot (user journeys)

| Flow                            | Test file                                        | Focus                                                       |
| ------------------------------- | ------------------------------------------------ | ----------------------------------------------------------- |
| Onboarding + demo data          | tests/e2e/dashboard/onboarding.spec.ts           | Onboarding path and loading demo data                       |
| Salary management               | tests/e2e/dashboard/salary-management.spec.ts    | Add/edit salary points with reasons                         |
| Reason-based visualization      | tests/e2e/dashboard/reason-visualization.spec.ts | Event baselines toggle + persistence                        |
| Chart controls & view switching | tests/e2e/dashboard/chart-controls.spec.ts       | Net/gross toggle and graph/table/analysis views             |
| Reference salary selection      | tests/e2e/dashboard/reference-salary.spec.ts     | Switching to Stortinget reference and handling API failures |
| Data persistence                | tests/e2e/data-persistence/localstorage.spec.ts  | LocalStorage persistence across reloads                     |
| Mobile experience               | tests/e2e/mobile/responsive.spec.ts              | Mobile drawer/layout workflows                              |
| Smoke                           | tests/e2e/hello-world.spec.ts                    | Basic app health check                                      |

## Fast Start Checklist

1. Add/modify logic → write/adjust colocated unit test.
2. Run `bun run test` (or targeted `vitest run path/to/file.test.ts`).
3. If user flow changes → add/adjust Playwright spec (keep it high-level); keep field-level/component details in Vitest.
