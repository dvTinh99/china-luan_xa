// ============================================================================
// POST /api/auth/logout
// ============================================================================

import { defineEventHandler, getCookie } from 'h3';
import { prisma } from '../../utils/prisma';
import { SESSION_COOKIE_NAME, clearSessionCookie } from '../../utils/auth';
import { sendApiSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const token = getCookie(event, SESSION_COOKIE_NAME);

  if (token) {
    await prisma.session.delete({ where: { token } }).catch(() => {});
  }

  clearSessionCookie(event);

  return sendApiSuccess(event, { loggedOut: true });
});

