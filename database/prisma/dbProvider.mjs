// ============================================================================
// LinguaWorld — Database Provider Switcher & Synchronization Utility
// ============================================================================
// Supports dynamic switching between SQLite (MVP / Local Dev) and PostgreSQL.
// Reads DB_DRIVER = "sqlite" | "postgresql" from environment or CLI argument.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const schemaPath = path.resolve(__dirname, 'schema.prisma');
const rootEnvPath = path.resolve(rootDir, '.env');
const webEnvPath = path.resolve(rootDir, 'apps/web/.env');

/**
 * Parses key-value pairs from a .env file
 */
function parseEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      env[key] = val;
    }
  }
  return env;
}

/**
 * Updates or sets a key-value in a .env file while preserving existing lines & comments
 */
function updateEnvFile(filePath, updates) {
  if (!fs.existsSync(filePath)) return;
  // If file is a symlink, resolve real path
  const realPath = fs.realpathSync(filePath);
  let content = fs.readFileSync(realPath, 'utf8');

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, 'm');
    const newLine = `${key}="${value}"`;
    if (regex.test(content)) {
      content = content.replace(regex, newLine);
    } else {
      content += `\n${newLine}\n`;
    }
  }

  fs.writeFileSync(realPath, content, 'utf8');
}

/**
 * Detects current configured DB_DRIVER from process.env, .env files, or schema
 */
export function getActiveDriver(targetDriver = null) {
  if (targetDriver && ['sqlite', 'postgresql', 'postgres'].includes(targetDriver.toLowerCase())) {
    return targetDriver.toLowerCase() === 'postgres' ? 'postgresql' : targetDriver.toLowerCase();
  }

  if (process.env.DB_DRIVER && ['sqlite', 'postgresql', 'postgres'].includes(process.env.DB_DRIVER.toLowerCase())) {
    return process.env.DB_DRIVER.toLowerCase() === 'postgres' ? 'postgresql' : process.env.DB_DRIVER.toLowerCase();
  }

  const rootEnv = parseEnv(rootEnvPath);
  if (rootEnv.DB_DRIVER) {
    return rootEnv.DB_DRIVER.toLowerCase() === 'postgres' ? 'postgresql' : rootEnv.DB_DRIVER.toLowerCase();
  }

  return 'sqlite';
}

/**
 * Synchronizes schema.prisma datasource provider with active DB_DRIVER
 */
export function syncSchemaProvider(driver) {
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Prisma schema not found at: ${schemaPath}`);
  }

  let schema = fs.readFileSync(schemaPath, 'utf8');
  const targetProvider = driver === 'sqlite' ? 'sqlite' : 'postgresql';

  const updatedSchema = schema.replace(
    /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+("\s*[\s\S]*?\})/,
    `$1${targetProvider}$2`
  );

  if (schema !== updatedSchema) {
    fs.writeFileSync(schemaPath, updatedSchema, 'utf8');
    console.log(`[dbProvider] ✓ Updated schema.prisma datasource provider to: "${targetProvider}"`);
  } else {
    console.log(`[dbProvider] ✓ schema.prisma datasource provider is already "${targetProvider}"`);
  }

  // Create/update dedicated schemas for dual-client generation
  function makeSchema(targetP, output) {
    let s = schema.replace(
      /(datasource\s+db\s*\{[\s\S]*?provider\s*=\s*")[^"]+("\s*[\s\S]*?\})/,
      `$1${targetP}$2`
    );
    s = s.replace(
      /(generator\s+client\s*\{[\s\S]*?provider\s*=\s*"prisma-client-js"[\s\S]*?)(\})/,
      `$1  output   = "${output}"\n$2`
    );
    return s;
  }

  fs.writeFileSync(path.resolve(__dirname, 'schema.sqlite.prisma'), makeSchema('sqlite', './generated/sqlite'), 'utf8');
  fs.writeFileSync(path.resolve(__dirname, 'schema.postgres.prisma'), makeSchema('postgresql', './generated/postgresql'), 'utf8');
}

/**
 * Configures environment files (.env and apps/web/.env) for the selected driver
 */
export function configureEnvForDriver(driver) {
  const isSqlite = driver === 'sqlite';

  const defaultUrl = isSqlite
    ? 'file:./dev.db'
    : 'postgresql://postgres:password@localhost:5432/linguaworld?schema=public';
  const activeUrl = process.env.DATABASE_URL || defaultUrl;

  updateEnvFile(rootEnvPath, {
    DB_DRIVER: driver,
    DATABASE_URL: activeUrl,
    SQLITE_DATABASE_URL: process.env.SQLITE_DATABASE_URL || 'file:./dev.db',
    POSTGRES_DATABASE_URL: process.env.POSTGRES_DATABASE_URL || activeUrl,
  });

  // Ensure apps/web/.env is a symlink
  try {
    const stat = fs.lstatSync(webEnvPath);
    if (!stat.isSymbolicLink()) {
      fs.unlinkSync(webEnvPath);
      fs.symlinkSync('../../.env', webEnvPath);
    }
  } catch {
    fs.symlinkSync('../../.env', webEnvPath);
  }

  console.log(`[dbProvider] ✓ Updated .env with DB_DRIVER="${driver}" & DATABASE_URL="${activeUrl}"`);
}

/**
 * Regenerates Prisma clients (both SQLite and PostgreSQL, plus active default)
 */
export function generateClients(driver) {
  console.log(`[dbProvider] Generating Prisma Clients for SQLite & PostgreSQL...`);
  const sqliteSchema = path.resolve(__dirname, 'schema.sqlite.prisma');
  const pgSchema = path.resolve(__dirname, 'schema.postgres.prisma');

  execSync(`DATABASE_URL="file:./dev.db" npx prisma generate --schema="${sqliteSchema}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });

  execSync(`DATABASE_URL="postgresql://postgres:password@localhost:5432/linguaworld?schema=public" npx prisma generate --schema="${pgSchema}"`, {
    stdio: 'inherit',
    cwd: rootDir,
  });

  // Also update default @prisma/client
  const activeUrl = process.env.DATABASE_URL || (driver === 'sqlite' ? 'file:./dev.db' : 'postgresql://postgres:password@localhost:5432/linguaworld?schema=public');
  execSync(`npx prisma generate --schema="${schemaPath}"`, {
    stdio: 'inherit',
    cwd: rootDir,
    env: {
      ...process.env,
      DATABASE_URL: activeUrl,
    },
  });

  // Patch generated clients to prevent '__dirname is not defined in ES module scope'
  const generatedClients = [
    path.resolve(__dirname, 'generated/sqlite/index.js'),
    path.resolve(__dirname, 'generated/postgresql/index.js'),
  ];
  for (const clientFile of generatedClients) {
    if (fs.existsSync(clientFile)) {
      let code = fs.readFileSync(clientFile, 'utf8');
      if (code.includes('config.dirname = __dirname')) {
        code = code.replace(
          'config.dirname = __dirname',
          'const __prisma_dirname = typeof __dirname !== "undefined" ? __dirname : process.cwd();\nconfig.dirname = __prisma_dirname'
        );
        code = code.replaceAll('path.join(__dirname,', 'path.join(config.dirname,');
        fs.writeFileSync(clientFile, code, 'utf8');
        console.log(`[dbProvider] ✓ Patched ${path.basename(path.dirname(clientFile))} for ES module __dirname safety`);
      }
    }
  }
}

/**
 * Main CLI action
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'prepare';

  let targetDriver = null;
  if (command === 'sqlite' || command === 'postgresql' || command === 'postgres') {
    targetDriver = command;
  } else if (args[1] === 'sqlite' || args[1] === 'postgresql') {
    targetDriver = args[1];
  }

  const driver = getActiveDriver(targetDriver);
  console.log(`\n============================================================`);
  console.log(`🛠️  LinguaWorld dbProvider: [${driver.toUpperCase()}]`);
  console.log(`============================================================`);

  // 1. Sync provider in schema.prisma and dual schemas
  syncSchemaProvider(driver);

  // 2. Configure env files
  if (targetDriver) {
    configureEnvForDriver(driver);
  } else {
    const rootEnv = parseEnv(rootEnvPath);
    if (!rootEnv.DB_DRIVER || rootEnv.DB_DRIVER !== driver) {
      configureEnvForDriver(driver);
    }
  }

  // 3. Generate clients when switching or generating
  if (command === 'switch' || targetDriver || command === 'generate' || command === 'prepare') {
    generateClients(driver);
  }

  console.log(`[dbProvider] Ready! Active driver: ${driver}\n`);
}

// Run when executed directly
if (process.argv[1] && process.argv[1].endsWith('dbProvider.mjs')) {
  main().catch((err) => {
    console.error('[dbProvider] Error:', err);
    process.exit(1);
  });
}
