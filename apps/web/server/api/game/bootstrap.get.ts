// ============================================================================
// GET /api/game/bootstrap
// ============================================================================

import { defineEventHandler } from 'h3';
import { BRIDGE_VERSION } from '@linguaworld/shared-types';
import type { GameBootstrapResponse } from '@linguaworld/api-contracts';
import { prisma } from '../../utils/prisma';
import { evaluateUserChakraProgress } from '../../utils/chakra';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // Fetch real character and equipped items from database
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
      },
    });
  }

  // Fetch world regions from database
  const dbRegions = await prisma.region.findMany({
    orderBy: { orderIndex: 'asc' },
  });

  // Fetch equipped items
  const equippedInventory = await prisma.inventoryItem.findMany({
    where: { userId: user.id, isEquipped: true },
    include: { item: true },
  });

  // Fetch chakra progress & active aura
  let chakraData = null;
  try {
    chakraData = await evaluateUserChakraProgress(user.id, prisma);
  } catch (err) {
    console.warn('[GameBootstrap] Failed to evaluate chakra:', err);
  }

  const regions = dbRegions.map((r) => ({
    id: r.code,
    name: r.name,
    description: r.description,
    requiredLevel: r.requiredLevel,
    unlocked: r.isUnlocked || (chakraData ? chakraData.unlockedRegions.includes(r.code) : character.level >= r.requiredLevel),
  }));

  const bootstrapData: any = {
    version: 1,
    player: {
      id: user.id,
      username: user.username,
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        exp: character.exp,
        hp: character.hp,
        maxHp: character.maxHp,
      },
      equipped: equippedInventory.map((inv) => ({
        slot: inv.item.slot,
        code: inv.item.code,
        name: inv.item.name,
        icon: inv.item.icon,
      })),
    },
    chakra: {
      activeChakraTier: chakraData?.activeChakraTier || 1,
      auraColorHex: chakraData?.activeAuraColorHex || '#EF4444',
      highestUnlockedTier: chakraData?.highestUnlockedTier || 0,
      unlockedRegions: chakraData?.unlockedRegions || ['region_novice_village'],
    },
    world: {
      regions,
    },
    config: {
      bridgeVersion: BRIDGE_VERSION,
    },
  };

  return sendApiSuccess(event, bootstrapData);
});
