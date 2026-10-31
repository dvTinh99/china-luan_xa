# LinguaWorld — Godot 4 Game Client

This directory contains the Godot 4 2D game client for LinguaWorld.

## Engine Requirements

- **Godot Engine**: 4.6.x with `gl_compatibility` renderer for Web export.
- Pinned compatibility: Godot 4.6-stable.

## Project Structure

```
apps/game/
├── project.godot          # Engine configuration, input actions, autoloads
├── export_presets.cfg     # Preset for Web HTML5 export
├── autoload/
│   └── Bridge.gd          # Autoload singleton: Nuxt ↔ Godot JavaScript postMessage bridge
├── scenes/
│   ├── main/
│   │   ├── Main.tscn      # Root scene (orchestrates World, Player, UI)
│   │   └── Main.gd
│   ├── player/
│   │   ├── Player.tscn    # Player character (8-dir movement, bobbing animation, camera)
│   │   └── Player.gd
│   ├── world/
│   │   ├── TestWorld.tscn # Village plaza, road, boundaries, trees, NPC
│   │   ├── NPC.tscn       # Interactive NPC with detection area & bounce feedback
│   │   └── NPC.gd
│   └── ui/
│       ├── GameUI.tscn    # HUD: loading screen, prompt, errors, FPS counter
│       └── GameUI.gd
└── assets/
    ├── fonts/
    ├── sprites/
    └── audio/
```

## How to Run in Godot Editor

1. Open Godot 4.6.
2. Click **Import**, browse to `apps/game/project.godot`, and click **Import & Edit**.
3. Press **F5** (or click the Play button in top-right) to run the `Main.tscn` scene.
4. In Desktop/Editor mode, `Bridge.gd` automatically enters `_mock_init()` mode with demo player/world data so you can test movement and interaction without needing the web host running.

## Controls

- **W / Up Arrow**: Move North
- **S / Down Arrow**: Move South
- **A / Left Arrow**: Move West
- **D / Right Arrow**: Move East
- **E / Space**: Interact with NPCs when in range

## How to Export for Web

1. In Godot Editor, open **Project** → **Export...**
2. Select the **Web** preset (already configured).
3. The export path is configured to: `../../apps/web/public/game/index.html`.
4. Click **Export Project...** (ensure "Export With Debug" is enabled for testing).
5. The export will generate:
   - `index.html`
   - `index.js`
   - `index.wasm`
   - `index.pck`
   inside `apps/web/public/game/`.

## Bridge Protocol Details

The game communicates with Nuxt via `window.parent.postMessage` in web mode:

- **Godot → Nuxt**:
  - `GAME_READY` — Emitted as soon as the web canvas and scripts load.
  - `INTERACT_NPC` — Emitted when the player presses E near an NPC (`{ npcId: "..." }`).
  - `ENTER_REGION` — Emitted when the player moves across a region boundary.
  - `OPEN_APP_ROUTE` — Requests Nuxt to navigate to an allowed app route (`/learn`, `/shop`, etc.).
  - `GAME_ERROR` — Emitted on unrecoverable client errors.

- **Nuxt → Godot**:
  - `GAME_INIT` — Provides player info, initial region, and world bootstrap data.
  - `PLAYER_DATA` — Updates character level, stats, appearance.
  - `WORLD_DATA` — Updates unlocked regions.
  - `SET_AUDIO` — Syncs mute/volume preference.
  - `PAUSE_GAME` / `RESUME_GAME` — Route change lifecycle management.

