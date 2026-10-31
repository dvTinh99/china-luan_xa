# LinguaWorld — Complete UI/UX Redesign

Act as a senior Product Designer, Art Director and Frontend Engineer specializing in gamified educational products.

Use the installed UI/UX design skill before implementing anything.

## Product context

LinguaWorld is a Mandarin-learning platform combined with a 2D Cartoon Cozy RPG.

Architecture:
- Nuxt 4 + Vue 3 + Tailwind CSS: application and learning UI.
- Godot: 2D world, character rendering, NPCs and adventure gameplay.
- PostgreSQL + Prisma: backend data.

The current interface looks generic and lacks a distinctive visual identity. Redesign it as a cohesive educational RPG product, not a conventional SaaS dashboard.

## Art direction

Create a distinctive visual identity combining:

1. Cozy fantasy RPG.
2. Playful educational experience.
3. Friendly cartoon illustration.
4. Clean and focused learning interface.
5. Game-inspired progression and collection UI.

Avoid:
- Generic SaaS dashboard layouts.
- Excessive white cards on gray backgrounds.
- Generic purple/blue AI gradients.
- Excessive glassmorphism.
- Emoji used as the primary icon system.
- Unnecessary decoration that reduces readability.
- Copying Duolingo's exact branding or interface.

## Required design process

### Step 1 — Audit

Inspect the existing application and identify:
- Current routes and pages.
- Existing components.
- Current color and typography system.
- Responsive behavior.
- Inconsistent or generic UI patterns.
- Existing functionality that must be preserved.

### Step 2 — Art direction

Propose three visual directions for LinguaWorld.

For each direction provide:
- Visual identity.
- Color palette.
- Typography.
- Component style.
- Illustration style.
- Animation/motion direction.
- Example Home screen composition.

Choose the strongest direction and explain why.

### Step 3 — Design system

Create reusable design tokens:
- Colors.
- Typography scale.
- Spacing.
- Border radius.
- Shadows and elevation.
- Buttons.
- Inputs.
- Cards.
- Progress indicators.
- Navigation.
- Feedback and reward components.

Create a consistent component library rather than styling each page independently.

### Step 4 — Redesign the key screens

Prioritize:

1. Home / Player Dashboard.
2. Learning Dashboard.
3. Vocabulary Flashcard.
4. Quiz / Exercise.
5. SRS Review.
6. Character Profile.
7. Inventory.
8. Shop.
9. Quest Overview.

The Home screen should communicate:
- Player identity and character.
- Current learning progress.
- Next recommended learning activity.
- Due SRS reviews.
- Active quests.
- Recent achievements.

Learning screens should prioritize:
- Chinese characters.
- Pinyin.
- Vietnamese meanings.
- Audio playback.
- Clear answer feedback.
- Learning progress.

Game-inspired elements must not distract from actual learning.

### Step 5 — Implementation

Implement the selected design in the existing Nuxt codebase.

Requirements:
- Reuse existing business logic and API contracts.
- Do not break existing functionality.
- Use reusable Vue components.
- Use responsive layouts.
- Support desktop and mobile.
- Keep accessibility and keyboard navigation.
- Use subtle purposeful animations.
- Use appropriate loading, empty and error states.

Do not rewrite the backend or change the Godot architecture as part of this UI task.

### Step 6 — Visual review

Run the application and inspect the actual rendered screens.

Evaluate:
- Visual hierarchy.
- Consistency.
- Typography.
- Color.
- Spacing.
- Responsiveness.
- Interaction states.
- Accessibility.

Fix the most important issues before declaring completion.

## Deliverables

1. UI audit report.
2. Three visual directions.
3. Selected art direction.
4. Design tokens and component system.
5. Implemented screens.
6. Before/after screenshots.
7. Responsive verification.
8. List of changed files.
9. Remaining UI issues.

Work incrementally. Complete the design system and Home screen first, then wait for approval before redesigning all remaining pages.