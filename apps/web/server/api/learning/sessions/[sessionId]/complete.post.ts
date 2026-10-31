// ============================================================================
// POST /api/learning/sessions/:sessionId/complete
// ============================================================================
// Rules 2, 3, 4, 5: Server-authoritative, idempotent reward transaction.

import { defineEventHandler, getRouterParam } from 'h3';
import { prisma } from '../../../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../../../utils/response';
import { trackQuestProgress } from '../../../../utils/quests';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  const sessionId = getRouterParam(event, 'sessionId');

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  if (!sessionId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing sessionId parameter.');
  }

  const session = await prisma.learningSession.findUnique({
    where: { id: sessionId },
    include: {
      lesson: {
        include: {
          vocabulary: true,
        },
      },
    },
  });

  if (!session) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Session not found.');
  }

  if (session.userId !== user.id) {
    return sendApiError(event, 403, 'FORBIDDEN', 'Access denied to session.');
  }

  // Idempotency: If already completed, return existing completion status without re-granting rewards
  if (session.status === 'completed') {
    const existingTransaction = await prisma.walletTransaction.findUnique({
      where: { idempotencyKey: `session_${sessionId}_reward` },
    });

    return sendApiSuccess(event, {
      alreadyCompleted: true,
      accuracy: session.accuracy,
      totalQuestions: session.totalQuestions,
      correctCount: session.correctCount,
      expEarned: 0,
      goldEarned: existingTransaction?.amount || 0,
    });
  }

  // Verify session completion criteria (must have at least answered something)
  if (session.totalQuestions === 0) {
    return sendApiError(event, 400, 'CANNOT_COMPLETE', 'Session has no submitted answers.');
  }

  // Calculate server-authoritative rewards
  const baseExp = session.lesson?.expReward || 50;
  const baseGold = session.lesson?.goldReward || 20;
  const accuracyMultiplier = 0.5 + session.accuracy * 0.5;
  const baseExpEarned = Math.round(baseExp * accuracyMultiplier);
  const goldEarned = Math.round(baseGold * accuracyMultiplier);

  const idempotencyKey = `session_${sessionId}_reward`;

  // Interactive transaction for atomic wallet & progression updates
  const result = await prisma.$transaction(async (tx) => {
    // 1. Calculate active equipped gear bonus
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

    const gearBonusExp = Math.round((baseExpEarned * bonusExpPercent) / 100);
    const totalExpEarned = baseExpEarned + gearBonusExp;

    // 2. Mark session completed
    const updatedSession = await tx.learningSession.update({
      where: { id: session.id },
      data: {
        status: 'completed',
        completedAt: new Date(),
      },
    });

    // 3. Idempotent Wallet credit & ledger entry
    let wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
    if (!wallet) {
      wallet = await tx.wallet.create({
        data: { userId: user.id, balanceGold: 0 },
      });
    }

    await tx.wallet.update({
      where: { id: wallet.id },
      data: { balanceGold: { increment: goldEarned } },
    });

    await tx.walletTransaction.create({
      data: {
        userId: user.id,
        currency: 'gold',
        amount: goldEarned,
        transactionType: 'reward_lesson',
        referenceType: 'session',
        referenceId: session.id,
        idempotencyKey,
      },
    });

    // 4. Update Character EXP and Level
    let character = await tx.character.findUnique({ where: { userId: user.id } });
    if (!character) {
      character = await tx.character.create({
        data: { userId: user.id, name: user.username, level: 1, exp: 0 },
      });
    }

    const newExp = character.exp + totalExpEarned;
    // Level formula: 100 * level required to reach next level
    let newLevel = character.level;
    let expForNext = newLevel * 100;
    while (newExp >= expForNext && newLevel < 99) {
      newLevel++;
      expForNext = newLevel * 100;
    }

    const leveledUp = newLevel > character.level;
    const updatedCharacter = await tx.character.update({
      where: { id: character.id },
      data: {
        exp: newExp,
        level: newLevel,
        maxHp: 100 + (newLevel - 1) * 15,
        hp: 100 + (newLevel - 1) * 15, // heal on level up
      },
    });

    // 5. Enroll words into Spaced Repetition (SRS)
    if (session.lesson?.vocabulary) {
      for (const entry of session.lesson.vocabulary) {
        await tx.vocabularyProgress.upsert({
          where: {
            userId_vocabularyId: {
              userId: user.id,
              vocabularyId: entry.vocabularyId,
            },
          },
          update: {},
          create: {
            userId: user.id,
            vocabularyId: entry.vocabularyId,
            state: 'new',
            difficulty: 5.0,
            stability: 1.0,
            intervalDays: 1,
            dueAt: new Date(Date.now() + 86400000), // Due in 1 day
          },
        });
      }
    }

    // 6. Track Quest Progress (COMPLETE_LESSON and EARN_EXP)
    const lessonQuestUpdates = await trackQuestProgress(user.id, 'COMPLETE_LESSON', 1, tx);
    const expQuestUpdates = await trackQuestProgress(user.id, 'EARN_EXP', totalExpEarned, tx);

    return {
      session: updatedSession,
      character: updatedCharacter,
      walletBalance: wallet.balanceGold + goldEarned,
      leveledUp,
      gearBonusExp,
      bonusExpPercent,
      totalExpEarned,
      questUpdates: [...lessonQuestUpdates, ...expQuestUpdates],
    };
  });

  return sendApiSuccess(event, {
    completed: true,
    accuracy: session.accuracy,
    totalQuestions: session.totalQuestions,
    correctCount: session.correctCount,
    expEarned: result.totalExpEarned,
    baseExpEarned,
    gearBonusExp: result.gearBonusExp,
    bonusExpPercent: result.bonusExpPercent,
    goldEarned,
    leveledUp: result.leveledUp,
    character: {
      name: result.character.name,
      level: result.character.level,
      exp: result.character.exp,
    },
    walletGold: result.walletBalance,
    questsCompleted: result.questUpdates.filter((q) => q.justCompleted),
  });
});

