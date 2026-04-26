#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// i18n-audit — find hardcoded English strings in src/components/.
//
// What counts as "hardcoded" (and worth flagging):
//   - aria-label="…" / aria-description="…"
//   - title="…"
//   - placeholder="…"
//   - alt="…"
//   - JSX text node containing letters: <span>Some Text</span>
//
// What we ignore (low signal):
//   - className / data-* / role / id values
//   - Pure punctuation / emoji / numbers
//   - Strings already wrapped in t(), useLocale(), tr(), or formatMessage()
//   - Comments
//
// Output:
//   metrics/i18n-audit.json (machine-readable)
//   metrics/i18n-audit.md   (human-readable summary)
//
// Usage:
//   node scripts/i18n-audit.mjs
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const COMPONENTS_DIR = join(ROOT, 'src', 'components');
const OUT_JSON = join(ROOT, 'metrics', 'i18n-audit.json');
const OUT_MD = join(ROOT, 'metrics', 'i18n-audit.md');

const STRING_PROPS = ['aria-label', 'aria-description', 'aria-placeholder', 'title', 'placeholder', 'alt'];

// At least one ASCII letter; reject pure numbers, punctuation, emoji-only.
const HAS_LETTER = /[A-Za-z]/;
// Reject strings shorter than 2 chars (icons, single letters).
const MIN_LEN = 2;

// Detect strings already inside a t() / locale.* / formatMessage() / trans()
// call — heuristic: look 20 chars left of the literal for any of those.
const ALREADY_WRAPPED = /(useLocale\(\)\.|t\(|tr\(|trans\(|formatMessage\(|locale\.|i18n\.)/;

async function* walkTSX(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.isDirectory()) {
      yield* walkTSX(join(dir, e.name));
    } else if (e.isFile() && /\.tsx?$/.test(e.name)) {
      yield join(dir, e.name);
    }
  }
}

function findPropStrings(content, file) {
  const findings = [];
  for (const prop of STRING_PROPS) {
    // Match prop="..." or prop='...' — JSX attribute.
    const re = new RegExp(`\\b${prop}=(['"])([^'"]+)\\1`, 'g');
    let m;
    while ((m = re.exec(content)) !== null) {
      const value = m[2].trim();
      if (value.length < MIN_LEN) continue;
      if (!HAS_LETTER.test(value)) continue;
      // Skip if it's a single placeholder like {x}
      if (/^\{.+\}$/.test(value)) continue;
      // Look back ~30 chars to see if this is in a wrapper call already
      const lookback = content.slice(Math.max(0, m.index - 30), m.index);
      if (ALREADY_WRAPPED.test(lookback)) continue;
      const line = content.slice(0, m.index).split('\n').length;
      findings.push({
        kind: 'prop',
        prop,
        value,
        line,
        file,
      });
    }
  }
  return findings;
}

function findJSXTextNodes(content, file) {
  const findings = [];
  // Match >text< where text has letters, doesn't start with {, isn't all whitespace,
  // and doesn't start with < (that's an opening tag).
  // Cap at ~120 chars to skip huge templated strings.
  const re = />([^<>{}]{2,120})</g;
  let m;
  while ((m = re.exec(content)) !== null) {
    const raw = m[1];
    const trimmed = raw.trim();
    if (trimmed.length < MIN_LEN) continue;
    if (!HAS_LETTER.test(trimmed)) continue;
    // Skip pure separators / punctuation surrounded by spaces.
    if (/^[\s.,:;!?\-–—•/\\|]+$/.test(trimmed)) continue;
    // Skip JSX expression containers we caught accidentally.
    if (trimmed.includes('{')) continue;
    // Skip URLs and asset refs.
    if (/^https?:\/\//.test(trimmed) || /\.(svg|png|jpe?g|webp)$/i.test(trimmed)) continue;
    const line = content.slice(0, m.index).split('\n').length;
    findings.push({
      kind: 'jsx-text',
      value: trimmed,
      line,
      file,
    });
  }
  return findings;
}

async function main() {
  const allFindings = [];
  const perFile = new Map();

  for await (const file of walkTSX(COMPONENTS_DIR)) {
    const content = await readFile(file, 'utf8');
    const rel = relative(ROOT, file).replace(/\\/g, '/');
    const findings = [
      ...findPropStrings(content, rel),
      ...findJSXTextNodes(content, rel),
    ];
    if (findings.length) {
      perFile.set(rel, findings);
      allFindings.push(...findings);
    }
  }

  // Summary stats
  const byProp = {};
  for (const f of allFindings) {
    const k = f.kind === 'prop' ? `prop:${f.prop}` : 'jsx-text';
    byProp[k] = (byProp[k] || 0) + 1;
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    totalFindings: allFindings.length,
    filesAffected: perFile.size,
    byKind: byProp,
    topFiles: [...perFile.entries()]
      .map(([file, findings]) => ({ file, count: findings.length }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20),
    allFindings,
  };

  await mkdir(dirname(OUT_JSON), { recursive: true });
  await writeFile(OUT_JSON, JSON.stringify(summary, null, 2));

  // Markdown report
  let md = `# i18n audit — ${summary.generatedAt}\n\n`;
  md += `**${summary.totalFindings} hardcoded strings** across ${summary.filesAffected} files.\n\n`;
  md += `## Breakdown by kind\n\n`;
  for (const [k, n] of Object.entries(byProp).sort((a, b) => b[1] - a[1])) {
    md += `- \`${k}\`: ${n}\n`;
  }
  md += `\n## Top 20 affected files\n\n`;
  md += `| File | Count |\n|---|---|\n`;
  for (const { file, count } of summary.topFiles) {
    md += `| \`${file}\` | ${count} |\n`;
  }
  md += `\n## Sample findings (first 50)\n\n`;
  md += `| File | Line | Kind | Value |\n|---|---|---|---|\n`;
  for (const f of allFindings.slice(0, 50)) {
    const kind = f.kind === 'prop' ? `prop \`${f.prop}\`` : 'JSX text';
    const escapedValue = f.value.replace(/\|/g, '\\|').slice(0, 80);
    md += `| \`${f.file}\` | ${f.line} | ${kind} | \`${escapedValue}\` |\n`;
  }

  await writeFile(OUT_MD, md);

  console.log(`✓ ${summary.totalFindings} findings across ${summary.filesAffected} files`);
  console.log(`✓ ${OUT_JSON}`);
  console.log(`✓ ${OUT_MD}`);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
