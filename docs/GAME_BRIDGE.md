# LinguaWorld — Nuxt ↔ Godot Game Bridge

**Version:** 1.0 draft

## 1. Purpose

Define a small, versioned communication protocol between the Nuxt parent application and embedded Godot Web client.

The bridge is for UI coordination and gameplay requests. It is not a security boundary and does not make the game client trusted.

## 2. Message envelope

```json
{
  "version": 1,
  "type": "INTERACT_NPC",
  "requestId": "req_123",
  "payload": {
    "npcId": "npc_001"
  }
}
```

Fields:
- `version`: protocol version.
- `type`: allowlisted event name.
- `requestId`: optional correlation ID.
- `payload`: event-specific validated data.

## 3. Initial event catalogue

### Nuxt → Godot
- `GAME_INIT`: initial boot information and non-secret configuration.
- `PLAYER_DATA`: current character appearance and display stats.
- `WORLD_DATA`: visible regions and world configuration.
- `SET_AUDIO`: application-level audio preference.
- `PAUSE_GAME`: pause game.
- `RESUME_GAME`: resume game.

### Godot → Nuxt
- `GAME_READY`: Godot initialization completed.
- `GAME_ERROR`: client-side failure.
- `INTERACT_NPC`: request interaction with NPC.
- `ENTER_REGION`: request entry to a region.
- `START_COMBAT`: request creation of combat session.
- `OPEN_APP_ROUTE`: request Nuxt to open a permitted application route.

## 4. Example NPC interaction

Godot → Nuxt:
```json
{
  "version": 1,
  "type": "INTERACT_NPC",
  "requestId": "req_123",
  "payload": {
    "npcId": "npc_001"
  }
}
```

Nuxt calls backend:
`POST /api/world/interactions`

Backend validates:
- Authenticated user.
- NPC exists and is active.
- Player can access the location.
- Interaction prerequisites.
- Quest state.

Nuxt returns result to Godot through a correlated response/event. The response contains displayable dialogue/quest state, not arbitrary client-authoritative rewards.

## 5. Security

- Validate exact `event.origin` in the parent window.
- Validate `event.source` matches the expected iframe/window.
- Validate message envelope and payload schema.
- Allowlist event types.
- Ignore unknown protocol versions.
- Never accept EXP, Gold, item ownership, answer correctness, damage or quest completion from client as authoritative.
- Never put secrets in bridge messages.
- Avoid passing long-lived tokens.
- Restrict `OPEN_APP_ROUTE` to approved internal routes.
- Use request IDs and timeout/error handling.

## 6. Lifecycle

1. Nuxt renders loading state and game iframe/container.
2. Godot initializes.
3. Godot sends `GAME_READY`.
4. Nuxt sends `GAME_INIT`, then player/world data.
5. Godot requests actions.
6. Nuxt/backend validate actions and send results.
7. On route leave, Nuxt sends pause/cleanup where possible.
8. On errors, show recoverable UI and provide retry.

## 7. Performance and compatibility

- Load the game only when `/world` is visited.
- Show progress/loading UI.
- Avoid loading large unused assets at boot.
- Test browser audio activation requirements.
- Test memory and WebGL behavior on actual target devices.
- Test mobile touch controls and viewport resizing.
