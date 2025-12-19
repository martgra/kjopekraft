# Better Auth DB Setup (Neon/Postgres)

Better Auth requires database tables for users and OAuth accounts even when sessions are JWT-based.

## Generate schema with Better Auth CLI

From the repo root:

```bash
npx @better-auth/cli generate
```

If you prefer Bun:

```bash
bunx @better-auth/cli generate
```

## Apply migrations

### Option 1: Using the migration script (Recommended)

The project includes a migration script that can be run locally or in production:

```bash
bun run db:migrate:better-auth
```

This script:
- Reads migration files from `better-auth_migrations/`
- Applies them to the database specified by `DATABASE_URL`
- Handles cases where tables already exist gracefully

### Option 2: Using Better Auth CLI

```bash
npx @better-auth/cli migrate
```

or

```bash
bunx @better-auth/cli migrate
```

## Deployment

Migrations are automatically applied during deployment via the GitHub Actions workflow:
- `bun run db:migrate` - Runs Drizzle migrations
- `bun run db:migrate:better-auth` - Runs Better Auth migrations

## Notes

- Ensure `DATABASE_URL` points at your Neon Postgres instance.
- The CLI uses your `better-auth` config (see `lib/auth.ts`) to infer table names and columns.
- Keep credits tables in `docs/db/credits-schema.sql` applied separately.
