# Prisma and database instructions

Read the repository [AGENTS.md](../../AGENTS.md) first.

## Sources and workflow

- `schema.prisma` is the authoritative model/provider definition. The configured datasource is PostgreSQL.
- `migrations/` is currently ignored by `.gitignore` in this checkout. Do not assume local migration files are versioned or reproducible; resolve this repository policy before relying on migrations for shared schema evolution.
- `dbProvider.mjs` prepares the datasource configuration for repository database scripts. Use the root `db:*` scripts where possible.
- Seed scripts are data operations; inspect target/provider and effects before running them against non-disposable databases.
- `generated/`, Prisma client output, and `dev.db` are generated/local state, not manual schema sources.

## Rules

- Preserve user ownership relations and indexes; keep wallet transactions auditable and durable.
- Make multi-row economy/reward updates transactional and protect replay-sensitive operations with unique constraints/idempotency as appropriate.
- Do not put domain rules only in client code. Coordinate schema changes with server routes/utilities, contracts, seeds, and `docs/DATABASE.md`.
- Do not edit generated Prisma client files by hand. Use `npm run db:generate` after schema changes.
- For schema evolution, create a reproducible migration using the repository's documented Prisma workflow; do not treat `db push` as a substitute for a committed migration in shared environments.

## Checks

Use `npm run db:generate` to regenerate the Prisma client. Validate migrations against a disposable/local database before relying on them. Check `DATABASE_URL` and provider setup before any command that changes data.
