# Web application instructions

Read the repository [AGENTS.md](../../AGENTS.md) first.

## Ownership and layout

- `app/pages`: route-level Vue pages; `app/components`: reusable UI; `app/composables`: client-side state and integrations.
- `app/services`: browser-facing service/adapters such as character rendering.
- `server/api`: Nitro handlers; file names define HTTP method and route. `server/middleware/auth.ts` resolves sessions; `server/utils` contains reusable server logic.
- `i18n/locales`: localized copy. Preserve the existing English/Vietnamese locale structure when changing user-facing strings.

## Rules

- Keep server-only secrets and Prisma access in server code. UI code must call APIs rather than importing server utilities.
- Authenticate and authorize every user-owned operation. Validate incoming bodies/query values at the handler boundary and use the established response/error helpers.
- Keep economy, learning evaluation, SRS scheduling, quest progress, and combat outcomes server-authoritative.
- For API changes, update route behavior and any matching API/shared types plus `docs/API.md`.
- For game bootstrap/bridge behavior, inspect `app/composables/useGameBridge.ts`, `/api/game/bootstrap`, `packages/shared-types/src/bridge.ts`, and the Godot bridge.
- For UI changes, follow `UX-UI.md` and `design-system/linguaworld/MASTER.md` where applicable.

## Checks

Available workspace commands are `npm run typecheck --workspace=@linguaworld/web` and `npm run build --workspace=@linguaworld/web`. The web `lint` script is a placeholder. Check the root package scripts before selecting a command.
