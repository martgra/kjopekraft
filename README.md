# Kjøpekraft - Salary & Inflation Tracker

A Next.js web application that helps users track their salary development over time and compare it against inflation data. Built specifically for the Norwegian market with accurate tax calculations and SSB (Statistics Norway) integration.

## What Does It Do?

Kjøpekraft allows you to:

- **Track Salary Development**: Add salary data points across multiple years and visualize your income progression
- **Compare Against Inflation**: See how your purchasing power has changed over time using official Norwegian inflation data
- **Net vs Gross Mode**: Toggle between gross salary and net income (after Norwegian tax calculations)
- **Reference Benchmarks**: Compare your salary against industry standards (currently supports nurses with SSB data)
- **Negotiation Preparation**: Generate professional negotiation emails and playbooks based on your salary data and arguments
- **Mobile Optimized**: Fully responsive design with mobile-first approach

## Quick Start

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Open http://localhost:3000
```

The app will load with an onboarding screen. You can try the demo data or add your own salary information.

## Tech Stack

- **Framework**: Next.js 15 with App Router and Server Components
- **Language**: TypeScript
- **Styling**: Tailwind CSS with CSS Modules
- **Charts**: Chart.js
- **Data Fetching**: SWR
- **AI Generation**: Vercel AI SDK with OpenAI
- **Package Manager**: Bun

## Documentation

- **[Getting Started](docs/GETTING_STARTED.md)** - Installation, configuration, and development workflow
- **[Architecture](docs/ARCHITECTURE.md)** - Technical architecture, folder structure, and design patterns
- **[Functional Description](docs/FUNCTIONAL_DESCRIPTION.md)** - Features, user workflows, and business logic
- **[CI/CD Pipeline](docs/ci-cd-pipeline.md)** - Quality checks and deployment process
- **[Reference Salary Implementation](docs/reference-salary-implementation.md)** - SSB integration guide

## Project Structure

```
/app                 # Next.js App Router pages and API routes
/components          # Reusable UI components (atoms, molecules, organisms)
/features            # Feature modules (salary, tax, inflation, visualization, negotiation)
/contexts            # React context providers (display mode, reference mode)
/lib                 # Utilities, constants, and shared models
/docs                # Documentation
```

## Features Overview

- ✅ Salary tracking with multi-year data entry
- ✅ Norwegian inflation data integration (SSB)
- ✅ Accurate Norwegian tax calculations (2024 rates)
- ✅ Net/Gross salary mode toggle
- ✅ Reference salary comparison (nurses)
- ✅ Interactive charts (desktop & mobile optimized)
- ✅ AI-powered negotiation email & playbook generation
- ✅ Data persistence in localStorage
- ✅ Onboarding with demo data
- ✅ Mobile-first responsive design

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
