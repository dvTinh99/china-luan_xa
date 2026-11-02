// ============================================================================
// LinguaWorld — Vercel Monorepo Output Mapper
// ============================================================================
// Copies apps/web/.vercel/output to .vercel/output at root so Vercel's
// Build Output API v3 seamlessly deploys the full Nuxt 3 serverless bundle.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceDir = path.resolve(rootDir, 'apps/web/.vercel/output');
const targetDir = path.resolve(rootDir, '.vercel/output');

console.log('[vercel-build] Checking output at:', sourceDir);

if (fs.existsSync(sourceDir)) {
  fs.mkdirSync(path.dirname(targetDir), { recursive: true });
  fs.cpSync(sourceDir, targetDir, { recursive: true });
  console.log('[vercel-build] ✓ Successfully synced apps/web/.vercel/output -> .vercel/output');
} else {
  console.error('[vercel-build] ❌ Error: apps/web/.vercel/output does not exist!');
  process.exit(1);
}
