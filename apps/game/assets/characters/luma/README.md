# Luma — The Little Wanderer (LinguaWorld 2D Skeletal Character)

Production-ready 2D Anime Chibi Fantasy skeletal character created with **Rigby2D** and export-ready for **Godot 4.6** and **PixiJS 8 (Nuxt 4)**.

---

## 1. Directory Structure

```
godot/assets/characters/luma/
├── source/
│   └── luma.rigby              # Complete editable Rigby2D workfile (ZIP with project.json & 35 PNG images)
├── export/
│   ├── luma.json               # Spine JSON 4.3 format skeleton data (79.2 KB)
│   ├── luma.skel               # Spine Binary 4.3 format skeleton data (11.8 KB)
│   ├── luma.atlas              # Texture atlas descriptor (35 packed regions)
│   └── luma.png                # Packed texture spritesheet (512x1024, RGBA)
└── README.md                   # This documentation
```

---

## 2. Character Design & Visual Identity

- **Name**: Luma – The Little Wanderer
- **Game**: LinguaWorld (Cozy Fantasy Language-Learning RPG)
- **Visual Direction**:
  - Anime Chibi Fantasy, ~2.6 heads tall.
  - Soft dark-brown outlines (`#49352F`), avoiding harsh pure black.
  - Cel-shading with 2–3 levels of depth (base, soft shadow, highlight).
  - Warm, comforting, whimsical RPG atmosphere.
- **Palette**:
  - Warm Peach Skin: `#F5D9C4` (Shadow: `#E8BFA8`, Cheek Blush: `#FCA5A5`)
  - Adventurer Brown Hair: `#4A3728` (Shadow: `#332317`, Highlight: `#6E523C`)
  - Sage Green Jacket: `#52796F` (Shadow: `#354F52`, Highlight: `#84A98C`)
  - Warm Cream Linen: `#FDFBF7` (Shadow: `#E5DED1`)
  - Travel Leather: `#8B5A2B` (Shadow: `#5C3D1E`)
  - Brass / Gold Accents: `#E0A96D` (Shine: `#FEF08A`)
  - Anime Chibi Eyes: Multi-tone sage & amber iris (`#354F52` / `#52796F` / `#84A98C`) with dark pupil (`#221711`) and dual crisp white reflections.

---

## 3. Skeletal Hierarchy (32 Bones, 4 IK Constraints)

The skeleton is cleanly organized in standard skeletal order with Y-up coordinates:

```text
root
└── hip (origin: [0.28, 214.41], rot: 90.1°)
    ├── chest (length: 48.0)
    │   ├── neck (length: 23.2)
    │   │   └── head (length: 154.9)
    │   │       ├── eye_l (length: 24.4)
    │   │       ├── eye_r (length: 24.4)
    │   │       ├── brow_l (length: 16.4)
    │   │       ├── brow_r (length: 16.4)
    │   │       ├── mouth (length: 6.8)
    │   │       ├── nose (length: 1.6)
    │   │       ├── hair (length: 144.4) [Crown Ahoge & Bangs]
    │   │       ├── hair_l1 ── hair_l2 (Side locks left)
    │   │       └── hair_r1 ── hair_r2 (Side locks right)
    │   ├── upperarm_l ── forearm_l ── hand_l
    │   └── upperarm_r ── forearm_r ── hand_r
    ├── hair_back (behind neck)
    ├── thigh_l ── shin_l ── foot_l
    └── thigh_r ── shin_r ── foot_r

IK Constraints:
- ik_hand_l (target for left arm chain)
- ik_hand_r (target for right arm chain)
- ik_foot_l (target for left leg chain)
- ik_foot_r (target for right leg chain)
```

---

## 4. Animations (7 Production Animations)

All animations are validated and sampled with the Rigby2D runtime:

1. **`idle_breathe`** (2.0s loop):
   - Gentle rhythmic chest translation Y: `[0 -> 3.2 -> 0]`.
   - Subtle head counterbalance rotation `[0° -> 1.2° -> 0°]`.
   - Relaxed arm breathing sway `±2°`.
   - Spring follow-through on crown ahoge tuft.
2. **`idle_blink`** (1.5s loop):
   - Natural eyelid scale Y `[1.0 -> 0.1 -> 1.0]` at 0.48s–0.64s.
   - Gentle eyebrow dip and secondary ahoge spring bounce.
3. **`happy`** (1.2s):
   - Double cheerful body bounce Y: `[0 -> +16 -> -4 -> +12 -> 0]`.
   - Head tilting joyfully `±6°`.
   - Outward welcoming arm swings `±28°`.
   - Mouth scaling to 1.3 for an open happy smile.
4. **`curious`** (1.6s):
   - Inquisitive head tilt `+12.5°`.
   - Chest slight lean forward `[4.5, 2.0]`.
   - Raised left eyebrow `+4.5px`.
   - Ahoge tuft perk `+7.5°`.
5. **`surprised`** (1.0s):
   - Startled recoil jump `[-3, +10]`.
   - Wide eyes scale `1.25x` and raised brows `+6px`.
   - Open 'O' mouth shape.
6. **`sleepy`** (2.4s loop):
   - Slow relaxed breathing cycle.
   - Head gently drooping forward `-6.5°`.
   - Heavy eyelids drooping down to `0.35x` scale.
7. **`proud`** (1.8s):
   - Chest puffed up proudly `+6.0px`.
   - Chin raised confidently `-4.5°`.
   - Hands placed on hips with `±24°` upper arm rotation.

---

## 5. Modular Equipment System

Equipment can be switched via Rigby2D / Spine Skins or per-slot attachment keys without modifying the skeleton:

| Equipment Category | Slot Name | Default Item (`skin_explorer`) | Variant Item (`skin_ranger`) |
| :--- | :--- | :--- | :--- |
| **Hair** | `hair_front` | `hair_front` (Adventurer Bangs + Ahoge) | `hair_short` (Tidy Wanderer Hair) |
| **Hat** | `hat_adventurer` | `hat_adventurer` (Sage Beret with Gold Leaf) | `hat_hood` (Traveler Cowl / Hood) |
| **Outfit** | `torso` | `torso` (Explorer Tunic + Sage Jacket) | `outfit_ranger` (Forest Ranger Leather Vest) |
| **Shoes (L)** | `foot_l` | `foot_l` (Adventure Leather Boots) | `shoes_sandals_l` (Nature Strapped Sandals) |
| **Shoes (R)** | `foot_r` | `foot_r` (Adventure Leather Boots) | `shoes_sandals_r` (Nature Strapped Sandals) |
| **Accessory Front** | `accessory_front_satchel` | `accessory_front_satchel` (Leather Crossbody Bag) | `accessory_front_scarf` (Cozy Wool Scarf) |
| **Accessory Back** | `cape_back` | `cape_back` (Adventurer Mantle / Cape) | *None* |

---

## 6. Godot Runtime Integration

Tested and verified in **Godot 4.6.3-stable**:

1. **Automatic Verification**:
   Run the headless verification test:
   ```bash
   godot --headless --path apps/game -s scenes/test_luma.gd
   ```
2. **Interactive Scene**:
   Open `res://scenes/LumaTest.tscn` in Godot Editor to preview Luma with live animation playback.

---

## 7. Web Compatibility (Godot Web & Nuxt PixiJS)

- **Godot Web Export**:
  - Godot Web uses WebAssembly + WebGL2 / GLES3 (`gl_compatibility`).
  - Native GDExtension modules (C++/Rust) require compiling separate wasm32 side-modules (`-sSIDE_MODULE=1`).
- **Nuxt Web Character Studio (`/character`)**:
  - LinguaWorld's web studio uses **PixiJS 8 + `@esotericsoftware/spine-pixi-v8` (4.3.13)**.
  - The exported assets (`luma.json`, `luma.atlas`, `luma.png`) are 100% compliant with Spine 4.3 runtime standards and load directly into PixiJS without GDExtension or WebAssembly compilation overhead.
