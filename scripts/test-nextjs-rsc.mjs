#!/usr/bin/env node
/**
 * test-nextjs-rsc.mjs — regression test for the v3.18 chunk-format fix.
 *
 * Spins up a minimal Next.js 15 App Router app in a scratch directory,
 * installs the locally-packed tekivex-ui tarball, imports a few flagship
 * components from both client and server boundaries, and runs `next build`.
 *
 * Exits 0 if the build succeeds with no chunk-loading errors.
 * Exits non-zero if `next build` fails or if the build log contains the
 * tell-tale "Cannot read properties of undefined (reading 'call')" string
 * that indicated webpack couldn't consume our chunks.
 *
 * Run in CI on every release. Catches the v3.18 regression we cannot
 * detect from unit tests alone (the failure mode is in webpack's chunk
 * runtime, not in our source).
 *
 * Usage:
 *   npm run test:nextjs
 *
 * Env:
 *   TEKIVEX_NEXTJS_SKIP=1   skip (e.g. when running locally without npm)
 *   TEKIVEX_NEXTJS_KEEP=1   keep the scratch dir after a failed run for triage
 */

import { execSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

if (process.env.TEKIVEX_NEXTJS_SKIP === '1') {
  console.log('TEKIVEX_NEXTJS_SKIP=1 set — skipping Next.js RSC test.');
  process.exit(0);
}

const FAIL_STRINGS = [
  // The signature failure from the original v3.17 consumer bug report
  "Cannot read properties of undefined (reading 'call')",
  // Generic chunk-loading failures
  'ChunkLoadError',
  // RSC client-component manifest errors that surface when chunks are wrong-shaped
  'Failed to load resource: the server responded with a status of 4',
  'react-server-dom-webpack',
];

function step(label) {
  console.log(`\n▶ ${label}`);
}

function run(cmd, opts = {}) {
  console.log(`  $ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', encoding: 'utf8', ...opts });
}

function runCapture(cmd, opts = {}) {
  const res = spawnSync(cmd, {
    shell: true,
    encoding: 'utf8',
    ...opts,
  });
  return { stdout: res.stdout ?? '', stderr: res.stderr ?? '', status: res.status ?? 1 };
}

// ── 1. Pack tekivex-ui from the repo so we test exactly what npm publishes
step('Step 1/5 — pack tekivex-ui from the repo');
const packOut = runCapture('npm pack --silent', { cwd: REPO_ROOT });
if (packOut.status !== 0) {
  console.error('✗ npm pack failed:', packOut.stderr);
  process.exit(1);
}
const tarballName = packOut.stdout.trim().split(/\s+/).pop();
if (!tarballName || !tarballName.endsWith('.tgz')) {
  console.error('✗ could not parse tarball name from npm pack output:', packOut.stdout);
  process.exit(1);
}
const tarballPath = resolve(REPO_ROOT, tarballName);
console.log(`  ✓ tarball: ${tarballName}`);

// ── 2. Create a scratch Next.js 15 App-Router app
step('Step 2/5 — scaffold scratch Next.js app');
const scratchDir = mkdtempSync(join(tmpdir(), 'tekivex-nextjs-rsc-'));
console.log(`  scratch: ${scratchDir}`);

const pkg = {
  name: 'tekivex-nextjs-smoke',
  version: '0.0.0',
  private: true,
  scripts: { build: 'next build' },
  dependencies: {
    next: '^15.0.0',
    react: '^18.3.0',
    'react-dom': '^18.3.0',
    'tekivex-ui': `file:${tarballPath.replace(/\\/g, '/')}`,
  },
};
writeFileSync(join(scratchDir, 'package.json'), JSON.stringify(pkg, null, 2));

writeFileSync(
  join(scratchDir, 'next.config.mjs'),
  `/** @type {import('next').NextConfig} */
export default {
  transpilePackages: ['tekivex-ui'],
};
`,
);

writeFileSync(
  join(scratchDir, 'tsconfig.json'),
  JSON.stringify(
    {
      compilerOptions: {
        target: 'ES2022',
        module: 'ESNext',
        moduleResolution: 'Bundler',
        jsx: 'preserve',
        strict: false,
        esModuleInterop: true,
        skipLibCheck: true,
        allowJs: true,
        noEmit: true,
        resolveJsonModule: true,
        isolatedModules: true,
        incremental: true,
        plugins: [{ name: 'next' }],
        paths: { '@/*': ['./*'] },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    },
    null,
    2,
  ),
);

mkdirSync(join(scratchDir, 'app'), { recursive: true });
writeFileSync(
  join(scratchDir, 'app', 'layout.tsx'),
  `import 'tekivex-ui/styles';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
);

// Server component — imports from the root entry, no hooks used
writeFileSync(
  join(scratchDir, 'app', 'page.tsx'),
  `import { Providers } from './providers';
import { ClientCard } from './client-card';

export default function Page() {
  return (
    <Providers>
      <main style={{ padding: 32 }}>
        <h1>tekivex-ui smoke test</h1>
        <p>If you can read this, the chunk format works in Next.js RSC.</p>
        <ClientCard />
      </main>
    </Providers>
  );
}
`,
);

writeFileSync(
  join(scratchDir, 'app', 'providers.tsx'),
  `'use client';

import { useEffect, useState } from 'react';
import { ThemeProvider, quantumDark } from 'tekivex-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <>{children}</>;
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}
`,
);

writeFileSync(
  join(scratchDir, 'app', 'client-card.tsx'),
  `'use client';

import { TkxCard, TkxButton, TkxBadge } from 'tekivex-ui';

export function ClientCard() {
  return (
    <TkxCard variant="elevated" style={{ marginTop: 16 }}>
      <h2>Hello from a client component</h2>
      <p>Both the server and client boundaries import tekivex-ui without errors.</p>
      <TkxBadge variant="solid" colorScheme="success">v3.18+ compatible</TkxBadge>
      <TkxButton disabled style={{ marginLeft: 8 }}>Native disabled prop</TkxButton>
    </TkxCard>
  );
}
`,
);

// ── 3. Install deps
step('Step 3/5 — npm install in scratch dir (this takes ~30-60s)');
const installRes = runCapture('npm install --no-audit --no-fund --silent', { cwd: scratchDir });
if (installRes.status !== 0) {
  console.error('✗ npm install failed:');
  console.error(installRes.stderr || installRes.stdout);
  cleanup(false);
  process.exit(1);
}

// ── 4. Run next build
step('Step 4/5 — next build (the actual test)');
const buildRes = runCapture('npx next build', { cwd: scratchDir });
const buildOutput = (buildRes.stdout ?? '') + '\n' + (buildRes.stderr ?? '');

const failuresFound = FAIL_STRINGS.filter((s) => buildOutput.includes(s));
if (buildRes.status !== 0 || failuresFound.length > 0) {
  console.error('\n✗ Next.js RSC smoke test FAILED.\n');
  if (failuresFound.length > 0) {
    console.error('  Found regression strings in build output:');
    for (const s of failuresFound) console.error(`    - ${JSON.stringify(s)}`);
  }
  console.error('\n  Full build output:');
  console.error('  ' + '─'.repeat(72));
  console.error(buildOutput.split('\n').map((l) => '  ' + l).join('\n'));
  console.error('  ' + '─'.repeat(72));
  console.error(`\n  Scratch dir kept for triage: ${scratchDir}`);
  console.error('  Re-run with TEKIVEX_NEXTJS_KEEP=1 to always keep on success too.\n');
  // Don't cleanup on failure — leave the dir for triage
  cleanupTarball();
  process.exit(1);
}

// ── 5. Success
step('Step 5/5 — verify build succeeded clean');
console.log('  ✓ next build exited 0');
console.log('  ✓ no chunk-loading regression strings found');
console.log('\n✓ Next.js RSC smoke test PASSED.\n');
cleanup(true);
process.exit(0);

function cleanup(success) {
  cleanupTarball();
  if (success && process.env.TEKIVEX_NEXTJS_KEEP !== '1') {
    try {
      rmSync(scratchDir, { recursive: true, force: true });
      console.log(`  ✓ cleaned scratch dir`);
    } catch (e) {
      console.warn(`  ⚠ could not remove scratch dir ${scratchDir}: ${e}`);
    }
  } else if (!success) {
    console.log(`  scratch dir kept at: ${scratchDir}`);
  }
}

function cleanupTarball() {
  try {
    if (existsSync(tarballPath)) rmSync(tarballPath, { force: true });
  } catch {
    /* swallow */
  }
}
