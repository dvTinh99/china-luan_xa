# LinguaWorld — 2D Chibi Rig Character Screen

You are a Senior Frontend Game Engineer, PixiJS Developer, Spine 2D Technical Artist, and Nuxt Architect.

Your task is to design and implement a 2D rigged chibi Character Screen for LinguaWorld.

## Product context

LinguaWorld is a Mandarin-learning platform with a Cozy Fantasy RPG experience.

Existing technology:
- Nuxt 4
- Vue 3
- TypeScript
- Tailwind CSS
- PostgreSQL
- Prisma
- Nuxt Server API
- Godot 4.x for the actual game world

Character design requirements:
- Cute 2D chibi cartoon.
- Skeletal rig animation.
- Equipment customization.
- Subtle idle animations.
- Character statistics.
- Learning statistics.
- Responsive desktop and mobile UI.

The character screen is `/character`.

The character renderer must use PixiJS + Spine Runtime.

Do not use Three.js, TresJS, React, or React Three Fiber.

Do not embed Godot just to display the character.

---

# 1. Inspect the existing project

Before implementation:

1. Read the existing documentation.
2. Inspect Nuxt architecture, routing, layouts, UI components, state management, API conventions, and Prisma schema.
3. Inspect existing character, inventory, equipment, and player progression systems.
4. Inspect existing Godot character assets and naming conventions.
5. Check whether any 2D character artwork or Spine assets already exist.
6. Check package compatibility before installing dependencies.

Do not create duplicate systems if equivalent functionality already exists.

Produce a concise implementation plan before coding.

---

# 2. Visual direction

Create a Cozy Fantasy Character Studio.

Visual style:
- Cute 2D chibi cartoon.
- Warm cream backgrounds.
- Soft green accents.
- Natural earthy colors.
- Rounded UI elements.
- Friendly typography.
- Soft shadows.
- Subtle decorative fantasy details.

Avoid:
- Generic SaaS dashboard design.
- Excessive gradients.
- Excessive glassmorphism.
- Neon colors.
- Excessive nested cards.
- Emoji as primary icons.
- Copying Duolingo's branding.

The character must be the visual focus.

The page should feel like a cozy room where the player can view their character and manage equipment.

---

# 3. Technology

Use:
- PixiJS 8.
- Official Spine Runtime compatible with PixiJS 8.
- Vue 3.
- TypeScript.
- Nuxt 4.
- Existing project state management.

Check the current compatible PixiJS and Spine runtime versions before installing.

Use the maintained official Spine runtime for PixiJS 8, not an outdated PixiJS 7 plugin.

Use client-only rendering.

All browser-only imports must be isolated from Nuxt SSR.

Spine is a licensed product. Do not assume that its editor or runtime is free for commercial distribution. Document the license requirements.

---

# 4. Character architecture

Use a modular 2D rigged character.

The character should have one shared skeleton and configurable equipment.

Conceptual skeleton:

- root
- body
- head
- left_arm
- right_arm
- left_leg
- right_leg
- hair

Conceptual slots:

- face
- hair
- hat
- outfit
- shoes
- accessory_front
- accessory_back

Customization categories:

## Hair
- Multiple hairstyles.
- Hair color variants.

## Hat
- Hats.
- Headbands.
- Ribbons.

## Outfit
- Shirts.
- Pants.
- Skirts.
- Dresses.
- Cloaks.

## Shoes
- Shoes.
- Boots.
- Sandals.

## Accessories
- Glasses.
- Necklaces.
- Backpacks.
- Other compatible accessories.

The first implementation should support:
- Switching equipment attachments.
- Switching compatible skins.
- Changing allowed color variants.
- Previewing equipment before saving.

Do not create a separate skeleton for every equipment combination.

Do not assume every item can be applied to every character. Compatibility must be represented in asset metadata.

---

# 5. Asset pipeline

Use Spine as the rigging and animation source.

The intended production pipeline:

1. Create original chibi character artwork.
2. Separate artwork into clean layers.
3. Prepare transparent PNG parts.
4. Import parts into Spine.
5. Create bones and slots.
6. Weight meshes where necessary.
7. Create compatible equipment attachments.
8. Create skins and animation clips.
9. Export skeleton data and atlas.
10. Load assets in PixiJS.

Suggested export files:

- character.json or compatible binary skeleton format.
- character.atlas
- texture atlas images.

Create an asset manifest describing:

- asset ID
- category
- display name
- slot
- skin or attachment name
- thumbnail
- allowed color variants
- compatibility
- unlock requirements
- asset version

Do not invent production-quality Spine assets if none exist.

If no real Spine model is available:
- Implement the renderer abstraction.
- Create a mock renderer or clearly labeled placeholder character.
- Create the manifest and asset contract.
- Document the exact requirements for the production Spine artist.
- Do not claim that placeholder images are a working rigged character.

---

# 6. Subtle animations

Support the following animations:

- idle
- breathe
- blink
- happy
- surprised

Requirements:
- Smooth transitions.
- Natural timing.
- Loopable idle.
- No excessive movement.
- No combat, running, jumping, or aggressive animations on this screen.

If the production skeleton contains a combined idle animation, use it rather than forcing separate animation clips.

If the model does not contain an animation, show a graceful fallback and report the missing clip.

Do not fake skeletal animation with random CSS transforms.

---

# 7. Character screen UI

Implement `/character`.

## Character Stage

- Large central character.
- Cozy fantasy background.
- Subtle idle animation.
- Loading indicator.
- Error state.
- Static fallback image if WebGL is unavailable.
- Optional emote control.
- Responsive stage sizing.

## Character Stats

Display authoritative backend values:
- Level.
- EXP.
- HP.
- Attack.
- Defense.
- Luck.

Do not calculate authoritative RPG statistics on the client.

## Learning Stats

Display separately:
- Total vocabulary learned.
- Weekly retained vocabulary.
- HSK level.
- Learning streak.
- Review progress.

Character level must never be presented as equivalent to language proficiency.

## Equipment Closet

Create categories:
- Hair.
- Hat.
- Outfit.
- Shoes.
- Accessories.

Each item should have:
- Thumbnail.
- Name.
- Selected state.
- Locked state.
- Equipped state.
- Preview behavior.

The user can preview an item before saving.

## Save controls

- Save.
- Cancel.
- Reset to saved appearance.
- Loading state.
- Save error state.

Mobile:
- Character stage at the top.
- Stats below.
- Equipment categories as tabs.
- Equipment catalog in a bottom sheet or compact panel.
- Controls must remain usable on narrow screens.

---

# 8. Nuxt component architecture

Follow existing project conventions.

Suggested structure:

```text
app/
├── pages/
│   └── character/
│       └── index.vue
├── components/
│   └── character/
│       ├── CharacterStage.client.vue
│       ├── CharacterRenderer.vue
│       ├── CharacterStatsPanel.vue
│       ├── LearningStatsPanel.vue
│       ├── EquipmentPanel.vue
│       ├── EquipmentCategoryTabs.vue
│       ├── EquipmentGrid.vue
│       └── EquipmentPreview.vue
├── composables/
│   ├── useCharacter.ts
│   ├── useCharacterRenderer.ts
│   ├── useCharacterEquipment.ts
│   └── useCharacterAssets.ts
├── services/
│   └── character/
│       ├── pixi-character-engine.client.ts
│       ├── spine-adapter.client.ts
│       └── equipment-mapper.ts
├── stores/
│   └── character.ts
└── types/
    └── character.ts
```

Adjust to the actual repository structure.

Responsibilities:

- Vue components: UI and interactions.
- Store: saved appearance, draft appearance, dirty state.
- PixiJS engine: rendering lifecycle.
- Spine adapter: loading skeleton, changing skins and attachments, animation.
- Nuxt Server API: authorization and persistence.
- Prisma: persistent character and equipment state.

Keep rendering logic separate from business logic.

---

# 9. Equipment preview behavior

Implement a draft state.

The intended workflow:

1. Fetch the saved appearance.
2. Load the character skeleton and current equipment.
3. User selects another equipment item.
4. Preview the item locally.
5. Keep the saved configuration unchanged.
6. Allow the user to select multiple equipment pieces.
7. Save the complete appearance.
8. Backend validates every selected item.
9. Backend persists the authoritative configuration.
10. Frontend updates the saved state.

Cancel must restore the saved appearance without requiring a page reload.

Avoid recreating the PixiJS renderer when changing equipment.

---

# 10. Backend and database

Inspect existing Prisma models before creating new ones.

Reuse existing models where possible.

Conceptual models:

- Character.
- CharacterAppearance.
- CharacterAsset.
- CharacterEquipment.
- UserInventory.

Appearance data should store asset IDs and allowed color values, not binary textures.

Asset metadata should include:
- category
- slot
- attachment name
- skin name
- skeleton compatibility
- allowed color variants
- unlock requirements
- active status
- version

Never trust client-supplied ownership, inventory, Gold, or unlock state.

The backend must validate:
- authenticated user.
- asset existence.
- asset availability.
- item ownership.
- unlock requirements.
- slot compatibility.
- character skeleton compatibility.
- allowed color values.

Save equipment changes transactionally.

---

# 11. API

Follow existing Nuxt Server API conventions.

Implement or adapt:

- GET `/api/character`
- GET `/api/character/equipment`
- POST `/api/character/appearance`
- POST `/api/character/equipment`

The API must return the authoritative character configuration.

Admin asset management can be deferred unless it already exists.

---

# 12. Performance and lifecycle

Requirements:

- Use one PixiJS Application per character stage.
- Reuse loaded textures and atlas data.
- Avoid reinitializing the renderer when equipment changes.
- Avoid loading every catalog asset into GPU memory.
- Use texture atlases.
- Pause or reduce animation when the page is hidden.
- Dispose the application and release owned GPU resources on unmount.
- Prevent duplicate ticker loops.
- Handle failed asset loading.
- Handle WebGL unavailable state.
- Use a static character preview fallback.

Test on desktop and mobile viewports.

Do not claim mobile performance without testing it.

---

# 13. Godot compatibility

LinguaWorld uses Godot 4.x for the game world.

Keep a shared character asset convention:
- skeleton bone naming.
- slot naming.
- skin naming.
- equipment IDs.
- animation names.

Use the same original artwork and Spine project as the source of truth.

Export separately for PixiJS and the appropriate Godot runtime.

Do not assume PixiJS Spine export files can be loaded directly by Godot.

Do not modify the existing Godot architecture during the first phase.

---

# 14. Implementation phases

## Phase 1 — UI and renderer foundation

- Inspect existing project.
- Configure PixiJS and compatible Spine runtime.
- Build `/character`.
- Create character stage.
- Implement loading and error states.
- Create placeholder or mock character renderer.
- Create stats and learning panels.
- Create equipment tabs and item grid.
- Implement responsive layout.

Stop after Phase 1 for review.

## Phase 2 — Real Spine character

- Integrate original Spine skeleton.
- Load atlas and textures.
- Implement idle and blink animations.
- Implement equipment attachments.
- Implement compatible skins.
- Implement color variants.

## Phase 3 — Backend persistence

- Integrate Prisma.
- Integrate character API.
- Implement ownership validation.
- Implement draft/save/cancel.
- Integrate real statistics.

## Phase 4 — Production optimization

- Optimize atlases.
- Verify mobile rendering.
- Test memory cleanup.
- Add loading progress.
- Add missing asset fallbacks.
- Verify Godot naming compatibility.

Do not implement all phases in one uncontrolled change.

---

# 15. Acceptance criteria

Phase 1 is complete only when:

- `/character` loads without SSR errors.
- PixiJS canvas mounts and unmounts correctly.
- Character stage has a visible placeholder or mock character.
- Stats and learning sections render.
- Equipment categories are interactive.
- Selecting a placeholder item updates the draft selection.
- Save and cancel controls have working UI behavior.
- Mobile layout is usable.
- Loading and error states work.
- No React or Three.js dependencies are introduced.
- Existing project routes remain functional.
- Build and type checks pass.

Clearly document any missing production Spine assets.

At the end, report:
- Architecture.
- Dependencies.
- Files changed.
- Commands executed.
- Build/type-check results.
- Screenshots if available.
- Known limitations.
- Exact next steps for Phase 2.

Start with Phase 1 only. Stop and request review before proceeding to Phase 2.