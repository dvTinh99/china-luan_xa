# Nuxt ↔ Godot bridge

**Status:** Describes the current protocol types and integration points inspected on 2026-11-04. The type definitions are in `packages/shared-types/src/bridge.ts`; runtime code is in `apps/web/app/composables/useGameBridge.ts`, `apps/web/app/pages/world.vue`, `apps/game/autoload/Bridge.gd`, and the web fallback `apps/web/public/game/index.html`.

## Message envelope

Messages use `version: 1`, a string `type`, a type-specific `payload`, and optional `requestId`. Keep TypeScript, the Godot adapter, fallback client, and host in sync when changing the protocol. Type definitions do not guarantee that every event is currently handled end to end.

## Typed event catalogue

Nuxt → Godot: `GAME_INIT`, `PLAYER_DATA`, `WORLD_DATA`, `SET_AUDIO`, `PAUSE_GAME`, `RESUME_GAME`, `PLAY_AUDIO`, `STOP_AUDIO`, `CHAKRA_DATA`.

Godot → Nuxt: `GAME_READY`, `GAME_ERROR`, `INTERACT_NPC`, `ENTER_REGION`, `START_COMBAT`, `OPEN_APP_ROUTE`, `AUDIO_STATUS`.

See `BridgePayloadMap` in `packages/shared-types/src/bridge.ts` for current payload shapes. Always check the runtime handlers before relying on an event.

## Current lifecycle

1. `/world` embeds `apps/web/public/game/index.html` in an iframe.
2. The client sends `GAME_READY`; the host checks the message origin, version, and event name.
3. The host calls authenticated `GET /api/game/bootstrap`, then sends `GAME_INIT` with player/world/chakra/config data.
4. The bridge status controls the loading and error UI. The host has a 15-second ready timeout and an iframe retry path.
5. Godot editor/desktop mode uses mock initialization; web mode uses the bridge. The Canvas fallback implements a web-hosted protocol subset.

## Runtime caveats to account for

- `useGameBridge.ts` validates origin, protocol version, and known event name, but does not validate payloads with a runtime schema and does not check `event.source` against the expected iframe. Preserve defensive validation and address these gaps when changing trust boundaries.
- The outbound host `postMessage` path is implemented; Godot's inbound callback wiring and the browser fallback use different mechanisms. Verify a message in both directions for the target client before claiming bridge support.
- Some declared events are not wired through the host/game end to end. For example, typed audio and chakra events should be traced through all endpoints before use.
- Godot outbound helper payloads do not always match TypeScript payload definitions: `GAME_ERROR`, `INTERACT_NPC`, `ENTER_REGION`, and `START_COMBAT` currently send subsets of the declared shapes.
- Current origin handling is configured in `useGameBridge.ts`; Godot's `postMessage` uses `'*'`. Do not treat a TypeScript type or client-side allowlist as a security boundary.
- `OPEN_APP_ROUTE` has client-side route allowlisting in Godot, but the host must independently validate any requested route.

## Security rules

- The bridge is a presentation/request channel, never an authorization boundary.
- Treat all messages as untrusted. Validate origin, source, version, event type, payload shape, and user/session authority on the host/backend.
- Backend validates NPC/region/combat actions and computes outcomes/rewards. Never trust client EXP, Gold, damage, answer correctness, inventory, or quest completion.
- Do not send secrets or long-lived credentials in messages.
- Keep audio URLs and asset identifiers constrained to server-approved assets where applicable.

## Change checklist

1. Update `packages/shared-types/src/bridge.ts` and the API/bootstrap types if needed.
2. Update `useGameBridge.ts`, `world.vue`, Godot `Bridge.gd`, and the Canvas fallback for relevant directions.
3. Keep origin/source and payload validation on the host; keep backend authorization authoritative.
4. Verify ready/init plus the changed event in both Godot Web and fallback mode, as applicable.
5. Update this file and `apps/game/README.md` when runtime behavior or event coverage changes.
