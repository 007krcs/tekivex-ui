#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-unified-site.mjs
//
// Builds all three deliverables and merges them into a single static
// directory served from one Render service:
//
//   docs-site/dist/                 ← Astro Starlight (canonical docs)
//   docs-site/dist/playground/      ← demo/ SPA (interactive sandbox)
//   docs-site/dist/book/            ← packages/tkx-book/ (component catalog)
//
// One domain (ui.tekivex.com), three intents:
//
//   /                 — read documentation
//   /playground/      — click around components live
//   /book/            — browse the component catalog with controls / a11y
//
// Why one domain and not three:
//   - One SSL cert, one DNS record, one CDN cache to invalidate
//   - Cross-linking between sites uses relative URLs
//   - Google sees one site instead of three (better SEO, no canonical fights)
//   - Render Hobby tier supports unlimited static sites but custom domain
//     limits favour fewer services
//
// Usage:
//   node scripts/build-unified-site.mjs
//
// Render's `tekivex-ui` service runs this as its buildCommand. The
// staticPublishPath is `docs-site/dist`.
// ─────────────────────────────────────────────────────────────────────────────

import { execSync } from 'node:child_process';
import { cpSync, existsSync, rmSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

function run(cmd, cwd, env = {}) {
  console.log(`\n▶ ${cmd}\n  cwd=${cwd}`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
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

// ── 1. Build the main library so demo + book have something to link against
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 1/4 — build tekivex-ui library (dist/)');
console.log('══════════════════════════════════════════════════════');
run('npm run build', ROOT);

// ── 2. Build the Astro docs site (canonical /)
//    Uses build:astro-only — NOT `build` — because docs-site's `build`
//    script invokes this very file, and we'd loop forever otherwise.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 2/4 — build docs-site (Astro Starlight) → /');
console.log('══════════════════════════════════════════════════════');
run('npm install --no-audit --no-fund', resolve(ROOT, 'docs-site'));
run('npm run build:astro-only', resolve(ROOT, 'docs-site'));

const DIST = resolve(ROOT, 'docs-site/dist');
if (!existsSync(DIST)) {
  throw new Error('docs-site/dist not produced — Astro build failed');
}

// ── 3. Build the demo SPA with /playground/ base, copy into dist/playground/
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 3/4 — build demo/ SPA → /playground/');
console.log('══════════════════════════════════════════════════════');
run('npm run build:demo', ROOT, { VITE_BASE: '/playground/' });
copyTree(resolve(ROOT, 'demo/dist'), resolve(DIST, 'playground'));

// ── 4. Build tkx-book with /book/ base, copy into dist/book/
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 4/4 — build packages/tkx-book/ → /book/');
console.log('══════════════════════════════════════════════════════');
run('npm install --no-audit --no-fund', resolve(ROOT, 'packages/tkx-book'));
run('npm run build', resolve(ROOT, 'packages/tkx-book'), {
  VITE_BASE: '/book/',
});
copyTree(resolve(ROOT, 'packages/tkx-book/dist'), resolve(DIST, 'book'));

// ── Done
console.log('\n══════════════════════════════════════════════════════');
console.log('✓ Unified site built at docs-site/dist/');
console.log('  /                 → Astro docs (canonical)');
console.log('  /playground/      → demo SPA');
console.log('  /book/            → component catalog');
console.log('══════════════════════════════════════════════════════\n');
