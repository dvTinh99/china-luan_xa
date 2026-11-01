# Luma — Art Direction 2.0: Super Deformed Fantasy Anime Chibi (Luna Nanobanana Edition)

Complete production-ready 2D skeletal character redesign for **LinguaWorld**, created with **Rigby2D MCP**, Godot 4.6, and PixiJS 8 (Nuxt 4).

Reconstructed directly from the genuine high-resolution breakdown artwork in `luna-nanobanana/`, upscaled with edge-preserving Lanczos filtering, seamless Laplace harmonic inpainting for bare facial base, natural joint overlap caps, and Full HD 600×800 canvas positioning.

---

## 1. Directory Structure & Versioning

```
godot/assets/characters/
├── luma/                                  # Current Production Release
│   ├── source/
│   │   ├── luma.rigby                    # Production source workfile (1.8 MB)
│   │   └── Luma_ArtDirection_2.rigby     # Versioned backup copy (1.8 MB)
│   ├── export/
│   │   ├── luma.json                     # Spine JSON 4.3 skeleton format (88.3 KB)
│   │   ├── luma.skel                     # Spine Binary 4.3 format (13.2 KB)
│   │   ├── luma.atlas                    # Texture atlas descriptor (52 packed regions)
│   │   └── luma.png                      # Packed texture spritesheet (1024x2048, RGBA)
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
  - **Total Height**: ~2.2 heads tall.
  - **Head Ratio**: ~48% of total height (chubby cheeks, soft chin, voluminous wavy lavender hair).
  - **Body**: Compact torso, puffy white adventurer sleeves with teal wrist cuffs, lavender travel capelet with gold star brooch, and cream tunic dress.
  - **Hands & Feet**: Slightly oversized relative to body (hands 77×80, boots 99×80) for readable gestures and solid stance.
- **Face Design**:
  - **Eyes**: Large expressive anime chibi eyes with multi-layered blue and starry reflections (`eye_l`, `eye_r`).
  - **Eyebrows**: Independent left and right expressive lavender arcs (`brow_l`, `brow_r`).
  - **Mouth**: Small anime mouth with neutral, open smiling (`mouth_happy`), yawning (`mouth_yawn`), smirk (`mouth_smirk`), and startled (`mouth_surprised`) attachments.
  - **Blush & Sparkles**: Soft rosy cheek ovals with delicate pink flush.
- **Facial Inpainting**: Bare chibi head created via 2,000-iteration harmonic Laplace relaxation, producing a perfectly smooth gradient matching the original chin and ear contours without any seam artifacts.

---

## 3. Skeletal Hierarchy & Rigging (32 Bones, 4 IK Constraints, 29 Slots)

Built in standard skeletal hierarchy with natural pivot points:

```text
root
└── hip (origin: [-16.0, 278.8], rest rot: 84.6°)
    ├── chest (length: 48.0)
    │   ├── neck (length: 22.0)
    │   │   └── head (length: 154.9)
    │   │       ├── eye_l / eye_r
    │   │       ├── brow_l / brow_r
    │   │       ├── mouth
    │   │       ├── hair (crown bangs & hair front)
    │   │       ├── hair_l1 ── hair_l2 (side-locks left)
    │   │       ├── hair_r1 ── hair_r2 (side-locks right)
    │   │       └── hat (child of head for modular hats)
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

1. **`idle_breathe`** (2.5s loop): Rhythmic chest vertical rise (`+3.5px`), gentle head counterbalance, relaxed arm breathing sway, hair side locks and back drift.
2. **`idle_blink`** (1.8s loop): Natural anime eyelid scale and slot attachment switch (`eye_l/r` -> `eye_blink_l/r` -> `eye_l/r`), subtle eyebrow dip.
3. **`happy`** (1.4s loop): Cheerful double bounce (`Y: 0 -> +18 -> -3 -> +14 -> 0`), celebratory outward arm swings (`±32°`), head tilts, eye squint (`^ ^`), open smile.
4. **`curious`** (1.8s): Inquisitive head tilt (`+14.0°`), chest shift, right hand raised thoughtfully toward chin (`hand_point`).
5. **`surprised`** (1.5s): Startled recoil hop (`+20px`), wide open shocked eyes (`eye_surprised_l/r`), open 'O' mouth (`mouth_surprised`), flung hands.
6. **`sleepy`** (2.8s loop): Slow relaxed breathing, head gently drooping forward (`-7.5°`), yawning mouth (`mouth_yawn`), left hand rubbing eye (`hand_fist`).
7. **`proud`** (2.0s): Confident puffed chest (`+5.0px`), chin raised (`+5.0°`), hands on hips (`arm rot: ±26°`), smug eyes and smirk (`mouth_smirk`).
8. **`walk`** (1.0s loop): Rhythmic chibi steps, alternating leg strides (`±24°`), bent knee lift on passing foot, alternating arm swing (`±22°`), pelvic bobbing.
9. **`run`** (0.65s loop): Dynamic forward lean (`-12°`), fast vertical flight bounce (`+6px, -10px`), high knee drive (`thigh rot: ±48°`), high arm pump (`±46°`), trailing hair bounce.

---

## 5. Modular Equipment System

Equipped items can be swapped either by Rigby2D / Spine skin or individual slot attachment:

| Equipment Category | Slot Name | Default Explorer (`skin_explorer`) | Alternate Adventurer (`skin_adventurer`) |
| :--- | :--- | :--- | :--- |
| **Hair** | `hair_front` | `hair_front` (Voluminous bangs & locks) | `hair_short` (Adventurer Pixie Bob) |
| **Hat** | `hat_explorer` | `hat_explorer` (Explorer Beret with Star Brooch) | *None* |
| **Outfit** | `torso` | `torso` (Cream Tunic with Lavender Capelet & Gold Star) | `outfit_adventurer` (Leather Vest & Travel Tunic) |
| **Shoes** | `foot_l`, `foot_r` | `foot_l`, `foot_r` (Lavender Boots with Diamond Buckles) | `shoes_boots_l`, `shoes_boots_r` (Leather Boots) |
| **Front Accessory** | `accessory_front_pendant` | `accessory_front_pendant` (Gold Star Clasp) | `accessory_front_satchel` (Teal-Flapped Crossbody Bag) |
| **Back Accessory** | `cape_back` | `cape_back` (Mystic Lavender Cloak) | *None* |

---

## 6. Runtime Verification Results

- **Godot 4.6.3 Engine**:
  Ran automated headless harness `apps/game/scenes/test_luma.gd`:
  **40 / 40 CHECKS PASSED** (0 failures).
- **Nuxt 4 / PixiJS 8 Web Runtime**:
  Exported assets (`luma.json`, `luma.atlas`, `luma.png`) are 100% compliant with `@esotericsoftware/spine-pixi-v8` (Spine 4.3). Assets deployed to `apps/web/public/assets/spine/character/` (`chibi_hero.json`, `chibi_hero.skel`, `chibi_hero.atlas`, `chibi_hero.png`).
