// ============================================================================
// GET /api/game/bootstrap
// ============================================================================
// Returns the initial game data needed to set up the Godot client.
// Requires authentication (Phase 0 uses demo user via middleware).
//
// Response envelope:
// {
//   "data": {
//     "version": 1,
//     "player": { ... },
//     "world": { ... },
//     "config": { ... }
//   }
// }
// ============================================================================

import { defineEventHandler } from 'h3';
import { BRIDGE_VERSION } from '@linguaworld/shared-types';
import type { GameBootstrapResponse } from '@linguaworld/api-contracts';

export default defineEventHandler((event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // TODO Phase 1: Fetch real player + character data from DB via Prisma:
  //   const character = await prisma.character.findFirst({
  //     where: { userId: user.id },
  //     orderBy: { createdAt: 'desc' },
  //   });
  //   if (!character) { ... create default character ... }

  // TODO Phase 1: Fetch unlocked regions from DB based on player progress.

  const bootstrapData: GameBootstrapResponse = {
    version: 1,
    player: {
      id: user.id,
      username: user.username,
      character: {
        id: 'char-001',
        name: '小龙',    // "Little Dragon" — default character name
        level: 1,
        exp: 0,
      },
    },
    world: {
      regions: [
        {
          id: 'beginner_village',
          name: 'Beginner Village',
          unlocked: true,
        },
        {
          id: 'market_district',
          name: 'Market District',
          unlocked: false,
        },
        {
          id: 'scholar_temple',
          name: 'Scholar Temple',
          unlocked: false,
        },
      ],
    },
    config: {
      bridgeVersion: BRIDGE_VERSION,
    },
  };

  return sendApiSuccess(event, bootstrapData);
});
