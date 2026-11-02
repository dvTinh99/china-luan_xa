// ============================================================================
// POST /api/srs/reviews
// ============================================================================
// Submits a review outcome (1=Again, 2=Hard, 3=Good, 4=Easy) and updates SRS state.

import { defineEventHandler, readBody } from 'h3';
import { z } from 'zod';
import { prisma } from '../../utils/prisma';
import { calculateSrsNextReview, SrsRating, SrsState, SRS_ALGORITHM_VERSION } from '../../utils/srs';
import { sendApiSuccess, sendApiError } from '../../utils/response';
import { trackQuestProgress } from '../../utils/quests';
import { evaluateUserChakraProgress } from '../../utils/chakra';

const reviewSchema = z.object({
  vocabularyId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  responseTimeMs: z.number().int().nonnegative().default(0),
});

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const body = await readBody(event);
  const parseResult = reviewSchema.safeParse(body);

  if (!parseResult.success) {
    return sendApiError(event, 400, 'VALIDATION_ERROR', 'Invalid review payload.');
  }

  const { vocabularyId, rating, responseTimeMs } = parseResult.data;

  // Retrieve existing vocabulary progress
  let progress = await prisma.vocabularyProgress.findUnique({
    where: {
      userId_vocabularyId: {
        userId: user.id,
        vocabularyId,
      },
    },
  });

  if (!progress) {
    // If not enrolled yet, create initial record
    progress = await prisma.vocabularyProgress.create({
      data: {
        userId: user.id,
        vocabularyId,
        state: 'new',
        difficulty: 5.0,
        stability: 1.0,
        intervalDays: 1,
        dueAt: new Date(),
      },
    });
  }

  // Calculate new scheduling parameters via FSRS
  const calculated = calculateSrsNextReview({
    state: progress.state as SrsState,
    difficulty: progress.difficulty,
    stability: progress.stability,
    totalReviews: progress.totalReviews,
    rating: rating as SrsRating,
  });

  const isSuccess = rating >= 3;
  const expReward = isSuccess ? 5 : 2;
  const goldReward = isSuccess ? 2 : 1;
  const reviewTimestamp = Date.now();
  const idempotencyKey = `srs_rev_${user.id}_${vocabularyId}_${reviewTimestamp}`;

  // Atomic database update for progress, history and reward
  const result = await prisma.$transaction(async (tx) => {
    // 1. Update VocabularyProgress
    const updatedProgress = await tx.vocabularyProgress.update({
      where: { id: progress.id },
      data: {
        state: calculated.newState,
        difficulty: calculated.newDifficulty,
        stability: calculated.newStability,
        intervalDays: calculated.intervalDays,
        dueAt: calculated.dueAt,
        lastReviewedAt: new Date(),
        totalReviews: { increment: 1 },
        correctReviews: isSuccess ? { increment: 1 } : undefined,
        incorrectReviews: !isSuccess ? { increment: 1 } : undefined,
        algorithmVersion: SRS_ALGORITHM_VERSION,
      },
    });

    // 2. Log ReviewHistory
    await tx.reviewHistory.create({
      data: {
        userId: user.id,
        vocabularyId,
        rating,
        scheduledDays: calculated.intervalDays,
        elapsedDays: progress.intervalDays,
        responseTimeMs,
        reviewedAt: new Date(),
      },
    });

    // 3. Grant small review reward
    let wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId: user.id, balanceGold: 0 },
      });
    }

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceGold: { increment: goldReward } },
    });

    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        currency: 'gold',
        amount: goldReward,
        transactionType: 'reward_review',
        referenceType: 'vocabulary',
        referenceId: vocabularyId,
        idempotencyKey,
      },
    });

    // 4. Calculate gear bonus for EXP
    const equippedItems = await tx.inventoryItem.findMany({
      where: { userId: user.id, isEquipped: true },
      include: { item: true },
    });

    let bonusExpPercent = 0;
    for (const inv of equippedItems) {
      const stats = (inv.item.stats as any) || {};
      if (stats.bonusExpPercent) {
        bonusExpPercent += Number(stats.bonusExpPercent);
      }
    }

    const gearBonusExp = Math.round((expReward * bonusExpPercent) / 100);
    const totalExpGranted = expReward + gearBonusExp;

    // Increment Character EXP
    await tx.character.updateMany({
      where: { userId: user.id },
      data: { exp: { increment: totalExpGranted } },
    });

    // 5. Track Quest Progress (REVIEW_FLASHCARDS & EARN_EXP)
    const reviewQuestUpdates = await trackQuestProgress(user.id, 'REVIEW_FLASHCARDS', 1, tx);
    const expQuestUpdates = await trackQuestProgress(user.id, 'EARN_EXP', totalExpGranted, tx);

    return {
      updatedProgress,
      walletBalance: wallet.balanceGold + goldReward,
      totalExpGranted,
      gearBonusExp,
      bonusExpPercent,
      questUpdates: [...reviewQuestUpdates, ...expQuestUpdates],
    };
  });

  // 6. Server-authoritative Chakra Milestone Evaluation
  let chakraUpdate = null;
  try {
    chakraUpdate = await evaluateUserChakraProgress(user.id, prisma);
  } catch (err) {
    console.warn('[SRS Review] Failed to evaluate chakra progress:', err);
  }

  return sendApiSuccess(event, {
    progress: {
      vocabularyId,
      state: result.updatedProgress.state,
      intervalDays: result.updatedProgress.intervalDays,
      dueAt: result.updatedProgress.dueAt,
      nextReviewInDays: result.updatedProgress.intervalDays,
    },
    rewards: {
      expEarned: result.totalExpGranted,
      baseExp: expReward,
      gearBonusExp: result.gearBonusExp,
      goldEarned: goldReward,
      walletGold: result.walletBalance,
    },
    questsCompleted: result.questUpdates.filter((q) => q.justCompleted),
    chakra: chakraUpdate,
  });
});

