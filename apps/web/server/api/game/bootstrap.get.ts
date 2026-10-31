// ============================================================================
// GET /api/game/bootstrap
// ============================================================================

import { defineEventHandler } from 'h3';
import { BRIDGE_VERSION } from '@linguaworld/shared-types';
import type { GameBootstrapResponse } from '@linguaworld/api-contracts';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // Fetch real character from database
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

  const bootstrapData: GameBootstrapResponse = {
    version: 1,
    player: {
      id: user.id,
      username: user.username,
      character: {
        id: character.id,
        name: character.name,
        level: character.level,
        exp: character.exp,
      },
    },
    world: {
      regions: [
        {
          id: 'beginner_village',
          name: 'Beginner Village (新手村)',
          unlocked: true,
        },
        {
          id: 'whispering_forest',
          name: 'Whispering Forest (低语森林)',
          unlocked: character.level >= 3,
        },
        {
          id: 'scholar_temple',
          name: 'Scholar Temple (学者文庙)',
          unlocked: character.level >= 5,
        },
      ],
    },
    config: {
      bridgeVersion: BRIDGE_VERSION,
    },
  };

  return sendApiSuccess(event, bootstrapData);
});
