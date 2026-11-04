/** Build-time replacement for SQLite Prisma client in Cloudflare Workers. */
export class PrismaClient {
  constructor() {
    throw new Error('SQLite is unavailable in Cloudflare Workers; configure PostgreSQL/Neon.');
  }
}
