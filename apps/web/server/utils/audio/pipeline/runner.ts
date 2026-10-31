// ============================================================================
// LinguaWorld — Audio Generation Pipeline & Job Runner (Audio_system.md §6)
// ============================================================================

import { prisma } from '../../prisma';
import { getTTSProvider } from '../tts';
import { getAudioStorageProvider, buildAudioStorageKey } from '../storage';
import crypto from 'crypto';

export interface CreateJobInput {
  contentType: 'VOCABULARY' | 'EXAMPLE_SENTENCE' | 'CONVERSATION_LINE' | 'NPC_DIALOGUE' | 'SYSTEM_UI';
  contentId: string;
  sourceText: string;
  pinyin?: string | null;
  voiceProfileCode?: string;
  voiceProfileId?: string;
  curriculumCode?: string;
  levelCode?: string;
  speakerId?: string;
}

export function generateIdempotencyKey(params: {
  contentType: string;
  contentId: string;
  voiceProfileId: string;
  sourceText: string;
  version?: number;
}): string {
  const raw = `${params.contentType}:${params.contentId}:${params.voiceProfileId}:${params.sourceText}:${params.version || 1}`;
  return crypto.createHash('sha256').update(raw).digest('hex');
}

/**
 * 1. Create a generation job with idempotency protection (§4, §6)
 */
export async function createAudioGenerationJob(input: CreateJobInput) {
  // Resolve VoiceProfile
  let voiceProfile = null;
  if (input.voiceProfileId) {
    voiceProfile = await prisma.voiceProfile.findUnique({
      where: { id: input.voiceProfileId },
    });
  } else if (input.voiceProfileCode) {
    voiceProfile = await prisma.voiceProfile.findUnique({
      where: { code: input.voiceProfileCode },
    });
  } else {
    // Default to standard learning voice profile
    voiceProfile = await prisma.voiceProfile.findUnique({
      where: { code: 'vp_learning_standard' },
    });
  }

  if (!voiceProfile) {
    throw new Error(`VoiceProfile not found for input: ${input.voiceProfileCode || input.voiceProfileId || 'default'}`);
  }

  // Determine latest version for this content
  const latestAsset = await prisma.audioAsset.findFirst({
    where: {
      contentType: input.contentType,
      contentId: input.contentId,
      voiceProfileId: voiceProfile.id,
    },
    orderBy: { version: 'desc' },
  });

  const nextVersion = (latestAsset?.version || 0) + 1;
  const idempotencyKey = generateIdempotencyKey({
    contentType: input.contentType,
    contentId: input.contentId,
    voiceProfileId: voiceProfile.id,
    sourceText: input.sourceText,
    version: nextVersion,
  });

  // Check if identical active job already exists to avoid duplicate work (§4)
  const existingJob = await prisma.audioGenerationJob.findUnique({
    where: { idempotencyKey },
  });

  if (existingJob) {
    return { job: existingJob, isNew: false, version: nextVersion };
  }

  const job = await prisma.audioGenerationJob.create({
    data: {
      contentType: input.contentType,
      contentId: input.contentId,
      sourceText: input.sourceText,
      pinyin: input.pinyin || null,
      voiceProfileId: voiceProfile.id,
      provider: voiceProfile.provider,
      status: 'PENDING',
      idempotencyKey,
    },
    include: {
      voiceProfile: true,
    },
  });

  return { job, isNew: true, version: nextVersion };
}

/**
 * 2. Execute an audio generation job (§6)
 */
export async function executeAudioJob(jobId: string) {
  const job = await prisma.audioGenerationJob.findUnique({
    where: { id: jobId },
    include: { voiceProfile: true },
  });

  if (!job) {
    throw new Error(`AudioGenerationJob not found: ${jobId}`);
  }

  // Update status to PROCESSING
  await prisma.audioGenerationJob.update({
    where: { id: jobId },
    data: {
      status: 'PROCESSING',
      startedAt: new Date(),
      attempts: { increment: 1 },
      errorMessage: null,
    },
  });

  try {
    // A. Validate source text and voice profile
    const text = job.sourceText.trim();
    if (!text) {
      throw new Error('Source text is empty or invalid.');
    }

    const voice = job.voiceProfile;
    if (!voice) {
      throw new Error('Voice profile is missing.');
    }

    // B. Generate audio through provider
    const tts = await getTTSProvider(voice.provider as any);
    const audioResult = await tts.generate({
      text,
      voiceId: voice.providerVoiceId,
      rate: voice.speed,
      pitch: voice.pitch,
      language: voice.languageCode,
      format: 'mp3',
    });

    // C. Validate output format and non-empty file
    if (!audioResult.buffer || audioResult.buffer.length < 100) {
      throw new Error('Generated audio buffer is empty or corrupted.');
    }

    // D. Calculate checksum and file size
    const checksum = crypto.createHash('sha256').update(audioResult.buffer).digest('hex');
    const fileSizeBytes = audioResult.buffer.length;

    // Approximate duration in ms: 1 second per ~3 Chinese characters, minimum 800ms
    const estimatedDurationMs = Math.max(800, Math.round(text.length * 350 * (1 / (voice.speed || 1))));

    // Determine category and storage key
    let category: 'learning' | 'conversation' | 'npc' = 'learning';
    if (job.contentType === 'CONVERSATION_LINE') category = 'conversation';
    if (job.contentType === 'NPC_DIALOGUE') category = 'npc';

    const latestAsset = await prisma.audioAsset.findFirst({
      where: {
        contentType: job.contentType,
        contentId: job.contentId,
        voiceProfileId: voice.id,
      },
      orderBy: { version: 'desc' },
    });

    const targetVersion = (latestAsset?.version || 0) + 1;

    const storageKey = buildAudioStorageKey({
      category,
      contentId: job.contentId,
      voiceProfileCode: voice.code,
      version: targetVersion,
      format: 'mp3',
    });

    // E. Upload to object storage (§5)
    const storage = getAudioStorageProvider();
    const uploadResult = await storage.upload(storageKey, audioResult.buffer, audioResult.mimeType);

    // F. Create or update AudioAsset with status NEEDS_REVIEW (§6 step 8)
    const asset = await prisma.audioAsset.upsert({
      where: { storageKey },
      update: {
        fileSizeBytes,
        checksum,
        durationMs: estimatedDurationMs,
        reviewStatus: 'NEEDS_REVIEW',
        publicationStatus: 'DRAFT',
      },
      create: {
        contentType: job.contentType,
        contentId: job.contentId,
        language: voice.languageCode,
        sourceText: text,
        pinyin: job.pinyin,
        voiceProfileId: voice.id,
        provider: voice.provider,
        storageKey,
        audioFormat: 'mp3',
        durationMs: estimatedDurationMs,
        fileSizeBytes,
        checksum,
        version: targetVersion,
        reviewStatus: 'NEEDS_REVIEW',
        publicationStatus: 'DRAFT',
      },
    });

    // G. Mark job COMPLETED
    const updatedJob = await prisma.audioGenerationJob.update({
      where: { id: jobId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        resultAssetId: asset.id,
        errorMessage: null,
      },
      include: {
        resultAsset: true,
        voiceProfile: true,
      },
    });

    return { job: updatedJob, asset, url: uploadResult.url };
  } catch (err: any) {
    const errorMsg = err.message || 'Unknown audio generation error';

    const failedJob = await prisma.audioGenerationJob.update({
      where: { id: jobId },
      data: {
        status: 'FAILED',
        errorMessage: errorMsg,
        completedAt: new Date(),
      },
      include: { voiceProfile: true },
    });

    console.error(`[AudioJobRunner] Job ${jobId} failed: ${errorMsg}`);
    return { job: failedJob, error: errorMsg };
  }
}

