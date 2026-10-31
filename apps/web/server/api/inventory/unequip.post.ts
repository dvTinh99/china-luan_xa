// ============================================================================
// POST /api/inventory/unequip — Unequip an Item (Phase 2 RPG)
// ============================================================================

import { defineEventHandler, readBody } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

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

  const targetInv = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
    include: { item: true },
  });

  if (!targetInv || targetInv.userId !== user.id) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Vật phẩm không thuộc sở hữu của bạn.');
  }

  const updated = await prisma.inventoryItem.update({
    where: { id: inventoryItemId },
    data: { isEquipped: false },
    include: { item: true },
  });

  return sendApiSuccess(event, {
    message: `Đã tháo trang bị ${targetInv.item.name}!`,
    unequippedItem: updated,
  });
});

