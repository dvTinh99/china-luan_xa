// ============================================================================
// GET /api/quests — Daily Quests & Player Progress (Phase 2 RPG Foundation)
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // Today's reset date key (UTC YYYY-MM-DD)
  const today = new Date().toISOString().slice(0, 10);

  // 1. Fetch all active quests
  const activeQuests = await prisma.quest.findMany({
    where: { isActive: true },
    orderBy: { rewardGold: 'asc' },
  });

  // 2. Query today's progress for each quest
  const userQuests = await prisma.userQuest.findMany({
    where: {
      userId: user.id,
      resetDate: today,
    },
  });

  const userQuestMap = new Map(userQuests.map((uq) => [uq.questId, uq]));

  // 3. Ensure UserQuest records exist for today
  const resultQuests = [];
  for (const quest of activeQuests) {
    let uq = userQuestMap.get(quest.id);

    if (!uq) {
      uq = await prisma.userQuest.create({
        data: {
          userId: user.id,
          questId: quest.id,
          currentCount: 0,
          isCompleted: false,
          isClaimed: false,
          resetDate: today,
        },
      });
    }

    resultQuests.push({
      id: quest.id,
      code: quest.code,
      title: quest.title,
      description: quest.description,
      category: quest.category,
      targetType: quest.targetType,
      targetCount: quest.targetCount,
      currentCount: uq.currentCount,
      isCompleted: uq.currentCount >= quest.targetCount || uq.isCompleted,
      isClaimed: uq.isClaimed,
      rewardGold: quest.rewardGold,
      rewardExp: quest.rewardExp,
      icon: quest.icon,
      claimedAt: uq.claimedAt,
    });
  }

  return sendApiSuccess(event, {
    today,
    quests: resultQuests,
  });
});

