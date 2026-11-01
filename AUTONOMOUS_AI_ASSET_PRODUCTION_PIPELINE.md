# LINGUAWORLD – CHARACTER SCREEN ASSET PRODUCTION

## Mission

You are a Senior Game Art Director, Character Artist, Technical Artist, and AI Asset Pipeline Engineer.

Your mission is to complete the visual asset library for the existing LinguaWorld **`/character` screen**.

Use the following tools:
- Claude Opus: Art direction, planning, prompt engineering, orchestration, and quality control.
- Nano MCP: Actual image generation and image editing.
- Rigby2D MCP: Character asset preparation, rigging, and animation.
- Local scripts and image-processing tools: Asset processing, normalization, validation, and export.

You must use the actual MCP tools and their exposed schemas. Never invent tool names, parameters, or capabilities.

**IMPORTANT SCOPE RESTRICTION**

Only work on the `/character` screen and assets directly required by this screen.

Do NOT generate assets for:
- Game environments.
- World maps.
- NPCs unrelated to the character screen.
- Shops.
- Quests.
- Inventory screens outside `/character`.
- Other game screens.
- General game illustrations.
- Future features that are not currently implemented.

The goal is to finish `/character` first, not to build the entire game's art library.

---

# PHASE 1 – INSPECT THE EXISTING CHARACTER SCREEN

Before generating any images, inspect the existing project.

Locate and analyze:
- Nuxt route `/character`.
- All Vue components used by this route.
- Existing styles and design system.
- Existing character preview implementation.
- Existing equipment and customization interfaces.
- Existing character data and equipment slots.
- Existing image and sprite assets.
- Existing Godot integration, if used by this page.
- Existing Rigby2D character project.

Read the relevant documentation and source code.

Determine exactly what the player can currently do on `/character`.

Create a complete inventory of visual assets required by the existing implementation.

Classify each asset as:

1. Existing and reusable.
2. Existing but needs redesign.
3. Missing and must be generated.
4. Optional improvement.

Do not redesign the page's functionality or invent new gameplay systems.

Create:

- `character/CHARACTER_ASSET_AUDIT.md`
- `character/CHARACTER_ART_DIRECTION.md`
- `character/CHARACTER_ASSET_MANIFEST.json`
- `character/CHARACTER_PRODUCTION_PLAN.md`

The audit must identify the actual assets required by the current `/character` screen.

---

# PHASE 2 – ESTABLISH CHARACTER ART DIRECTION

Use the existing approved Luma character design as the source of truth.

## Luma identity

Character name: Luma – The Little Wanderer.

Personality:
- Curious.
- Friendly.
- Warm.
- Optimistic.
- Adventurous.
- Loves exploration and learning.

Luma is not a warrior and should not be restricted to a single profession.

## Approved visual style

**Super Deformed Fantasy Anime Chibi**

Proportions:
- 2–2.3 heads tall.
- Head approximately 45–50% of total height.
- Large expressive anime eyes.
- Detailed iris, pupils, and highlights.
- Tiny nose and expressive mouth.
- Soft blush.
- Voluminous layered hair.
- Compact body.
- Short expressive arms and legs.
- Slightly oversized hands and boots.

Rendering:
- Soft dark-plum or dark-brown outlines.
- Soft cel shading.
- Subtle gradients.
- Clean, polished anime illustration.
- Readable at small game scale.

## Approved palette

- Mystic Lavender: `#B9A0D9`
- Fantasy Blue: `#78A9D9`
- Royal Teal: `#579E9B`
- Warm Gold: `#E8B76B`
- Rose Pink: `#E9A8B9`
- Soft Cream: `#F8EBD5`
- Dark Plum: `#493747`
- Nature Green: `#9CC8A1`
- Warm Skin: `#F5D9C4`

## Default costume

- Short fantasy explorer tunic.
- Small cape or shoulder mantle.
- Golden star emblem or pendant.
- Small explorer pouch.
- Belt.
- Cute boots.

Before generating production assets:
1. Inspect existing Luma reference images.
2. Select the best available master reference.
3. Generate or refine a master character reference if necessary.
4. Establish consistent front-facing proportions.
5. Establish the default costume and color references.
6. Save the approved reference for subsequent image-generation tasks.

Do not change Luma's identity during subsequent generations.

---

# PHASE 3 – NANO MCP CAPABILITY DISCOVERY

Inspect all available Nano MCP tools and schemas.

Identify support for:
- Text-to-image.
- Image-to-image.
- Reference image input.
- Multiple reference images.
- Image editing.
- Background removal.
- Transparent background.
- Image dimensions.
- Aspect ratios.
- Multiple outputs.
- Seed or consistency controls.
- Batch generation.
- Output file paths.

Create `character/NANO_MCP_CAPABILITIES.md`.

Important:
- Use actual MCP capabilities only.
- Do not assume transparent PNG output is supported.
- Do not assume layered PSD export is supported.
- Do not assume pixel-perfect alignment across generated images.
- Validate actual image output and alpha channels.
- Use a separate image-processing stage if necessary.

Use reference images whenever supported to maintain Luma's visual consistency.

---

# PHASE 4 – GENERATE CHARACTER ASSETS

Generate only assets required by the existing `/character` screen.

## A. Main Character Reference

Prepare:
- Front-facing full-body Luma.
- Character neutral pose.
- Character proportions reference.
- Character color reference.
- Costume reference.

Generate additional angles only if the existing character screen requires them.

## B. Modular Character Body

Prepare independent components as required by the existing rig:

Head:
- Face base.
- Head base.
- Ears.
- Neck.

Hair:
- Hair back.
- Hair front.
- Left side hair.
- Right side hair.

Body:
- Torso.
- Pelvis / lower body.
- Left upper arm.
- Left forearm.
- Left hand.
- Right upper arm.
- Right forearm.
- Right hand.
- Left leg.
- Right leg.

Clothing:
- Default tunic.
- Cape back.
- Cape front.
- Belt.
- Explorer pouch.
- Boots.

Each component must be designed for the actual character rig.

Requirements:
- Preserve Luma's proportions and identity.
- Include sufficient hidden artwork underneath overlapping joints.
- Avoid gaps during rotation.
- Maintain consistent outline thickness and lighting.
- Use a common canvas size and coordinate alignment when required.
- Preserve original source images.
- Do not merge independent components into flattened artwork.

Do not generate unused body parts merely to complete a theoretical list. Follow the actual rig requirements.

## C. Modular Facial System

The facial system must support independent expression changes.

Generate:

Face:
- `face_base.png`: Skin, blush, chin and ears, without eyes, eyebrows or mouth.

Open eyes:
- `eye_left.png`
- `eye_right.png`

Closed eyes:
- `eye_closed_left.png`
- `eye_closed_right.png`

Optional half-closed eyes:
- `eye_half_left.png`
- `eye_half_right.png`

Eyebrows:
- `brow_left.png`
- `brow_right.png`

Mouth:
- `mouth_neutral.png`
- `mouth_smile.png`
- `mouth_open.png`
- `mouth_sleepy.png`
- `mouth_frown.png`

Requirements:
- All facial features must be separate.
- No facial features baked into `face_base.png`.
- All parts must align with the same face reference.
- Closed eyes must match the open eye positions.
- Mouth variants must share the same position.
- Eyebrows must be independently adjustable.

Prepare the following expressions where supported by the actual rig:

- Idle.
- Blink.
- Happy.
- Curious.
- Surprised.
- Sleepy.
- Proud.
- Sad.
- Excited.

## D. Character Animation Assets

Use Rigby2D MCP to inspect and prepare the existing animation system.

Required animations:
- `idle_breathe`
- `idle_blink`
- `happy`
- `curious`
- `surprised`
- `sleepy`
- `proud`
- `walk`
- `run`

Do not generate unrelated animations.

Use actual Rigby2D functionality and validate exported results.

If an animation requires additional sprites or expression assets, add them to the manifest.

## E. Equipment and Customization Assets

Inspect the existing equipment slots and customization features on `/character`.

Only generate items for supported slots.

Potential slots:
- Hair.
- Hat.
- Outfit.
- Shoes.
- Front accessory.
- Back accessory.
- Neck accessory.

For each existing slot:
1. Identify current item count and item categories.
2. Identify missing artwork.
3. Generate a consistent initial asset collection.
4. Ensure every item fits Luma's existing proportions.
5. Ensure items can be equipped independently.

Prioritize the default equipment and items already present in the application.

Do not invent new equipment slots or change equipment data structures.

## F. Character Equipment Icons

Generate icons for equipment items that appear on `/character`.

Requirements:
- Consistent icon style.
- Recognizable silhouettes.
- Transparent background where appropriate.
- Consistent dimensions.
- Clear appearance at actual UI scale.
- Consistent rarity treatment if the existing system supports rarity.

Do not generate icons for unrelated inventory items or shop items.

## G. Character Screen Supporting Art

Inspect the existing page and identify whether it needs:

- Character background or stage.
- Character profile portrait.
- Equipment slot illustrations.
- Empty equipment slot artwork.
- Character customization category icons.
- Decorative character-screen elements.
- Loading or empty-state illustrations.

Generate only what is genuinely needed by the existing page.

Do not replace functional Vue UI components with generated screenshots.

---

# PHASE 5 – IMAGE GENERATION WORKFLOW

Generate assets in controlled batches.

Recommended order:

Batch 1:
- Luma master reference.
- Default full-body character.
- Art direction approval.

Batch 2:
- Modular body.
- Hair.
- Default costume.
- Accessories.

Batch 3:
- Facial assets.
- Expression variations.

Batch 4:
- Equipment variations for existing slots.

Batch 5:
- Equipment icons.
- Character portraits.
- Supporting `/character` illustrations.

For every batch:

1. Prepare prompts using Claude Opus.
2. Call Nano MCP.
3. Save actual output files.
4. Inspect generated images.
5. Validate visual consistency.
6. Process and normalize images.
7. Update the manifest.
8. Mark failed or uncertain outputs for review.

Do not generate everything in one enormous request.

Do not ask the user to manually write individual prompts.

Do not claim that an image was saved unless the actual output file exists.

---

# PHASE 6 – IMAGE PROCESSING AND VALIDATION

Build or reuse scripts for:

- Image dimension inspection.
- Alpha channel validation.
- Background removal.
- Canvas normalization.
- Transparent padding.
- Image alignment.
- File format conversion.
- Preview generation.
- Sprite sheet generation where required.
- Duplicate detection.

For production transparent assets:
- PNG RGBA.
- Genuine transparent pixels.
- No fake checkerboard backgrounds.
- No unwanted background artifacts.
- Preserve white and light-colored character details.
- Avoid destructive modification of source artwork.

For modular character components:
- Preserve shared canvas dimensions.
- Preserve relative positioning.
- Include sufficient overlap for joints.
- Verify correct layer stacking.
- Verify that components reconstruct the original character.

If precise alignment cannot be achieved automatically, mark the asset `review_required`.

---

# PHASE 7 – RIGBY2D INTEGRATION

Use Rigby2D MCP to inspect the existing character project.

Preserve the current working character and create a backup before making changes.

Tasks:
- Import approved modular assets.
- Configure hierarchy.
- Configure layer ordering.
- Set and validate pivots.
- Configure facial feature visibility.
- Configure expression states.
- Configure equipment slots.
- Prepare required animations.
- Export using formats supported by the installed Rigby2D workflow.

Do not invent APIs or assume unsupported features.

Test:
- Neutral character reconstruction.
- Facial expression switching.
- Eye blinking.
- Eyebrow movement.
- Mouth switching.
- Equipment changes.
- Idle animation.
- Walk and run animations.

Do not mark integration complete until the actual output has been tested.

---

# PHASE 8 – INTEGRATE WITH `/character`

Inspect the existing Nuxt `/character` implementation.

Integrate the new assets into the existing page.

Requirements:
- Preserve current page functionality.
- Preserve existing data models.
- Preserve equipment and character state logic.
- Preserve API contracts.
- Preserve backend business logic.
- Preserve responsive behavior.
- Do not rewrite unrelated components.
- Do not change database schemas.
- Do not introduce new gameplay systems.

Improve the visual presentation only where necessary to display the new assets correctly.

Validate:
- Character preview.
- Character scale and positioning.
- Equipment display.
- Equipment switching.
- Facial expressions.
- Animation playback.
- Loading behavior.
- Desktop layout.
- Mobile layout.
- Missing asset handling.

Godot must not access the database directly. The backend remains the source of truth for game state.

If the character preview uses Godot Web or another rendering integration, verify its actual compatibility before changing it.

---

# PHASE 9 – ASSET QUALITY CONTROL

Every asset must have an explicit status:

- `planned`
- `generating`
- `generated`
- `processing`
- `review_required`
- `approved`
- `failed`
- `integrated`

Visual validation:
- Matches Luma's identity.
- Matches approved art direction.
- Correct proportions.
- Correct color palette.
- Clean silhouette.
- No unwanted artifacts.
- Readable at actual game scale.

Technical validation:
- Correct dimensions.
- Correct format.
- Correct transparency.
- Correct alignment.
- Correct filename.
- Correct location.
- No broken files.

Integration validation:
- Correctly imported.
- Correctly layered.
- Correctly positioned.
- Correctly displayed in `/character`.
- Interactions still work.
- Responsive layout remains functional.

Never mark an asset approved just because image generation succeeded.

---

# PHASE 10 – FINAL DELIVERABLES

Create the following documentation:

- `character/CHARACTER_ASSET_AUDIT.md`
- `character/CHARACTER_ART_DIRECTION.md`
- `character/CHARACTER_ASSET_MANIFEST.json`
- `character/CHARACTER_PRODUCTION_PLAN.md`
- `character/NANO_MCP_CAPABILITIES.md`
- `character/CHARACTER_ASSET_QA_REPORT.md`
- `character/RIGBY2D_INTEGRATION_REPORT.md`
- `character/CHARACTER_SCREEN_VALIDATION.md`

Organize generated assets using the existing project conventions.

If no suitable convention exists, propose:

`assets/character/`
- `references/`
- `luma/body/`
- `luma/face/`
- `luma/hair/`
- `luma/clothing/`
- `luma/accessories/`
- `luma/animations/`
- `equipment/`
- `icons/`
- `ui/`
- `previews/`
- `source/`

Do not move existing files unnecessarily.

---

# EXECUTION RULES

1. Start by auditing `/character`.
2. Inspect Nano MCP and Rigby2D MCP capabilities.
3. Create the asset manifest before generating images.
4. Reuse existing assets whenever appropriate.
5. Preserve existing approved Luma references.
6. Use Claude Opus to orchestrate Nano MCP.
7. Use Nano MCP for actual image generation.
8. Use scripts for repeatable image processing.
9. Use Rigby2D MCP for supported rigging operations.
10. Save all actual outputs to the project.
11. Back up files before modifying existing assets.
12. Never fabricate successful operations.
13. Never modify unrelated game screens.
14. Never generate assets outside the `/character` scope.
15. Continue working through independent tasks when an asset requires manual review.

## DEFINITION OF DONE

The `/character` screen is complete only when:

- All visual assets required by its current functionality have been inventoried.
- All required character assets have been generated or explicitly marked as blocked.
- Luma has a consistent visual identity.
- Modular facial assets work.
- Character equipment assets work.
- Required animations have been validated.
- Assets are integrated into the actual `/character` page.
- Existing functionality is preserved.
- Desktop and mobile layouts have been checked.
- Asset manifests and QA reports are updated.

Do not expand the scope to the rest of LinguaWorld.

## START NOW

Begin with Phase 1 and Phase 3.

Inspect the existing `/character` route, current assets, Nano MCP and Rigby2D MCP.

Then produce the audit and asset manifest.

After that, immediately begin Batch 1.

Do not stop at planning. Execute the work autonomously in controlled batches and report actual results.