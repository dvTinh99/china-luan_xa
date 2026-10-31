// ============================================================================
// GET /api/auth/me
// ============================================================================

import { defineEventHandler } from 'h3';
import { prisma } from '../../utils/prisma';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // Fetch full details
  const fullUser = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      character: true,
      wallet: true,
      settings: true,
    },
  });

  if (!fullUser) {
    return sendApiError(event, 404, 'NOT_FOUND', 'User record not found.');
  }

  return sendApiSuccess(event, {
    user: {
      id: fullUser.id,
      email: fullUser.email,
      username: fullUser.username,
      character: fullUser.character,
      wallet: fullUser.wallet,
      settings: fullUser.settings,
    },
  });
});
