# Nitro API reference

**Status:** Route inventory verified against `apps/web/server/api` on 2026-11-04. This is an index, not a substitute for handler behavior or request validation. Route files and their schemas are authoritative.

## Conventions

- API handlers are Nuxt Nitro routes under `apps/web/server/api`; filename suffixes (`.get.ts`, `.post.ts`) define methods and bracketed directories define route parameters.
- `apps/web/server/middleware/auth.ts` and `apps/web/server/utils/auth.ts` implement session resolution. Read the specific handler to determine whether authentication is required; the route inventory alone does not imply public/private status.
- The current middleware may attach the `demo-user-001` user to requests without a valid session when that row exists. Do not mistake a non-null `event.context.user` for proof of authenticated identity until this fallback is addressed or explicitly intended.
- Shared helpers are in `apps/web/server/utils/response.ts` and `apps/web/server/utils/prisma.ts`. Follow the response/error shape used by the handler being changed.
- Validate all client input and authorize user-owned records on the server. Never accept client-calculated learning correctness, rewards, prices, combat damage, or ownership as authoritative.
- Contracts are incomplete: `packages/api-contracts` currently defines auth and game bootstrap shapes only. Do not treat this file as a complete OpenAPI specification.

## Implemented route inventory

| Area | Methods and paths |
| --- | --- |
| Auth | `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` |
| Database / chakra status | `GET /api/db/status`, `GET /api/chakra/status` |
| Game | `GET /api/game/bootstrap` |
| Learning | `GET /api/learning/courses`, `GET /api/learning/lessons/:lessonId`, `GET /api/learning/radicals`, `POST /api/learning/sessions`, `POST /api/learning/sessions/:sessionId/answers`, `POST /api/learning/sessions/:sessionId/complete` |
| SRS | `GET /api/srs/due`, `POST /api/srs/reviews`, `GET /api/srs/statistics` |
| Character | `GET /api/character`, `POST /api/character`, `GET /api/character/profile`, `POST /api/character/appearance` |
| Wallet | `GET /api/wallet`, `GET /api/wallet/transactions` |
| Inventory | `GET /api/inventory`, `POST /api/inventory/equip`, `POST /api/inventory/unequip`, `POST /api/inventory/use` |
| Shop | `GET /api/shop/items`, `POST /api/shop/purchase` |
| Quests | `GET /api/quests`, `POST /api/quests/claim` |
| Combat | `POST /api/combat/start`, `POST /api/combat/action` |
| Audio | `GET /api/audio/:id`, `GET /api/audio/resolve`, `GET /api/audio/stream`, `GET /api/audio/voices`; audio jobs: `GET/POST /api/audio/jobs`, `GET /api/audio/jobs/:id`, `POST /api/audio/jobs/:id/retry`; audio assets: `GET /api/audio/assets`, `POST /api/audio/assets/:id/approve`, `POST /api/audio/assets/:id/publish`, `POST /api/audio/assets/:id/regenerate` |

The inventory above is generated from current route filenames. Confirm semantics, body fields, permissions, and status codes in the specific handler before integrating or documenting a contract.

## Security and data rules

- Authenticate private operations and scope database reads/writes to the current user.
- Use server-side catalog values for shop pricing. Use transactions for wallet/inventory mutations.
- Learning answers are evaluated on the server. Completion must validate session state and prevent duplicate reward grants.
- SRS scheduling and due dates are computed on the server through the SRS domain helper.
- Game and combat inputs are requests; verify access and allowed state transitions server-side.
- Audio generation, approval, and publishing are privileged content operations; inspect route-specific authorization before use.

## Adding or changing routes

1. Define and validate the request at the server boundary.
2. Enforce authentication, ownership, and domain invariants in the handler/domain helper.
3. Use a database transaction for coupled persistence changes and idempotency for retryable reward/purchase operations.
4. Update `packages/api-contracts` when a shared request/response contract is introduced or changed.
5. Update this inventory and relevant `docs/DATABASE.md` or `docs/GAME_BRIDGE.md` when applicable.
