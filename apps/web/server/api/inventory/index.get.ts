// ============================================================================
// GET /api/inventory — Player Inventory & Equipped Gear Set (Phase 2 RPG)
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;
  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  const inventoryItems = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    include: { item: true },
    orderBy: [
      { isEquipped: 'desc' },
      { acquiredAt: 'desc' },
    ],
  });

  const equipped: Record<string, any> = {
    HEAD: null,
    WEAPON: null,
    ARMOR: null,
    ACCESSORY: null,
  };

  let totalBonusExpPercent = 0;
  let totalHpBonus = 0;

  for (const inv of inventoryItems) {
    if (inv.isEquipped && inv.item.slot) {
      equipped[inv.item.slot] = inv;
      const stats = (inv.item.stats as any) || {};
      if (stats.bonusExpPercent) totalBonusExpPercent += Number(stats.bonusExpPercent);
      if (stats.hpBonus) totalHpBonus += Number(stats.hpBonus);
    }
  }

  return sendApiSuccess(event, {
    inventory: inventoryItems,
    equipped,
    statsBonus: {
      totalBonusExpPercent,
      totalHpBonus,
    },
  });
});

