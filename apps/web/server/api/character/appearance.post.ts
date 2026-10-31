// ============================================================================
// POST /api/character/appearance — Save Chibi Customization (CHIBI_CHARACTER.md §10, §11)
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
  const { hatId, outfitId, hairId, shoesId, accessoryId } = body || {};

  // 1. Fetch user's inventory to validate item ownership
  const userInventory = await prisma.inventoryItem.findMany({
    where: { userId: user.id },
    include: { item: true },
  });

  const ownedCodes = new Set(userInventory.map((inv) => inv.item.code));

  // Starter free items
  const freeStarterCodes = new Set(['hair_topknot', 'shoes_cloth', 'hair_wanderer', 'outfit_novice']);

  // Validate equipped items
  const itemsToVerify = [
    { code: hatId, slot: 'HEAD' },
    { code: outfitId, slot: 'ARMOR' },
    { code: accessoryId, slot: 'ACCESSORY' },
  ].filter((item) => Boolean(item.code));

  for (const check of itemsToVerify) {
    if (!freeStarterCodes.has(check.code!) && !ownedCodes.has(check.code!)) {
      // Find item name for error message
      const dbItem = await prisma.item.findUnique({ where: { code: check.code! } });
      const itemName = dbItem ? dbItem.name : check.code;
      return sendApiError(event, 403, 'ITEM_NOT_OWNED', `Bạn chưa sở hữu "${itemName}". Hãy ghé Thương Điếm để mở khóa.`);
    }
  }

  // 2. Perform atomic save and inventory synchronization
  const result = await prisma.$transaction(async (tx) => {
    const appearancePayload = {
      hatId: hatId || null,
      outfitId: outfitId || 'item_silk_robe',
      hairId: hairId || 'hair_topknot',
      shoesId: shoesId || 'shoes_cloth',
      accessoryId: accessoryId || null,
    };

    // Update Character record
    const updatedCharacter = await tx.character.upsert({
      where: { userId: user.id },
      update: {
        appearance: appearancePayload,
      },
      create: {
        userId: user.id,
        name: user.username,
        level: 1,
        exp: 0,
        hp: 100,
        maxHp: 100,
        appearance: appearancePayload,
      },
    });

    // Synchronize isEquipped state in inventory for matching items
    const targetCodes = new Set([hatId, outfitId, accessoryId].filter(Boolean));

    for (const inv of userInventory) {
      const shouldBeEquipped = targetCodes.has(inv.item.code);
      if (inv.isEquipped !== shouldBeEquipped) {
        await tx.inventoryItem.update({
          where: { id: inv.id },
          data: { isEquipped: shouldBeEquipped },
        });
      }
    }

    return updatedCharacter;
  });

  return sendApiSuccess(event, {
    message: 'Diện mạo nhân vật Chibi đã được lưu thành công!',
    appearance: result.appearance,
  });
});
