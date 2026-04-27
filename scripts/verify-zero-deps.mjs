#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// verify-zero-deps — assert that the published bundle has no production deps.
//
// Audit §6.3 "the zero-dep claim" — this script makes it CI-enforceable.
// Runs three independent checks:
//
//   1. package.json `dependencies` is empty or absent
//   2. dist/ contains no require() of a third-party package
//   3. peerDependencies are listed but optional (with peerDependenciesMeta)
//
// Exits non-zero if any check fails.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, readdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

let failed = false;
function fail(msg) {
  console.error(`✗ ${msg}`);
  failed = true;
}
function pass(msg) {
  console.log(`✓ ${msg}`);
}

// ── 1. package.json check ───────────────────────────────────────────────────
const pkgRaw = await readFile(join(ROOT, 'package.json'), 'utf8');
const pkg = JSON.parse(pkgRaw);
const deps = pkg.dependencies ?? {};
const depKeys = Object.keys(deps);
if (depKeys.length === 0) {
  pass('package.json has no production dependencies');
} else {
  fail(`package.json declares dependencies: ${depKeys.join(', ')}`);
}

// ── 2. dist/ scan ───────────────────────────────────────────────────────────
const dist = join(ROOT, 'dist');
let distExists = false;
try {
  await stat(dist);
  distExists = true;
} catch {}

if (!distExists) {
  console.log('  (dist/ not present — skipping bundle scan; run `npm run build` first)');
} else {
  const peerNames = new Set(Object.keys(pkg.peerDependencies ?? {}));
  // Allow Node built-ins (no leading word boundary issues since they don't
  // appear in browser-targeted dist).
  const NODE_BUILTINS = new Set([
    'fs', 'path', 'os', 'url', 'crypto', 'util', 'stream', 'buffer',
    'events', 'http', 'https', 'process', 'react', 'react-dom',
    'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom/server',
  ]);
  // Anything that's a peer dep is fine. Anything else is a flag.
  // Valid bare-package-name pattern: optional @scope/, then [a-z0-9._-]+,
  // then optional /subpath. This rejects minified-code false positives
  // like `from",n.name]})…"` where the captured content has commas / brackets.
  const PKG_NAME = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*(\/[\w./-]*)?$/i;
  const requireRe = /require\((['"])([^'")(]+)\1\)/g;
  const importRe = /\bfrom\s*(['"])([^'")(\n,]{1,80})\1/g;
  const externals = new Set();
  for await (const file of walk(dist)) {
    if (!/\.(js|cjs|mjs)$/.test(file)) continue;
    const content = await readFile(file, 'utf8');
    let m;
    while ((m = requireRe.exec(content)) !== null) {
      if (PKG_NAME.test(m[2])) externals.add(m[2]);
    }
    while ((m = importRe.exec(content)) !== null) {
      if (PKG_NAME.test(m[2])) externals.add(m[2]);
    }
  }
  const offenders = [...externals].filter(
    (name) =>
      !name.startsWith('.') &&
      !name.startsWith('/') &&
      !peerNames.has(name) &&
      !NODE_BUILTINS.has(name) &&
      // strip the subpath: 'react/jsx-runtime' → 'react'
      !peerNames.has(name.split('/')[0]) &&
      !NODE_BUILTINS.has(name.split('/')[0]),
  );
  if (offenders.length === 0) {
    pass(`dist/ imports only peer deps (${peerNames.size} peers) — zero runtime deps verified`);
  } else {
    fail(`dist/ imports unexpected packages: ${offenders.join(', ')}`);
  }
}

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

// ── 3. peerDependenciesMeta sanity ──────────────────────────────────────────
const peerMeta = pkg.peerDependenciesMeta ?? {};
const peerDeps = pkg.peerDependencies ?? {};
const requiredPeers = Object.keys(peerDeps).filter((p) => !peerMeta[p]?.optional);

// We expect react + react-dom to be required peers (everything else optional).
const expectedRequired = new Set(['react', 'react-dom']);
const surprising = requiredPeers.filter((p) => !expectedRequired.has(p));
if (surprising.length === 0) {
  pass(`required peer dependencies = react + react-dom (others optional)`);
} else {
  fail(`unexpected required peer dependencies: ${surprising.join(', ')} — should they be optional?`);
}

if (failed) {
  console.error('\n✗ zero-dep verification failed');
  process.exit(1);
}
console.log('\n✓ zero-dep verification passed');
