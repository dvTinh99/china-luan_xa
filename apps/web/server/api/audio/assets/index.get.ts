// ============================================================================
// GET /api/audio/assets — List Audio Assets with review & publication filters
// ============================================================================

import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '../../../utils/prisma';
import { sendApiSuccess } from '../../../utils/response';
import { getAudioStorageProvider } from '../../../utils/audio/storage';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const reviewStatus = query.reviewStatus as any;
  const publicationStatus = query.publicationStatus as any;
  const contentType = query.contentType as any;
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  const offset = Math.max(0, parseInt(query.offset as string) || 0);

  const where: any = {};
  if (reviewStatus) where.reviewStatus = reviewStatus;
  if (publicationStatus) where.publicationStatus = publicationStatus;
  if (contentType) where.contentType = contentType;

  const storage = getAudioStorageProvider();

  const [rawAssets, total] = await Promise.all([
    prisma.audioAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        voiceProfile: true,
      },
    }),
    prisma.audioAsset.count({ where }),
  ]);

  const assets = rawAssets.map((asset) => ({
    ...asset,
    url: storage.getUrl(asset.storageKey),
  }));

  return sendApiSuccess(event, {
    assets,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
});
