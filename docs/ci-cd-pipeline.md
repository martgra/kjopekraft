# CI/CD Pipeline Documentation

This repository uses GitHub Actions to automate quality checks and deployments.

## CI Pipeline (Pull Requests)

The CI pipeline runs on every pull request and push to `main` and `develop` branches. It ensures code quality and prevents regressions.

### Jobs

#### 1. Secret Detection (`secret-scan`)

- **Tool**: [Gitleaks](https://github.com/gitleaks/gitleaks)
- **Purpose**: Scans the codebase for accidentally committed secrets, API keys, tokens, and credentials
- **When**: Runs on all PRs and pushes
- **Configuration**: Uses default Gitleaks rules

#### 2. Lint & Format (`lint-and-format`)

- **Tools**: ESLint, Prettier
- **Purpose**: Ensures code follows style guidelines and best practices
- **Checks**:
  - `bun run lint` - ESLint checks for code quality issues
  - `bun run format:check` - Prettier verifies all files are formatted correctly
- **Fix locally**: Run `bun run lint:fix` and `bun run format` to auto-fix issues

#### 3. Build Check (`build`)

- **Purpose**: Verifies the application builds successfully
- **Checks**:
  - Runs `bun run build` to create production build
  - Verifies `.next` directory is created
- **Why**: Catches build-time errors before they reach production

#### 4. Type Check (`typecheck`)

- **Tool**: TypeScript compiler
- **Purpose**: Validates all TypeScript types are correct
- **Command**: `bunx tsc --noEmit`
- **Why**: Catches type errors that could cause runtime issues

#### 5. CI Success (`ci-success`)

- **Purpose**: Summary job that requires all checks to pass
- **Why**: Provides a single status check for branch protection rules

### Branch Protection

We recommend enabling the following branch protection rules for `main`:

1. Require pull request before merging
2. Require status checks to pass:
   - `secret-scan`
   - `lint-and-format`
   - `build`
   - `typecheck`
   - `ci-success`
3. Require conversation resolution before merging

## Deployment Pipeline

The deployment pipeline (`deployment.yml`) runs on pushes to `main` and deploys to Azure App Service.

### Requirements

The following secrets and variables must be configured in GitHub:

**Secrets**:

- `AZURE_CREDENTIALS` - Azure service principal credentials for authentication

**Variables**:

- `AZURE_APP_NAME` - Name of the Azure App Service

### Jobs

1. **Build & Push Docker Image**
   - Builds Docker image from the repository
   - Pushes to GitHub Container Registry (ghcr.io)
   - Tagged with commit SHA for versioning

2. **Deploy to Azure**
   - Uses Azure Web Apps Deploy action
   - Deploys the built Docker image

## Local Development

### Running Checks Locally

Before pushing code, run these commands to ensure CI will pass:

```bash
# Install dependencies
bun install

# Run all checks
bun run lint          # Check for code issues
bun run format:check  # Check formatting
bun run typecheck     # Check TypeScript types
bun run secrets       # Check for secrets
bun run build         # Verify build works

# Auto-fix issues
bun run lint:fix      # Fix linting issues
bun run format        # Format all files
```

### Pre-commit Hooks

This repository uses **Husky** and **lint-staged** for automated pre-commit checks:

**What runs on every commit:**

1. **Secret Detection** with secretlint
   - Scans all files for secrets before commit
   - Configured in `.secretlintrc.json`
   - Ignores files listed in `.secretlintignore` (e.g., `.env.local`)

2. **ESLint** - Automatically fixes linting issues on staged `.js`, `.jsx`, `.ts`, `.tsx` files

3. **Prettier** - Automatically formats staged files including:
   - JavaScript/TypeScript files
   - Markdown files
   - JSON, YAML, CSS, HTML files

**Configuration files:**

- `.husky/pre-commit` - Pre-commit hook script
- `.lintstagedrc.mjs` - Lint-staged configuration

**Bypass pre-commit hooks** (not recommended):

```bash
git commit --no-verify -m "message"
```

## Troubleshooting

### CI Fails on Lint

```bash
# Run lint locally to see errors
bun run lint

# Auto-fix many issues
bun run lint:fix
```

### CI Fails on Format

```bash
# Check which files need formatting
bun run format:check

# Auto-format all files
bun run format
```

### CI Fails on Type Check

```bash
# See type errors
bun run typecheck

# Type errors must be fixed manually by correcting the code
```

### CI Fails on Secret Scan

If secretlint detects a secret:

1. **Never commit secrets** - Remove the secret from the file
2. **Rotate the secret** - If it was committed, consider it compromised
3. **Use environment variables** - Store secrets in GitHub Secrets or `.env.local`
4. **Update .secretlintignore** - Only if it's a false positive

```bash
# Test locally
bun run secrets

# Check specific files
bunx secretlint path/to/file.ts
```

### CI Fails on Build

```bash
# Run build locally to debug
bun run build

# Check for:
# - Import errors
# - Missing dependencies
# - TypeScript errors in build
```

## Maintenance

### Updating Dependencies

```bash
# Update all dependencies
bun update

# Run all checks after update
bun run lint && bun run format:check && bun run typecheck && bun run build
```

### Adding New Checks

To add a new check to the CI pipeline:

1. Edit `.github/workflows/ci.yml`
2. Add your new job following the existing pattern
3. Update the `ci-success` job's `needs` array to include your new job
4. Update this documentation

## Performance

- **Average CI time**: ~3-5 minutes
- **Jobs run in parallel** when possible
- **Caching**: Bun dependencies are cached automatically
- **Optimization**: Using Bun for faster installs

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Gitleaks Documentation](https://github.com/gitleaks/gitleaks)
- [ESLint Rules](https://eslint.org/docs/rules/)
- [Prettier Configuration](https://prettier.io/docs/en/configuration.html)
