// ============================================================================
// GET /api/srs/statistics
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const now = new Date();

  const [totalEnrolled, dueCount, stateCounts, todayReviews] = await Promise.all([
    prisma.vocabularyProgress.count({ where: { userId: user.id } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, dueAt: { lte: now } } }),
    prisma.vocabularyProgress.groupBy({
      by: ['state'],
      where: { userId: user.id },
      _count: true,
    }),
    prisma.reviewHistory.count({
      where: {
        userId: user.id,
        reviewedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
  ]);

  const statesMap: Record<string, number> = {
    new: 0,
    learning: 0,
    review: 0,
    mastered: 0,
  };

  stateCounts.forEach((group) => {
    statesMap[group.state] = group._count;
  });

  return sendApiSuccess(event, {
    totalEnrolled,
    dueCount,
    todayReviews,
    targetDailyReviews: user.settings?.targetDailyReviews || 20,
    breakdown: statesMap,
  });
});

