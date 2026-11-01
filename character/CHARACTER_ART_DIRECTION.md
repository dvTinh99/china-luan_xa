# CHARACTER ART DIRECTION SPECIFICATION
## LinguaWorld — Luma 2.0 Super Deformed Fantasy Anime Chibi

**Document Status:** Approved & Production-Ready  
**Role:** Master Visual Reference for `/character` Screen & Rigging  
**Character Identity:** Luma — The Little Wanderer  

---

## 1. Character Identity & Lore

| Attribute | Specification |
| :--- | :--- |
| **Name** | Luma (卢玛) |
| **Title** | The Little Wanderer (小小的漫游者) |
| **Personality** | Curious, warm, friendly, optimistic, adventurous, observant |
| **Core Role** | A young fantasy explorer who discovers the world through learning ancient script and languages. Not a soldier or battle-hardened warrior; an intellectual traveler with an insatiable wonder for the unknown. |
| **Key Motifs** | Golden guiding star (⭐), traveler's journal satchel, celestial lavender hair, breezy explorer mantle. |

---

## 2. Anatomical Proportions — Super Deformed (SD) Chibi

```
  0.0 ─── Top of Head / Ahoge ───
         │
         │   HEAD REGION (~48% of total height)
         │   - Oversized expressive anime skull
         │   - Large multi-layer eyes
         │   - Voluminous layered bangs & locks
         │
  1.0 ─── Chin / Neck ───────────
         │
         │   TORSO REGION (~28% of total height)
         │   - Compact cozy tunic & mantle
         │   - Short expressive arms, soft joints
         │   - Expressive hands (slightly oversized for gestures)
         │
  1.6 ─── Hip / Belt ────────────
         │
         │   LEGS & FEET (~24% of total height)
         │   - Short, rounded chibi legs
         │   - Sturdy, cute explorer ankle boots
         │
  2.1 ─── Ground Plane ──────────
```

### Proportional Rules:
- **Total Height:** 2.0 to 2.3 heads tall (approx. 597 units in Rigby2D canvas).
- **Head Ratio:** Head constitutes 45%–50% of the complete vertical silhouette.
- **Eyes:** Occupy 35%–40% of the vertical face height. Upper eyelashes are distinct and curved; irises feature deep gradient tones, white specular reflections, and soft luminous crescents.
- **Hands & Feet:** Slightly oversized relative to limbs to ensure clear silhouette readability at mobile resolutions.
- **Pivots:** Joint pivots must overlap cleanly by 15–20% under parent layers to prevent gaps during animation rotations.

---

## 3. Official Color Palette & Chromatic Hierarchy

All character assets, equipment icons, and interface illustrations must adhere strictly to the following 9 canonical swatches:

| Color Name | Hex Code | Swatch | Intended Usage |
| :--- | :--- | :--- | :--- |
| **Mystic Lavender** | `#B9A0D9` | ![#B9A0D9](https://via.placeholder.com/15/B9A0D9/000000?text=+) | Primary hair base, iris luminous crescent, magical sparkles |
| **Fantasy Blue** | `#78A9D9` | ![#78A9D9](https://via.placeholder.com/15/78A9D9/000000?text=+) | Explorer mantle, scholar robes, sky accents, mid-iris |
| **Royal Teal** | `#579E9B` | ![#579E9B](https://via.placeholder.com/15/579E9B/000000?text=+) | Jade pendants, fine cloth hems, deep water / scholar trims |
| **Warm Gold** | `#E8B76B` | ![#E8B76B](https://via.placeholder.com/15/E8B76B/000000?text=+) | Star emblem, belt buckles, book clasps, metallic filigree |
| **Rose Pink** | `#E9A8B9` | ![#E9A8B9](https://via.placeholder.com/15/E9A8B9/000000?text=+) | Cheek blush, smile interior, soft romantic embellishments |
| **Soft Cream** | `#F8EBD5` | ![#F8EBD5](https://via.placeholder.com/15/F8EBD5/000000?text=+) | Inner explorer tunic, parchment scrolls, sclera highlights |
| **Dark Plum** | `#493747` | ![#493747](https://via.placeholder.com/15/493747/000000?text=+) | Master contour outlines, eyelashes, deep shading, pupil |
| **Nature Green** | `#9CC8A1` | ![#9CC8A1](https://via.placeholder.com/15/9CC8A1/000000?text=+) | Bamboo brush shafts, nature hats, herbal satchels |
| **Warm Skin** | `#F5D9C4` | ![#F5D9C4](https://via.placeholder.com/15/F5D9C4/000000?text=+) | Character skin base, ears, hands, neck |

### Outline & Shading Rules:
1. **Never Pure Black (`#000000`):** Pure black destroys fantasy warmth. Master outlines MUST use **Dark Plum (`#493747`)** or dark chestnut brown (`#3D281D`).
2. **Cel Shading:** 2 to 3 discrete tonal steps (Base Color, Ambient Shadow at 70% brightness shifted toward plum/teal, Specular Highlight at 120% brightness).
3. **Line Weight:** Consistent 2–3px vector line weight at 512×512 master resolution, tapering naturally at tips of hair bangs and garment edges.

---

## 4. Default Costume Breakdown

The canonical explorer outfit communicates curiosity, readiness for mild outdoor travel, and scholarly study:

1. **Inner Tunic:** Soft cream (`#F8EBD5`) linen shirt with rounded collar and subtle golden stitching.
2. **Shoulder Mantle / Cape:** Fantasy blue (`#78A9D9`) capelet resting gently on the shoulders, fastened with a golden four-pointed star brooch (`#E8B76B`).
3. **Explorer Belt & Satchel:** Warm leather belt (`#8B5A2B`) with a brass buckle holding a compact travel pouch on the right hip for scrolls and flashcards.
4. **Boots:** Soft leather ankle boots with rounded toes and cream fur/cloth trim, designed for comfortable walking across ancient paths.
5. **Headwear:** Soft explorer beret or brimmed sun cap adorned with a small celestial badge.

---

## 5. Facial Rigging & Expression States

The facial system is divided into four completely decoupled layers:
- **`face_base`**: Smooth facial oval, ears, and soft pink blush (`#E9A8B9`). No eyes, eyebrows, or mouth baked into this layer.
- **`eyes`**: Left and right eyes rigged independently. Each eye has an open state (layered iris, pupil, highlights), a closed curved eyelash arc for blinking, and a half-lidded relaxed state.
- **`eyebrows`**: Left and right eyebrows with free rotation (-15° to +20°) and vertical translation (±12px).
- **`mouth`**: Mutually exclusive attachment slots for `neutral`, `smile`, `open`, `sleepy`, and `frown`.

### Canonical Expression Matrix:

| Emote ID | Eyebrows | Eyes | Mouth Shape | Head Angle | Body Dynamics |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`idle`** | Neutral rest | Open, tracking player | `mouth_neutral` | 0° upright | Gentle 2.5s vertical breathing sine wave |
| **`happy`** | Slightly raised, relaxed | Curved closed arc (^^) | `mouth_smile` | +2° tilt | Playful 1.4s bounce, arm lift |
| **`curious`** | Left brow raised, right angled | Open, slightly shifted | `mouth_smile` | +8° tilt | Torso leans forward 4px |
| **`surprised`**| Raised +12px high | Wide open, enlarged highlights | `mouth_open` | 0° upright | Sudden +6px hop and settle |
| **`sleepy`** | Drooped, relaxed | Half-lidded / closed arc | `mouth_sleepy` | -4° tilt | Slow 2.8s deep breathing, gentle head nod |
| **`proud`** | Confident slant, raised | Open with star glint | `mouth_smile` | +3° chin up | Torso expands upright, chest puff |

---

## 6. Equipment Icon Art Direction (Closet & Wardrobe)

All equipment items displayed in `EquipmentCloset.vue` must adhere to a unified visual language:
- **Canvas Size:** 128×128 pixels (or 256×256 master source, downscaled with Lanczos filtering).
- **Format:** 32-bit RGBA PNG with true transparent background (no baked checkered pattern).
- **Framing:** Centered item filling 75%–85% of the frame with a 10% breathing margin.
- **Outline:** 2px dark plum (`#493747`) outer border with inner soft cel highlights.
- **Drop Shadow:** Subtle semi-transparent ground shadow (`rgba(73, 55, 71, 0.25)`) beneath resting items.
- **Rarity Tinting:**
  - `COMMON`: Natural tones, clean linen/leather styling.
  - `RARE`: Subtle emerald (`#10B981`) or sapphire glow around key accents.
  - `EPIC`: Royal purple / amethyst sheen with gilded gold trim.
  - `LEGENDARY`: Brilliant amber-gold aura with floating star embers.
