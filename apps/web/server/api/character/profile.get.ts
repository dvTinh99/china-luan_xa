// ============================================================================
// GET /api/character/profile — Full RPG Character & Linguistic Proficiency
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // 1. Fetch or create character
  let character = await prisma.character.findUnique({
    where: { userId: user.id },
  });

  if (!character) {
    character = await prisma.character.create({
      data: {
        userId: user.id,
        name: user.username,
        level: 1,
        exp: 0,
        hp: 100,
        maxHp: 100,
      },
    });
  }

  // 2. Fetch wallet
  let wallet = await prisma.wallet.findUnique({
    where: { userId: user.id },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId: user.id,
        balanceGold: 500, // Starting gold
      },
    });
  }

  // 3. Fetch equipped items & calculate gear bonuses
  const equippedInventory = await prisma.inventoryItem.findMany({
    where: { userId: user.id, isEquipped: true },
    include: { item: true },
  });

  let totalBonusExpPercent = 0;
  let totalHpBonus = 0;

  for (const inv of equippedInventory) {
    const stats = (inv.item.stats as any) || {};
    if (stats.bonusExpPercent) totalBonusExpPercent += Number(stats.bonusExpPercent);
    if (stats.hpBonus) totalHpBonus += Number(stats.hpBonus);
  }

  // 4. Calculate Language Proficiency Stats (Independent from RPG Stats)
  const [enrolledCount, masteredCount, reviewingCount, totalAnswers, correctAnswers] = await Promise.all([
    prisma.vocabularyProgress.count({ where: { userId: user.id } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, state: 'mastered' } }),
    prisma.vocabularyProgress.count({ where: { userId: user.id, state: 'review' } }),
    prisma.learningAnswer.count({ where: { userId: user.id } }),
    prisma.learningAnswer.count({ where: { userId: user.id, isCorrect: true } }),
  ]);

  const retentionRate = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) / 100 : 0.95;

  // 5. Recent Ledger Transactions
  const recentTransactions = await prisma.walletTransaction.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  const formattedTransactions = recentTransactions.map((tx) => {
    let description = 'Giao dịch';
    if (tx.transactionType === 'reward_lesson') description = 'Thưởng hoàn thành bài học';
    else if (tx.transactionType === 'reward_review') description = 'Thưởng ôn tập thẻ từ vựng';
    else if (tx.transactionType === 'reward_quest') description = 'Thưởng nhiệm vụ hàng ngày';
    else if (tx.transactionType === 'shop_purchase') description = 'Mua vật phẩm thương điếm';

    return {
      id: tx.id,
      amount: tx.amount,
      transactionType: tx.transactionType,
      description,
      createdAt: tx.createdAt,
    };
  });

  return sendApiSuccess(event, {
    character: {
      ...character,
      effectiveMaxHp: character.maxHp + totalHpBonus,
    },
    wallet: {
      goldBalance: wallet.balanceGold,
    },
    gearStats: {
      totalBonusExpPercent,
      totalHpBonus,
      equippedCount: equippedInventory.length,
    },
    proficiency: {
      vocabularyEnrolled: enrolledCount,
      masteredCount,
      reviewingCount,
      retentionRate,
      estimatedHskLevel: 'HSK 3.0 Band 1 (In Progress)',
    },
    transactions: formattedTransactions,
  });
});

