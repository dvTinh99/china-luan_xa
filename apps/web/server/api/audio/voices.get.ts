// ============================================================================
// GET /api/audio/voices — List all active Voice Profiles
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const voices = await prisma.voiceProfile.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      code: true,
      name: true,
      description: true,
      gender: true,
      role: true,
      languageCode: true,
      provider: true,
      pitch: true,
      speed: true,
      isSystem: true,
    },
  });

  return sendApiSuccess(event, { voices });
});

