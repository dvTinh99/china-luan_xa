// ============================================================================
// GET /api/auth/me
// ============================================================================

import { defineEventHandler } from 'h3';
import { sendApiSuccess, sendApiError } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  return sendApiSuccess(event, {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      character: user.character,
      wallet: user.wallet,
      settings: user.settings,
    },
  });
});
