// ============================================================================
// Quest Progression Tracker Utility (Phase 2 RPG Foundation)
// ============================================================================

import type { QuestTargetType } from '@linguaworld/shared-types';
import { prisma as defaultPrisma } from './prisma';

export interface QuestProgressResult {
  questId: string;
  code: string;
  title: string;
  currentCount: number;
  targetCount: number;
  isCompleted: boolean;
  justCompleted: boolean;
  rewardGold: number;
  rewardExp: number;
}

/**
 * Increments progress for daily quests matching the specified targetType.
 * Runs atomically inside an optional transaction client or the default prisma instance.
 */
export async function trackQuestProgress(
  userId: string,
  targetType: QuestTargetType,
  incrementCount = 1,
  tx?: any
): Promise<QuestProgressResult[]> {
  const db = tx || defaultPrisma;
  const today = new Date().toISOString().slice(0, 10);

  // 1. Find all active quests for this target type
  const activeQuests = await db.quest.findMany({
    where: {
      targetType,
      isActive: true,
    },
  });

  if (!activeQuests || activeQuests.length === 0) {
    return [];
  }

  const results: QuestProgressResult[] = [];

  for (const quest of activeQuests) {
    // 2. Fetch or create today's UserQuest record
    let userQuest = await db.userQuest.findUnique({
      where: {
        userId_questId_resetDate: {
          userId,
          questId: quest.id,
          resetDate: today,
        },
      },
    });

    if (!userQuest) {
      userQuest = await db.userQuest.create({
        data: {
          userId,
          questId: quest.id,
          currentCount: 0,
          isCompleted: false,
          isClaimed: false,
          resetDate: today,
        },
      });
    }

    // If already marked completed, skip incrementing
    if (userQuest.isCompleted) {
      continue;
    }

    const wasCompleted = userQuest.currentCount >= quest.targetCount;
    const newCount = userQuest.currentCount + incrementCount;
    const isNowCompleted = newCount >= quest.targetCount;

    const updated = await db.userQuest.update({
      where: { id: userQuest.id },
      data: {
        currentCount: newCount,
        isCompleted: isNowCompleted,
      },
    });

    results.push({
      questId: quest.id,
      code: quest.code,
      title: quest.title,
      currentCount: updated.currentCount,
      targetCount: quest.targetCount,
      isCompleted: updated.isCompleted,
      justCompleted: isNowCompleted && !wasCompleted,
      rewardGold: quest.rewardGold,
      rewardExp: quest.rewardExp,
    });
  }

  return results;
}

