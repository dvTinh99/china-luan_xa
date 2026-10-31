// ============================================================================
// GET /api/audio/jobs — List audio generation jobs (Audio_system.md §7)
// ============================================================================

import { defineEventHandler, getQuery } from 'h3';
import { prisma } from '../../../utils/prisma';
import { sendApiSuccess } from '../../../utils/response';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const status = query.status as any;
  const contentType = query.contentType as any;
  const limit = Math.min(100, Math.max(1, parseInt(query.limit as string) || 20));
  const offset = Math.max(0, parseInt(query.offset as string) || 0);

  const where: any = {};
  if (status) where.status = status;
  if (contentType) where.contentType = contentType;

  const [jobs, total] = await Promise.all([
    prisma.audioGenerationJob.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        voiceProfile: true,
        resultAsset: true,
      },
    }),
    prisma.audioGenerationJob.count({ where }),
  ]);

  return sendApiSuccess(event, {
    jobs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + limit < total,
    },
  });
});
