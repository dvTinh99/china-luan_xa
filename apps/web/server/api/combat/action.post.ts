// ============================================================================
// POST /api/combat/action — Evaluate Combat Turn (Server-Authoritative)
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';
import { trackQuestProgress } from '../../utils/quests';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const body = await readBody(event);
  const { combatSessionId, answer, action } = body || {};

  if (!combatSessionId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing combatSessionId.');
  }

  // 1. Fetch combat session
  const session = await prisma.combatSession.findUnique({
    where: { id: combatSessionId },
  });

  if (!session || session.userId !== user.id) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Không tìm thấy phiên giao chiến.');
  }

  if (session.status !== 'IN_PROGRESS') {
    return sendApiError(event, 400, 'SESSION_ENDED', 'Trận đấu này đã kết thúc.');
  }

  // 2. Handle Flee action
  if (action === 'flee') {
    await prisma.combatSession.update({
      where: { id: session.id },
      data: { status: 'FLED' },
    });
    return sendApiSuccess(event, {
      outcome: 'FLED',
      message: 'Bạn đã thu kiếm rút lui an toàn.',
    });
  }

  const turnQuestions = session.turnQuestions as any[];
  const turnIndex = session.currentTurn - 1;
  const currentQuestion = turnQuestions[turnIndex];

  if (!currentQuestion) {
    return sendApiError(event, 400, 'INVALID_TURN', 'Lượt đấu không hợp lệ.');
  }

  // 3. Authoritative evaluation
  const isCorrect = String(answer || '').trim() === String(currentQuestion.correctMeaning || '').trim();

  // 4. Calculate damages
  let playerDamage = 0;
  let enemyDamage = 0;

  if (isCorrect) {
    // Correct answer: Player strikes enemy
    playerDamage = 35 + Math.floor(Math.random() * 12);
  } else {
    // Incorrect answer: Enemy strikes player
    enemyDamage = session.enemyAtk + Math.floor(Math.random() * 6);
  }

  const newEnemyHp = Math.max(0, session.enemyHp - playerDamage);
  const newPlayerHp = Math.max(0, session.playerHp - enemyDamage);

  // Track quest for correct answer
  if (isCorrect) {
    await trackQuestProgress(user.id, 'PERFECT_QUIZ', 1);
  }

  // 5. Outcome A: VICTORY
  if (newEnemyHp <= 0) {
    const victoryResult = await prisma.$transaction(async (tx) => {
      // Mark session victory
      await tx.combatSession.update({
        where: { id: session.id },
        data: {
          enemyHp: 0,
          playerHp: newPlayerHp,
          status: 'VICTORY',
        },
      });

      // Calculate gear bonuses
      const equippedItems = await tx.inventoryItem.findMany({
        where: { userId: user.id, isEquipped: true },
        include: { item: true },
      });

      let bonusExpPercent = 0;
      for (const inv of equippedItems) {
        const stats = (inv.item.stats as any) || {};
        if (stats.bonusExpPercent) bonusExpPercent += Number(stats.bonusExpPercent);
      }

      const baseExp = session.expReward;
      const gearBonusExp = Math.round((baseExp * bonusExpPercent) / 100);
      const totalExpEarned = baseExp + gearBonusExp;
      const goldEarned = session.goldReward;

      // Credit wallet
      const idempotencyKey = `combat_${session.id}_reward`;
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
          transactionType: 'reward_combat',
          referenceType: 'combat',
          referenceId: session.id,
          idempotencyKey,
        },
      });

      // Update Character
      let character = await tx.character.findUnique({ where: { userId: user.id } });
      if (!character) {
        character = await tx.character.create({
          data: { userId: user.id, name: user.username, level: 1, exp: 0, hp: 100, maxHp: 100 },
        });
      }

      const newExp = character.exp + totalExpEarned;
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
          hp: leveledUp ? 100 + (newLevel - 1) * 15 : newPlayerHp,
          maxHp: leveledUp ? 100 + (newLevel - 1) * 15 : character.maxHp,
          exp: newExp,
          level: newLevel,
        },
      });

      // Track quest progress
      const expQuests = await trackQuestProgress(user.id, 'EARN_EXP', totalExpEarned, tx);

      return {
        character: updatedCharacter,
        walletGold: wallet.balanceGold + goldEarned,
        totalExpEarned,
        gearBonusExp,
        goldEarned,
        leveledUp,
        completedQuests: expQuests.filter((q) => q.justCompleted),
      };
    });

    return sendApiSuccess(event, {
      outcome: 'VICTORY',
      isCorrect,
      correctMeaning: currentQuestion.correctMeaning,
      playerDamage,
      enemyDamage,
      enemyHp: 0,
      playerHp: newPlayerHp,
      rewards: {
        expEarned: victoryResult.totalExpEarned,
        gearBonusExp: victoryResult.gearBonusExp,
        goldEarned: victoryResult.goldEarned,
        walletGold: victoryResult.walletGold,
        leveledUp: victoryResult.leveledUp,
      },
      character: victoryResult.character,
      completedQuests: victoryResult.completedQuests,
    });
  }

  // 6. Outcome B: DEFEAT
  if (newPlayerHp <= 0) {
    await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        enemyHp: newEnemyHp,
        playerHp: 0,
        status: 'DEFEAT',
      },
    });

    await prisma.character.updateMany({
      where: { userId: user.id },
      data: { hp: 15 }, // Rescue player with minimal HP
    });

    return sendApiSuccess(event, {
      outcome: 'DEFEAT',
      isCorrect,
      correctMeaning: currentQuestion.correctMeaning,
      playerDamage,
      enemyDamage,
      enemyHp: newEnemyHp,
      playerHp: 0,
      message: 'Bạn đã kiệt sức trước đòn tấn công của quái vật!',
    });
  }

  // 7. Outcome C: ONGOING COMBAT
  const nextTurnNumber = session.currentTurn + 1;
  const hasMoreQuestions = nextTurnNumber <= turnQuestions.length;

  if (!hasMoreQuestions) {
    // Questions exhausted but monster still alive: monster retreats
    await prisma.combatSession.update({
      where: { id: session.id },
      data: {
        enemyHp: newEnemyHp,
        playerHp: newPlayerHp,
        status: 'VICTORY',
      },
    });

    return sendApiSuccess(event, {
      outcome: 'VICTORY',
      isCorrect,
      correctMeaning: currentQuestion.correctMeaning,
      playerDamage,
      enemyDamage,
      enemyHp: 0,
      playerHp: newPlayerHp,
      message: 'Quái vật đã chịu nhiều thương tích và rút chạy vào rừng sâu!',
      rewards: {
        expEarned: Math.round(session.expReward * 0.7),
        goldEarned: Math.round(session.goldReward * 0.7),
      },
    });
  }

  // Next question
  await prisma.combatSession.update({
    where: { id: session.id },
    data: {
      enemyHp: newEnemyHp,
      playerHp: newPlayerHp,
      currentTurn: nextTurnNumber,
    },
  });

  const nextQ = turnQuestions[nextTurnNumber - 1];
  const nextClientQuestion = {
    turn: nextTurnNumber,
    totalTurns: turnQuestions.length,
    vocabularyId: nextQ.vocabularyId,
    simplified: nextQ.simplified,
    pinyin: nextQ.pinyin,
    audioUrl: nextQ.audioUrl,
    options: nextQ.options,
  };

  return sendApiSuccess(event, {
    outcome: 'CONTINUE',
    isCorrect,
    correctMeaning: currentQuestion.correctMeaning,
    playerDamage,
    enemyDamage,
    enemyHp: newEnemyHp,
    playerHp: newPlayerHp,
    nextQuestion: nextClientQuestion,
  });
});

