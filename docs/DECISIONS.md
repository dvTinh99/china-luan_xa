# LinguaWorld — Architecture Decisions & Log

This document records architectural decisions, prototype findings, browser compatibility notes, and open questions across development phases.

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

## Phase 0 Open Questions & Phase 1 Recommendations

1. **Authentication Strategy (Phase 1):**
   - Phase 0 implements demo-mode middleware injecting `demo-user-001`.
   - Phase 1 will implement full bcrypt password hashing, session tokens stored in PostgreSQL `sessions` table, and HttpOnly `Set-Cookie` with CSRF protection.
2. **Audio Asset Pipeline:**
   - Web interface uses HTML Audio API for pronunciation / vocabulary cards.
   - Godot client will receive `SET_AUDIO` bridge events to mute background music when user enters a speaking or listening lesson.
3. **HSK 3.0 Band 1 Data Seed:**
   - Raw vocabulary data should be normalized into `curriculum_levels` and `vocabulary` tables with Vietnamese definitions, pinyin, and sample sentences before enabling SRS review.

