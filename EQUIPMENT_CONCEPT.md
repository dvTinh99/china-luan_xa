# LINGUAWORLD — MODULAR 2D RPG EQUIPMENT DESIGN SHEET

## Main Prompt

Using the approved LinguaWorld Luma character concept (`CHARACTER_CONCEPT.md`) as the exact visual master reference, create a modular 2D RPG equipment asset design sheet for a cozy language-learning adventure game called LinguaWorld.

### Art Direction
- **Style**: Anime Chibi Fantasy.
- **Detail Level**: Medium detail level, crisp readable silhouettes at UI display sizes (32px to 256px).
- **Linework**: Soft dark-brown outlines (`#3d281d`), never harsh pure-black outlines. Subtle inner creases (`#5c3d2e`).
- **Shading**: Soft cel-shading with 2–3 levels (base, warm shadow, gentle highlight).
- **Atmosphere**: Warm, cozy, whimsical fantasy RPG.
- **Color Language**:
  - Warm cream linen (`#fdfbf7` / shadow `#e5ded1`).
  - Sage green (`#52796f` / shadow `#354f52` / highlight `#84a98c`).
  - Muted fantasy blue / slate navy (`#415a77` / `#1b263b`).
  - Soft golden/brass hardware accents (`#e0a96d` / `#fef08a`).
  - Warm brown leather (`#8b5a2b` / shadow `#5c3d1e`).
  - Earthy terracotta & moss (`#b45309`, `#2d6a4f`).

---

## Equipment Specifications

All assets are designed to fit the standard Luma base chibi skeleton (2.5–3 heads tall, large expressive anime chibi head, compact torso, standing upright neutral relaxed pose).

### 1. Hair (`slot: hair`)
- **Attachment Anchor**: Skull vertex (center `[0, -164]`).
- **Layers**: Distinguishable front bangs, side locks, and back volume.
- **Items**:
  1. `hair_short_layered` — **Short Layered Hairstyle**:
     - Dynamic textured clumps with distinct front bangs framing the forehead.
     - Signature perky adventurer ahoge tuft on the crown.
     - Soft side tufts resting above the jawline.
  2. `hair_medium_wavy` — **Medium Wavy Hairstyle**:
     - Gentle wavy locks cascading down past the cheeks to shoulder height.
     - Side-swept soft bangs with warm cel-shading highlights.
     - Whimsical natural movement suitable for a wanderer.
  3. `hair_long_fantasy` — **Long Fantasy Hairstyle**:
     - Flowing twin strands or long back mantle draped behind the shoulders.
     - Front face-framing locks with a tiny brass clip or nature leaf pin.
     - Clean separation between front hair layer and back hair container.

### 2. Hats (`slot: hat`)
- **Attachment Anchor**: Head crown (center `[0, -170]`).
- **Requirement**: Must not clip through front bangs or obscure expressive eyebrows.
- **Items**:
  1. `hat_fantasy_beret` — **Soft Fantasy Beret**:
     - Cozy woven cloth beret tilted gently to one side.
     - Adorned with a small brass leaf or quill badge.
     - Warm sage green or cream felt fabric.
  2. `hat_adventurer_hood` — **Small Adventurer Hood**:
     - Lightweight travel cowl resting softly around the crown and neck.
     - Folded fabric cuffs with brass snap clasp.
     - Compact profile that frames the face without casting dark harsh shadows.
  3. `hat_nature_themed` — **Decorative Nature-Themed Hat**:
     - Woven straw or pressed bark brimmed hat.
     - Wrapped with a delicate braided vine and miniature sprout/flower accent.
     - Provides sunshade silhouette while keeping the chibi face unobstructed.

### 3. Outfits (`slot: outfit`)
- **Attachment Anchor**: Torso root (`[0, -42]`).
- **Requirement**: Fully modular torso cover, includes matching arm sleeve cuffs; leaves room for belt and neck attachments.
- **Items**:
  1. `outfit_explorer_tunic` — **Cozy Explorer Tunic**:
     - Comfortable cream linen undershirt with a short sage-green adventurer jacket.
     - Sturdy leather travel belt with a rounded brass buckle.
     - Symbolic brass compass or language scroll token at the hip.
  2. `outfit_forest_ranger` — **Forest Ranger Outfit**:
     - Earthy forest-green and tan leather tunic with reinforced shoulder yokes.
     - Criss-cross leather lacing at the collar.
     - Dual utility pouch loops and soft acorn-shaped buttons.
  3. `outfit_academy_robe` — **Elegant Academy Outfit**:
     - Muted navy-blue scholar robe with cream lapels and delicate gold filigree trim.
     - High structured collar and tailored cuffs.
     - Suggests scholarly exploration, linguistics, and magical research.

### 4. Shoes (`slot: shoes`)
- **Attachment Anchor**: Feet origin (`left: [-20, 0]`, `right: [20, 0]`).
- **Requirement**: Grounded flat on floor plane, matching natural upright stance.
- **Items**:
  1. `shoes_adventure_boots` — **Simple Adventure Boots**:
     - Soft oiled brown leather boots with rolled-down linen cuffs.
     - Petite brass side buckles and rounded reinforced toes.
  2. `shoes_fantasy_cloth` — **Soft Fantasy Shoes**:
     - Flexible slip-on cloth loafers in sage green or deep teal.
     - Gold embroidered trim around the ankle opening.
  3. `shoes_nature_sandals` — **Nature-Themed Sandals**:
     - Sturdy strapped travel sandals with criss-crossed leather cords.
     - Woven natural fiber soles for light-footed woodland exploration.

### 5. Accessories (`slot: accessory` / `slot: face`)
- **Attachment Anchors**: Face (`[0, -120]`), Neck (`[0, -80]`), or Hip (`[-42, -24]`).
- **Items**:
  1. `acc_round_glasses` — **Round Glasses**:
     - Classic circular spectacles with thin brass wire frames.
     - Perfectly sized for chibi eye proportions with clean transparent lenses and subtle white specular sheen.
  2. `acc_small_scarf` — **Small Scarf**:
     - Cozy knitted warm wool scarf wrapped neatly around the neck.
     - Short fringed tail falling over one shoulder.
     - Tonal palette: terracotta orange or warm amber.
  3. `acc_decorative_necklace` — **Decorative Necklace**:
     - Delicate braided leather cord with a glowing teardrop amber or jade talisman.
     - Rests naturally on the upper chest above tunic collar lines.

---

## Production & Technical Constraints

1. **Orthographic Separation**:
   - Each item is rendered separately in a crisp orthographic front-facing view.
   - Clean transparent background (PNG with alpha channel).
   - No character mannequin body merged behind items (assets must be transparent hollow sprites ready for slot attachment).
2. **Modular Boundary & Alignment**:
   - Outfits leave neck and limb sockets open for seamless skeleton skinning.
   - Hats conform to the chibi skull curvature without clipping the eyebrows.
   - Shoes are pre-aligned to standard chibi foot bones with zero perspective tilt.
3. **Line Quality**:
   - Consistent stroke weight (2.0–2.5px for outer contour, 1.2–1.5px for inner details).
   - Contours strictly colored `#3d281d`.
4. **Scale & Silhouette**:
   - Bold, clear readable shapes designed to stay sharp at both 48×48 inventory icons and 400×500 full-character stage.
   - Avoid hairline strokes or microscopic details that blur when scaled.

---

## Negative Prompt

pixel art, 3D model, photorealistic render, harsh black outlines, black lineart, extreme perspective, isometric angle, dynamic combat pose, items merged together, model body inside clothes, mannequin, watermarks, signature, low resolution, blurred edges, sci-fi elements, modern streetwear, heavy plate armor, spikes, weapons.

