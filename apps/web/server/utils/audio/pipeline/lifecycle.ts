// ============================================================================
// LinguaWorld — Audio Review & Publication Lifecycle (Audio_system.md §6, §10)
// ============================================================================

import { prisma } from '../../prisma';
import { getAudioStorageProvider } from '../storage';
import { createAudioGenerationJob, executeAudioJob } from './runner';

/**
 * Approve a generated audio asset after human review (§6 step 9)
 */
export async function approveAudioAsset(assetId: string, reviewedBy = 'system_admin') {
  const asset = await prisma.audioAsset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    throw new Error(`AudioAsset not found: ${assetId}`);
  }

  const updated = await prisma.audioAsset.update({
    where: { id: assetId },
    data: {
      reviewStatus: 'APPROVED',
      reviewedBy,
      reviewedAt: new Date(),
    },
    include: { voiceProfile: true },
  });

  return updated;
}

/**
 * Reject a generated audio asset with a reason
 */
export async function rejectAudioAsset(assetId: string, reviewedBy = 'system_admin') {
  const asset = await prisma.audioAsset.findUnique({
    where: { id: assetId },
  });

  if (!asset) {
    throw new Error(`AudioAsset not found: ${assetId}`);
  }

  const updated = await prisma.audioAsset.update({
    where: { id: assetId },
    data: {
      reviewStatus: 'REJECTED',
      reviewedBy,
      reviewedAt: new Date(),
    },
    include: { voiceProfile: true },
  });

  return updated;
}

/**
 * Publish an approved audio asset (§6 step 10)
 * Replaces the primary asset for the content while preserving old versions in history.
 */
export async function publishAudioAsset(assetId: string) {
  const asset = await prisma.audioAsset.findUnique({
    where: { id: assetId },
    include: { voiceProfile: true },
  });

  if (!asset) {
    throw new Error(`AudioAsset not found: ${assetId}`);
  }

  if (asset.reviewStatus !== 'APPROVED') {
    throw new Error(
      `Cannot publish audio asset with reviewStatus "${asset.reviewStatus}". An audio asset must be APPROVED before publication.`,
    );
  }

  const storage = getAudioStorageProvider();
  const url = storage.getUrl(asset.storageKey);

  // Unset previous primary assets for this content & voiceProfile
  await prisma.audioAsset.updateMany({
    where: {
      contentType: asset.contentType,
      contentId: asset.contentId,
      voiceProfileId: asset.voiceProfileId,
      isPrimary: true,
      NOT: { id: asset.id },
    },
    data: {
      isPrimary: false,
    },
  });

  // Mark current asset as PUBLISHED and primary
  const publishedAsset = await prisma.audioAsset.update({
    where: { id: asset.id },
    data: {
      publicationStatus: 'PUBLISHED',
      isPrimary: true,
      publishedAt: new Date(),
    },
    include: { voiceProfile: true },
  });

  // If this is vocabulary learning content, link the URL directly into Vocabulary table
  if (asset.contentType === 'VOCABULARY') {
    await prisma.vocabulary.update({
      where: { id: asset.contentId },
      data: { audioUrl: url },
    }).catch((err) => {
      console.warn(`[PublishAudio] Vocabulary record ${asset.contentId} not found to update audioUrl:`, err);
    });
  }

  return { asset: publishedAsset, url };
}

/**
 * Regenerate an audio asset (§7, §11)
 * Preserves the existing published version while creating a new generation job with an incremented version number.
 */
export async function regenerateAudioAsset(assetId: string, autoExecute = true) {
  const asset = await prisma.audioAsset.findUnique({
    where: { id: assetId },
    include: { voiceProfile: true },
  });

  if (!asset) {
    throw new Error(`AudioAsset not found: ${assetId}`);
  }

  // Create new generation job with incremented version
  const { job } = await createAudioGenerationJob({
    contentType: asset.contentType,
    contentId: asset.contentId,
    sourceText: asset.sourceText,
    pinyin: asset.pinyin,
    voiceProfileId: asset.voiceProfileId,
  });

  if (autoExecute) {
    return executeAudioJob(job.id);
  }

  return { job };
}

