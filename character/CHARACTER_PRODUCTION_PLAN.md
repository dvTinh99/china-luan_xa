# CHARACTER ASSET PRODUCTION PLAN
## LinguaWorld — Chibi Character Studio (`/character`)

**Lead:** Senior Game Art Director & Technical Artist  
**Strategy:** Autonomous 5-Batch Generation & Rigby2D Pipeline  
**Execution Target:** 100% Visual Completion for `/character` Screen  

---

## 1. Batch Execution Schedule

```
┌────────────────────────────────────────────────────────────────────────┐
│ BATCH 1: Master Reference & Canonical Identity                          │
│ - Luma Master Standing Reference (677×369 RGBA)                         │
│ - 4-Expression Sheet & Proportions Baseline                            │
│ Status: COMPLETED & APPROVED                                           │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BATCH 2: Modular 2D Body & Default Explorer Rig Layers                 │
│ - 12 High-Res Rigging Parts (Head, Torso, Arms, Legs, Hair, Mantle)   │
│ - Pivot Normalization & 32-Bone Rigby2D Skeletal Hierarchy             │
│ Status: COMPLETED & APPROVED                                           │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BATCH 3: Modular Facial System & Canonical Expressions                 │
│ - Decoupled Face Base, Open Eyes, Closed Eyes, Brows, 5 Mouth Shapes   │
│ - 6 Expression Controllers (idle, happy, curious, surprised, sleepy)   │
│ Status: COMPLETED & INTEGRATED                                         │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BATCH 4: Equipment Closet Items & Skins (Rigby2D / Spine)               │
│ - 3 Modular Skins: default, skin_explorer, skin_adventurer             │
│ - Equipment Slots: Hair, Hat, Outfit, Shoes, Accessory                 │
│ Status: COMPLETED & INTEGRATED                                         │
└───────────────────┬────────────────────────────────────────────────────┘
                    │
                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│ BATCH 5: 128×128 Illustrated RPG Equipment Icons & Stage Art           │
│ - 33 Dedicated Chibi RPG Icons for EquipmentCloset.vue                 │
│ - Cozy Stage Backdrop & Empty Slot Frames                              │
│ Status: EXECUTING IN BATCH                                             │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Detailed Batch Breakdown

### Batch 1: Master Reference & Art Direction Approval
- **Objective:** Establish the unshakeable source of truth for Luma's Super Deformed Anime Chibi proportions (2–2.3 heads tall).
- **Deliverables:**
  - `assets/character/references/luma_master_standing.png`
  - `assets/character/references/luma_emotion_sheet.png`
  - `assets/character/references/luma_breakdown_sheet.png`
- **Criteria:** Approved palette (Mystic Lavender `#B9A0D9`, Fantasy Blue `#78A9D9`, Warm Gold `#E8B76B`, Dark Plum outlines `#493747`).

### Batch 2: Modular Body Components (Rigby2D Rig)
- **Objective:** Separate high-resolution body components with sufficient joint overlap to prevent visual seam gaps during skeletal rotation.
- **Deliverables:**
  - `assets/character/luma/body/head_base.png` (2048×2048)
  - `assets/character/luma/body/body_torso.png` (2752×1536)
  - `assets/character/luma/body/left_arm.png` (2752×1536)
  - `assets/character/luma/body/right_arm.png` (2400×1792)
  - `assets/character/luma/body/left_leg.png` (2816×1536)
  - `assets/character/luma/body/right_leg.png` (2816×1536)
  - `assets/character/luma/hair/hair_front.png` (2816×1536)
  - `assets/character/luma/hair/hair_back.png` (2816×1536)
  - `assets/character/luma/clothing/cape_back.png` (1792×2400)
  - `assets/character/luma/clothing/hat_explorer.png` (2400×1792)
  - `assets/character/luma/clothing/shoes_boots.png` (2752×1536)
  - `assets/character/luma/accessories/accessories_default.png` (2816×1536)

### Batch 3: Modular Facial System & Expression Controller
- **Objective:** Clean separation of facial organs allowing programmatic expression switches without redrawing the character.
- **Deliverables:**
  - `assets/character/luma/face/face_base.png` (Skin + blush only)
  - `assets/character/luma/face/eye_left.png`, `eye_right.png` (Open eyes)
  - `assets/character/luma/face/eye_closed_left.png`, `eye_closed_right.png` (Blink)
  - `assets/character/luma/face/eye_half_left.png`, `eye_half_right.png` (Sleepy)
  - `assets/character/luma/face/brow_left.png`, `brow_right.png` (Eyebrows)
  - `assets/character/luma/face/mouth_neutral.png`, `mouth_smile.png`, `mouth_open.png`, `mouth_sleepy.png`, `mouth_frown.png`
- **Controller APIs:**
  - Godot: `apps/game/scripts/character/expression_controller.gd`
  - Web/Pixi: `apps/web/app/services/character/expression-controller.client.ts`

### Batch 4: Equipment Closet Items & Skins
- **Objective:** Configure Rigby2D / Spine skins to enable real-time wardrobe changes on the `/character` page.
- **Skins:**
  - `default`: Canonical Little Wanderer explorer costume.
  - `skin_explorer`: Lightweight field travel outfit with scholar cap and travel pouch.
  - `skin_adventurer`: Full explorer gear with cloak, boots, and star pendant.

### Batch 5: Dedicated 128×128 Illustrated RPG Equipment Icons
- **Objective:** Replace Lucide glyph placeholders in `EquipmentCloset.vue` with 33 illustrated chibi RPG icons adhering to the Art Direction palette and style.
- **Categories:**
  - 6 Hair Icons (`icon_hair_*.png`)
  - 6 Hat Icons (`icon_hat_*.png`)
  - 8 Outfit Icons (`icon_outfit_*.png`)
  - 6 Shoes Icons (`icon_shoes_*.png`)
  - 7 Accessory Icons (`icon_acc_*.png`)
- **Stage Enhancements:**
  - `stage_backdrop_cozy.png` (Cozy fantasy study room backdrop)
  - `avatar_luma_portrait.png` (256×256 circular crop)
