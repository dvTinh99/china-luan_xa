# LinguaWorld — Audio System Implementation

You are a Senior Full-stack Engineer and Audio Infrastructure Architect.

Implement a reusable Audio System for LinguaWorld, a Mandarin-learning platform built with Nuxt 4, Vue 3, TypeScript, PostgreSQL, Prisma, and Godot 4.x.

## 1. First: Understand the existing project

Before coding:

1. Read all existing project documentation, especially:
   - `docs/PRD.md`
   - `docs/GDD.md`
   - `docs/ARCHITECTURE.md`
   - `docs/API.md`
   - `docs/DATABASE.md`
   - `docs/GAME_BRIDGE.md`
   - `docs/LEARNING_CONTENT.md`
   - `docs/ROADMAP.md`
2. Inspect the existing source code, Prisma schema, API conventions, authentication, and Godot bridge.
3. Identify existing audio-related functionality.
4. Produce a short implementation plan and list of files that need to change.
5. Do not replace existing architecture or introduce an unrelated backend service.

## 2. Product requirements

Build three audio categories:

### A. Learning Audio
- One consistent Mandarin Chinese voice.
- Vocabulary pronunciation.
- Example sentence pronunciation.
- Support normal and slow playback.
- Prioritize clear, accurate pronunciation over emotional expression.

### B. Conversation Audio
- Multiple speaker profiles.
- Support dialogue between two or more speakers.
- Maintain speaker consistency across dialogue lines.
- Store dialogue order and speaker identity.
- Allow playback of individual lines and the complete conversation.

### C. NPC Voice
Create configurable voice profiles for:
- Village Guide: friendly and welcoming.
- Shopkeeper: energetic and expressive.
- Storyteller: calm and narrative.

Voice profiles must be data-driven. Do not hardcode voice IDs throughout the application.

## 3. TTS architecture

Create a provider abstraction so the application is not tied to one TTS vendor.

Suggested interface:

- `TTSProvider`
- `CosyVoiceProvider`
- `EdgeTTSProvider` (optional fallback)
- `AudioStorageProvider`
- `CloudflareR2StorageProvider`

Requirements:
- CosyVoice is the primary candidate for batch audio generation.
- Edge TTS may be used for early prototyping.
- Do not require a large TTS model to run on the user's development Mac.
- TTS generation must run asynchronously as background jobs.
- Never generate audio synchronously during a learning activity request.
- Keep API keys and provider credentials server-side.
- Check model and voice licensing before commercial use.
- Use synthetic or properly licensed voice references only.

If a provider cannot be configured without credentials, implement the interface and a mock provider. Do not invent credentials or pretend generation succeeded.

## 4. Database

Design Prisma models for:

- `VoiceProfile`
- `AudioAsset`
- `AudioGenerationJob`

AudioAsset should support:
- content type
- content ID
- language
- source text
- Pinyin
- voice profile
- provider
- storage key
- audio format
- duration
- file size
- checksum
- version
- generation parameters
- review status
- publication status
- timestamps

Suggested statuses:

`PENDING`, `PROCESSING`, `GENERATED`, `NEEDS_REVIEW`, `APPROVED`, `PUBLISHED`, `FAILED`, `ARCHIVED`.

Important:
- Do not store binary audio files in PostgreSQL.
- Store object keys rather than permanent CDN URLs.
- Preserve previously published audio when regenerating.
- Support multiple audio versions for the same content.
- Avoid duplicate generation jobs for identical content, voice profile, and parameters.

## 5. Storage

Implement Cloudflare R2 through its S3-compatible API.

Requirements:
- Private credentials on the server.
- Configurable bucket and public CDN base URL.
- Upload and delete operations.
- Object key versioning.
- Correct MIME types.
- Audio metadata and checksum validation.
- Signed URLs or controlled public CDN URLs.
- No hardcoded bucket credentials.

Suggested key structure:

`learning/{curriculum}/{level}/{contentId}/{voiceProfile}/{version}.mp3`

`conversation/{conversationId}/{speakerId}/{lineId}/{version}.mp3`

`npc/{characterId}/{dialogueId}/{version}.mp3`

Provide `.env.example` with placeholder values.

## 6. Audio generation pipeline

Implement this lifecycle:

1. Create generation job.
2. Validate source text and voice profile.
3. Generate audio through the selected provider.
4. Validate output format and non-empty file.
5. Calculate checksum and duration.
6. Upload to object storage.
7. Create or update AudioAsset.
8. Set status to `NEEDS_REVIEW`.
9. Allow an administrator/editor to approve.
10. Publish the approved version.

A failed job must preserve its error message and allow retry.

Do not automatically publish generated audio.

## 7. API

Follow existing Nuxt Server API conventions.

Implement appropriate endpoints for:
- Fetching published audio by ID.
- Resolving audio for learning content.
- Creating generation jobs.
- Listing and inspecting jobs.
- Retrying failed jobs.
- Approving generated audio.
- Publishing approved audio.
- Regenerating existing audio.

All admin operations must require authorization.

Validate request bodies and never trust client-supplied storage keys, file URLs, or publication statuses.

## 8. Frontend Audio Manager

Create a reusable Audio Manager for Nuxt.

Required features:
- Play.
- Pause.
- Resume.
- Stop.
- Replay.
- Playback speed control: 0.75x, 1x, 1.25x, 1.5x.
- Loading and error states.
- Prevent overlapping playback where appropriate.
- Handle missing or unpublished audio gracefully.
- Avoid unnecessary duplicate downloads.

Integrate with:
- Vocabulary flashcards.
- Example sentences.
- Quiz/listening activities.
- Conversation playback.

Do not redesign unrelated pages.

## 9. Godot integration

Extend the existing versioned Nuxt-Godot bridge.

Expose a safe message for audio playback using an audio asset ID or resolved URL.

Godot should:
- Play NPC dialogue.
- Support stop and replay.
- Handle loading and playback errors.
- Avoid direct database or storage access.
- Never trust a client-generated URL without validation.

Reuse the existing bridge protocol. Do not create a second independent communication mechanism.

## 10. Quality and pronunciation

Create an audio review workflow.

Check:
- Correct Mandarin text.
- Pinyin and tone marks.
- Pronunciation of names and special terms.
- Audio duration.
- Silence and clipping.
- Consistent voice identity.
- Correct speaker assignment.
- Correct dialogue order.

Do not claim automated audio checks guarantee pronunciation accuracy. Include a human review step for learning content.

## 11. Implementation phases

Implement incrementally:

Phase 1:
- Prisma schema.
- Storage abstraction.
- R2 integration.
- Audio Manager.
- One sample audio asset.

Phase 2:
- TTS provider abstraction.
- CosyVoice adapter.
- Background generation jobs.
- Review and publish lifecycle.

Phase 3:
- HSK vocabulary and sentence audio integration.
- Conversation multi-speaker support.

Phase 4:
- NPC voice integration.
- Godot bridge integration.
- End-to-end verification.

Do not implement all phases in one uncontrolled change.

## 12. Deliverables and acceptance criteria

At the end of each phase, report:
- Files created or modified.
- Database migrations.
- Environment variables.
- API endpoints.
- Setup instructions.
- Commands executed.
- Verification results.
- Known limitations.
- Remaining tasks.

Acceptance criteria:
- A published audio asset can be played in Nuxt.
- Audio playback supports speed adjustment.
- Multiple voice profiles work.
- A generation job can be created and retried.
- Generated audio requires approval before publishing.
- Previously published versions remain available during regeneration.
- Godot can play an approved NPC audio asset through the existing bridge.
- No TTS credentials are exposed to the client.
- Existing learning and game functionality remains intact.

Start with Phase 1 only. Inspect the project, implement the minimum complete foundation, run available checks, and stop for review before proceeding to Phase 2.