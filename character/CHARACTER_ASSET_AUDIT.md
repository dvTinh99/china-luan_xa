# CHARACTER ASSET AUDIT
## LinguaWorld Chibi Character Studio (`/character`)

**Date:** 2026-11-01  
**Auditor:** Senior Art Director & Technical Artist  
**Scope:** Strictly `/character` route, components, rendering engine, and customization assets  
**Target Proportions:** Super Deformed (SD) Anime Chibi (2.0–2.3 heads tall)  
**Primary Reference:** `luna-nanobanana/main-removebg-preview.png`  

---

## 1. Executive Summary

The LinguaWorld `/character` screen provides players with an interactive 2D Chibi wardrobe and character sheet. Players can preview equipment changes in real-time, inspect RPG attributes (HP, ATK, DEF, LUCK), track HSK 3.0 Chinese language learning progress, and trigger six canonical character expressions.

This audit evaluates all visual assets required by the `/character` screen, classifying each asset into one of four states:
1. **Existing and reusable**
2. **Existing but needs redesign**
3. **Missing and must be generated**
4. **Optional improvement**

---

## 2. Character Screen Architecture & Component Inventory

| Component | File Path | Role on `/character` Screen | Current Visual Assets Used |
| :--- | :--- | :--- | :--- |
| **Character Page** | `apps/web/app/pages/character.vue` | Main layout, studio banner, gold ledger, and responsive grid | Lucide icons (`Sparkles`, `Shield`, `Coins`, `ArrowDownLeft`, `ArrowUpRight`) |
| **Character Stage** | `apps/web/app/components/character/CharacterStage.client.vue` | Interactive 2D Chibi canvas with expression controls | PixiJS 8 WebGL canvas, radial gradient backdrop, emote emoji buttons |
| **Character Stats Panel** | `apps/web/app/components/character/CharacterStatsPanel.vue` | RPG attributes display (HP, ATK, DEF, LUCK, EXP bonus) | Lucide icons (`Swords`, `Shield`, `Heart`, `Sparkles`, `TrendingUp`) |
| **Equipment Closet** | `apps/web/app/components/character/EquipmentCloset.vue` | Tabbed wardrobe grid (Hair, Hat, Outfit, Shoes, Accessory) | Generic Lucide icons (`Sparkles`, `Crown`, `Shirt`, `Footprints`, `Gem`) |
| **Learning Stats Panel** | `apps/web/app/components/character/LearningStatsPanel.vue` | HSK 3.0 vocabulary retention, review counts, streak | Lucide icons (`BookOpen`, `Award`, `Flame`, `Brain`) |
| **Pixi Chibi Engine** | `apps/web/app/services/character/pixi-character-engine.client.ts` | PixiJS 8 rendering pipeline & Spine runtime adapter | Spine 4.3 runtime (`luma.skel`, `luma.atlas`, `luma.png`) + Vector fallback |
| **Rigby2D Project** | `apps/game/assets/characters/luma/source/luma.rigby` | Master 2D skeletal rig, bone hierarchy, animations | 32 bones, 29 slots, 3 skins, 9 animations, 52 image slices |

---

## 3. Visual Asset Inventory & Classification

### 3.1. Main Character Luma Base & Body Parts

| Asset Identifier | Description | Specification | Current Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| `luma_master_ref` | Full-body neutral standing pose | 677×369 RGBA | **Existing & Reusable** | Standardized in `assets/character/references/` |
| `luma_emotion_ref` | 4-expression emotional reference sheet | 677×369 RGBA | **Existing & Reusable** | Standardized in `assets/character/references/` |
| `luma_breakdown_ref` | Visual disassembly of modular layers | 669×373 RGBA | **Existing & Reusable** | Standardized in `assets/character/references/` |
| `head_base` | Luma chibi head base, ears, blush | 2048×2048 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/head.png` |
| `body_torso` | Compact chibi torso and tunic base | 2752×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/body_torso.png` |
| `left_arm` | Left shoulder, forearm, and hand | 2752×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/left_arm.png` |
| `right_arm` | Right shoulder, forearm, and hand | 2400×1792 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/right_arm.png` |
| `left_leg` | Left leg and rounded boot joint | 2816×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/left_leg.png` |
| `right_leg` | Right leg and rounded boot joint | 2816×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/right_leg.png` |
| `hair_front` | Voluminous bangs and side locks | 2816×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/hair_front.png` |
| `hair_back` | Soft back hair silhouette | 2816×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/hair_back.png` |
| `cape_back` | Adventurer shoulder mantle / back cape | 1792×2400 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/cape_back.png` |
| `hat_explorer` | Default explorer brimmed hat with star | 2400×1792 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/hat.png` |
| `shoes_boots` | Default explorer leather ankle boots | 2752×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/shoes.png` |
| `accessories_default` | Star pendant, waist belt, travel pouch | 2816×1536 RGBA | **Existing & Reusable** | High-res source in `luna-nanobanana/part/accessories.png` |

---

### 3.2. Modular Facial Asset System

| Asset Identifier | Asset File | Expression Role | Current Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| `face_base` | `face_base.png` | Blank face with skin & blush | **Existing & Reusable** | Integrated in Rigby2D / Spine slot `face` |
| `eye_left` / `eye_right` | `eye_left.png`, `eye_right.png` | Open anime eyes with layered iris | **Existing & Reusable** | Integrated in Rigby2D / Spine slot `eye_l`, `eye_r` |
| `eye_closed_l` / `eye_closed_r` | `eye_closed_left.png`, `...` | Closed curved eyelashes for blinking | **Existing & Reusable** | Used in `idle_blink`, `sleepy`, `happy` |
| `eye_half_l` / `eye_half_r` | `eye_half_left.png`, `...` | Half-lidded eyelids for drowsy gaze | **Existing & Reusable** | Used in `sleepy` animation |
| `brow_left` / `brow_right` | `brow_left.png`, `brow_right.png` | Independent expressive eyebrows | **Existing & Reusable** | Rotated / translated dynamically in rig |
| `mouth_neutral` | `mouth_neutral.png` | Tiny serene anime mouth | **Existing & Reusable** | Default rest shape |
| `mouth_smile` | `mouth_smile.png` | Cheerful curved smile | **Existing & Reusable** | Triggered in `happy` & `proud` |
| `mouth_open` | `mouth_open.png` | Small open mouth | **Existing & Reusable** | Triggered in `surprised` |
| `mouth_sleepy` | `mouth_sleepy.png` | Drowsy small wavy mouth | **Existing & Reusable** | Triggered in `sleepy` |
| `mouth_frown` | `mouth_frown.png` | Slight pout / concentrated mouth | **Existing & Reusable** | Available for emotional transitions |

---

### 3.3. Equipment Closet Items & Dedicated RPG Icons

Currently, the `EquipmentCloset.vue` component renders standard Lucide icons (`Sparkles`, `Crown`, `Shirt`, `Footprints`, `Gem`) for gear items. To meet production quality standards, dedicated 128×128 pixel-art / illustrated anime chibi icons must be provided.

| Item Code | Category | Name | Current Status | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| `hair_luma_adventurer` | Hair | Tóc Lữ Khách Luma | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hair_topknot` | Hair | Búi Tóc Nho Sinh | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hair_wanderer` | Hair | Tóc Kiếm Khách Lãng Tử | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hair_short_layered` | Hair | Tóc Ngắn Tỉa Lớp | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hair_medium_wavy` | Hair | Tóc Lượn Sóng Lãng Du | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hair_long_fantasy` | Hair | Tóc Tiên Tung Bay | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_scholar_hat` | Hat | Mũ Nho Sinh (Scholar’s Cap) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_straw_hat` | Hat | Nón Lá Tiêu Dao (Straw Hat) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_phoenix_crown` | Hat | Mão Phượng Hoàng (Phoenix Crown) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hat_fantasy_beret` | Hat | Mũ Nồi Giả Tưởng (Fantasy Beret) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hat_adventurer_hood` | Hat | Mũ Trùm Du Lữ (Adventurer Hood) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `hat_nature_themed` | Hat | Nón Vành Thiên Nhiên (Nature Hat) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `outfit_luma_tunic` | Outfit | Áo Khoác Du Lữ Luma | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `outfit_novice` | Outfit | Y Phục Tân Thủ (Novice Robe) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_silk_robe` | Outfit | Trường Bào Lam Điền (Silk Robe) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_leather_vest` | Outfit | Áo Da Lữ Khách (Leather Vest) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_dragon_armor` | Outfit | Chiến Bào Kim Long (Dragonscale) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `outfit_explorer_tunic`| Outfit | Áo Du Ngoạn Tiêu Chuẩn | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `outfit_forest_ranger` | Outfit | Chiến Phục Kiểm Lâm (Ranger) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `outfit_academy_robe` | Outfit | Học Phục Học Viện (Academy Robe)| **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `shoes_luma_boots` | Shoes | Ủng Da Lữ Khách Luma | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `shoes_cloth` | Shoes | Hài Vải Hành Hiệp (Cloth Shoes) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `shoes_embroidered` | Shoes | Hài Thêu Trúc Lâm (Embroidered) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `shoes_adventure_boots`| Shoes| Ủng Thám Hiểm Da Mềm | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `shoes_fantasy_cloth` | Shoes | Giày Vải Huyền Ảo | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `shoes_nature_sandals` | Shoes | Sandal Dây Rừng (Nature Sandals)| **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `accessory_luma_satchel`| Accessory| Túi Thư Tịch Luma (Satchel) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_bamboo_brush` | Accessory | Bút Lông Trúc Lâm (Bamboo Brush)| **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_wooden_sword` | Accessory | Mộc Kiếm Tân Thủ (Wooden Sword) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `item_jade_pendant` | Accessory | Ngọc Bội Bình An (Jade Pendant) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `acc_round_glasses` | Accessory | Kính Tròn Học Giả (Glasses) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `acc_small_scarf` | Accessory | Khăn Len Ấm Áp (Small Scarf) | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |
| `acc_decorative_necklace`| Accessory| Dây Chuyền Ngọc Hổ Phách | **Needs Redesign (Icon)** | Generate 128×128 illustrated icon |

---

### 3.4. Supporting Character Screen Art & Backgrounds

| Asset Identifier | Role | Current Status | Action Required |
| :--- | :--- | :--- | :--- |
| `stage_backdrop_cozy` | Cozy fantasy room backdrop for `CharacterStage` | **Missing / Placeholder** | Generate illustrated stage backdrop (512×512) |
| `empty_slot_frame` | Visual frame for unequipped slots | **Optional Improvement** | Design subtle ornamental frame |
| `avatar_portrait_luma` | Circular profile avatar in header | **Missing** | Extract 256×256 head crop with transparent alpha |

---

## 4. Rigby2D & Spine Asset Verification

The Rigby2D project at `apps/game/assets/characters/luma/source/luma.rigby` and its Spine 4.3 runtime exports in `apps/web/public/assets/spine/character/` have been audited:
- **Bones:** 32 hierarchical bones (root, hip, chest, neck, head, eyes, brows, mouth, hair_f, hair_b, arms, legs, IK constraints).
- **Slots:** 29 slots supporting independent attachment swapping and draw order sorting.
- **Skins:** 3 skins (`default`, `skin_explorer`, `skin_adventurer`).
- **Animations:** 9 validated animations (`idle_breathe`, `idle_blink`, `happy`, `curious`, `surprised`, `sleepy`, `proud`, `walk`, `run`).

## 5. Audit Conclusion & Next Actions

1. The core character anatomy, modular body layers, facial components, and skeletal animations are fully established and validated.
2. The primary gap on the `/character` screen is the **absence of illustrated RPG equipment icons** (currently falling back to generic Lucide glyphs) and the **stage backdrop illustration**.
3. All missing assets will be generated in Phase 4 & 5, normalized via Pillow in Phase 6, integrated into `EquipmentCloset.vue` and `asset-manifest.ts` in Phase 8, and verified in Phase 9.
