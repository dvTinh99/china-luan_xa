// ============================================================================
// Authentication Middleware
// ============================================================================

import { defineEventHandler } from 'h3';
import { authenticateEvent } from '../utils/auth';
import { prisma } from '../utils/prisma';

export default defineEventHandler(async (event) => {
  // Only process /api/ routes
  if (!event.path.startsWith('/api/')) {
    return;
  }

  // 1. Try real session authentication via HttpOnly cookie
  const authUser = await authenticateEvent(event);
  if (authUser) {
    event.context.user = authUser;
    return;
  }

  // 2. Dev / Demo fallback if not authenticated and not explicitly calling auth endpoints
  const isAuthEndpoint = event.path.startsWith('/api/auth/login') || event.path.startsWith('/api/auth/register');
  if (!isAuthEndpoint) {
    const demoUser = await prisma.user.findUnique({
      where: { id: 'demo-user-001' },
      include: {
        character: true,
        wallet: true,
        settings: true,
      },
    });

    if (demoUser) {
      event.context.user = demoUser;
    }
  }
});
