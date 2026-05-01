#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// bundle-size-report.mjs
//
// Walks every npm-publishable package in the repo and reports tarball + main-
// entry sizes (raw, minified, gzipped). Output is a single Markdown file
// suitable for posting on the npm-package README, the docs site, or a GitHub
// status check.
//
// Run: node scripts/bundle-size-report.mjs
// Output: bundle-size-report.md (in repo root)
//
// What this is NOT:
//   - Not a per-component breakdown (run bundlephobia for that)
//   - Not a tree-shake analyzer (use webpack-bundle-analyzer for that)
//   - Just a "how big is each tarball + main entry, gzipped, today" stat
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { execSync } from 'node:child_process';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const PACKAGES = [
  { name: 'tekivex-ui',              dir: '.' },
  { name: 'tekivex-3d',              dir: 'packages/tekivex-3d' },
  { name: 'tekivex-pdf',             dir: 'packages/tekivex-pdf' },
  { name: 'tekivex-templates',       dir: 'packages/tekivex-templates' },
  { name: 'tekivex-form',            dir: 'packages/tekivex-form' },
  { name: 'tekivex-india',           dir: 'packages/tekivex-india' },
  { name: 'tekivex-finance',         dir: 'packages/tekivex-finance' },
  { name: 'tekivex-content',         dir: 'packages/tekivex-content' },
  { name: 'tekivex-security-core',   dir: 'packages/security-core' },
  { name: 'tekivex-audit',           dir: 'packages/tekivex-audit' },
  { name: 'tekivex-add',             dir: 'packages/tekivex-add' },
  { name: 'create-tekivex-app',      dir: 'packages/create-tekivex-app' },
  { name: 'tekivex-figma-kit',       dir: 'packages/figma-kit' },
];

function fmt(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getMainEntry(pkgPath) {
  const json = JSON.parse(readFileSync(resolve(pkgPath, 'package.json'), 'utf8'));
  // Prefer module → main → exports['.'].import
  const candidate =
    json.module ||
    json.main ||
    (json.exports && json.exports['.'] && (json.exports['.'].import || json.exports['.'].default)) ||
    null;
  if (!candidate) return null;
  const full = resolve(pkgPath, candidate);
  return existsSync(full) ? full : null;
}

function tarballSize(pkgPath) {
  try {
    // npm pack --dry-run --json gives the unpacked + tarball size without
    // actually creating the .tgz file. Accurate to what gets uploaded.
    const out = execSync('npm pack --dry-run --json', {
      cwd: pkgPath,
      stdio: ['ignore', 'pipe', 'ignore'],
    }).toString();
    const data = JSON.parse(out);
    const entry = Array.isArray(data) ? data[0] : data;
    return {
      tarball: entry.size ?? 0,
      unpacked: entry.unpackedSize ?? 0,
      files: entry.entryCount ?? 0,
    };
  } catch {
    return { tarball: 0, unpacked: 0, files: 0 };
  }
}

const rows = [];
for (const pkg of PACKAGES) {
  const path = resolve(ROOT, pkg.dir);
  if (!existsSync(resolve(path, 'package.json'))) {
    rows.push({ name: pkg.name, status: 'missing' });
    continue;
  }

  const json = JSON.parse(readFileSync(resolve(path, 'package.json'), 'utf8'));
  const tar = tarballSize(path);

  let mainRaw = 0;
  let mainGzip = 0;
  let mainBrotli = 0;
  const main = getMainEntry(path);
  if (main) {
    const buf = readFileSync(main);
    mainRaw = buf.length;
    mainGzip = gzipSync(buf).length;
    mainBrotli = brotliCompressSync(buf).length;
  }

  rows.push({
    name: pkg.name,
    version: json.version,
    main,
    mainRaw,
    mainGzip,
    mainBrotli,
    tarball: tar.tarball,
    unpacked: tar.unpacked,
    files: tar.files,
  });
}

// ── Render Markdown ─────────────────────────────────────────────────────────

const lines = [];
lines.push('# tekivex-* bundle sizes\n');
lines.push(`_Generated ${new Date().toISOString().slice(0, 10)} from local source._\n`);
lines.push('Sizes are real — measured from each package\'s built `dist/`. Tarball is what');
lines.push('npm uploads. Gzip and Brotli sizes are what the browser actually downloads.\n');
lines.push('| Package | Version | Main entry (raw / gzip / brotli) | Tarball | Files |');
lines.push('|---|---|---|---|---|');

for (const r of rows) {
  if (r.status === 'missing') {
    lines.push(`| \`${r.name}\` | — | — | — | — |`);
    continue;
  }
  const main =
    r.mainRaw > 0
      ? `${fmt(r.mainRaw)} / ${fmt(r.mainGzip)} / ${fmt(r.mainBrotli)}`
      : '_(no built main)_';
  lines.push(
    `| [\`${r.name}\`](https://www.npmjs.com/package/${r.name}) | ${r.version} | ${main} | ${fmt(r.tarball)} | ${r.files} |`,
  );
}

lines.push('\n## How this is measured');
lines.push('- **Main entry raw** — the first file Node loads when you `import "<pkg>"`.');
lines.push('- **Gzip / Brotli** — what an HTTP server with compression sends to a browser.');
lines.push('- **Tarball** — `npm pack --dry-run --json`, the actual file uploaded to the registry.');
lines.push('- **Files** — number of files in the published tarball.');
lines.push('\n## Caveats');
lines.push('- These are **whole-package** sizes. Tree-shaking eliminates unused exports;');
lines.push('  your real bundle will be smaller. Use [bundlephobia.com](https://bundlephobia.com)');
lines.push('  for per-import sizes.');
lines.push('- `tekivex-3d` numbers do **not** include `three` — it\'s a peer dependency,');
lines.push('  so the consumer\'s bundler decides whether to include it.');

writeFileSync(resolve(ROOT, 'docs/bundle-size-report.md'), lines.join('\n'));
console.log('✓ Wrote docs/bundle-size-report.md');
console.log('\n' + lines.slice(0, 5 + PACKAGES.length).join('\n'));
