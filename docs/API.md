# LinguaWorld — Initial API Contract

**Version:** 1.0 draft

All endpoints require authentication unless explicitly marked public. Validate input schemas, authorize user ownership and return consistent error envelopes.

## 1. Response conventions

Success:
```json
{
  "data": {},
  "meta": {
    "requestId": "req_example"
  }
}
```

Error:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request is invalid.",
    "details": []
  },
  "meta": {
    "requestId": "req_example"
  }
}
```

Never return stack traces or internal secrets to clients.

## 2. Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

## 3. Learning

- `GET /api/learning/courses`
- `GET /api/learning/courses/:courseId`
- `GET /api/learning/lessons/:lessonId`
- `POST /api/learning/sessions`
- `GET /api/learning/sessions/:sessionId`
- `POST /api/learning/sessions/:sessionId/answers`
- `POST /api/learning/sessions/:sessionId/complete`

The server must determine whether the session is valid and whether completion criteria are satisfied.

## 4. SRS

- `GET /api/srs/due`
- `POST /api/srs/reviews`
- `GET /api/srs/statistics`

A review submission should include vocabulary ID, answer/result data and response time where appropriate. The backend calculates rating/scheduling state according to the chosen SRS algorithm. Do not accept client-calculated due dates as authoritative.

## 5. Character

- `GET /api/character`
- `POST /api/character`
- `PATCH /api/character/appearance`
- `GET /api/character/progression`

## 6. Inventory and shop

- `GET /api/inventory`
- `POST /api/inventory/equip`
- `POST /api/inventory/unequip`
- `GET /api/shop/items`
- `POST /api/shop/purchase`

Purchase payload should contain item ID, quantity if supported, and an idempotency key. Price must be read from server-side catalog, not trusted from client.

## 7. Economy

- `GET /api/wallet`
- `GET /api/wallet/transactions`

Reward crediting should normally be an internal domain operation triggered by validated completion events, not a public endpoint accepting arbitrary EXP/Gold.

## 8. Quests

- `GET /api/quests`
- `GET /api/quests/:questId`
- `POST /api/quests/:questId/claim`

Quest progress should be derived from validated domain events. Claim endpoint must verify all objectives and use an idempotency key or unique reward constraint.

## 9. World

- `GET /api/world/state`
- `GET /api/world/regions`
- `POST /api/world/interactions`

Interaction requests should include a known interaction/NPC ID and context. Backend validates whether the player can perform the interaction.

## 10. Combat

- `POST /api/combat/sessions`
- `GET /api/combat/sessions/:sessionId`
- `POST /api/combat/sessions/:sessionId/actions`
- `POST /api/combat/sessions/:sessionId/complete`

Backend owns:
- Session lifecycle.
- Question selection.
- Answer evaluation.
- Enemy/player state.
- Damage calculation.
- Completion state.
- Rewards.

Godot sends player actions and renders server results.

## 11. Security requirements

- Authenticate and authorize every private endpoint.
- Validate ownership of session, quest, item and character IDs.
- Rate-limit login, answer and reward-sensitive operations.
- Use CSRF protection appropriate to cookie authentication.
- Validate idempotency keys.
- Use transactions for purchases and reward grants.
- Never accept arbitrary Gold, EXP, damage or completion flags.
