// ============================================================================
// POST /api/inventory/equip — Equip Item to Specific Slot (Phase 2 RPG)
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

  // 1. Validate ownership & equipment slot
  const targetInv = await prisma.inventoryItem.findUnique({
    where: { id: inventoryItemId },
    include: { item: true },
  });

  if (!targetInv || targetInv.userId !== user.id) {
    return sendApiError(event, 404, 'NOT_FOUND', 'Vật phẩm không thuộc sở hữu của bạn.');
  }

  if (targetInv.item.itemType !== 'EQUIPMENT' || !targetInv.item.slot) {
    return sendApiError(event, 400, 'CANNOT_EQUIP', 'Vật phẩm này không thể trang bị.');
  }

  const slot = targetInv.item.slot;

  // 2. Atomic swap: unequip old item in slot and equip target
  const result = await prisma.$transaction(async (tx) => {
    // Find any currently equipped item in the same slot for this user
    const currentlyEquipped = await tx.inventoryItem.findMany({
      where: {
        userId: user.id,
        isEquipped: true,
        item: { slot },
      },
    });

    for (const oldItem of currentlyEquipped) {
      if (oldItem.id !== targetInv.id) {
        await tx.inventoryItem.update({
          where: { id: oldItem.id },
          data: { isEquipped: false },
        });
      }
    }

    // Equip target item
    const equippedItem = await tx.inventoryItem.update({
      where: { id: targetInv.id },
      data: { isEquipped: true },
      include: { item: true },
    });

    return equippedItem;
  });

  return sendApiSuccess(event, {
    message: `Đã trang bị ${targetInv.item.name} vào vị trí ${slot}!`,
    equippedItem: result,
  });
});

