# Testing and Selectors Guide

## Layout and Commands

- **Unit/Component/Domain/Services tests:** `tests/` (e.g., `tests/components/*`, `tests/features/*`, `tests/domain/*`, `tests/services/*`).
- **E2E (Playwright):** `tests/e2e/*` with shared fixtures in `tests/fixtures/*`.
- **Commands:**
  - `bunx vitest` — unit/component tests
  - `bun run test:e2e` — Playwright suite
  - `bunx tsc --noEmit` — typecheck
  - Note: Playwright starts its own dev server on `PLAYWRIGHT_PORT` (default `3100`) to avoid clashing with a local `bun dev`, and uses a separate cache dir (`.next-playwright`) so lockfiles don’t collide. Override with `PLAYWRIGHT_PORT=<port>`.

## Selector Conventions (`createTestId`)

- Use hierarchical `data-testid` via `createTestId` to keep selectors stable:
  - `chart-view-switcher-option-{graph|table|analysis}`
  - `chart-section-open-settings`, `chart-settings-modal-container`
  - `chart-settings-mode-toggle` (Brutto/Netto), `chart-settings-inflation-base-select` (numeric input; accepts pay-point years or "auto")
  - `chart-settings-modal-occupation-select`
  - `salary-form-*` (amount-input, year-input, reason-select, note-input, submit-button)
- Prefer these test IDs over text labels for Playwright/Testing Library stability.

## Chart Controls Placement

- Net/gross toggle, event baselines toggle, and reference occupation selector now live **only** in the chart settings modal (opened via `chart-section-open-settings`). The chart header keeps just the view switcher + settings button.
- Granular behavior of these toggles (labels, callbacks, persistence) is covered in component/hook tests; E2E specs stick to modal visibility and end-to-end user flows.

## Organization Rules (recap)

- Keep business logic in `domain/` and `services/`; UI and hooks in `components/`/`features/`.
- Co-locate feature UI in its feature folder, but keep tests centralized under `tests/` as above.
- Dashboard and negotiation components expect `SalaryDataProvider` + `PurchasingPowerBaseProvider`; use existing test fixtures/helpers to wrap them when rendering.
