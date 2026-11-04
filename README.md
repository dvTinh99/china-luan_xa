# LinguaWorld

LinguaWorld is a Mandarin-learning application with a cozy 2D RPG presentation. Learning sessions and review history support language learning; character progression, inventory, quests, and the Godot world provide motivation and context.

## Current implementation

- `apps/web`: Nuxt 3.14.1592 with Nuxt 4 compatibility conventions, Vue, TypeScript, Tailwind, and Nitro server routes.
- `apps/game`: Godot 4.6 project using the Compatibility renderer; a browser Canvas fallback is also present in `apps/web/public/game/`.
- `database/prisma`: Prisma schema configured for PostgreSQL plus seed/provider scripts. The migration directory is ignored by the current `.gitignore`; confirm migration files are tracked before relying on them for reproducible schema evolution.
- `packages/shared-types` and `packages/api-contracts`: shared bridge and API TypeScript contracts.
- Implemented areas include authentication, learning sessions, SRS, character, wallet, inventory, shop, quests, combat, game bootstrap, audio operations, and chakra progression. The exact available endpoints are listed in [API documentation](docs/API.md).

See [AGENTS.md](AGENTS.md) before making code changes. It explains repository boundaries, security invariants, commands, and which sources are authoritative.

## Requirements

- Node.js 20 or newer; npm 10.9.0 as declared by the repository.
- PostgreSQL for the configured Prisma datasource.
- Godot 4.6 for editing/running/exporting the native game project.
- Copy `.env.example` to `.env` and set local credentials and service configuration. Never commit secrets.

## Common commands

```sh
npm install
npm run dev
npm run typecheck
npm run build
n```

Database helpers:

```sh
npm run db:generate
npm run db:push
npm run db:seed
npm run db:studio
```

## Cloudflare Pages

The Nuxt server build imports Prisma clients from the ignored
`database/prisma/generated/` directory. This is an npm workspace, so configure
Cloudflare Pages with `apps/web` as its root directory. Run the build from that
project directory so Cloudflare detects Nuxt in the app rather than the
workspace root:

```sh
npm run build:cloudflare-pages
```

Set the build output directory to `dist`. The workspace-local build command
generates the Prisma clients from the repository root before building Nuxt.

Set `DATABASE_URL` and the other server secrets in Cloudflare Pages settings;
do not commit production credentials. The build command generates both
SQLite and PostgreSQL Prisma clients and does not connect to the production
database.

See root `package.json` and `database/prisma/package.json` for the exact scripts. `npm run lint` is currently a placeholder in the web workspace, not a configured lint check. For Godot, open `apps/game/project.godot`; export settings are in `apps/game/export_presets.cfg`.

## Repository map

| Path | Purpose |
| --- | --- |
| `apps/web/app` | Nuxt pages, components, composables, and client services |
| `apps/web/server/api` | Nitro API route handlers |
| `apps/web/server/utils` | Server-side auth, Prisma, SRS, quest, audio, and domain helpers |
| `apps/game` | Godot project, scripts, scenes, and character exports |
| `packages/shared-types` | Bridge protocol and shared types/enums |
| `packages/api-contracts` | Shared API request/response contracts |
| `database/prisma` | Prisma schema, migrations, provider helper, and seed scripts |
| `docs` | Product, architecture, API, data, bridge, learning, and decision records |
| `character`, `assets`, `design-system`, root art files | Character production, design references, and source assets |

## Documentation map

- See the [documentation index](docs/README.md) for the complete guide map.
- [Architecture](docs/ARCHITECTURE.md) — implemented boundaries and technical baseline.
- [API](docs/API.md) — route inventory and security expectations.
- [Database](docs/DATABASE.md) — current Prisma models and data invariants.
- [Game bridge](docs/GAME_BRIDGE.md) — typed Nuxt ↔ Godot messages.
- [Decisions](docs/DECISIONS.md) — accepted decisions and implementation notes.
- [Roadmap](docs/ROADMAP.md) — delivered capabilities and remaining product direction.
- [Product requirements](docs/PRD.md), [game design](docs/GDD.md), [learning content](docs/LEARNING_CONTENT.md).
- Specialized references: [UX/UI](UX-UI.md), [audio](Audio_system.md), [design system](design-system/linguaworld/MASTER.md), and [character production](character/CHARACTER_PRODUCTION_PLAN.md).

## Status and source of truth

This repository contains a working implementation plus future-facing product/design documents. A feature mentioned in a PRD or roadmap is not necessarily implemented. For current behavior, inspect code first; for persistent data use `database/prisma/schema.prisma`; for bridge shapes use `packages/shared-types/src/bridge.ts`; for API contracts use the relevant route and `packages/api-contracts`. Current auth demo fallback and bridge caveats are documented in [Architecture](docs/ARCHITECTURE.md) and [Game bridge](docs/GAME_BRIDGE.md). See [AGENTS.md](AGENTS.md) for precedence rules.
