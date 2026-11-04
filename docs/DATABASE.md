# Database and Prisma

**Status:** Describes the Prisma schema as inspected on 2026-11-04. `database/prisma/schema.prisma` is authoritative. Note that `.gitignore` currently excludes `database/prisma/migrations/`, so local migration files may not be versioned; do not assume migration history is reproducible from a clean checkout.

## Provider and workflow

- The schema datasource is PostgreSQL (`DATABASE_URL`). `database/prisma/dbProvider.mjs` prepares provider configuration for the repository scripts; inspect it and `.env` before switching providers or running data-changing commands.
- Prisma schema: `database/prisma/schema.prisma`.
- Local migration files, if present: `database/prisma/migrations/` (currently ignored by `.gitignore`).
- Prisma client setup: `database/prisma/client.mjs`; generated output under `database/prisma/generated/` is not hand-edited source.
- Root scripts: `npm run db:generate`, `npm run db:push`, `npm run db:migrate`, `npm run db:seed`, and `npm run db:studio`.
- Resolve the migration tracking policy before shared schema evolution. `db:push` is useful for local iteration but does not create migration history.

## Current model groups

The schema currently defines:

- Identity: `User`, `Session`, `UserSettings`.
- Character/progression: `Character`, `UserChakraProgress`.
- Curriculum/content: `Curriculum`, `CurriculumLevel`, `Course`, `Unit`, `Lesson`, `Vocabulary`, `VocabularyReading`, `VocabularyMeaning`, `VocabularyExample`, `CurriculumVocabulary`, `Radical`, `VocabularyRadical`.
- Learning/SRS: `LearningSession`, `LearningAnswer`, `VocabularyProgress`, `ReviewHistory`.
- Economy/collection: `Wallet`, `WalletTransaction`, `Item`, `InventoryItem`.
- Quests/world/combat: `Quest`, `UserQuest`, `Region`, `CombatSession`.
- Audio operations: `VoiceProfile`, `AudioAsset`, `AudioGenerationJob`.

Use the schema to confirm exact fields, relations, defaults, indexes, and uniqueness. Earlier conceptual suggestions for pets, housing, achievements, or separate location/combat-action tables are not current models unless added to the schema.

## Invariants to preserve

- User-owned records must remain associated with the authenticated user; enforce ownership in server logic as well as relations.
- A user's character, wallet, and settings have unique user relationships in the current schema.
- Vocabulary progress and review history are separate: progress stores current scheduling state while review history records attempts.
- Curriculum membership is modeled separately from reusable vocabulary.
- Wallet transactions provide an audit trail; inspect current schema constraints before changing balance mutation behavior.
- Cross-record economy/reward changes must use server transactions and replay protection where the domain requires it.
- RPG character progression and language proficiency are distinct concepts.

## Schema change checklist

1. Inspect the model, its consumers, migration history, seeds, and DB provider helper.
2. Make the smallest schema change and generate a migration using the project's Prisma scripts/workflow.
3. Update seed/import code and server code that reads or writes the model.
4. Regenerate the client with `npm run db:generate`; never edit generated client output manually.
5. Verify on a disposable/local database and document any compatibility or data-backfill requirement.

Seed scripts in `database/prisma/` can create or modify data. Confirm `DATABASE_URL` points to a safe local target before executing them.
