// ============================================================================
// GET /api/shop/items — List Shop Items Catalog (Phase 2 RPG Foundation)
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const items = await prisma.item.findMany({
    where: { isShopItem: true },
    orderBy: [
      { itemType: 'asc' },
      { priceGold: 'asc' },
    ],
  });

  return sendApiSuccess(event, { items });
});

