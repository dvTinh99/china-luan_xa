// ============================================================================
// LinguaWorld — Dual Database Provider Singleton (SQLite / PostgreSQL)
// ============================================================================
// Supports instant, zero-reboot switching between:
// - SQLite: Local MVP development without external database dependencies
// - PostgreSQL: Production database with Docker / Supabase / Neon
//
// Controlled via: DB_DRIVER = "sqlite" | "postgresql" in .env
// ============================================================================

import type { PrismaClient } from '@prisma/client';
import { PrismaClient as SqliteClient } from '@linguaworld/database/sqlite';
import { PrismaClient as PostgresClient } from '@linguaworld/database/postgresql';
import { PrismaNeon } from '@prisma/adapter-neon';
import path from 'path';
import fs from 'fs';

export type DbDriverType = 'sqlite' | 'postgresql';

let lastEnvMtime = 0;

/**
 * In development, automatically re-reads .env on file modification
 * so switching DB_DRIVER does not even require restarting Nuxt.
 */
function reloadEnvIfChanged() {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const cwd = process.cwd();
    const candidatePaths = [
      path.resolve(cwd, '.env'),
      path.resolve(cwd, '../../.env'),
      path.resolve(cwd, '../.env'),
    ];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        const realPath = fs.realpathSync(p);
        const stat = fs.statSync(realPath);
        if (stat.mtimeMs !== lastEnvMtime) {
          lastEnvMtime = stat.mtimeMs;
          const content = fs.readFileSync(realPath, 'utf8');
          for (const line of content.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx !== -1) {
              const key = trimmed.slice(0, eqIdx).trim();
              let val = trimmed.slice(eqIdx + 1).trim();
              if (
                (val.startsWith('"') && val.endsWith('"')) ||
                (val.startsWith("'") && val.endsWith("'"))
              ) {
                val = val.slice(1, -1);
              }
              process.env[key] = val;
            }
          }
        }
        break;
      }
    }
  } catch {}
}

/**
 * Resolves the active database driver from environment variables.
 * Defaults to "sqlite" if unspecified.
 */
export function resolveDbDriver(): DbDriverType {
  reloadEnvIfChanged();
  const driver = (process.env.DB_DRIVER || '').trim().toLowerCase();
  if (driver === 'postgresql' || driver === 'postgres') {
    return 'postgresql';
  }
  if (driver === 'sqlite') {
    return 'sqlite';
  }

  // Auto-detect from connection string if DB_DRIVER is unset
  const dbUrl = (process.env.DATABASE_URL || '').trim();
  if (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')) {
    return 'postgresql';
  }

  return 'sqlite';
}

/**
 * Resolves the appropriate database URL based on the active driver.
 */
export function resolveDatabaseUrl(driver: DbDriverType): string {
  if (driver === 'postgresql') {
    const pgUrl =
      process.env.POSTGRES_DATABASE_URL ||
      (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgres')
        ? process.env.DATABASE_URL
        : '') ||
      'postgresql://postgres:password@localhost:5432/linguaworld?schema=public';
    return pgUrl;
  }

  // SQLite resolution
  const envUrl =
    process.env.SQLITE_DATABASE_URL ||
    (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')
      ? process.env.DATABASE_URL
      : '') ||
    'file:./dev.db';

  let filename = 'dev.db';
  if (envUrl.startsWith('file:')) {
    filename = path.basename(envUrl.replace(/^file:/, ''));
  }

  // Search candidate root paths upwards from cwd
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

  // Fallback to project root database path
  return `file:${path.resolve(process.cwd(), '../../database/prisma', filename)}`;
}

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __dbDriver: DbDriverType | undefined;
  // eslint-disable-next-line no-var
  var __dbUrl: string | undefined;
}

/**
 * Gets or dynamically re-creates the PrismaClient matching the active DB_DRIVER
 */
export function getActivePrismaClient(): PrismaClient {
  const activeDriver = resolveDbDriver();
  const resolvedUrl = resolveDatabaseUrl(activeDriver);

  if (!globalThis.__prisma || globalThis.__dbDriver !== activeDriver) {
    if (globalThis.__prisma) {
      console.log(
        `[dbProvider] 🔄 Switching active DB driver: ${globalThis.__dbDriver?.toUpperCase()} ➔ ${activeDriver.toUpperCase()}`
      );
      globalThis.__prisma.$disconnect().catch(() => {});
    }

    console.log(
      `[dbProvider] 🔌 Connected to [${activeDriver.toUpperCase()}]: ${
        activeDriver === 'postgresql'
          ? resolvedUrl.replace(/:[^:@]+@/, ':****@')
          : resolvedUrl
      }`
    );

    let newInstance: PrismaClient;
    if (activeDriver === 'postgresql') {
      if (process.env.CLOUDFLARE_WORKERS_BUILD === '1') {
        newInstance = new PostgresClient({
          adapter: new PrismaNeon({ connectionString: resolvedUrl }),
          log: ['warn', 'error'],
        } as never) as unknown as PrismaClient;
      } else {
        newInstance = new PostgresClient({
          datasources: {
            db: {
              url: resolvedUrl,
            },
          },
          log: ['warn', 'error'],
        }) as unknown as PrismaClient;
      }
    } else {
      newInstance = new SqliteClient({
        datasources: {
          db: {
            url: resolvedUrl,
          },
        },
        log: ['warn', 'error'],
      }) as unknown as PrismaClient;
    }

    globalThis.__prisma = newInstance;
    globalThis.__dbDriver = activeDriver;
    globalThis.__dbUrl = resolvedUrl;
  }

  return globalThis.__prisma;
}

/**
 * Transparent proxy for PrismaClient that dynamically invokes getActivePrismaClient().
 * Guarantees that any query automatically uses the active database connection.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const instance = getActivePrismaClient();
    const val = (instance as any)[prop];
    if (typeof val === 'function') {
      return val.bind(instance);
    }
    return val;
  },
});

/**
 * dbProvider utility object for application-level DB inspection & health checks
 */
export const dbProvider = {
  get driver(): DbDriverType {
    return resolveDbDriver();
  },
  get url(): string {
    return resolveDatabaseUrl(this.driver);
  },
  get isSqlite(): boolean {
    return this.driver === 'sqlite';
  },
  get isPostgres(): boolean {
    return this.driver === 'postgresql';
  },
  async healthCheck(): Promise<{ ok: boolean; driver: DbDriverType; latencyMs: number; error?: string }> {
    const driver = this.driver;
    const start = Date.now();
    try {
      const client = getActivePrismaClient();
      await (client as any).$queryRaw`SELECT 1`;
      return { ok: true, driver, latencyMs: Date.now() - start };
    } catch (err: any) {
      return { ok: false, driver, latencyMs: Date.now() - start, error: err.message };
    }
  },
};
