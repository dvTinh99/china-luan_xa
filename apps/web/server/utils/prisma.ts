// ============================================================================
// Prisma Client Singleton
// ============================================================================
// Creates a single PrismaClient instance per server process to avoid
// exhausting database connections during development hot-reloads.
// ============================================================================

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // In development, attach to global to survive HMR
  if (!globalThis.__prisma) {
    globalThis.__prisma = new PrismaClient({
      log: ['query', 'warn', 'error'],
    });
  }
  prisma = globalThis.__prisma;
}

export { prisma };
