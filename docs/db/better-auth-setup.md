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

```bash
npx @better-auth/cli migrate
```

or

```bash
bunx @better-auth/cli migrate
```

## Notes

- Ensure `DATABASE_URL` points at your Neon Postgres instance.
- The CLI uses your `better-auth` config (see `lib/auth.ts`) to infer table names and columns.
- Keep credits tables in `docs/db/credits-schema.sql` applied separately.
