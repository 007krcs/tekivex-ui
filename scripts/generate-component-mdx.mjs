#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// Generate MDX scaffolds for every Tkx* component in docs-site/.
//
// For each src/components/Tkx*.tsx file:
//   - Parse the component name(s) — the exported function/class
//   - Extract the *Props interface body (regex-based; no tsc API)
//   - Write docs-site/src/content/docs/components/<kebab-name>.mdx
//
// Existing pages (e.g. button.mdx) are NOT overwritten — generator output
// only fills gaps. Re-run safely after every release.
//
// Usage:
//   node scripts/generate-component-mdx.mjs
//   node scripts/generate-component-mdx.mjs --force   # overwrite existing
// ─────────────────────────────────────────────────────────────────────────────

import { readFile, writeFile, readdir, mkdir, access } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC_COMPONENTS = join(ROOT, 'src', 'components');
const OUT_DIR = join(ROOT, 'docs-site', 'src', 'content', 'docs', 'components');
const force = process.argv.includes('--force');

// Components we don't want public docs pages for (internal helpers).
const SKIP = new Set([
  'TkxThemeBuilder.tsx',
  'TkxPlayground.tsx',
]);

function kebab(name) {
  return name
    .replace(/^Tkx/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function titleFromComponent(name) {
  return name.replace(/^Tkx/, '');
}

// ── Parser — minimal, regex-based ───────────────────────────────────────────
//
// We only need to grab the Tkx<Name>Props interface body and split it into
// fields. The grammar we accept:
//
//   export interface Tkx<Name>Props [extends ...] { … }
//
// Inside the body each line is one of:
//   // comment
//   /** doc comment */
//   <field>?: <type>;
//   <field>: <type>;
//
// We don't need full TS parsing — getting fieldName + type + default + doc
// for each top-level prop is enough.

function findInterfaceBlock(content, ifaceName) {
  // Find "export interface Foo …" then walk braces to capture the body.
  const startRe = new RegExp(`export\\s+interface\\s+${ifaceName}\\b[^{]*\\{`, 'm');
  const m = startRe.exec(content);
  if (!m) return null;
  const start = m.index + m[0].length;
  let depth = 1;
  let i = start;
  while (i < content.length && depth > 0) {
    const ch = content[i];
    if (ch === '{') depth++;
    else if (ch === '}') depth--;
    i++;
  }
  if (depth !== 0) return null;
  return content.slice(start, i - 1);
}

function parseProps(body) {
  const props = [];
  // Split on lines so we can pick up trailing JSDoc above each field.
  const lines = body.split('\n');
  let pendingDoc = '';
  for (let raw of lines) {
    const line = raw.trim();
    if (!line) {
      pendingDoc = '';
      continue;
    }
    // JSDoc one-liner /** foo */
    const docOneLine = /^\/\*\*\s*(.+?)\s*\*\/$/.exec(line);
    if (docOneLine) {
      pendingDoc = docOneLine[1];
      continue;
    }
    // Plain // comment becomes pending doc
    if (line.startsWith('//')) {
      pendingDoc = line.replace(/^\/+\s*/, '');
      continue;
    }
    // Multi-line JSDoc: /**, * line, */ — accumulate
    if (line.startsWith('/**') && !line.includes('*/')) {
      pendingDoc = '';
      continue;
    }
    if (line.startsWith('*') && !line.startsWith('*/')) {
      pendingDoc += (pendingDoc ? ' ' : '') + line.replace(/^\*\s*/, '');
      continue;
    }
    if (line.startsWith('*/')) continue;

    // Field declaration. Tolerate: name?: type | type2; or name: () => void;
    // We split on the FIRST ':' that is at top-level (not inside <>).
    const colonIdx = findTopLevelColon(line);
    if (colonIdx < 0) {
      pendingDoc = '';
      continue;
    }
    const namePart = line.slice(0, colonIdx).trim();
    let typePart = line.slice(colonIdx + 1).trim();
    // Strip trailing ; or ,
    typePart = typePart.replace(/[;,]\s*$/, '').trim();
    const optional = namePart.endsWith('?');
    const name = namePart.replace(/\??$/, '').trim();
    if (!/^[a-zA-Z_][\w$]*$/.test(name)) {
      pendingDoc = '';
      continue;
    }
    props.push({
      name,
      type: typePart,
      optional,
      doc: pendingDoc,
    });
    pendingDoc = '';
  }
  return props;
}

function findTopLevelColon(line) {
  let depth = 0;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '<' || c === '(' || c === '[' || c === '{') depth++;
    else if (c === '>' || c === ')' || c === ']' || c === '}') depth--;
    else if (c === ':' && depth === 0) return i;
  }
  return -1;
}

function findExports(content) {
  const exports = new Set();
  const re = /export\s+(?:function|const)\s+(Tkx[A-Z][\w$]*)/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    exports.add(m[1]);
  }
  return [...exports];
}

// ── MDX template ────────────────────────────────────────────────────────────

function escapePipe(s) {
  return String(s).replace(/\|/g, '\\|');
}

function renderMdx(componentName, props, sourcePath) {
  const title = titleFromComponent(componentName);
  const description = `${title} — accessible React component from tekivex-ui. Variants, props, and accessibility notes.`;
  const propsTable = props.length === 0
    ? '_This component takes no props, or its props are inherited from a base type._'
    : [
        '| Prop | Type | Required | Description |',
        '|---|---|---|---|',
        ...props.map((p) =>
          `| \`${p.name}\` | \`${escapePipe(p.type)}\` | ${p.optional ? '' : 'yes'} | ${p.doc || ''} |`,
        ),
      ].join('\n');

  return `---
title: ${componentName}
description: ${description}
---

\`\`\`tsx
import { ${componentName} } from 'tekivex-ui';
\`\`\`

${title} is part of the 78-component tekivex-ui library. Every component is
WCAG 2.1 AAA compliant, fully typed, and tree-shakeable.

## Props

${propsTable}

## Accessibility

- Keyboard navigation supported on all interactive elements
- \`:focus-visible\` outline at 2px (theme-token \`primary\`)
- ARIA roles and properties applied per WAI-ARIA 1.2
- Respects \`prefers-reduced-motion\`
- Minimum 44×44 touch target where applicable

## Source

The implementation lives at [\`${sourcePath}\`](https://ui.tekivex.com).

> This page is a generated scaffold. It will be replaced with hand-authored
> examples and a live preview in a follow-up release. For interactive demos,
> see the [legacy demo site](https://ui.tekivex.com/#/components/${kebab(componentName)}).
`;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function fileExists(p) {
  try {
    await access(p, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  const entries = await readdir(SRC_COMPONENTS);
  const tsxFiles = entries.filter((f) => f.endsWith('.tsx') && !SKIP.has(f));

  let written = 0;
  let skipped = 0;
  let failed = 0;

  for (const file of tsxFiles) {
    try {
      const full = join(SRC_COMPONENTS, file);
      const content = await readFile(full, 'utf8');
      const exports = findExports(content);
      // Pick the primary export — the one matching the filename.
      const baseName = basename(file, '.tsx');
      const primary = exports.includes(baseName) ? baseName : exports[0];
      if (!primary) {
        failed++;
        continue;
      }
      const propsIface = `${primary}Props`;
      const body = findInterfaceBlock(content, propsIface);
      const props = body ? parseProps(body) : [];
      const slug = kebab(primary);
      const outPath = join(OUT_DIR, `${slug}.mdx`);
      const sourceRel = `src/components/${file}`;

      if (!force && (await fileExists(outPath))) {
        skipped++;
        continue;
      }

      const mdx = renderMdx(primary, props, sourceRel);
      await writeFile(outPath, mdx);
      written++;
    } catch (err) {
      console.error(`  ✗ ${file}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n✓ ${written} written, ${skipped} skipped (already exists), ${failed} failed`);
  console.log(`  Output: ${OUT_DIR}`);
  console.log(`  Pass --force to overwrite existing pages.`);
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
