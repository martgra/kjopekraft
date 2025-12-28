# Kjøpekraft – Salary & Inflation Tracker

A Next.js 16 (App Router) web app that helps Norwegian users track salary development, compare against inflation, and prepare negotiation material with SSB-backed data.

## What It Does

- Track salary points across years with net/gross toggle and inflation adjustment
- Compare against SSB reference salary (nurses, extendable) and view real purchasing power
- Generate negotiation emails/playbooks (OpenAI key optional)
- Mobile-first dashboard with responsive charts and persistent localStorage data

## Quick Start

```bash
bun install
bun dev
# open http://localhost:3000
```

The app loads with onboarding; try demo data or add your own.

## Tech Stack

- **Next.js** 16 (App Router, RSC) with React 19
- **TypeScript** 5.9, **Bun** runtime/PM
- **Tailwind CSS** 4 (CSS variables, light + dark themes)
- **Chart.js** 4.4, **SWR** 2 for client caching
- **AI**: `ai` SDK + `@ai-sdk/openai`

## Documentation

- **Architecture**: `docs/ARCHITECTURE.md`
- **Functional description**: `docs/FUNCTIONAL_DESCRIPTION.md`
- **Testing** (unit + E2E): `docs/TESTING.md`
- **Reference salary details (WIP)**: `docs/wip/reference-salary-implementation.md`

## Project Structure

```
/app          # Routes (App Router) + API handlers
/components   # Reusable UI (dashboard, layout, ui atoms/molecules/organisms)
/features     # Feature modules (salary, tax, reference salary, negotiation, onboarding, visualization)
/contexts     # Global providers (display mode, reference mode, drawer)
/domain       # Pure business logic (tax/salary/inflation/reference)
/services     # Server-only data fetching (inflation, storting reference)
/lib          # Shared utilities, constants, schemas, prompts, chart config
/docs         # Documentation
```

## Development Commands

- Dev server: `bun dev` (Turbopack)
- Build/start: `bun run build` / `bun start`
- Quality: `bun run lint` · `bun run format:check` · `bun run typecheck`
- Tests: `bun run test` (Vitest for logic + component behavior) · `bun run test:e2e` (Playwright user journeys only)

## Development

```bash
# Development server with Turbopack
bun dev

# Build for production
bun build

# Start production server
bun start

# Run linting
bun run lint

# Format code
bun run format

# Type check
bun run typecheck

# Unit tests (Vitest)
bun run test              # Run all unit tests
bun run test:watch        # Run tests in watch mode
bun run test:coverage     # Run tests with coverage report
bun run test:ui           # Run tests with Vitest UI

# E2E tests (Playwright)
bun run test:e2e          # Run E2E tests (headless)
bun run test:e2e:headed   # Run E2E tests (headed browser)
bun run test:e2e:ui       # Run E2E tests with Playwright UI
bun run test:e2e:debug    # Run E2E tests in debug mode
# Note: Playwright starts the dev server with Node for stability. Set PLAYWRIGHT_USE_BUN=true if you explicitly want Bun. If port 3000 is busy, set PLAYWRIGHT_PORT=3001 (or any free port).

# IMPORTANT: Use "bun run test", NOT "bun test"
# "bun test" uses Bun's native test runner (not configured for this project)
# "bun run test" uses Vitest (properly configured with browser mocking)
```

## Contributing

All code must pass CI checks before merging:

- Secret detection (Gitleaks)
- Linting (ESLint)
- Formatting (Prettier)
- Type checking (TypeScript)
- Build verification

Pre-commit hooks automatically run linting and formatting on staged files.

## License

[Add your license here]

---

For detailed technical documentation, see [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
