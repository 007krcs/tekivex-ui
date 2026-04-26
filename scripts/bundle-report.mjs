#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// bundle-report — measure dist/ output sizes and emit a markdown report.
//
// Replaces the audit's §6.1 "bundlephobia" recommendation with an in-house
// equivalent. Runs after `npm run build` and writes:
//   metrics/bundle-size.json   (machine-readable)
//   metrics/bundle-size.md     (human-readable, drops into release notes)
//
// Compares against metrics/bundle-baseline.json if present and flags any
// chunk that grew more than +5% since the baseline.
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, readdir, stat, writeFile, mkdir } from 'node:fs/promises';
import { join, dirname, basename, extname } from 'node:path';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const METRICS = join(ROOT, 'metrics');
const OUT_JSON = join(METRICS, 'bundle-size.json');
const OUT_MD = join(METRICS, 'bundle-size.md');
const BASELINE = join(METRICS, 'bundle-baseline.json');
const REGRESSION_PCT = 5;

async function* walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = join(dir, e.name);
    if (e.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

async function main() {
  try {
    await stat(DIST);
  } catch {
    console.error('✗ dist/ not found. Run `npm run build` first.');
    process.exit(1);
  }

  const entries = [];
  let totalRaw = 0;
  let totalGz = 0;
  let totalBr = 0;

  for await (const file of walk(DIST)) {
    const ext = extname(file);
    if (!['.js', '.cjs', '.mjs', '.css'].includes(ext)) continue;
    const content = await readFile(file);
    const raw = content.length;
    const gz = gzipSync(content, { level: 9 }).length;
    const br = brotliCompressSync(content).length;
    const rel = file.replace(`${DIST}/`, '').replace(`${DIST}\\`, '');
    entries.push({ file: rel.replace(/\\/g, '/'), raw, gz, br });
    totalRaw += raw;
    totalGz += gz;
    totalBr += br;
  }

  entries.sort((a, b) => b.raw - a.raw);

  let baseline = null;
  try {
    baseline = JSON.parse(await readFile(BASELINE, 'utf8'));
  } catch { /* no baseline yet */ }

  const regressions = [];
  if (baseline?.entries) {
    const baseMap = new Map(baseline.entries.map((e) => [e.file, e]));
    for (const cur of entries) {
      const prev = baseMap.get(cur.file);
      if (!prev) continue;
      const delta = cur.raw - prev.raw;
      const pct = prev.raw > 0 ? (delta / prev.raw) * 100 : 0;
      if (pct > REGRESSION_PCT) {
        regressions.push({ file: cur.file, prev: prev.raw, cur: cur.raw, pct: pct.toFixed(1) });
      }
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    totals: { raw: totalRaw, gz: totalGz, br: totalBr },
    entries,
    regressions,
  };

  await mkdir(METRICS, { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(report, null, 2));

  // Markdown report.
  let md = `# Bundle size report — ${report.generatedAt}\n\n`;
  md += `## Totals\n\n`;
  md += `| | Raw | gzip | brotli |\n|---|---|---|---|\n`;
  md += `| **All chunks** | ${fmt(totalRaw)} | ${fmt(totalGz)} | ${fmt(totalBr)} |\n\n`;
  md += `## Per chunk\n\n`;
  md += `| File | Raw | gzip | brotli |\n|---|---|---|---|\n`;
  for (const e of entries) {
    md += `| \`${e.file}\` | ${fmt(e.raw)} | ${fmt(e.gz)} | ${fmt(e.br)} |\n`;
  }
  if (regressions.length > 0) {
    md += `\n## ⚠ Size regressions (>${REGRESSION_PCT}%)\n\n`;
    md += `| File | Was | Now | Δ |\n|---|---|---|---|\n`;
    for (const r of regressions) {
      md += `| \`${r.file}\` | ${fmt(r.prev)} | ${fmt(r.cur)} | +${r.pct}% |\n`;
    }
  } else if (baseline) {
    md += `\n_No size regressions vs baseline._\n`;
  } else {
    md += `\n_No baseline; run \`cp metrics/bundle-size.json metrics/bundle-baseline.json\` to set one._\n`;
  }

  await writeFile(OUT_MD, md);

  console.log(`Total dist/ size:  ${fmt(totalRaw)} raw  /  ${fmt(totalGz)} gzip  /  ${fmt(totalBr)} brotli`);
  console.log(`✓ ${OUT_JSON}`);
  console.log(`✓ ${OUT_MD}`);
  if (regressions.length > 0) {
    console.error(`\n⚠ ${regressions.length} chunk(s) grew more than ${REGRESSION_PCT}% vs baseline.`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
