// ============================================================================
// LinguaWorld — Universal Prisma Client Loader (SQLite & PostgreSQL)
// ============================================================================
// Automatically provides the correct compiled PrismaClient instance based on:
// DB_DRIVER = "sqlite" | "postgresql"
// ============================================================================

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');

export function resolveDriver() {
  const driver = (process.env.DB_DRIVER || '').trim().toLowerCase();
  if (driver === 'postgresql' || driver === 'postgres') return 'postgresql';
  if (driver === 'sqlite') return 'sqlite';

  const dbUrl = (process.env.DATABASE_URL || '').trim();
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    return 'postgresql';
  }
  return 'sqlite';
}

export function resolveDatabaseUrl(driver) {
  if (driver === 'postgresql') {
    return (
      process.env.POSTGRES_DATABASE_URL ||
      process.env.DATABASE_URL ||
      'postgresql://postgres:password@localhost:5432/linguaworld?schema=public'
    );
  }

  // SQLite resolution
  const envUrl = process.env.SQLITE_DATABASE_URL || process.env.DATABASE_URL || '';
  let filename = 'dev.db';
  if (envUrl.startsWith('file:')) {
    filename = path.basename(envUrl.replace(/^file:/, ''));
  }

  // Search candidate root paths upwards
  let curr = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(curr, 'database/prisma', filename);
    if (fs.existsSync(candidate)) {
      return `file:${candidate}`;
    }
    const parent = path.dirname(curr);
    if (parent === curr) break;
    curr = parent;
  }

  return `file:${path.resolve(rootDir, 'database/prisma', filename)}`;
}

let cachedClient = null;
let cachedDriver = null;

export async function getPrismaClient() {
  const driver = resolveDriver();
  const url = resolveDatabaseUrl(driver);

  if (cachedClient && cachedDriver === driver) {
    return cachedClient;
  }

  if (cachedClient) {
    await cachedClient.$disconnect().catch(() => {});
  }

  let ClientConstructor;
  if (driver === 'postgresql') {
    const mod = await import('./generated/postgresql/index.js');
    ClientConstructor = mod.PrismaClient;
  } else {
    const mod = await import('./generated/sqlite/index.js');
    ClientConstructor = mod.PrismaClient;
  }

  cachedClient = new ClientConstructor({
    datasources: {
      db: { url },
    },
    log: ['warn', 'error'],
  });
  cachedDriver = driver;

  return cachedClient;
}

export { resolveDriver as getDriver };
