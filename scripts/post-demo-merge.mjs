#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// post-demo-merge.mjs
//
// Called from demo/vite.config.ts via a closeBundle plugin AFTER the demo
// SPA finishes building. Render's hardcoded build command is
// `npm install && cd demo && npx vite build` (with publishPath=demo/dist),
// which we cannot change without dashboard access. So we hook into Vite.
//
// Layout produced inside demo/dist (Render's publish path):
//   demo/dist/                ← React landing (the new ui.tekivex.com /)
//   demo/dist/playground/     ← The demo SPA (the same files Vite just built,
//                               but moved into a subfolder)
//   demo/dist/book/           ← packages/tkx-book/ component catalog
//
// Skip with SKIP_POST_MERGE=1 (used during local `npm run dev:demo`).
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, mkdirSync, renameSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

if (process.env.SKIP_POST_MERGE) {
  console.log('post-demo-merge: SKIP_POST_MERGE set — skipping');
  process.exit(0);
}

function run(cmd, cwd, env = {}) {
  console.log(`\n▶ ${cmd}\n  cwd=${cwd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
}

function copyTree(from, to) {
  if (!existsSync(from)) throw new Error(`copyTree: source missing — ${from}`);
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`  ✓ copied ${from}\n        → ${to}`);
}

const DEMO_DIST = resolve(ROOT, 'demo/dist');
const STASH = resolve(ROOT, 'demo/_dist_playground_stash');

if (!existsSync(DEMO_DIST)) {
  console.error('post-demo-merge: demo/dist missing — was the demo built?');
  process.exit(1);
}

// ── 1. Stash the demo SPA we just built ─────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 1/3 — stash demo/dist (built with base=/playground/)');
console.log('══════════════════════════════════════════════════════');
if (existsSync(STASH)) rmSync(STASH, { recursive: true, force: true });
renameSync(DEMO_DIST, STASH);
console.log(`  ✓ demo/dist → ${STASH}`);

// ── 2. Build the React landing → demo/dist (new canonical /) ───────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 2/3 — build landing/ → demo/dist (new homepage)');
console.log('══════════════════════════════════════════════════════');
try {
  run('npm install --no-audit --no-fund --legacy-peer-deps', resolve(ROOT, 'landing'));
  run('npx vite build', resolve(ROOT, 'landing'));
  copyTree(resolve(ROOT, 'landing/dist'), DEMO_DIST);
} catch (err) {
  console.error('  ✗ landing build failed — restoring demo SPA at /');
  console.error('   ', err instanceof Error ? err.message : err);
  // Fallback: put the demo SPA back at root so site isn't broken
  renameSync(STASH, DEMO_DIST);
  process.exit(0);
}

// ── 3a. Move stashed demo SPA into demo/dist/playground/ ──────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 3a/3 — move demo SPA into demo/dist/playground/');
console.log('══════════════════════════════════════════════════════');
const PLAY_DEST = resolve(DEMO_DIST, 'playground');
if (existsSync(PLAY_DEST)) rmSync(PLAY_DEST, { recursive: true, force: true });
renameSync(STASH, PLAY_DEST);
console.log(`  ✓ ${STASH} → ${PLAY_DEST}`);

// ── 3b. Build tkx-book → demo/dist/book/ ──────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 3b/3 — build packages/tkx-book/ → demo/dist/book/');
console.log('══════════════════════════════════════════════════════');
try {
  run('npm install --no-audit --no-fund --legacy-peer-deps', resolve(ROOT, 'packages/tkx-book'));
  run('npx vite build --base=/book/', resolve(ROOT, 'packages/tkx-book'));
  copyTree(resolve(ROOT, 'packages/tkx-book/dist'), resolve(DEMO_DIST, 'book'));
} catch (err) {
  console.error('  ⚠ tkx-book build failed (non-fatal — /book/ will 404)');
  console.error('   ', err instanceof Error ? err.message : err);
}

console.log('\n══════════════════════════════════════════════════════');
console.log('✓ Unified merge complete — demo/dist contains:');
console.log('    /                  → React landing (new homepage)');
console.log('    /playground/       → demo SPA (every component)');
console.log('    /book/             → tkx-book catalog');
console.log('══════════════════════════════════════════════════════\n');
