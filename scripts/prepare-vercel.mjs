// ============================================================================
// LinguaWorld — Vercel Monorepo Serverless Bundle Preparation Utility
// ============================================================================
// 1. Syncs apps/web/.vercel/output to root .vercel/output for Build Output API v3.
// 2. Injects vue/server-renderer into serverless functions (resolves monorepo bundling gap).
// 3. Injects Prisma query engine binaries (rhel-openssl-3.0.x) & schemas into all lookup paths.
// ============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const sourceDir = path.resolve(rootDir, 'apps/web/.vercel/output');
const targetDir = path.resolve(rootDir, '.vercel/output');

console.log('[vercel-prep] Starting Vercel serverless bundle preparation...');

// 1. Sync apps/web/.vercel/output -> .vercel/output
if (!fs.existsSync(sourceDir)) {
  console.error('[vercel-prep] ❌ Error: apps/web/.vercel/output does not exist!');
  process.exit(1);
}

fs.mkdirSync(path.dirname(targetDir), { recursive: true });
fs.cpSync(sourceDir, targetDir, { recursive: true });
console.log('[vercel-prep] ✓ Mapped apps/web/.vercel/output -> .vercel/output');

// Find all serverless functions in .vercel/output/functions
const functionsDir = path.resolve(targetDir, 'functions');
if (!fs.existsSync(functionsDir)) {
  console.log('[vercel-prep] No functions directory found, skipping runtime asset injection.');
  process.exit(0);
}

const funcDirs = [];
function findFuncDirs(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name.endsWith('.func')) {
        funcDirs.push(full);
      } else {
        findFuncDirs(full);
      }
    }
  }
}
findFuncDirs(functionsDir);

console.log(`[vercel-prep] Detected ${funcDirs.length} serverless function(s) to prepare.`);

// Locate vue/server-renderer in repository
const vueServerRendererCandidates = [
  path.resolve(rootDir, 'node_modules/vue/server-renderer'),
  path.resolve(rootDir, 'apps/web/node_modules/vue/server-renderer'),
];
let vueServerRendererSource = vueServerRendererCandidates.find((p) => fs.existsSync(p));

// Locate Prisma query engines (*.so.node and *.node)
const prismaEngineCandidates = [
  path.resolve(rootDir, 'node_modules/.prisma/client'),
  path.resolve(rootDir, 'database/prisma/generated/postgresql'),
  path.resolve(rootDir, 'database/prisma/generated/sqlite'),
  path.resolve(rootDir, 'apps/web/node_modules/.prisma/client'),
];

const foundEngines = [];
for (const cand of prismaEngineCandidates) {
  if (fs.existsSync(cand)) {
    for (const f of fs.readdirSync(cand)) {
      if (f.includes('query_engine') && (f.endsWith('.node') || f.endsWith('.so.node'))) {
        foundEngines.push({ name: f, fullPath: path.join(cand, f) });
      }
    }
  }
}

// Locate schema files
const schemaFiles = [
  path.resolve(rootDir, 'database/prisma/schema.prisma'),
  path.resolve(rootDir, 'database/prisma/schema.postgres.prisma'),
  path.resolve(rootDir, 'database/prisma/schema.sqlite.prisma'),
].filter((p) => fs.existsSync(p));

for (const funcDir of funcDirs) {
  console.log(`[vercel-prep] Processing function: ${path.relative(rootDir, funcDir)}`);

  // A. Ensure vue/server-renderer is present
  if (vueServerRendererSource) {
    const targetVueRenderer = path.join(funcDir, 'node_modules/vue/server-renderer');
    if (!fs.existsSync(targetVueRenderer)) {
      fs.mkdirSync(path.dirname(targetVueRenderer), { recursive: true });
      fs.cpSync(vueServerRendererSource, targetVueRenderer, { recursive: true });
      console.log(`[vercel-prep]   ✓ Injected vue/server-renderer`);
    }
  }

  // B. Ensure Prisma engines are copied to function root, chunks, and prisma paths
  const engineDestinations = [
    funcDir,
    path.join(funcDir, 'chunks'),
    path.join(funcDir, 'chunks/nitro'),
    path.join(funcDir, 'node_modules/.prisma/client'),
    path.join(funcDir, 'database/prisma/generated/postgresql'),
    path.join(funcDir, 'database/prisma/generated/sqlite'),
  ];

  for (const eng of foundEngines) {
    for (const destDir of engineDestinations) {
      fs.mkdirSync(destDir, { recursive: true });
      const destFile = path.join(destDir, eng.name);
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(eng.fullPath, destFile);
      }
    }
  }
  if (foundEngines.length > 0) {
    console.log(`[vercel-prep]   ✓ Injected ${foundEngines.length} Prisma engine binary(ies)`);
  }

  // C. Copy schema files
  const schemaDestDirs = [
    funcDir,
    path.join(funcDir, 'database/prisma'),
  ];
  for (const sch of schemaFiles) {
    const baseName = path.basename(sch);
    for (const destDir of schemaDestDirs) {
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(sch, path.join(destDir, baseName));
    }
  }
}

console.log('[vercel-prep] 🎉 All serverless functions successfully prepared for Vercel deployment!\n');
