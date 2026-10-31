// ============================================================================
// POST /api/quests/claim — Claim Daily Quest Rewards (Phase 2 RPG Foundation)
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';
import crypto from 'crypto';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const body = await readBody(event);
  const questId = body?.questId;

  if (!questId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing questId.');
  }

  const today = new Date().toISOString().slice(0, 10);

  // 1. Fetch quest definition & user quest progress
  const quest = await prisma.quest.findUnique({
    where: { id: questId },
  });

  if (!quest) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Nhiệm vụ không tồn tại.');
  }

  const userQuest = await prisma.userQuest.findUnique({
    where: {
      userId_questId_resetDate: {
        userId: user.id,
        questId: quest.id,
        resetDate: today,
      },
    },
  });

  if (!userQuest) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Chưa có tiến độ cho nhiệm vụ hôm nay.');
  }

  if (userQuest.isClaimed) {
    return sendApiError(event, 400, 'ALREADY_CLAIMED', 'Bạn đã nhận phần thưởng nhiệm vụ này hôm nay rồi.');
  }

  if (userQuest.currentCount < quest.targetCount && !userQuest.isCompleted) {
    return sendApiError(
      event,
      400,
      'NOT_COMPLETED',
      `Nhiệm vụ chưa hoàn thành (${userQuest.currentCount}/${quest.targetCount}).`,
    );
  }

  // 2. Atomic claim transaction (§5)
  try {
    const claimResult = await prisma.$transaction(async (tx) => {
      // Mark quest as claimed
      const updatedUserQuest = await tx.userQuest.update({
        where: { id: userQuest.id },
        data: {
          isCompleted: true,
          isClaimed: true,
          claimedAt: new Date(),
        },
      });

      // Credit wallet
      const updatedWallet = await tx.wallet.upsert({
        where: { userId: user.id },
        update: {
          balanceGold: { increment: quest.rewardGold },
        },
        create: {
          userId: user.id,
          balanceGold: quest.rewardGold,
        },
      });

      // Write ledger transaction
      const idempotencyKey = crypto
        .createHash('sha256')
        .update(`quest_claim:${user.id}:${quest.id}:${today}`)
        .digest('hex');

      await tx.walletTransaction.create({
        data: {
          userId: user.id,
          currency: 'gold',
          amount: quest.rewardGold,
          transactionType: 'reward_quest',
          referenceType: 'quest',
          referenceId: quest.id,
          idempotencyKey,
        },
      });

      // Credit character EXP and calculate level up
      let character = await tx.character.findUnique({
        where: { userId: user.id },
      });

      if (!character) {
        character = await tx.character.create({
          data: {
            userId: user.id,
            name: user.username,
            level: 1,
            exp: 0,
          },
        });
      }

      const newExp = character.exp + quest.rewardExp;
      let newLevel = character.level;
      const expPerLevel = 100;
      while (newExp >= newLevel * expPerLevel) {
        newLevel++;
      }

      const updatedCharacter = await tx.character.update({
        where: { id: character.id },
        data: {
          exp: newExp,
          level: newLevel,
          maxHp: 100 + (newLevel - 1) * 10,
        },
      });

      return {
        userQuest: updatedUserQuest,
        wallet: updatedWallet,
        character: updatedCharacter,
        rewardGold: quest.rewardGold,
        rewardExp: quest.rewardExp,
      };
    });

    return sendApiSuccess(event, {
      message: `Đã nhận thưởng thành công: +${quest.rewardGold} Gold và +${quest.rewardExp} EXP!`,
      claim: claimResult,
    });
  } catch (err: any) {
    return sendApiError(event, 500, 'CLAIM_FAILED', err.message);
  }
});

