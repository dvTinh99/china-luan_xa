// ============================================================================
// GET /api/auth/me
// ============================================================================
// Returns the currently authenticated user.
// Phase 0: Returns the demo user injected by the auth middleware.
//
// TODO Phase 1: Return real user from session lookup.
// ============================================================================

import { defineEventHandler } from 'h3';
import type { User } from '@linguaworld/api-contracts';

export default defineEventHandler((event) => {
  const user = event.context.user;

  if (!user) {
    return sendApiError(event, 401, 'UNAUTHORIZED', 'Authentication required.');
  }

  // TODO Phase 1: Fetch full user object from DB
  const userData: User = {
    id: user.id,
    email: user.email,
    username: user.username,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return sendApiSuccess(event, { user: userData });
});
