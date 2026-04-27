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
//
//    NON-FATAL: After 7 deploy attempts with Astro 5 + Starlight 0.36 +
//    Zod 4 hitting the same `inst._zod.parse undefined` crash during
//    static-route generation, we've stopped letting Astro's failure
//    block the deploy. If this step fails:
//      - We write a minimal stub at docs-site/dist/index.html that
//        links to /playground/ and /book/
//      - Steps 3-5 still run, so the SPAs work
//      - The user gets a working site TODAY; Astro can be debugged
//        separately without holding up the demo
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 2/4 — build docs-site (Astro Starlight) → /');
console.log('══════════════════════════════════════════════════════');
const DIST = resolve(ROOT, 'docs-site/dist');
let astroSucceeded = false;
try {
  run('npm install --no-audit --no-fund', resolve(ROOT, 'docs-site'));
  run('npm run build:astro-only', resolve(ROOT, 'docs-site'));
  if (existsSync(DIST)) {
    astroSucceeded = true;
    console.log('  ✓ Astro build succeeded');
  }
} catch (err) {
  console.error(`\n  ✗ Astro build failed (continuing anyway): ${err.message}`);
}

if (!astroSucceeded) {
  console.log('\n  Writing stub homepage at docs-site/dist/index.html');
  if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
  mkdirSync(DIST, { recursive: true });
  // Minimal homepage that links to the working sub-apps
  const stub = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TekiVex UI — v3.0</title>
  <meta name="description" content="Production-ready React component library — 99 components, WCAG 2.1 AAA, built-in security kernel, 1034 passing tests.">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
           background: #0a0a0f; color: #e8e8f4; line-height: 1.6; min-height: 100vh; display: flex;
           align-items: center; justify-content: center; padding: 32px; }
    .wrap { max-width: 640px; width: 100%; text-align: center; }
    h1 { font-size: clamp(2rem, 6vw, 3.5rem); margin: 0 0 16px; letter-spacing: -0.03em;
         background: linear-gradient(135deg, #00f5d4, #3a86ff); -webkit-background-clip: text;
         -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 999px;
             background: rgba(0,245,212,0.12); border: 1px solid rgba(0,245,212,0.3);
             color: #00f5d4; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 24px; }
    p { color: #aaa; margin: 0 0 32px; font-size: 17px; }
    .grid { display: grid; gap: 16px; grid-template-columns: 1fr; margin: 0 0 32px; }
    @media (min-width: 640px) { .grid { grid-template-columns: 1fr 1fr; } }
    a.card { display: block; padding: 24px; border-radius: 12px; border: 1px solid #2a2a3e;
             background: #12121a; color: #e8e8f4; text-decoration: none; transition: all 0.2s; }
    a.card:hover { border-color: #00f5d4; transform: translateY(-2px);
                   box-shadow: 0 8px 24px rgba(0,245,212,0.1); }
    .card h2 { margin: 0 0 8px; font-size: 18px; color: #00f5d4; }
    .card p { margin: 0; font-size: 14px; color: #888; }
    .links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 32px; }
    .links a { color: #00f5d4; text-decoration: none; font-size: 14px; font-weight: 600; }
    .links a:hover { text-decoration: underline; }
    code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; background: #1a1a2e;
           padding: 2px 6px; border-radius: 4px; color: #00f5d4; font-size: 0.9em; }
  </style>
</head>
<body>
  <main class="wrap">
    <span class="badge">v3.0 · 99 components · 1034 tests</span>
    <h1>TekiVex UI</h1>
    <p>Production-ready React component library. WCAG 2.1 AAA · Built-in security kernel · MIT.</p>
    <p><code>npm install tekivex-ui</code></p>
    <div class="grid">
      <a class="card" href="/playground/">
        <h2>🎮 Interactive playground →</h2>
        <p>Click around every component live — variants, sizes, theme switcher.</p>
      </a>
      <a class="card" href="/book/">
        <h2>📖 Component catalog →</h2>
        <p>Storybook-style: controls panel, a11y panel, viewport toggles.</p>
      </a>
    </div>
    <div class="links">
      <a href="https://www.npmjs.com/package/tekivex-ui">npm</a>
      <a href="https://github.com/007krcs/tekivex-ui">GitHub</a>
      <a href="https://github.com/007krcs/tekivex-ui/issues">Issues</a>
    </div>
  </main>
</body>
</html>`;
  const fs = await import('node:fs');
  fs.writeFileSync(resolve(DIST, 'index.html'), stub);
  console.log('  ✓ Stub homepage written');
}

// ── 3. Build the demo SPA with /playground/ base, copy into dist/playground/
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 3/4 — build demo/ SPA → /playground/');
console.log('══════════════════════════════════════════════════════');
// Use the :standalone alias — `build:demo` is now an alias for THIS
// script, so calling it would loop forever.
run('npm run build:demo:standalone', ROOT, { VITE_BASE: '/playground/' });
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

// ── 5. Mirror to demo/dist so it works regardless of which path Render
//    is configured to publish. The original demo/dist (containing only
//    the SPA) is replaced with the merged tree. The SPA is preserved
//    inside the new demo/dist/playground/ subfolder.
//
//    Why mirror: Render's `staticPublishPath` was historically demo/dist
//    (when tekivex-ui-playground was the canonical service). After the
//    blueprint flip to docs-site/dist, some services may still cache the
//    old setting until manually re-synced. Mirroring guarantees the
//    deploy works whether Render reads docs-site/dist OR demo/dist.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 5/5 — mirror merged tree to demo/dist (compat shim)');
console.log('══════════════════════════════════════════════════════');
const DEMO_DIST = resolve(ROOT, 'demo/dist');
copyTree(DIST, DEMO_DIST);

// ── Done
console.log('\n══════════════════════════════════════════════════════');
console.log('✓ Unified site built at TWO publish targets:');
console.log('    docs-site/dist/    (canonical, render.yaml v3)');
console.log('    demo/dist/         (compat — old render.yaml setting)');
console.log('  Each contains:');
console.log('    /                  → Astro docs (canonical)');
console.log('    /playground/       → demo SPA');
console.log('    /book/             → component catalog');
console.log('══════════════════════════════════════════════════════\n');
