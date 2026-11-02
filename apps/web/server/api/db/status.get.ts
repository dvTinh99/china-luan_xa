// ============================================================================
// GET /api/db/status — Database Connection Status & Health Check
// ============================================================================

import { defineEventHandler } from 'h3';
import { dbProvider } from '../../utils/prisma';
import { sendApiSuccess } from '../../utils/response';

export default defineEventHandler(async (event) => {
  const health = await dbProvider.healthCheck();

  return sendApiSuccess(event, {
    driver: dbProvider.driver,
    url: dbProvider.driver === 'postgresql'
      ? dbProvider.url.replace(/:[^:@]+@/, ':****@')
      : dbProvider.url,
    isSqlite: dbProvider.isSqlite,
    isPostgres: dbProvider.isPostgres,
    health,
  });
});
