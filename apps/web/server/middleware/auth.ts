// ============================================================================
// Auth Server Middleware
// ============================================================================
// Phase 0: Demo mode — if no real session exists, injects a demo user into
// the event context so that all authenticated endpoints work for development.
//
// TODO Phase 1: Replace demo-mode fallback with real session lookup:
//   1. Read session token from HttpOnly cookie
//   2. Validate token against Session table in DB
//   3. Check expiration
//   4. Attach real user to event.context.user
//   5. Return 401 if no valid session
// ============================================================================

import { defineEventHandler } from 'h3';

/** The user object shape attached to event.context */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

declare module 'h3' {
  interface H3EventContext {
    user?: AuthUser;
  }
}

/** Demo user for Phase 0 development */
const DEMO_USER: AuthUser = {
  id: 'demo-user-001',
  email: 'demo@linguaworld.dev',
  username: 'DemoExplorer',
};

export default defineEventHandler((event) => {
  // Only apply to /api/ routes
  const path = event.path || '';
  if (!path.startsWith('/api/')) {
    return;
  }

  // TODO Phase 1: Read session cookie and look up real user
  // const sessionToken = getCookie(event, 'lw_session');
  // if (sessionToken) {
  //   const session = await prisma.session.findUnique({ where: { token: sessionToken }, include: { user: true } });
  //   if (session && session.expiresAt > new Date()) {
  //     event.context.user = { id: session.user.id, email: session.user.email, username: session.user.username };
  //     return;
  //   }
  // }

  // Phase 0: Auto-authenticate with demo user
  if (!event.context.user) {
    event.context.user = DEMO_USER;
  }
});
