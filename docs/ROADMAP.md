# LinguaWorld — Implementation Roadmap

**Version:** 1.2

## Delivery strategy

Build in vertical slices. Complete and verify the smallest end-to-end capability before expanding scope.

## Phase 0 — Technical validation

Goal: prove Nuxt + Godot Web integration.

Tasks:
- Create monorepo.
- Initialize Nuxt 4, TypeScript and Tailwind.
- Initialize Godot 4.x project and pin version.
- Create one simple scene with a controllable placeholder character.
- Export Godot Web.
- Serve/embed build in Nuxt `/world`.
- Implement versioned bridge.
- Send `GAME_READY` and `INTERACT_NPC` events.
- Add a simple authenticated API endpoint and fetch it from game context.
- Test desktop Chrome, iOS Safari and Android Chrome.
- Record performance, audio, memory and WebGL findings.

Acceptance:
- `/world` loads the embedded game.
- Character can move.
- Nuxt sends initialization data.
- Godot sends an event to Nuxt.
- Backend request is authenticated and validated.
- Loading and failure states work.
- Compatibility findings are documented.

Do not proceed to large asset production until this phase passes.

## Phase 1 — Learning core

Tasks:
- Authentication.
- User settings.
- Character creation.
- Curriculum/course/unit/lesson management.
- Vocabulary import pipeline.
- HSK 3.0 initial dataset.
- Flashcards.
- Word matching.
- Quiz.
- Learning sessions and answer history.
- SRS integration (FSRS or another evaluated algorithm).
- EXP and Gold server-side reward rules.
- Learning dashboard.

Acceptance:
- User can create a character.
- At least 100 reviewed vocabulary entries are available.
- Three learning activity types work.
- Learning history persists.
- Due reviews are calculated server-side.
- Rewards are granted once after valid completion.
- Learning proficiency is independent of RPG level.

## Phase 2 — RPG foundation

Tasks:
- Character appearance and customization.
- Item catalog.
- Inventory.
- Wallet ledger.
- Shop and transactional purchase.
- Equip/unequip.
- Daily quests.
- Achievements.
- Godot character rendering and animation.
- Basic environment and movement.
- NPC rendering and interaction.
- Sync character appearance into game.

Acceptance:
- Player can purchase and equip an item.
- Inventory and wallet are correct after refresh.
- Godot renders the server-owned appearance.
- Quest progress comes from validated events.

## Phase 3 — Adventure world

Tasks:
- Regions and map.
- NPC dialogue.
- Adventure quests.
- World unlock validation.
- Combat sessions.
- Question/answer combat loop.
- Boss encounter prototype.
- Combat result synchronization.
- Reward validation.

Acceptance:
- Player explores an unlocked region.
- NPC can start a quest.
- Quest objectives update from learning events.
- Combat answer is evaluated by backend.
- Client cannot forge completion or rewards.

## Phase 4 — Retention and content

Tasks:
- More curriculum content.
- More vocabulary and grammar.
- Listening activities.
- More regions and quests.
- SRS analytics.
- Pet and housing prototype.
- Seasonal events.
- UX and performance improvements.

## Phase 5 — Public platform expansion

Tasks:
- Public multi-user hardening.
- Profile visibility controls.
- Friends and social systems.
- Leaderboards.
- Guilds and shared events.
- Admin CMS.
- Multiple languages/curricula.
- Content moderation and reporting.

## Suggested first sprint backlog

1. Create repository and app/game folders.
2. Build Nuxt shell and `/world` route.
3. Build Godot placeholder scene.
4. Export and embed.
5. Implement bridge envelope and event allowlist.
6. Add `/api/game/bootstrap` (authenticated).
7. Load placeholder character data into Godot.
8. Test browsers and document limitations.

## Definition of Done

A feature is done only when:
- Requirements are implemented.
- Server-side validation exists where required.
- Authorization is tested.
- Error/loading states exist.
- Relevant automated tests pass.
- Database migrations and seed data are included.
- Documentation is updated.
- No secrets or trusted reward values are exposed to the client.
