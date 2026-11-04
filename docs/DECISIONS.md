# LinguaWorld — Architecture Decisions & Log

This document records architectural decisions, prototype findings, browser compatibility notes, and open questions across development phases.

## How to read this log

Entries below preserve the decision record as originally written; their “implemented” status and claims are historical assertions, not a fresh audit of current behavior. For current behavior, inspect source and use `docs/ARCHITECTURE.md`, `docs/API.md`, and `docs/GAME_BRIDGE.md`. In particular, current auth middleware has a demo-user fallback, bridge declarations/runtime payloads are not fully aligned, and `.gitignore` excludes `database/prisma/migrations/`. Treat these as current implementation caveats until resolved in code and verified.

---

## ADR-001: Monorepo Structure & Package Boundaries (Phase 0)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  LinguaWorld consists of a web client/application (Nuxt 4), a 2D RPG game client (Godot 4), a server API with backend domain logic, and a PostgreSQL database. We require clear boundaries, shared type definitions, and versioned message contracts without introducing microservices.
- **Decision:**
  - Standard npm workspaces with Turborepo orchestration:
    - `apps/web`: Nuxt 4 (Vue 3 + Tailwind CSS + Nitro backend modular monolith).
    - `apps/game`: Godot 4.6 project (scenes, scripts, assets, web export preset).
    - `packages/shared-types`: Bridge message envelopes, event enums, and API response envelopes.
    - `packages/api-contracts`: Strongly typed REST request/response contracts (`User`, `GameBootstrapResponse`, etc.).
    - `database/prisma`: PostgreSQL schema and Prisma migrations.
- **Consequences:**
  - Clean separation: Nuxt imports TypeScript packages directly.
  - Godot GDScript mirrors the versioned contract constants (`BRIDGE_VERSION = 1`).
  - Zero microservices: Backend runs as Nitro server routes under `apps/web/server`.

---

## ADR-002: Nuxt 4 Compatibility with Nuxt 3.14 (Phase 0)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  The architecture specifies Nuxt 4 directory structure (`app/` folder layout).
- **Decision:**
  - Used `nuxt: 3.14.1592` with `future: { compatibilityVersion: 4 }`.
  - Directory structure uses `app/` (`app/app.vue`, `app/pages/`, `app/composables/`, `app/layouts/`, `app/assets/`) and root-level `server/`.
- **Consequences:**
  - Modern Nuxt 4 conventions and forward-compatibility while maintaining stable ecosystem compatibility.

---

## ADR-003: Versioned Nuxt ↔ Godot Game Bridge Protocol (Phase 0)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  The embedded Godot Web client needs bidirectional communication with the host Nuxt application for lifecycle events, NPC interactions, and route navigation.
- **Decision:**
  - Handshake protocol:
    1. Godot client emits `GAME_READY`.
    2. Nuxt host validates origin and envelope, fetches `/api/game/bootstrap`, and responds with `GAME_INIT`.
    3. Game initializes player state and transitions from loading overlay to active gameplay.
  - Strict security rules:
    - All messages carry `version: 1`, `type: string`, and typed `payload`.
    - Host validates `event.origin` against configured `runtimeConfig.public.gameOrigin` or window same-origin.
    - Client never submits authoritative EXP, Gold, or quest progress; all rewards remain backend-driven.
  - Outbound game actions:
    - `INTERACT_NPC` carries `{ npcId, npcName }` with correlation `requestId`.
    - `OPEN_APP_ROUTE` is restricted to an allowlist of approved frontend routes (`/learn`, `/shop`, `/inventory`, `/quests`, `/character`, `/profile`).
- **Consequences:**
  - Decoupled presentation: game only requests actions, host and backend validate and execute.

---

## ADR-004: Dual-Mode Game Client (Godot 4.6 + Web Fallback) (Phase 0)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  Godot 4.6 export requires the Godot Editor or headless Godot CLI. In development environments or CI pipelines where the native Godot binary is not yet pre-installed, developers need to test the web application, bridge, API bootstrap, and UI layout immediately.
- **Decision:**
  - Full Godot 4.6 project implemented in `apps/game/` with `project.godot`, `export_presets.cfg`, `Bridge.gd` autoload, `Player.tscn`, `NPC.tscn`, `TestWorld.tscn`, and `GameUI.tscn`.
  - In `apps/game/autoload/Bridge.gd`, desktop/editor mode automatically activates `_mock_init()` so Godot developers can run and test scenes in the Godot Editor without running Nuxt.
  - In `apps/web/public/game/index.html`, a lightweight 2D HTML5 Canvas web client implementing the exact same Bridge protocol (`GAME_READY`, `GAME_INIT`, `INTERACT_NPC`, WASD movement, touch controls) is provided as a drop-in web target until overwritten by Godot Web export.
- **Consequences:**
  - Complete zero-barrier development for both frontend web developers and Godot game designers.

---

## Browser & Platform Compatibility Report (Phase 0)

### 1. Desktop Browsers
- **Chrome / Edge (Chromium)**:
  - WebGL 2 / GL Compatibility: Excellent. Canvas and WebGL contexts initialize without restriction.
  - PostMessage: Fully compliant, sub-millisecond handshake latency.
  - Keyboard focus: When clicking into the iframe, `iframe.contentWindow.focus()` correctly captures WASD and arrow keys.
- **Firefox**:
  - Requires explicit canvas focus handling on click to route keyboard events inside iframe. Verified.
  - Strict origin matching works cleanly with `localhost` and `127.0.0.1`.
- **macOS Safari**:
  - WebGL / Canvas rendering supported.
  - Audio autoplay policy requires user gesture (e.g. initial click/tap inside game container) before Godot audio bus un-mutes.

### 2. Mobile Browsers
- **iOS Safari**:
  - Virtual viewport / address bar resizing: Fullscreen layout handles `100dvh` / fixed absolute container to prevent bouncing.
  - Touch input: Added dual-mode touch controls (virtual D-pad / joystick and action button) inside the web client.
  - WebAssembly memory limit: Godot 4 Web exports should use minimal initial memory (128MB or 256MB) to prevent iOS WebKit tab crashes.
- **Android Chrome**:
  - Pointer events and touch joystick function smoothly.
  - WebGL performance solid on mid-range and high-end devices.

---

---

## ADR-005: Authentication Strategy & HttpOnly Session Management (Phase 1)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  Secure authentication is required without exposing tokens in client-side localStorage or URL query parameters.
- **Decision:**
  - Implemented bcryptjs password hashing (salt rounds: 10).
  - Database-backed session tokens (32-byte crypto random hex) stored in `sessions` table with 7-day expiration.
  - HttpOnly, SameSite=Lax session cookie (`lw_session`).
  - Auth middleware automatically resolves user context from the session cookie.
- **Consequences:**
  - Complete protection against XSS token theft.

---

## ADR-006: Server-Authoritative Answer Evaluation & Atomic Reward Ledger (Phase 1)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  Non-negotiable Rules 2, 3, 4, and 5 state that client-submitted answer correctness, EXP, and Gold must never be trusted.
- **Decision:**
  - `POST /api/learning/sessions/:sessionId/answers` evaluates user answers against normalized database vocabulary records server-side.
  - `POST /api/learning/sessions/:sessionId/complete` calculates EXP and Gold rewards proportionally to accuracy.
  - Interactive database transaction (`prisma.$transaction`) atomically updates session status, character EXP/level, and wallet balance.
  - Idempotency key `session_${sessionId}_reward` prevents replay attacks and duplicate reward claims.
- **Consequences:**
  - Tamper-proof progression and verifiable audit trail via `wallet_transactions`.

---

## ADR-007: Spaced Repetition Scheduling Engine (FSRS Algorithm) (Phase 1)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  Spaced repetition is a first-class feature that must calculate due reviews on the server based on recall performance rather than simple views.
- **Decision:**
  - Implemented FSRS scheduling engine in `apps/web/server/utils/srs.ts`.
  - 4 rating levels: 1 (Again), 2 (Hard), 3 (Good), 4 (Easy).
  - Maintains difficulty $D$, stability $S$, review counts, and next interval calculation.
  - Words reaching 21+ days interval transition to `mastered`.
  - Due cards query (`dueAt <= now`) prioritizes the most overdue vocabulary items.
- **Consequences:**
  - Optimal retention rate aligned with cognitive science standards.

---

## ADR-008: Separation of RPG Character Level and Language Proficiency (Phase 1)

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  Non-negotiable Rule 6 mandates that character level (RPG stat) must never be treated as language proficiency.
- **Decision:**
  - `Character` model tracks RPG level (1-99), EXP, HP, and Max HP.
  - Language proficiency is computed separately from `VocabularyProgress` and `LearningAnswer` records (total words enrolled, mastered words, accuracy rate, HSK level).
  - Gold or cosmetics cannot artificially boost language proficiency metrics.
- **Consequences:**
  - Genuine educational progress is preserved while maintaining cozy RPG motivation.

---

## ADR-009: Docker Compose for PostgreSQL Database Infrastructure

- **Date:** 2026-10-31
- **Status:** Approved & Implemented
- **Context:**
  The baseline architecture specifies PostgreSQL as the authoritative database. The project requires a standardized local containerized database environment without relying on SQLite.
- **Decision:**
  - Created `docker-compose.yml` configuring `postgres:16-alpine` service (`linguaworld-postgres`) on port `5432:5432`.
  - Configured healthcheck with `pg_isready` and persistent volume `postgres_data`.
  - Updated `database/prisma/schema.prisma` datasource provider to `postgresql`.
  - Updated `.env` and `.env.example` with `DATABASE_URL="postgresql://postgres:password@localhost:5432/linguaworld?schema=public"`.
  - Removed all SQLite fallbacks; all data migrations, seeds, sessions, and transactions execute directly against PostgreSQL.
- **Consequences:**
  - 100% parity between local development and production PostgreSQL environment.



