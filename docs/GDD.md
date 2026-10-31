# LinguaWorld — Game Design Document

**Version:** 1.2

## 1. Game identity

- Genre: Cozy RPG + Adventure RPG + future Social RPG.
- Visual style: 2D Cartoon, colorful, friendly and approachable.
- Platform: Web first, with Godot Web embedded in Nuxt.
- Core fantasy: learn a language to develop a character, explore a world, help NPCs, collect items and build a personal home.

## 2. Core gameplay loop

Learn → Earn → Grow → Customize → Explore → Quest → Review.

1. Learn new vocabulary or complete an exercise.
2. Earn EXP, Gold and learning progress.
3. Improve character level and unlock cosmetic options.
4. Visit the world and interact with NPCs.
5. Complete language-based quests.
6. Return for SRS reviews.

## 3. Character system

### Appearance
- Body/base type.
- Hair and hairstyle.
- Face and expression.
- Clothing.
- Accessories.
- Equipment appearance.
- Cosmetic sets.

### RPG stats
- Level.
- EXP.
- HP.
- Gold (wallet is managed by economy domain).
- Reputation.
- Equipment.

### Learning proficiency
Track independently:
- Vocabulary.
- Listening.
- Reading.
- Grammar.
- Writing.
- Speaking.

These values must be derived from actual learning performance. Online time, character level or purchased items must not increase language proficiency.

## 4. Learning activities

MVP:
1. Flashcards — recognize Hanzi, Pinyin and meaning.
2. Word Matching — match Hanzi, Pinyin and Vietnamese meaning.
3. Quiz — multiple choice and/or typed response.

Future:
- Listening Quest.
- Grammar Challenge.
- Sentence Builder.
- Word Dungeon.
- Speaking Challenge.
- Writing Challenge.

Learning sessions must be recorded by the backend. Rewards are granted only after validation.

## 5. Quest system

Types:
- Learning Quest.
- Daily Quest.
- Weekly Quest.
- Adventure Quest.
- Achievement.
- Seasonal Event.

Example story quest: **The Lost Translator**
1. NPC asks player to decode a letter.
2. Player learns five target vocabulary words.
3. Player completes a sentence translation activity.
4. Player completes a listening challenge.
5. Player returns to NPC.
6. Backend verifies all objectives and grants rewards.

Quest definitions should be data-driven, not hardcoded into individual scenes.

## 6. World and regions

Suggested thematic progression:

| Region | Suggested curriculum association |
|---|---|
| Beginner Village | HSK 1 |
| Whispering Forest | HSK 2 |
| Crystal Lake | HSK 3 |
| Ancient City | HSK 4 |
| Dragon Mountain | HSK 5 |
| Celestial Kingdom | HSK 6 |

This is thematic guidance, not a hard learning restriction. Learners must be able to access lessons and due reviews appropriate to their actual learning needs.

Because HSK 3.0 uses nine levels, region-to-level mapping must be configurable rather than hardcoded to six regions.

## 7. Adventure and combat

Combat is turn-based and language-driven.

Flow:
1. Backend creates a combat session.
2. Godot renders encounter and question.
3. Player submits an answer.
4. Backend evaluates the answer.
5. Backend updates combat state.
6. Godot displays the result and animation.
7. Backend validates completion and grants reward.

Rules:
- Correct answer: attack.
- Incorrect answer: lose turn or receive damage.
- Consecutive correct answers: combo.
- Boss encounters: multiple stages/questions.
- Equipment bonuses must remain small.
- Client must never decide authoritative damage, answer correctness or rewards.

## 8. Housing and pets

Future features:
- Personal home.
- Furniture and decoration.
- Room themes.
- Garden.
- Pet collection.
- Pet customization.
- Pet accessories and interactions.

No inactivity punishment. Pets must not lose health, happiness or items because the player is away.

## 9. Economy

Primary currency: Gold. Gems may be considered later, but are not required for MVP.

Gold sources:
- Validated lesson completion.
- Learning quests.
- Daily quests.
- Achievements.
- Validated adventure completion.

Gold sinks:
- Cosmetics.
- Furniture.
- Pet accessories.
- Character customization.
- Limited non-essential equipment.

Economy rules:
- Every transaction is recorded.
- Use idempotency keys for reward claims.
- Prevent duplicate completion and replay abuse.
- Apply reasonable reward caps/cooldowns.
- Do not make purchased equipment a substitute for knowledge.

## 10. UI/UX direction

Nuxt:
- Home prioritizes character, next learning task and due reviews.
- Learning pages prioritize focus and clarity.
- Shop and inventory are standard application screens.
- World route provides a full-screen game experience.

Godot:
- Game world, movement, NPCs and adventure scenes.
- Avoid duplicating account management and complex learning administration in Godot.
- Use loading and error states when game assets or API are unavailable.

## 11. Content principles

- Data-driven lessons, quests and item definitions.
- Store source and license metadata for learning materials.
- Separate curriculum versions.
- Avoid hardcoding HSK level assumptions into gameplay code.
- Use reusable activity templates.
