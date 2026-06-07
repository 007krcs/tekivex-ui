#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// build-unified-site.mjs
//
// Builds all four deliverables and merges them into a single static
// directory served from one Render service:
//
//   docs-site/dist/                 ← landing React app (homepage, /examples/, /blog/, /about/)
//                                     PLUS Astro Starlight overlay for
//                                     /recipes/, /blueprints/, /components/,
//                                     /getting-started/, /quick-reference/,
//                                     /themes/, /bundlers/, /rsc/, /ecosystem/, /security/
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
import {
  cpSync,
  existsSync,
  rmSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  readdirSync,
  statSync,
  copyFileSync,
} from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
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

// overlayTreeNoOverwrite — copy `from` into `to` only at paths where the
// target file does NOT already exist. Used to add Astro's docs pages
// (/recipes/, /blueprints/, /components/, etc.) on top of the landing
// React app's output without clobbering landing's homepage, /examples/,
// /blog/, /about/, /license/, etc. Whichever build wrote first wins for
// any given path.
function overlayTreeNoOverwrite(from, to) {
  if (!existsSync(from)) {
    throw new Error(`overlayTreeNoOverwrite: source missing — ${from}`);
  }
  let added = 0;
  let skipped = 0;
  function walk(src, dest) {
    const entries = readdirSync(src);
    for (const name of entries) {
      const s = join(src, name);
      const d = join(dest, name);
      const st = statSync(s);
      if (st.isDirectory()) {
        if (!existsSync(d)) mkdirSync(d, { recursive: true });
        walk(s, d);
      } else if (st.isFile()) {
        if (existsSync(d)) {
          skipped++;
          continue;
        }
        mkdirSync(dirname(d), { recursive: true });
        copyFileSync(s, d);
        added++;
      }
    }
  }
  walk(from, to);
  console.log(`  ✓ overlay ${relative(ROOT, from)} → ${relative(ROOT, to)} (${added} added, ${skipped} skipped due to existing file)`);
}

// Reads the built index.html and confirms its first <script type="module">
// src begins with `expectedBase`. Logs a clear warning (non-fatal) if the
// base is wrong, so we can spot it in build logs rather than discovering
// it via a blank page in prod.
function verifyBase(htmlPath, expectedBase) {
  if (!existsSync(htmlPath)) {
    console.warn(`  ⚠ verifyBase: ${htmlPath} missing`);
    return;
  }
  const html = readFileSync(htmlPath, 'utf8');
  // Find ALL <script src=...> and check the first one that's NOT external
  // (skip GA, Tag Manager, anything starting with http(s) or //).
  const matches = [...html.matchAll(/<script[^>]*src=["']([^"']+)["']/g)];
  const localScripts = matches
    .map((m) => m[1])
    .filter((src) => !/^(https?:)?\/\//.test(src));
  if (localScripts.length === 0) {
    console.warn(`  ⚠ verifyBase: no local <script src> in ${htmlPath}`);
    return;
  }
  const src = localScripts[0];
  if (src.startsWith(expectedBase)) {
    console.log(`  ✓ base verified: ${src}`);
  } else {
    console.warn(
      `  ⚠ base mismatch in ${htmlPath}: got "${src}", expected to start with "${expectedBase}"`,
    );
  }
}

// ── 1. Build the main library so demo + book have something to link against
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 1/4 — build tekivex-ui library (dist/)');
console.log('══════════════════════════════════════════════════════');
run('npm run build', ROOT);

// ── 2. Build the new React landing page (canonical /)
//    landing/ is a small Vite project that imports tekivex-ui (3.1+
//    holographic family) and tekivex-3d (WebGL + 360° + AR/VR) to make
//    the homepage actually showcase what the library can do.
//
//    Astro is no longer attempted at build time — after 8 failed deploys
//    on the Starlight 0.36 + Zod 4 incompatibility, we replaced it with
//    this React landing page that doesn't have those issues.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 2/4 — build landing/ (React + tekivex-3d) → /');
console.log('══════════════════════════════════════════════════════');
const DIST = resolve(ROOT, 'docs-site/dist');
let landingSucceeded = false;
try {
  run('npm install --no-audit --no-fund --legacy-peer-deps', resolve(ROOT, 'landing'));
  // Use the landing project's `npm run build` (vite build && build-sitemap
  // && prerender) instead of `npx vite build` directly. Without this,
  // /examples/index.html, /about/index.html, /blog/<slug>/index.html etc.
  // never get generated and Render returns "Not Found" for any non-root
  // path that React Router needs to handle.
  run('npm run build', resolve(ROOT, 'landing'));
  const landingDist = resolve(ROOT, 'landing/dist');
  if (existsSync(landingDist)) {
    if (existsSync(DIST)) rmSync(DIST, { recursive: true, force: true });
    mkdirSync(DIST, { recursive: true });
    cpSync(landingDist, DIST, { recursive: true });
    landingSucceeded = true;
    console.log('  ✓ Landing built and copied to docs-site/dist/');
  }
} catch (err) {
  console.error(`\n  ✗ Landing build failed (falling back to stub): ${err instanceof Error ? err.message : err}`);
}

// Keep the old astroSucceeded variable name so the fallback block
// below doesn't need restructuring — false means stub takes over.
const astroSucceeded = landingSucceeded;

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
  <title>TekiVex UI — v3.5 · 13 packages on npm · React in 360°</title>
  <meta name="description" content="Production-ready React component library — 99 components, WCAG 2.1 AAA, built-in security kernel, 1034 passing tests, Puppeteer-free PDF rendering.">
  <link rel="canonical" href="https://ui.tekivex.com/">
  <style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
           background: #0a0a0f; color: #e8e8f4; line-height: 1.65; padding: 48px 24px; }
    .wrap { max-width: 920px; margin: 0 auto; }
    header { text-align: center; margin-bottom: 48px; }
    h1 { font-size: clamp(2rem, 6vw, 3.6rem); margin: 0 0 12px; letter-spacing: -0.03em;
         background: linear-gradient(135deg, #00f5d4, #3a86ff); -webkit-background-clip: text;
         -webkit-text-fill-color: transparent; }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 999px;
             background: rgba(0,245,212,0.12); border: 1px solid rgba(0,245,212,0.3);
             color: #00f5d4; font-size: 12px; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 18px; }
    .lead { color: #aaa; font-size: 17px; max-width: 640px; margin: 0 auto; }
    h2 { font-size: 22px; margin: 48px 0 16px; letter-spacing: -0.02em; }
    h2 .label { color: #888; font-size: 13px; font-weight: 500; letter-spacing: 0; margin-left: 8px; }
    .grid { display: grid; gap: 12px; grid-template-columns: 1fr; margin-bottom: 16px; }
    @media (min-width: 600px) { .grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 900px) { .grid.try { grid-template-columns: 1fr 1fr; } }
    a.card, .card-static { display: block; padding: 18px 20px; border-radius: 10px; border: 1px solid #2a2a3e;
             background: #12121a; color: #e8e8f4; text-decoration: none; transition: all 0.15s; }
    a.card:hover { border-color: #00f5d4; transform: translateY(-1px);
                   box-shadow: 0 6px 20px rgba(0,245,212,0.08); }
    .card h3 { margin: 0 0 4px; font-size: 15px; color: #00f5d4; font-family: ui-monospace, monospace; }
    .card-static h3 { margin: 0 0 4px; font-size: 15px; color: #ffbe0b; font-family: ui-monospace, monospace; }
    .card p { margin: 0; font-size: 13px; color: #aaa; line-height: 1.5; }
    .card-static p { margin: 0; font-size: 13px; color: #888; line-height: 1.5; }
    .card-static { opacity: 0.85; cursor: default; }
    .install { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px;
               background: #0d0d14; padding: 6px 10px; border-radius: 6px;
               color: #00f5d4; margin-top: 8px; display: inline-block; border: 1px solid #1f1f2e; }
    .links { display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-top: 56px;
             padding-top: 32px; border-top: 1px solid #2a2a3e; }
    .links a { color: #00f5d4; text-decoration: none; font-size: 14px; font-weight: 600; }
    .links a:hover { text-decoration: underline; }
    .try a { background: linear-gradient(135deg, #12121a, #1a1a2e); padding: 24px; }
    .try .card h3 { font-size: 18px; font-family: inherit; }
    .footnote { color: #666; font-size: 12.5px; text-align: center; margin-top: 48px; }
  </style>
</head>
<body>
  <main class="wrap">
    <header>
      <span class="badge">v3.5.0 · 102 components · 13 packages · MIT · 🌐 360°/AR/VR-ready</span>
      <h1>TekiVex UI</h1>
      <p class="lead">Production-ready React component library. WCAG 2.1 AAA accessibility, built-in security kernel, Puppeteer-free PDF rendering, zero runtime dependencies.</p>
    </header>

    <h2>Try it without installing</h2>
    <div class="grid try">
      <a class="card" href="/playground/">
        <h3>🎮 Interactive playground →</h3>
        <p>Click around every component live — variants, sizes, theme switcher, hash-routed deep links.</p>
      </a>
      <a class="card" href="/book/">
        <h3>📖 Component catalog →</h3>
        <p>Storybook-style: controls panel, a11y panel, viewport toggles.</p>
      </a>
    </div>

    <h2>Live on npm <span class="label">13 packages, all unscoped</span></h2>
    <div class="grid">
      <a class="card" href="https://www.npmjs.com/package/tekivex-ui" target="_blank" rel="noopener">
        <h3>tekivex-ui</h3>
        <p>The main library. 99 components, WCAG 2.1 AAA, built-in security kernel.</p>
        <span class="install">npm install tekivex-ui</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-pdf" target="_blank" rel="noopener">
        <h3>tekivex-pdf</h3>
        <p>Puppeteer alternative. React → PDF / PNG without a headless browser. 5/5 smoke tests pass.</p>
        <span class="install">npm install tekivex-pdf</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-templates" target="_blank" rel="noopener">
        <h3>tekivex-templates</h3>
        <p>7 pre-built PDF templates: Biodata, Invoice, Certificate, Resume, Ticket, BoardingPass, Receipt.</p>
        <span class="install">npm install tekivex-templates</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-form" target="_blank" rel="noopener">
        <h3>tekivex-form</h3>
        <p>Slimmer install for form-only apps. Re-exports every form input from tekivex-ui.</p>
        <span class="install">npm install tekivex-form</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-security-core" target="_blank" rel="noopener">
        <h3>tekivex-security-core</h3>
        <p>Framework-agnostic security kernel. XSS, CSP, Trojan Source, clickjacking, PII, rate-limit.</p>
        <span class="install">npm install tekivex-security-core</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-audit" target="_blank" rel="noopener">
        <h3>tekivex-audit</h3>
        <p>Static-analysis CLI. 15 security + a11y checks with OWASP / CWE / WCAG mappings.</p>
        <span class="install">npx tekivex-audit .</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/create-tekivex-app" target="_blank" rel="noopener">
        <h3>create-tekivex-app</h3>
        <p>Project scaffolder. Two templates (basic + secure) with CSP + Trusted Types preset.</p>
        <span class="install">npm create tekivex-app@latest my-app</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-add" target="_blank" rel="noopener">
        <h3>tekivex-add</h3>
        <p>shadcn-style component copier. Copy a Tkx* component's source into your project to edit freely.</p>
        <span class="install">npx tekivex-add button</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-india" target="_blank" rel="noopener">
        <h3>tekivex-india</h3>
        <p>Vertical pack: Aadhaar, PAN, Voter ID, DL, INR currency, India Post PIN lookup, Tithi/Nakshatra calendar.</p>
        <span class="install">npm install tekivex-india</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-finance" target="_blank" rel="noopener">
        <h3>tekivex-finance</h3>
        <p>Vertical pack: KYC inputs, OTP flows, payment buttons, subscription helpers, statement viewers.</p>
        <span class="install">npm install tekivex-finance</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-content" target="_blank" rel="noopener">
        <h3>tekivex-content</h3>
        <p>Vertical pack: SignaturePad, Markdown, RichTextDisplay, Watermark, SEO helpers.</p>
        <span class="install">npm install tekivex-content</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-3d" target="_blank" rel="noopener">
        <h3>tekivex-3d</h3>
        <p>Real WebGL 3D + 360° panoramas + AR/VR (WebXR). TkxScene, TkxPanorama360, TkxHotspot, TkxModel3D, TkxLogo3D, TkxParticleField, TkxXRSession.</p>
        <span class="install">npm install tekivex-3d three</span>
      </a>
      <a class="card" href="https://www.npmjs.com/package/tekivex-figma-kit" target="_blank" rel="noopener">
        <h3>tekivex-figma-kit</h3>
        <p>Machine-readable design tokens + 13,103-variant catalog. Imports into Figma via Tokens Studio.</p>
        <span class="install">npm install tekivex-figma-kit</span>
      </a>
    </div>

    <p class="footnote">If a build step ran into trouble you're seeing this fallback page. The full 360° experience lives at <a href="/" style="color: #00f5d4;">/</a> once the React landing finishes building. <a href="https://github.com/007krcs/tekivex-ui/issues/new" style="color: #00f5d4;">Report an issue</a>.</p>

    <div class="links">
      <a href="https://www.npmjs.com/package/tekivex-ui">npm</a>
      <a href="https://github.com/007krcs/tekivex-ui/issues">Report an issue</a>
      <a href="/playground/">Playground</a>
      <a href="/book/">Catalog</a>
    </div>
  </main>
</body>
</html>`;
  writeFileSync(resolve(DIST, 'index.html'), stub);
  console.log('  ✓ Stub homepage written');
}

// ── 2.5. Build docs-site (Astro Starlight) and overlay its output INTO
//         docs-site/dist WITHOUT clobbering the landing pages above.
//
// Why this is here and not at step 1: landing/ owns the homepage and the
// /examples/, /blog/, /about/, /license/ paths. Astro owns /recipes/,
// /blueprints/, /components/, /getting-started/, /quick-reference/,
// /themes/, /bundlers/, /rsc/, /ecosystem/, /security/. They don't
// overlap except at /index.html (both have one) and /license/ (both
// have one). Overlay-no-overwrite resolves both: landing wins because
// it copied first, and Astro fills in everything else.
//
// Historical note: this block was commented out for ~5 versions after
// 8 failed deploys on the Starlight 0.36 + Zod 4 incompatibility. The
// underlying incompatibility was resolved upstream by Starlight 0.36+,
// and a TkxDatePicker SSR crash that surfaced as a separate blocker
// was fixed in commit 7827e4e (May 2026). With both gone, the docs
// build now reliably produces 125+ pages locally. Adding the step
// back in here so the recipes/blueprints/components docs that have
// been shipped since v3.18 finally reach ui.tekivex.com.
//
// If this step starts failing again, the safe fall-back is to comment
// out just the run() and the overlay call below — the landing pages
// and the playground/book/security artifacts stay live regardless.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 2.5 — build docs-site/ (Astro Starlight) → overlay onto /');
console.log('══════════════════════════════════════════════════════');
let astroOverlaySucceeded = false;
try {
  // ── Pre-step: build packages/tekivex-india-admin/ ──────────────────────
  //
  // docs-site/package.json depends on `tekivex-india-admin: "file:../packages/
  // tekivex-india-admin"`. The package's package.json points main/module/
  // types at ./dist/index.{cjs,js,d.ts}. dist/ is git-ignored — it only
  // exists after `npm run build` in that package. Without this step,
  // docs-site's npm install symlinks/copies the package WITHOUT a built
  // dist/, and Vite/Rollup's resolver fails with:
  //
  //   [commonjs--resolver] Failed to resolve entry for package
  //   "tekivex-india-admin". The package may have incorrect main/module/
  //   exports specified in its package.json.
  //
  // …which surfaces as an Astro build failure during Step 2.5. This is
  // exactly the production bug the user reported on 2026-06-07 (every
  // Astro page returning 404). Build the package here so its dist/ is
  // present when docs-site's npm install + Astro build run below.
  const INDIA_ADMIN = resolve(ROOT, 'packages/tekivex-india-admin');
  if (existsSync(INDIA_ADMIN)) {
    console.log('\n  Pre-build: packages/tekivex-india-admin/');
    run('npm install --no-audit --no-fund', INDIA_ADMIN);
    run('npm run build', INDIA_ADMIN);
  }

  run('npm install --no-audit --no-fund --legacy-peer-deps', resolve(ROOT, 'docs-site'));
  // Astro writes to docs-site/dist by default. The landing build above
  // already populated docs-site/dist, so we redirect Astro's output to
  // a temp sibling dir and overlay it manually.
  const ASTRO_OUT = resolve(ROOT, 'docs-site/dist-astro');
  if (existsSync(ASTRO_OUT)) rmSync(ASTRO_OUT, { recursive: true, force: true });
  // --outDir tells Astro where to write. Astro accepts both absolute and
  // relative paths; absolute is unambiguous across runner cwd quirks.
  run(`npx astro build --outDir "${ASTRO_OUT}"`, resolve(ROOT, 'docs-site'));
  if (existsSync(ASTRO_OUT)) {
    overlayTreeNoOverwrite(ASTRO_OUT, DIST);
    rmSync(ASTRO_OUT, { recursive: true, force: true });
    astroOverlaySucceeded = true;
    console.log('  ✓ Astro pages overlaid (landing pages preserved on conflict)');
  } else {
    console.warn('  ⚠ Astro build appeared to succeed but produced no output dir — skipping overlay');
  }
} catch (err) {
  console.error(
    `\n  ✗ Astro overlay step failed (recipes/blueprints/components won't be live this deploy):` +
      `\n    ${err instanceof Error ? err.message : err}`,
  );
  console.error(
    '    This is FATAL — the deploy is meaningfully broken without the Astro content layer.',
  );
}
console.log(`  Astro overlay step: ${astroOverlaySucceeded ? 'OK' : 'SKIPPED'}`);

// ── Astro post-overlay assertion ────────────────────────────────────────────
// History: an earlier version of this script allowed the deploy to ship
// landing-only if Astro failed silently, calling it "non-fatal." Result: for
// ~9 weeks ui.tekivex.com served zero Astro pages — every /security/,
// /getting-started/, /components/<slug>/, /recipes/<slug>/, /blueprints/<slug>/
// returned 404 and nobody noticed because the homepage and /playground/ both
// worked. The user reported it 2026-06-07 with screenshots.
//
// New policy: if a known-critical Astro page is missing from the final tree,
// abort the deploy with a loud, actionable error. We'd rather Render fail
// the deploy and surface the build log than silently ship a broken site.
//
// Skip the check (e.g. when iterating on the build script itself) by setting:
//   TEKIVEX_SKIP_ASTRO_ASSERTION=1
const CRITICAL_ASTRO_PAGES = [
  // Linked from landing's hero CTAs — bottom of homepage user-flow.
  'security/index.html',
  'getting-started/index.html',
  // Linked from landing's AllComponents (every chip on the homepage).
  'components/index.html',
  'components/button/index.html',
  'components/address-input/index.html',
  // Recipes + blueprints — the content layer that motivates Astro.
  'recipes/secure-file-upload/index.html',
  'blueprints/healthtech-patient-intake/index.html',
  // Discovery / navigation surfaces.
  'quick-reference/index.html',
  'ecosystem/index.html',
];
if (process.env.TEKIVEX_SKIP_ASTRO_ASSERTION !== '1') {
  const missing = CRITICAL_ASTRO_PAGES.filter(
    (p) => !existsSync(resolve(DIST, p)),
  );
  if (missing.length > 0) {
    console.error('\n══════════════════════════════════════════════════════');
    console.error('✗ ASTRO ASSERTION FAILED — DEPLOY ABORTED');
    console.error('══════════════════════════════════════════════════════');
    console.error('The following critical Astro pages are missing from the');
    console.error('final deploy tree at docs-site/dist/:');
    console.error('');
    for (const p of missing) console.error(`    ✗ ${p}`);
    console.error('');
    console.error('Likely causes:');
    console.error('  1. Astro build crashed silently in this environment');
    console.error('     (check the Step 2.5 logs above for the real error)');
    console.error('  2. docs-site/ npm install failed and Astro never ran');
    console.error('  3. The page MDX was deleted but the assertion list');
    console.error('     was not updated — edit CRITICAL_ASTRO_PAGES above');
    console.error('');
    console.error('To bypass this check (NOT recommended — production will');
    console.error('serve 404 for these paths), set:');
    console.error('  TEKIVEX_SKIP_ASTRO_ASSERTION=1');
    console.error('');
    process.exit(1);
  } else {
    console.log(`  ✓ Astro assertion passed (${CRITICAL_ASTRO_PAGES.length}/${CRITICAL_ASTRO_PAGES.length} critical pages present)`);
  }
}

// ── 3. Build the demo SPA with /playground/ base, copy into dist/playground/
//    Pass --base on the CLI directly — npm sometimes strips env vars
//    from child processes, causing assets to reference / instead of
//    /playground/ and the SPA to render blank in production.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 3/4 — build demo/ SPA → /playground/');
console.log('══════════════════════════════════════════════════════');
run(
  'npx vite build --config ./demo/vite.config.ts --base=/playground/',
  ROOT,
);
copyTree(resolve(ROOT, 'demo/dist'), resolve(DIST, 'playground'));
verifyBase(resolve(DIST, 'playground/index.html'), '/playground/');

// ── 4. Build tkx-book with /book/ base, copy into dist/book/
//    Same pattern: --base on CLI, not via env var.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 4/4 — build packages/tkx-book/ → /book/');
console.log('══════════════════════════════════════════════════════');
run('npm install --no-audit --no-fund', resolve(ROOT, 'packages/tkx-book'));
run('npx vite build --base=/book/', resolve(ROOT, 'packages/tkx-book'));
copyTree(resolve(ROOT, 'packages/tkx-book/dist'), resolve(DIST, 'book'));
verifyBase(resolve(DIST, 'book/index.html'), '/book/');

// ── 5. Security artifacts (security.txt + SBOM) — copy unconditionally.
//    When the landing build succeeds, Vite already copies landing/public/*
//    into landing/dist/ and we mirror that into DIST. But if the landing
//    build FAILS and the stub homepage takes over (above), those artifacts
//    vanish — which is precisely when a procurement scanner is most likely
//    to find a 404 at /.well-known/security.txt and treat the site as
//    immature. Belt AND braces: copy directly here too.
console.log('\n══════════════════════════════════════════════════════');
console.log('Step 5/6 — copy security artifacts (defense against stub fallback)');
console.log('══════════════════════════════════════════════════════');
const SEC_SOURCES = [
  ['landing/public/.well-known/security.txt', '.well-known/security.txt'],
  ['landing/public/security/sbom.json',        'security/sbom.json'],
];
for (const [src, dest] of SEC_SOURCES) {
  const srcPath = resolve(ROOT, src);
  const destPath = resolve(DIST, dest);
  if (!existsSync(srcPath)) {
    console.warn(`  ⚠ security artifact missing at source: ${src}`);
    continue;
  }
  mkdirSync(dirname(destPath), { recursive: true });
  cpSync(srcPath, destPath);
  console.log(`  ✓ ${src} → ${dest}`);
}

// ── 6. Mirror to demo/dist so it works regardless of which path Render
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
console.log('Step 6/6 — mirror merged tree to demo/dist (compat shim)');
console.log('══════════════════════════════════════════════════════');
const DEMO_DIST = resolve(ROOT, 'demo/dist');
copyTree(DIST, DEMO_DIST);

// ── Done — verify security artifacts before declaring success
console.log('\n══════════════════════════════════════════════════════');
console.log('✓ Unified site built at TWO publish targets:');
console.log('    docs-site/dist/    (canonical, render.yaml v3)');
console.log('    demo/dist/         (compat — old render.yaml setting)');
console.log('  Each contains:');
console.log('    /                  → Astro docs (canonical)');
console.log('    /playground/       → demo SPA');
console.log('    /book/             → component catalog');
console.log('    /.well-known/security.txt');
console.log('    /security/sbom.json');
console.log('══════════════════════════════════════════════════════\n');

// Run the verifier as a real subprocess so its exit code becomes ours.
// Without this, a deploy with missing security.txt would still succeed.
console.log('Running security-artifact verification ...');
try {
  run(`node ${JSON.stringify(resolve(__dirname, 'verify-security-artifacts.mjs'))}`, ROOT);
} catch (err) {
  console.error('✗ Build aborted: security-artifact verification failed.');
  console.error('  Set TEKIVEX_SKIP_SEC_VERIFY=1 to override (NOT recommended).');
  process.exit(1);
}
