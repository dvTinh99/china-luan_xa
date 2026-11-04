# Godot game instructions

Read the repository [AGENTS.md](../../AGENTS.md) and [game README](README.md) first.

## Ownership and layout

- Project: `project.godot`, Godot 4.6, GL Compatibility renderer.
- `autoload/Bridge.gd`: host communication and initialization.
- `scenes/main`, `scenes/player`, `scenes/world`, `scenes/ui`: game composition, controls, NPC/world presentation, and HUD.
- `assets/characters`: imported character/Spine outputs and their source files. Preserve originals and follow the local asset README.

## Rules

- Godot is an untrusted client. It may request actions and render server-provided state; it must not decide rewards, ownership, answer correctness, progression, or unlock authority.
- Keep bridge messages versioned and aligned with `packages/shared-types/src/bridge.ts`; coordinate changes with the host composable and docs.
- Keep browser JavaScript interop isolated in the bridge adapter rather than spreading it across gameplay scripts.
- Preserve editor/mock mode and the web-hosted flow unless the task explicitly changes them.
- Do not hand-edit imported/generated `.godot` cache or exported build output as source.

## Checks

Run the project in Godot 4.6 for scene/script changes. For web bridge/export changes, also exercise the embedded game through the Nuxt host. Godot is a separate toolchain from npm; use the editor/export instructions in `README.md`.
