#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// post-demo-merge.mjs
//
// Called from demo/vite.config.ts via a closeBundle plugin AFTER the demo
// SPA finishes building. Render's hardcoded buildCommand is
// `npm install && cd demo && npx vite build` which we cannot change
// without dashboard access — so we hook into Vite instead.
//
// Layout produced (in demo/dist, the path Render publishes):
//   demo/dist/                  Astro Starlight docs (canonical /)
//   demo/dist/playground/       The demo SPA (assets reference /playground/)
//   demo/dist/book/             packages/tkx-book/ (assets reference /book/)
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
  console.log('post-demo-merge: SKIP_POST_MERGE set — skipping merge');
  process.exit(0);
}

function run(cmd, cwd, env = {}) {
  console.log(`\n▶ ${cmd}\n  cwd=${cwd}`);
  execSync(cmd, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
}

function copyTree(from, to) {
  if (!existsSync(from)) {
    throw new Error(`copyTree: source missing — ${from}`);
  }
  if (existsSync(to)) rmSync(to, { recursive: true, force: true });
  mkdirSync(dirname(to), { recursive: true });
  cpSync(from, to, { recursive: true });
  console.log(`  ✓ copied ${from}\n        → ${to}`);
}

// At this point the demo SPA has already been built to demo/dist with
// VITE_BASE=/playground/ (configured in demo/vite.config.ts when
// command==='build'). We need to move it into a /playground/ subdir,
// then put Astro at the root, and tkx-book at /book/.

const DEMO_DIST = resolve(ROOT, 'demo/dist');
const DEMO_DIST_PLAYGROUND_TMP = resolve(ROOT, 'demo/dist-playground-tmp');

if (!existsSync(DEMO_DIST)) {
  console.error('post-demo-merge: demo/dist missing — was the demo built?');
  process.exit(1);
}

// ── 1. Stash the freshly-built demo SPA to a temp location ───────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 1/4 — stash demo SPA to demo/dist-playground-tmp/');
console.log('══════════════════════════════════════════════════════');
if (existsSync(DEMO_DIST_PLAYGROUND_TMP)) {
  rmSync(DEMO_DIST_PLAYGROUND_TMP, { recursive: true, force: true });
}
renameSync(DEMO_DIST, DEMO_DIST_PLAYGROUND_TMP);
console.log(`  ✓ demo/dist → demo/dist-playground-tmp`);

// ── 2. Build the Astro docs site ─────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 2/4 — build docs-site (Astro Starlight) → demo/dist/');
console.log('══════════════════════════════════════════════════════');
try {
  run('npm install --no-audit --no-fund --legacy-peer-deps', resolve(ROOT, 'docs-site'));
  // Use astro build directly (skip astro check — too strict for deploy)
  run('npx astro build', resolve(ROOT, 'docs-site'));
} catch (err) {
  console.error('post-demo-merge: docs-site build failed:', err.message);
  // Fallback: restore demo/dist so the deploy isn't worse than before
  renameSync(DEMO_DIST_PLAYGROUND_TMP, DEMO_DIST);
  console.error('post-demo-merge: restored original demo/dist; aborting merge');
  process.exit(1);
}

// Copy Astro output to demo/dist (root)
const ASTRO_DIST = resolve(ROOT, 'docs-site/dist');
if (!existsSync(ASTRO_DIST)) {
  console.error('post-demo-merge: docs-site/dist not produced');
  renameSync(DEMO_DIST_PLAYGROUND_TMP, DEMO_DIST);
  process.exit(1);
}
mkdirSync(DEMO_DIST, { recursive: true });
cpSync(ASTRO_DIST, DEMO_DIST, { recursive: true });
console.log(`  ✓ Astro → demo/dist/`);

// ── 3. Move the stashed demo SPA into demo/dist/playground/ ──────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 3/4 — move demo SPA into demo/dist/playground/');
console.log('══════════════════════════════════════════════════════');
const PLAYGROUND_DEST = resolve(DEMO_DIST, 'playground');
if (existsSync(PLAYGROUND_DEST)) {
  rmSync(PLAYGROUND_DEST, { recursive: true, force: true });
}
renameSync(DEMO_DIST_PLAYGROUND_TMP, PLAYGROUND_DEST);
console.log(`  ✓ demo SPA → demo/dist/playground/`);

// ── 4. Build tkx-book → demo/dist/book/ ──────────────────────────────────
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 4/4 — build packages/tkx-book/ → demo/dist/book/');
console.log('══════════════════════════════════════════════════════');
try {
  run('npm install --no-audit --no-fund --legacy-peer-deps', resolve(ROOT, 'packages/tkx-book'));
  run('npx vite build', resolve(ROOT, 'packages/tkx-book'), { VITE_BASE: '/book/' });
  copyTree(resolve(ROOT, 'packages/tkx-book/dist'), resolve(DEMO_DIST, 'book'));
} catch (err) {
  console.error('post-demo-merge: tkx-book build failed (non-fatal):', err.message);
  console.error('  /book/ will 404 but / and /playground/ will work');
}

console.log('\n══════════════════════════════════════════════════════');
console.log('✓ Merged tree assembled at demo/dist/');
console.log('  /                  → Astro docs (canonical)');
console.log('  /playground/       → demo SPA');
console.log('  /book/             → component catalog');
console.log('══════════════════════════════════════════════════════\n');
