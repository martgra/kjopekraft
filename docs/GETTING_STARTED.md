# Getting Started

This guide will help you set up and run the Kjøpekraft application locally.

## Prerequisites

Before you begin, ensure you have the following installed:

### Required

- **Bun** (v1.0.0 or higher) - [Installation Guide](https://bun.sh/docs/installation)

  ```bash
  # macOS/Linux
  curl -fsSL https://bun.sh/install | bash

  # Windows
  powershell -c "irm bun.sh/install.ps1|iex"
  ```

- **Git** - [Download](https://git-scm.com/downloads)

### Optional

- **Docker** - For containerized deployment
- **VS Code** - Recommended editor with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd kjopekraft
```

### 2. Install Dependencies

```bash
bun install
```

This will install all dependencies listed in `package.json`.

### 3. Set Up Environment Variables (Optional)

For AI-powered negotiation features, you need an OpenAI API key:

```bash
# Create .env.local file
touch .env.local

# Add your OpenAI API key
echo "OPENAI_API_KEY=your_openai_api_key_here" >> .env.local
```

**Note**: The app will work without this, but negotiation email/playbook generation will be disabled.

### 4. Start Development Server

```bash
bun dev
```

The application will start on [http://localhost:3000](http://localhost:3000).

You should see:

```
  ▲ Next.js 15.x
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Ready in 1.2s
```

## Development Workflow

### Running the App

```bash
# Development mode (with hot reload)
bun dev

# Production build
bun run build

# Start production server
bun start
```

### Code Quality Checks

Before committing code, run these commands:

```bash
# Lint code
bun run lint

# Auto-fix linting issues
bun run lint:fix

# Check code formatting
bun run format:check

# Auto-format all files
bun run format

# Type check
bun run typecheck

# Scan for secrets
bun run secrets
```

### Pre-commit Hooks

The project uses Husky for pre-commit hooks. These run automatically on `git commit`:

1. **Secret detection** - Scans for accidentally committed secrets
2. **Linting** - Auto-fixes ESLint issues
3. **Formatting** - Auto-formats with Prettier

If any check fails, the commit will be blocked.

### Manual Hook Setup

If hooks don't run automatically:

```bash
# Initialize Husky
bun run prepare

# Make hook executable (macOS/Linux)
chmod +x .husky/pre-commit
```

## Project Structure

After installation, your directory should look like this:

```
kjopekraft/
├── app/                 # Next.js App Router pages and API routes
├── components/          # Reusable UI components
├── features/            # Feature modules (salary, tax, inflation, etc.)
├── contexts/            # React Context providers
├── lib/                 # Utilities and constants
├── public/              # Static assets
├── docs/                # Documentation (you are here)
├── .husky/              # Pre-commit hooks
├── .next/               # Build output (generated)
├── node_modules/        # Dependencies (generated)
├── package.json         # Dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── next.config.ts       # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── .env.local           # Environment variables (optional, create manually)
```

## First Run

### Onboarding Experience

When you first open the app, you'll see an onboarding screen with two options:

1. **Try Demo Data**: Loads sample salary data (2020-2024) to explore features
2. **Add Your Own**: Scroll to the form to enter your real salary data

### Adding Salary Data

1. Navigate to the right panel (or scroll down on mobile)
2. Enter a year (e.g., 2024)
3. Enter annual salary in NOK (e.g., 650000)
4. Click "Legg til lønn"

The chart will update immediately showing:

- Your salary progression
- Inflation-adjusted values
- Comparison metrics

### Exploring Features

**Dashboard Features**:

- Toggle between Net (Netto) and Gross (Brutto) salary modes
- Enable reference salary comparison (currently nurses)
- View detailed metrics (real annual value, inflation impact)
- Filter time ranges (1Y, 3Y, ALL)

**Negotiation Tab** (requires OpenAI API key):

- Add negotiation arguments
- Enter job details and context
- Generate professional email
- Generate negotiation playbook
- Download as DOCX or copy as rich text

## Configuration

### Next.js Configuration

Edit `next.config.ts` to modify:

- Build settings
- Environment variables
- Experimental features
- Redirects/rewrites

### Tailwind Configuration

Edit `tailwind.config.ts` to customize:

- Colors
- Spacing
- Breakpoints
- Plugins

### TypeScript Configuration

Edit `tsconfig.json` to adjust:

- Compiler options
- Path aliases
- Type checking strictness

### ESLint Configuration

Edit `eslint.config.mjs` to modify:

- Linting rules
- Ignored files
- Plugins

## Environment Variables

The app uses the following environment variables:

| Variable         | Required | Description                               | Default  |
| ---------------- | -------- | ----------------------------------------- | -------- |
| `OPENAI_API_KEY` | No       | OpenAI API key for negotiation generation | -        |
| `NODE_ENV`       | Auto     | Environment (`development`, `production`) | Auto-set |

Create `.env.local` for local development:

```bash
# .env.local
OPENAI_API_KEY=sk-...your-key-here...
```

**Important**: Never commit `.env.local` to git. It's already in `.gitignore`.

## Common Issues & Solutions

### Port Already in Use

If port 3000 is occupied:

```bash
# Use different port
bun dev --port 3001
```

### Bun Not Found

Ensure Bun is in your PATH:

```bash
# Check Bun installation
bun --version

# Reinstall if needed
curl -fsSL https://bun.sh/install | bash
```

### Pre-commit Hook Errors

If hooks are failing:

```bash
# Run checks manually
bun run lint:fix
bun run format
bun run typecheck

# Re-initialize Husky
rm -rf .husky
bun run prepare
```

### Type Errors

TypeScript may show errors if packages are outdated:

```bash
# Clear cache and reinstall
rm -rf node_modules bun.lockb
bun install
```

### Chart Not Rendering

Ensure you have data points added:

- At least one salary entry is required
- Years must be within inflation data range (typically 1900+)

### AI Generation Not Working

Check OpenAI API key:

```bash
# Verify .env.local exists
cat .env.local

# Ensure key starts with sk-
# Restart dev server after adding key
```

## Development Tools

### Recommended VS Code Extensions

Install these for the best development experience:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code Settings

Add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

### Browser DevTools

**React DevTools**:

- Install: [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)
- Inspect component tree
- View props and state
- Profile performance

**Network Tab**:

- Monitor API calls
- Check SSB data fetching
- Verify caching behavior

## Testing (Future)

Currently, the project has no automated tests, but the architecture supports testing:

### Planned Test Setup

```bash
# Install test dependencies (when ready)
bun add -d vitest @testing-library/react @testing-library/jest-dom

# Run tests (future)
bun test

# Run tests in watch mode
bun test:watch

# Run E2E tests
bun test:e2e
```

### Test Structure (Planned)

```
tests/
├── unit/              # Unit tests for utilities
├── integration/       # Integration tests for features
└── e2e/               # End-to-end tests
```

See [ARCHITECTURE.md](ARCHITECTURE.md#testing-strategy) for testing strategy.

## Building for Production

### Local Production Build

```bash
# Create production build
bun run build

# Start production server
bun start
```

The build process:

1. Compiles TypeScript
2. Bundles with Next.js
3. Optimizes assets
4. Generates static pages where possible

### Docker Build

```bash
# Build Docker image
docker build -t kjopekraft .

# Run container
docker run -p 3000:3000 kjopekraft
```

### Production Checklist

Before deploying:

- [ ] All tests pass (when implemented)
- [ ] No TypeScript errors (`bun run typecheck`)
- [ ] No linting errors (`bun run lint`)
- [ ] Code is formatted (`bun run format:check`)
- [ ] No secrets in code (`bun run secrets`)
- [ ] Environment variables configured
- [ ] Build succeeds (`bun run build`)

## Next Steps

### Explore Documentation

- **[Architecture](ARCHITECTURE.md)** - Technical architecture and design patterns
- **[Functional Description](FUNCTIONAL_DESCRIPTION.md)** - Features and user workflows
- **[CI/CD Pipeline](ci-cd-pipeline.md)** - Deployment and quality checks
- **[Reference Salary Implementation](reference-salary-implementation.md)** - SSB integration details

### Start Developing

1. **Read the codebase**:
   - Start with `app/page.tsx` (main entry point)
   - Explore `components/dashboard/Dashboard.tsx` (main UI)
   - Check `features/salary/hooks/useSalaryData.ts` (core logic)

2. **Make your first change**:
   - Update text in `lib/constants/text.ts`
   - Add a new metric in `MetricGrid.tsx`
   - Modify chart colors in `lib/chartjs.ts`

3. **Follow the principles**:
   - Review [copilot-instructions.md](../.github/copilot-instructions.md)
   - Follow the feature-based structure
   - Add text to constants
   - Update [project-description.md](project-description.md) after changes

## Getting Help

### Documentation

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chart.js Documentation](https://www.chartjs.org/docs)
- [Bun Documentation](https://bun.sh/docs)

### Project Resources

- **Architecture**: See [ARCHITECTURE.md](ARCHITECTURE.md)
- **Features**: See [FUNCTIONAL_DESCRIPTION.md](FUNCTIONAL_DESCRIPTION.md)
- **Project History**: See [project-description.md](project-description.md)

### Common Commands Reference

```bash
# Development
bun dev                    # Start dev server
bun run build              # Build for production
bun start                  # Start production server

# Code Quality
bun run lint               # Check linting
bun run lint:fix           # Fix linting issues
bun run format             # Format all files
bun run format:check       # Check formatting
bun run typecheck          # Check TypeScript types
bun run secrets            # Scan for secrets

# Dependencies
bun install                # Install dependencies
bun add <package>          # Add dependency
bun add -d <package>       # Add dev dependency
bun remove <package>       # Remove dependency

# Other
bun run prepare            # Setup Husky hooks
```

---

**Ready to start?** Run `bun dev` and open [http://localhost:3000](http://localhost:3000)!
