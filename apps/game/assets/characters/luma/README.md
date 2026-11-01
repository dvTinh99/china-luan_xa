# Luma — Art Direction 2.0: Super Deformed Fantasy Anime Chibi

Complete production-ready 2D skeletal character redesign for **LinguaWorld**, created with **Rigby2D MCP**, Godot 4.6, and PixiJS 8 (Nuxt 4).

---

## 1. Directory Structure & Versioning

```
godot/assets/characters/
├── luma/                                  # Current Production Release (Art Direction 2.0)
│   ├── source/
│   │   ├── Luma_ArtDirection_2.rigby     # Rigby2D Super Deformed editable workfile (268 KB)
│   │   └── luma.rigby                    # Production source workfile symlink/copy (268 KB)
│   ├── export/
│   │   ├── luma.json                     # Spine JSON 4.3 skeleton format (95.5 KB)
│   │   ├── luma.skel                     # Spine Binary 4.3 format (13.9 KB)
│   │   ├── luma.atlas                    # Texture atlas descriptor (38 packed regions)
│   │   └── luma.png                      # Packed texture spritesheet (512x1024, RGBA)
│   └── README.md                         # This documentation
│
├── Luma_ArtDirection_2/                  # Dedicated Versioned Mirror
│   ├── source/Luma_ArtDirection_2.rigby
│   └── export/ (luma.json, luma.skel, luma.atlas, luma.png)
│
└── luma_v1_backup/                       # Preserved V1 Working Backup
    ├── source/luma.rigby
    ├── export/ (luma.json, luma.skel, luma.atlas, luma.png)
    └── README.md
```

---

## 2. Character Design & Super Deformed Proportions

- **Visual Direction**: Super Deformed (SD) Fantasy Anime Chibi.
- **Proportions**:
  - **Total Height**: ~2.1 heads tall.
  - **Head Ratio**: ~48% of total height (chubby cheeks, soft chin, large voluminous hair mass).
  - **Body**: Compact torso (~54px height), short rounded limbs with no joint gaps.
  - **Hands & Feet**: Slightly oversized relative to body (hands 32×28, boots 42×56) for readable gestures and solid stance.
- **Face Design**:
  - **Eyes**: Large expressive anime chibi eyes with multi-layered irises:
    - Top Shade: Deep Navy Teal (`#2D5560`)
    - Midtone: Vibrant Fantasy Blue (`#78A9D9`)
    - Lower Glow: Mystic Lavender (`#B9A0D9`) & Rose Pink (`#E9A8B9`) crescent rim light
    - Pupil: Deep Plum (`#2A1D2B`)
    - Highlights: Dual crisp white highlights + twinkle fleck
    - Eyeliner: Curved Dark Plum lash line with anime wing flick
  - **Eyebrows**: Independent left and right expressive arcs.
  - **Mouth**: Small anime mouth with open smiling (`mouth_happy`) and startled (`mouth_surprised`) attachments.
  - **Blush & Sparkles**: Soft rosy cheek ovals (`#E9A8B9`) with white twinkle stars.
- **Fantasy Pastel Palette**:
  - Mystic Lavender: `#B9A0D9`
  - Fantasy Blue: `#78A9D9`
  - Royal Teal: `#579E9B`
  - Warm Gold: `#E8B76B`
  - Rose Pink: `#E9A8B9`
  - Soft Cream: `#F8EBD5`
  - Dark Plum Outline: `#493747` (no harsh black outlines)
  - Nature Green: `#9CC8A1`
  - Warm Skin: `#F5D9C4`

---

## 3. Skeletal Hierarchy & Rigging (32 Bones, 4 IK Constraints)

Built in standard skeletal hierarchy with natural pivot points:

```text
root
└── hip (origin: [0.25, 298.5], rest rot: 85.8°)
    ├── chest (length: 48.0)
    │   ├── neck (length: 22.0)
    │   │   └── head (length: 154.9)
    │   │       ├── eye_l / eye_r
    │   │       ├── brow_l / brow_r
    │   │       ├── mouth / nose
    │   │       ├── hair (crown ahoge tuft & bangs)
    │   │       ├── hair_l1 ── hair_l2 (side-locks left)
    │   │       └── hair_r1 ── hair_r2 (side-locks right)
    │   ├── upperarm_l ── forearm_l ── hand_l
    │   └── upperarm_r ── forearm_r ── hand_r
    ├── hair_back (voluminous rear hair puff)
    ├── thigh_l ── shin_l ── foot_l
    └── thigh_r ── shin_r ── foot_r

IK Constraints:
- ik_hand_l, ik_hand_r (2-bone arm IK)
- ik_foot_l, ik_foot_r (2-bone leg IK)
```

---

## 4. Animations (9 Production Animations)

All animations authored with smooth Bezier interpolation (`EASE_IN_OUT` curves):

1. **`idle_breathe`** (2.0s loop): Rhythmic chest vertical rise (`+3.0px`), gentle head counterbalance, relaxed arm breathing sway, crown ahoge spring bounce.
2. **`idle_blink`** (1.5s loop): Natural anime eyelid scale (`Y: 1.0 -> 0.1 -> 1.0`), subtle eyebrow dip, secondary ahoge motion.
3. **`happy`** (1.2s loop): Cheerful double bounce (`Y: 0 -> +16 -> -4 -> +12 -> 0`), celebratory outward arm swings (`±28°`), head tilts, open smile scale.
4. **`curious`** (1.6s): Inquisitive head tilt (`+13.5°`), slight chest forward lean (`+4.0px, +2.0px`), raised left eyebrow, ahoge tuft perk (`+7.5°`).
5. **`surprised`** (1.0s): Startled recoil hop (`+10px`), wide open eyes (`1.25x`), raised brows (`+6px`), open 'O' mouth.
6. **`sleepy`** (2.4s loop): Slow relaxed breathing, head gently drooping forward (`-6.5°`), heavy eyelids drooping to `0.35x` scale.
7. **`proud`** (1.8s): Confident puffed chest (`+6.0px`), chin raised (`-4.5°`), hands on hips (`arm rot: ±24°`).
8. **`walk`** (1.2s loop): Rhythmic chibi steps, alternating leg strides (`±22°`), bent knee lift on passing foot, alternating arm swing (`±20°`), subtle body bounce.
9. **`run`** (0.8s loop): Energetic short strides (`±36°`), dynamic forward lean (`-6°`), fast vertical flight bounce (`+8px`), high arm pump (`±42°`), trailing hair bounce.

---

## 5. Modular Equipment System

Equipped items can be swapped either by Rigby2D / Spine skin or individual slot attachment:

| Equipment Category | Slot Name | Default Explorer (`skin_explorer`) | Alternate Adventurer (`skin_adventurer`) |
| :--- | :--- | :--- | :--- |
| **Hair** | `hair_front` | `hair_front` (Voluminous bangs + Ahoge) | `hair_short` (Adventurer Pixie Bob + Ribbons) |
| **Hat** | `hat_explorer` | `hat_explorer` (Floppy Beret with Gold Star & Feather) | *None* |
| **Outfit** | `torso` | `torso` (Cream Tunic with Blue Trim & Gold Star Buckle) | `outfit_adventurer` (Royal Teal Voyager Vest & Lavender Tunic) |
| **Shoes** | `foot_l`, `foot_r` | `foot_l`, `foot_r` (Royal Teal Boots with Gold Cuffs) | `shoes_boots_l`, `shoes_boots_r` (Travel Leather Boots with Buckles) |
| **Front Accessory** | `accessory_front_pendant` | `accessory_front_pendant` (Glowing Crystal Pendant) | `accessory_front_satchel` (Leather Crossbody Bag) |
| **Back Accessory** | `cape_back` | `cape_back` (Mystic Lavender Mantle with Gold Trim) | *None* |

---

## 6. Runtime Verification Results

- **Godot 4.6.3 Engine**:
  Ran automated headless harness `apps/game/scenes/test_luma.gd`:
  **40 / 40 CHECKS PASSED** (0 failures).
- **Nuxt 4 / PixiJS 8 Web Runtime**:
  Exported assets (`luma.json`, `luma.atlas`, `luma.png`) are 100% compliant with `@esotericsoftware/spine-pixi-v8` (Spine 4.3). Assets copied to `apps/web/public/assets/spine/character/`.
- **Downscale Readability Check**:
  Verified at 100% (276×471), 75% (207×353), and 50% (138×235). Large anime eyes, clear silhouettes, and soft dark plum outlines preserve character identity down to thumbnail sizes.
