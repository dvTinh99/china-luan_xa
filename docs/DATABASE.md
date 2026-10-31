# LinguaWorld — Database Design

**Version:** 1.0 draft  
**Database:** PostgreSQL  
**ORM:** Prisma

This is a domain-oriented starting point. Final Prisma schema should be normalized and reviewed before implementation.

## 1. Domains and suggested tables

### User
- `users`
- `user_settings`
- `sessions` (if using database-backed sessions)

### Character
- `characters`
- `character_stats`
- `character_appearances`

### Curriculum and learning
- `curriculums`
- `curriculum_levels`
- `courses`
- `units`
- `lessons`
- `vocabulary`
- `vocabulary_meanings`
- `vocabulary_readings`
- `vocabulary_examples`
- `vocabulary_audio`
- `grammar_points`
- `exercises`
- `questions`
- `question_options`

### Learning history and SRS
- `learning_sessions`
- `learning_answers`
- `vocabulary_progress`
- `review_history`

### Economy and inventory
- `items`
- `wallets`
- `wallet_transactions`
- `inventory`
- `equipment`

### Quest and world
- `quests`
- `quest_objectives`
- `quest_progress`
- `regions`
- `locations`
- `world_unlocks`

### Combat
- `combat_sessions`
- `combat_actions`

### Pets/housing (later)
- `pet_definitions`
- `user_pets`
- `houses`
- `decorations`
- `house_decorations`

### Achievement
- `achievements`
- `user_achievements`

## 2. Important relationships

- Every user-owned row has `user_id`.
- A curriculum has version and source metadata.
- A curriculum level belongs to a curriculum, not globally to the vocabulary table.
- Vocabulary is a reusable language item; curriculum membership should be represented through a join/mapping where needed.
- A vocabulary item may appear in more than one curriculum or level.
- Learning answers belong to a learning session.
- SRS state is per user and vocabulary item.
- Wallet transactions are immutable ledger entries.
- Inventory ownership references item definitions.
- Quest progress is per user and quest.
- Combat actions belong to a server-created combat session.

## 3. Key fields

### curriculums
- `id`
- `code` (e.g. `hsk-3.0`)
- `name`
- `version`
- `language_code`
- `translation_language_code`
- `source_url`
- `license_name`
- `license_url`
- `status`
- `created_at`

### vocabulary
- `id`
- `language_code`
- `hanzi`
- `simplified`
- `traditional`
- `created_at`

### vocabulary_readings
- `id`
- `vocabulary_id`
- `reading`
- `reading_system` (e.g. pinyin)
- `is_primary`

### vocabulary_meanings
- `id`
- `vocabulary_id`
- `language_code`
- `meaning`
- `part_of_speech`
- `review_status`
- `source_id`

### curriculum_vocabulary
- `curriculum_level_id`
- `vocabulary_id`
- `sequence_number`
- `source_reference`

### vocabulary_progress
- `id`
- `user_id`
- `vocabulary_id`
- `state`
- `difficulty`
- `stability`
- `due_at`
- `last_reviewed_at`
- `total_reviews`
- `correct_reviews`
- `incorrect_reviews`
- `algorithm_version`

### review_history
- `id`
- `user_id`
- `vocabulary_id`
- `answer`
- `rating`
- `response_time_ms`
- `reviewed_at`
- `session_id`

### wallet_transactions
- `id`
- `user_id`
- `currency`
- `amount` (signed or explicit direction; choose one convention)
- `transaction_type`
- `reference_type`
- `reference_id`
- `idempotency_key`
- `created_at`

## 4. Constraints and indexes

- Unique user email/username as appropriate.
- Unique `(user_id, vocabulary_id)` for current SRS state.
- Unique idempotency key within the relevant user/domain.
- Unique inventory ownership row by `(user_id, item_id)` if quantity-based.
- Index user-owned tables by `(user_id, created_at)`.
- Index due reviews by `(user_id, due_at)`.
- Index curriculum vocabulary by `(curriculum_level_id, sequence_number)`.
- Foreign keys for all domain relationships.
- Use check constraints for nonnegative quantities/balances where applicable.

## 5. Transaction requirements

Purchase transaction:
1. Lock/read wallet safely.
2. Validate item availability and price on server.
3. Validate sufficient balance.
4. Debit wallet.
5. Create inventory ownership/quantity.
6. Write ledger transaction.
7. Commit atomically.

Reward transaction:
1. Validate originating learning/quest/combat event.
2. Check idempotency/unique reward claim.
3. Calculate reward server-side.
4. Credit wallet and/or EXP.
5. Write ledger/event record.
6. Commit atomically.

Never update wallet balance without a corresponding ledger entry.

## 6. Content provenance

Store source and license information for imported learning content. Avoid mixing data with different licensing conditions into an untraceable dataset.
