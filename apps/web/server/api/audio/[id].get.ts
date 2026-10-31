// ============================================================================
// GET /api/audio/:id — Fetch published audio asset by ID
// ============================================================================

import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';
import { getAudioStorageProvider } from '../../utils/audio/storage';

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id');

  if (!id) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing audio ID parameter.');
  }

  const asset = await prisma.audioAsset.findUnique({
    where: { id },
    include: {
      voiceProfile: true,
    },
  });

  if (!asset) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Audio asset not found.');
  }

  // Check publication status
  if (asset.publicationStatus !== 'PUBLISHED') {
    return sendApiError(
      event,
      403,
      'UNPUBLISHED_AUDIO',
      'This audio asset has not been published yet.',
    );
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
      language: asset.language,
      audioFormat: asset.audioFormat,
      durationMs: asset.durationMs,
      fileSizeBytes: asset.fileSizeBytes,
      checksum: asset.checksum,
      version: asset.version,
      voice: {
        id: asset.voiceProfile.id,
        code: asset.voiceProfile.code,
        name: asset.voiceProfile.name,
        role: asset.voiceProfile.role,
      },
      url,
    },
  });
});

