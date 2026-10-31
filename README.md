# LinguaWorld — Implementation Documentation

**Document package:** 1.2  
**Architecture:** Hybrid Nuxt + Godot  
**Initial curriculum:** Mandarin Chinese — HSK 3.0, with HSK 2.0 as a separate optional curriculum  
**Visual direction:** 2D Cartoon  
**Product principle:** Learning First

## Package contents

- `docs/PRD.md` — Product requirements and scope.
- `docs/GDD.md` — Game design document.
- `docs/ARCHITECTURE.md` — System architecture and technology decisions.
- `docs/API.md` — Initial backend API contract.
- `docs/DATABASE.md` — Data model and database design guidance.
- `docs/GAME_BRIDGE.md` — Nuxt ↔ Godot communication contract.
- `docs/LEARNING_CONTENT.md` — HSK sources, licensing, content schema and import pipeline.
- `docs/ROADMAP.md` — Implementation phases, milestones and acceptance criteria.
- `ANTIGRAVITY_PROMPT.md` — Master implementation prompt for Antigravity.

## Important implementation rules

1. Backend is the source of truth for all persistent state, rewards, progression and validation.
2. Godot is an untrusted presentation/gameplay client. Never trust client-submitted EXP, Gold, damage, quest completion or item ownership.
3. Nuxt owns application UX, learning UX, account management, shop, inventory and administrative interfaces.
4. Godot owns the 2D world presentation, movement, NPC/game scenes, adventure and combat presentation.
5. Learning proficiency and RPG character level are independent.
6. SRS and learning history are first-class product features.
7. Start as a modular monolith. Do not introduce microservices for MVP.
8. HSK 2.0 and HSK 3.0 must be stored as separate curriculum versions.
9. Do not copy copyrighted textbook content, audio or exam material without checking the applicable license and permissions.
10. Validate Godot Web compatibility early on desktop and mobile browsers before investing in large game content.

## Suggested execution order

1. Read all documents.
2. Implement Phase 0 technical prototype only.
3. Demonstrate Nuxt embedding Godot Web, secure communication and authenticated API calls.
4. Obtain approval before proceeding to the next phase.
5. Implement incrementally with tests and updated documentation.

## Current assumptions to confirm during implementation

- Nuxt 4 + Vue 3 + TypeScript.
- PostgreSQL + Prisma.
- Godot 4.x, exact minor version selected and pinned during Phase 0.
- Same-origin deployment for the embedded Godot Web build where practical.
- Secure HttpOnly cookie authentication for Nuxt.
- One initial player/account workflow, but multi-user-ready data ownership.
- Mandarin and Vietnamese as the initial learning language pair.
