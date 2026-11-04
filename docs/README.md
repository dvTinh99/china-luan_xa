# Documentation index

Read repository [AGENTS.md](../AGENTS.md) before coding. It defines cross-project rules, source precedence, and common commands. Then use the closest scoped guide: [web](../apps/web/AGENTS.md), [Godot](../apps/game/AGENTS.md), or [Prisma](../database/prisma/AGENTS.md).

## Current implementation references

- [Architecture](ARCHITECTURE.md) — system ownership, entry points, trust boundaries, and known caveats.
- [API](API.md) — Nitro route inventory and server-side invariants.
- [Database](DATABASE.md) — Prisma models, provider, and schema workflow.
- [Game bridge](GAME_BRIDGE.md) — typed messages, lifecycle, runtime coverage, and caveats.
- [Decisions](DECISIONS.md) — historical ADRs; verify present behavior in source.
- [Roadmap](ROADMAP.md) — current code surfaces and future product direction.

## Product and domain references

- [PRD](PRD.md) — product requirements and intended scope.
- [GDD](GDD.md) — game loop and design direction.
- [Learning content](LEARNING_CONTENT.md) — content sources, licensing, and data workflow.
- [Chakra milestone architecture](chakra-milestone-architecture.md) — chakra progression design.
- Repository-level [UX/UI](../UX-UI.md), [audio system](../Audio_system.md), and [design system](../design-system/linguaworld/MASTER.md).
- Character design/production details are indexed by the files under `../character/`; treat approvals and QA reports as asset-specific records.

Product and design documents describe goals. For current runtime behavior, follow the implementation-first precedence in `../AGENTS.md`.
