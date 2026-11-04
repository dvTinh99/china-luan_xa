# LinguaWorld roadmap and implementation status

**Status snapshot:** 2026-11-04. This is a code-informed overview, not a release promise. “Implemented surface” means corresponding routes/components/helpers exist; it does not certify complete product behavior, production security, or browser QA. Check source and `docs/DECISIONS.md` before relying on historical acceptance claims.

## Current product direction

Build a Mandarin-learning platform where learning and review drive progress, supported by character collection and a 2D exploration layer. RPG level and language proficiency remain separate. Backend validation is required for persistent state and rewards.

## Implemented surface in this checkout

- **App and game shell:** Nuxt application, `/world` iframe host, Godot 4.6 scenes/bridge, and a Canvas browser fallback exist.
- **Accounts and player state:** register/login/logout/current-user routes, session utilities, character/profile/appearance routes, wallet and inventory routes exist. Current auth middleware includes a demo-user fallback; see `docs/ARCHITECTURE.md`.
- **Learning:** course/lesson, session/answer/completion routes and learning UI exist; UI components include radical strategy and Hanzi writing activities. Verify the exact activity lifecycle and completion coverage in code.
- **SRS:** due/review/statistics routes and a server-side SRS helper exist.
- **RPG systems:** shop/purchase, equip/unequip/use, quests/claim, combat start/action, game bootstrap and chakra routes/helpers exist.
- **Audio operations:** audio resolution/streaming, voices, generation jobs, and asset review/publish routes exist.

This list records code surfaces only. It is not evidence that all acceptance criteria in `PRD.md` or the original phased roadmap have passed.

## Remaining direction

- Close security and contract gaps: remove or explicitly constrain demo auth fallback; validate every API's ownership/authorization; align typed bridge payloads with runtime handlers and verify both directions.
- Make schema evolution reproducible. The current `.gitignore` excludes `database/prisma/migrations/`; determine and implement a tracked migration policy before shared releases.
- Improve content breadth and review quality, learning analytics, responsive game experience, and automated coverage.
- Evaluate later product areas (more curriculum/content, NPC story quests, world expansion, pets/housing, social systems, and admin CMS) against user needs before scheduling them.

## Agent guidance

Do not treat phase labels or acceptance lists from older plans as proof of delivery. For a feature, first trace its UI, route, domain logic, Prisma models, and client contract. Update this status only when the implementation evidence changes; document product goals separately from verified runtime behavior.
