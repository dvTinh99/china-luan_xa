// ============================================================================
// GET /api/audio/resolve — Resolve published audio for content
// ============================================================================

import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';
import { getAudioStorageProvider } from '../../utils/audio/storage';
import { AudioContentType } from '@prisma/client';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const contentType = query.contentType as AudioContentType;
  const contentId = query.contentId as string;
  const voiceCode = query.voiceCode as string | undefined;

  if (!contentType || !contentId) {
    return sendApiError(
      event,
      400,
      'BAD_REQUEST',
      'Both contentType and contentId query parameters are required.',
    );
  }

  // Find the primary published asset for this content
  const asset = await prisma.audioAsset.findFirst({
    where: {
      contentType,
      contentId,
      publicationStatus: 'PUBLISHED',
      ...(voiceCode ? { voiceProfile: { code: voiceCode } } : { isPrimary: true }),
    },
    include: {
      voiceProfile: true,
    },
    orderBy: { version: 'desc' },
  });

  if (!asset) {
    return sendApiSuccess(event, {
      asset: null,
      message: 'No published audio asset available for this content.',
    });
  }

  const storage = getAudioStorageProvider();
  const url = storage.getUrl(asset.storageKey);

  return sendApiSuccess(event, {
    asset: {
      id: asset.id,
      contentType: asset.contentType,
      contentId: asset.contentId,
      sourceText: asset.sourceText,
      pinyin: asset.pinyin,
      audioFormat: asset.audioFormat,
      durationMs: asset.durationMs,
      fileSizeBytes: asset.fileSizeBytes,
      version: asset.version,
      voice: {
        id: asset.voiceProfile.id,
        code: asset.voiceProfile.code,
        name: asset.voiceProfile.name,
      },
      url,
    },
  });
});

