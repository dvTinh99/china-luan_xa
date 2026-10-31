# LinguaWorld — Product Requirements Document

**Version:** 1.2

## 1. Product overview

LinguaWorld is a language-learning platform presented through a friendly 2D cartoon RPG. Players create a personal character, learn Mandarin Chinese, complete learning activities and quests, earn EXP and Gold, customize their character, and explore a game world.

The first use case is personal Mandarin learning. The architecture must be suitable for later public multi-user use and additional language courses.

### Product promise

Learn. Play. Explore. Evolve.

### Core principle

**Learning First:** gameplay must support measurable learning. The product must not become a conventional game with superficial quizzes attached.

## 2. Target users

### Initial user
- A learner studying Mandarin Chinese.
- Wants a more engaging alternative to conventional flashcards and vocabulary apps.
- Enjoys character customization, quests, exploration and collecting items.

### Future users
- Other independent language learners.
- Learners following structured curricula such as HSK.
- Community members who may participate in social and cooperative activities.

## 3. Product pillars

1. Learning First — meaningful language learning is the primary progression driver.
2. Character Progression — create, customize and develop a personal character.
3. Exploration — unlock regions, meet NPCs and complete story quests.
4. Collection — collect outfits, items, furniture and pets.
5. Long-term Retention — SRS, achievements, quests and content expansion.
6. Expandability — support additional users, languages and curricula.

## 4. Core user journey

1. Register or sign in.
2. Create a character.
3. Select a language course and curriculum.
4. Complete a lesson or due SRS reviews.
5. Earn server-validated EXP, Gold and quest progress.
6. Level up the RPG character and customize appearance.
7. Spend Gold on cosmetic items and decorations.
8. Enter the Godot world, explore and interact with NPCs.
9. Complete language-based quests and adventure encounters.
10. Return for scheduled reviews and new content.

## 5. Functional requirements

### 5.1 Authentication and profile
- Register, login, logout and retrieve current user.
- Secure session handling.
- User settings and learning preferences.
- Every user-owned record must be scoped to the authenticated user.

### 5.2 Character
- Create a character.
- Store appearance/customization selections.
- Track RPG level, EXP, HP and reputation.
- Display the character in Nuxt and Godot.
- Character level must not be treated as language proficiency.

### 5.3 Learning
- Course → Unit → Lesson → Activity structure.
- Initial course: Mandarin Chinese.
- Initial curriculum: HSK 3.0 Band 1; HSK 2.0 may be supported as a separate curriculum.
- Support vocabulary, grammar, listening, reading and writing content.
- MVP activity types:
  - Flashcards.
  - Word matching.
  - Quiz.
- Persist learning sessions, answers, accuracy and completion.
- Allow learning content access independently of RPG region unlocks.

### 5.4 Spaced repetition
- Maintain per-user/per-vocabulary scheduling state.
- Store every review attempt.
- Calculate due reviews using a proven algorithm such as FSRS.
- Prioritize overdue vocabulary.
- Measure recall/retention rather than views.
- Keep algorithm version and scheduling parameters traceable.

### 5.5 Economy
- Gold as initial currency.
- EXP and Gold rewards calculated by backend.
- Transaction ledger for every credit/debit.
- Idempotent reward processing.
- Repeated trivial activities must not create unlimited rewards.
- MVP monetization is out of scope.

### 5.6 Inventory and shop
- Item catalog.
- Inventory ownership.
- Purchase and equip/unequip.
- Purchases validated and committed transactionally.
- Cosmetic items are preferred for MVP.
- Equipment must not overpower actual language ability.

### 5.7 Quests
- Learning, daily, weekly, adventure, achievement and seasonal quest types.
- Quest objectives progress from validated backend events.
- NPC story quests may require multiple learning objectives.
- Reward claims must be idempotent.

### 5.8 World and Godot game
- Godot Web export embedded in Nuxt `/world`.
- 2D cartoon world.
- Character movement and animation.
- NPC rendering and interaction.
- World/region state loaded from backend.
- Future: combat, bosses, pets and housing.

### 5.9 Administration and content operations
Future admin functionality:
- Manage curriculum, courses, units, lessons and vocabulary.
- Import CSV/JSON datasets.
- Review translations and examples.
- Manage audio assets and source/license metadata.
- Manage items, quests and rewards.
- Publish/unpublish content.

## 6. Non-functional requirements

- Responsive Nuxt UI.
- Keyboard and touch input support where relevant.
- Accessible learning controls and readable typography.
- Secure authorization on every user-specific API.
- Validate all request payloads.
- Rate-limit sensitive endpoints.
- Log important economy and progression events.
- Database migrations must be reproducible.
- Godot game build and API contract must be versioned.
- Optimize asset size and initial game loading.
- Test real iOS Safari and Android Chrome, not only desktop emulation.

## 7. Product rules

- No punishment for inactivity.
- Pets must not lose health/happiness due to absence.
- No loss of learning progress because a player takes a break.
- Character level and language proficiency are independent.
- SRS reviews and appropriate learning content remain accessible even when regions are locked.
- Backend is authoritative.
- Do not grant rewards solely because a client reports that an activity is complete.

## 8. MVP definition

Must have:
- Authentication.
- Character creation.
- Initial Mandarin vocabulary dataset.
- At least three learning activity types.
- Learning history.
- SRS scheduling.
- EXP and Gold reward processing.
- Inventory and basic shop.
- Godot Web embedded in Nuxt.
- Basic 2D character/world visualization.
- Nuxt ↔ Godot bridge.
- Backend validation for all important rewards.

Should have:
- Daily quests.
- Character animation.
- NPC interaction.
- Basic exploration.
- Achievements.

Out of scope for MVP:
- Real-time multiplayer.
- Guilds and leaderboards.
- Full social network.
- Complex housing simulation.
- Large-scale combat content.
- User-generated curriculum marketplace.
- Payment and premium currency systems.

## 9. Success metrics

North Star Metric: **Weekly Retained Vocabulary** — vocabulary items correctly recalled during the week, measured from review outcomes.

Supporting metrics:
- Weekly Active Learners.
- Lessons Completed.
- SRS Review Completion Rate.
- Vocabulary Retention.
- Learning Accuracy.
- Quest Completion Rate.
- Weekly Return Rate.
- Gold Earned vs Gold Spent.
- World Exploration Rate.

Avoid optimizing solely for login streaks or time spent.
