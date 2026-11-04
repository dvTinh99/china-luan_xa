# Repository instructions for coding agents

## Start here

1. Read this file and the nearest nested `AGENTS.md` before editing.
2. Inspect the relevant implementation, package scripts, and git status. Do not assume a product or architecture document describes shipped behavior.
3. Trace a change across its owners: Nuxt UI, Nitro route, domain helper, Prisma model, shared contract, and Godot bridge as applicable.
4. Keep changes focused. Update the relevant documentation when behavior, an API, a schema, or a bridge contract changes.

## Project boundaries

- `apps/web` owns web UX and the Nitro backend. API handlers live in `apps/web/server/api`; shared server utilities live in `apps/web/server/utils`.
- `apps/game` is the Godot 4.6 presentation/gameplay client. It communicates through the bridge and backend-facing host flow; it must not access the database.
- `database/prisma/schema.prisma` defines persistent data. Use Prisma workflows and inspect migrations before changing schema.
- `packages/shared-types` defines bridge/shared types. `packages/api-contracts` defines selected API shapes. Keep TypeScript and GDScript bridge behavior aligned.
- `docs/PRD.md`, `docs/GDD.md`, design documents, and roadmaps include intended or future behavior. Verify implementation before claiming a capability exists.

## Non-negotiable invariants

- The server is authoritative for identity, ownership, learning evaluation, SRS state, progression, wallet, inventory, quest completion, combat results, and rewards.
- Treat browser and Godot payloads as untrusted input. Validate payloads and authorize ownership at the server boundary.
- Never accept client-calculated EXP, Gold, prices, damage, answer correctness, item ownership, or completion as authoritative.
- Make reward, purchase, and other replay-sensitive operations transactional and idempotent where applicable.
- Keep RPG character level separate from language proficiency.
- Do not put secrets or long-lived credentials in client bundles, bridge messages, URLs, or local storage.
- Preserve source assets and generated/runtime files according to `.gitignore`; do not delete assets as part of documentation cleanup.

## Commands

Run from the repository root unless noted:

```sh
npm install
npm run dev
npm run build
npm run typecheck
npm run db:generate
npm run db:push
npm run db:seed
```

`npm run lint` is currently a placeholder in `apps/web/package.json`; do not report it as a real lint pass. Check root and workspace `package.json` files for current commands. Godot workflows require the Godot 4.6 editor/CLI and are documented in `apps/game/README.md`.

## Change-specific checks

- Web/API: use the web workspace's `typecheck` and/or `build` when the change warrants it; inspect auth middleware and response conventions for route changes.
- Database: validate schema and migrations against `database/prisma/AGENTS.md`; do not edit generated Prisma output by hand.
- Game/bridge: inspect both `apps/game/autoload/Bridge.gd` and `packages/shared-types/src/bridge.ts`; verify web and editor/mock behavior when relevant.
- Docs-only changes: verify referenced paths exist, commands match package scripts, and statements about current behavior have a code source.

## Documentation precedence

For current behavior, use this order:

1. Executable implementation, Prisma schema, and versioned migration files (verify that migrations are tracked; current `.gitignore` excludes the migration directory).
2. Shared types/contracts that the implementation imports.
3. `docs/DECISIONS.md` for the rationale and status of accepted decisions.
4. Architecture/API/database/bridge references for explanatory documentation.
5. PRD, GDD, design files, prompts, and roadmap for intended or future behavior.

When sources conflict, follow the higher item, correct stale documentation in the same change when practical, and call out unresolved ambiguity. Do not silently rewrite decision history; append a dated/scope-labeled decision instead.

## Agent collaboration

Do not assume another agent's changes are disposable. Check `git status` before and after work, preserve unrelated edits, and avoid broad cleanup or generated-file churn. Prefer small, reviewable diffs and state what was verified in the handoff.
