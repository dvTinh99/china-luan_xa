// ============================================================================
// POST /api/inventory/use — Use Consumable Item (Potions, Teas, Ginseng)
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
  const inventoryItemId = body?.inventoryItemId;

  if (!inventoryItemId) {
    return sendApiError(event, 400, 'BAD_REQUEST', 'Missing inventoryItemId.');
  }

  // 1. Fetch inventory record & validate ownership
  const targetInv = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
    include: { item: true },
  });

  if (!targetInv || targetInv.userId !== user.id) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Vật phẩm không thuộc sở hữu của bạn.');
  }

  if (targetInv.item.itemType !== 'CONSUMABLE') {
    return sendApiError(event, 400, 'CANNOT_CONSUME', 'Vật phẩm này không phải là tiêu hao phẩm.');
  }

  if (targetInv.quantity < 1) {
    return sendApiError(event, 400, 'OUT_OF_STOCK', 'Bạn đã dùng hết vật phẩm này.');
  }

  const stats = (targetInv.item.stats as any) || {};

  // 2. Perform atomic consumption
  const result = await prisma.$transaction(async (tx) => {
    // Character retrieval
    let character = await tx.character.findUnique({ where: { userId: user.id } });
    if (!character) {
      character = await tx.character.create({
        data: { userId: user.id, name: user.username, level: 1, exp: 0, hp: 100, maxHp: 100 },
      });
    }

    let healAmount = 0;
    let expAmount = 0;
    let newHp = character.hp;
    let newExp = character.exp;
    let newLevel = character.level;
    let leveledUp = false;

    // A. Apply HP Healing
    if (stats.healHp) {
      healAmount = Number(stats.healHp);
      // Query equipped gear hp bonus
      const equippedArmor = await tx.inventoryItem.findMany({
        where: { userId: user.id, isEquipped: true },
        include: { item: true },
      });
      let gearHpBonus = 0;
      for (const eq of equippedArmor) {
        const eqStats = (eq.item.stats as any) || {};
        if (eqStats.hpBonus) gearHpBonus += Number(eqStats.hpBonus);
      }

      const effectiveMaxHp = character.maxHp + gearHpBonus;
      newHp = Math.min(effectiveMaxHp, character.hp + healAmount);
    }

    // B. Apply EXP Grant
    if (stats.grantExp) {
      expAmount = Number(stats.grantExp);
      newExp += expAmount;

      let expForNext = newLevel * 100;
      while (newExp >= expForNext && newLevel < 99) {
        newLevel++;
        expForNext = newLevel * 100;
      }
      leveledUp = newLevel > character.level;
    }

    // Update Character
    const updatedCharacter = await tx.character.update({
      where: { id: character.id },
      data: {
        hp: leveledUp ? 100 + (newLevel - 1) * 15 : newHp,
        maxHp: leveledUp ? 100 + (newLevel - 1) * 15 : character.maxHp,
        exp: newExp,
        level: newLevel,
      },
    });

    // C. Decrement or remove item from inventory
    let remainingQuantity = targetInv.quantity - 1;
    if (remainingQuantity > 0) {
      await tx.inventoryItem.update({
        where: { id: targetInv.id },
        data: { quantity: remainingQuantity },
      });
    } else {
      await tx.inventoryItem.delete({
        where: { id: targetInv.id },
      });
    }

    // D. Quest progression if EXP was gained
    let questUpdates: any[] = [];
    if (expAmount > 0) {
      questUpdates = await trackQuestProgress(user.id, 'EARN_EXP', expAmount, tx);
    }

    return {
      character: updatedCharacter,
      healAmount,
      expAmount,
      leveledUp,
      remainingQuantity,
      completedQuests: questUpdates.filter((q) => q.justCompleted),
    };
  });

  return sendApiSuccess(event, {
    message: `Đã sử dụng ${targetInv.item.name}!`,
    item: {
      name: targetInv.item.name,
      remainingQuantity: result.remainingQuantity,
    },
    character: result.character,
    effect: {
      healAmount: result.healAmount,
      expAmount: result.expAmount,
      leveledUp: result.leveledUp,
    },
    completedQuests: result.completedQuests,
  });
});

