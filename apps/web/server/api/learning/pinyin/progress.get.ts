import { defineEventHandler } from 'h3';
import { prisma } from '../../../utils/prisma';
import { authenticateEvent } from '../../../utils/auth';
import { sendApiSuccess, sendApiError } from '../../../utils/response';
import { PINYIN_STAGES } from '../../../utils/pinyin-curriculum';
import type { PinyinStageProgress } from '@linguaworld/api-contracts';

export default defineEventHandler(async (event) => {
  // Do not rely on event.context.user: auth middleware may attach the demo user.
  const user = await authenticateEvent(event);
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const rows = await prisma.pinyinStageProgress.findMany({
    where: { userId: user.id },
    select: { stageId: true, bestScore: true, completedAt: true },
  });
  const byStage = new Map(rows.map((row) => [row.stageId, row]));
  const progress: PinyinStageProgress[] = PINYIN_STAGES.map((stage) => {
    const row = byStage.get(stage.id);
    return {
      stageId: stage.id,
      completed: Boolean(row),
      bestScore: row?.bestScore ?? null,
      completedAt: row?.completedAt.toISOString() ?? null,
    };
  });

  return sendApiSuccess(event, { progress });
});
