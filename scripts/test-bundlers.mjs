#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// test-bundlers — install + build every bundler smoke test in sequence.
// Reports per-bundler success/failure + total time. Exits non-zero if ANY
// bundler fails so CI catches the regression on the right project.
// ─────────────────────────────────────────────────────────────────────────────

import { spawn } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', 'examples', 'bundler-tests');

const SKIP = new Set(['_shared', 'README.md']);

function run(cmd, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, {
      cwd,
      stdio: 'inherit',
      shell: true,
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`exit ${code}`))));
  });
}

async function main() {
  const entries = await readdir(ROOT, { withFileTypes: true });
  const dirs = entries
    .filter((e) => e.isDirectory() && !SKIP.has(e.name))
    .map((e) => e.name)
    .sort();

  const results = [];
  for (const name of dirs) {
    const cwd = join(ROOT, name);
    const start = Date.now();
    console.log(`\n━━━ ${name} ━━━`);
    try {
      // Use --no-audit --no-fund --silent to keep CI logs sane.
      await run('npm install --no-audit --no-fund --silent', cwd);
      await run('npm run build', cwd);
      const sec = ((Date.now() - start) / 1000).toFixed(1);
      results.push({ name, ok: true, sec });
      console.log(`✓ ${name} (${sec}s)`);
    } catch (err) {
      const sec = ((Date.now() - start) / 1000).toFixed(1);
      results.push({ name, ok: false, sec, err: err.message });
      console.error(`✗ ${name} (${sec}s) — ${err.message}`);
    }
  }

  console.log('\n━━━ Summary ━━━');
  for (const r of results) {
    console.log(`  ${r.ok ? '✓' : '✗'}  ${r.name.padEnd(12)} ${r.sec}s`);
  }
  const failed = results.filter((r) => !r.ok);
  if (failed.length > 0) {
    console.error(`\n${failed.length}/${results.length} bundler(s) failed.`);
    process.exit(1);
  }
  console.log(`\nAll ${results.length} bundlers passed.`);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
