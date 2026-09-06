#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// generate-llms-full.mjs
//
// Builds docs-site/public/llms-full.txt — a single plain-text concatenation
// of every docs page's real content, for deep AI ingestion (GEO/AEO).
//
// The llms.txt standard (llmstxt.org) defines two files:
//   - /llms.txt       — a curated, link-based map (hand-authored, stable)
//   - /llms-full.txt  — the full expanded content in one file
//
// This generates the second from the actual MDX so it never drifts from the
// shipped docs. Run before the Astro build so the file lands in public/ and
// gets copied to dist/.
//
// Stripping rules (keep it readable for an LLM, drop the machinery):
//   - YAML frontmatter -> converted to a "# Title" + description line
//   - `import ... from ...`  -> dropped
//   - `<Component client:load />` and other JSX tags -> dropped (the prose
//     and code fences around them carry the meaning)
//   - Everything else (markdown prose, tables, code fences) -> kept verbatim
// ─────────────────────────────────────────────────────────────────────────────

import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { resolve, dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const DOCS_DIR = resolve(ROOT, 'docs-site/src/content/docs');
const OUT = resolve(ROOT, 'docs-site/public/llms-full.txt');
const SITE = 'https://www.tekivex.com/ui';

// Order matters — put the high-signal pages first so an LLM that truncates
// still gets the most important context.
const SECTION_ORDER = [
  'getting-started',
  'bundlers',
  'themes',
  'rsc',
  'quick-reference',
  'security',
  'ecosystem',
  'recipes',
  'blueprints',
  'components',
  'templates',
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (name.endsWith('.mdx') || name.endsWith('.md')) out.push(full);
  }
  return out;
}

function sectionRank(relPath) {
  const top = relPath.split(/[/\\]/)[0];
  const idx = SECTION_ORDER.indexOf(top.replace(/\.mdx?$/, ''));
  return idx === -1 ? SECTION_ORDER.length : idx;
}

function parseFrontmatter(rawSrc) {
  // Normalise CRLF -> LF so the frontmatter + cleanup regexes match on
  // Windows checkouts (the docs MDX files are committed with CRLF here).
  const src = rawSrc.replace(/\r\n/g, '\n');
  const m = src.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return { title: null, description: null, body: src };
  const fm = m[1];
  const title = (fm.match(/^title:\s*(.+)$/m)?.[1] ?? '').replace(/^['"]|['"]$/g, '').trim();
  const description = (fm.match(/^description:\s*(.+)$/m)?.[1] ?? '').replace(/^['"]|['"]$/g, '').trim();
  return { title: title || null, description: description || null, body: src.slice(m[0].length) };
}

function cleanBody(body) {
  return body
    // drop import statements
    .replace(/^import\s.+?;?\s*$/gm, '')
    // drop self-closing / paired JSX component tags (e.g. <Foo client:load />,
    // <Aside ...>...</Aside>) but keep their inner text where paired.
    .replace(/<([A-Z][A-Za-z0-9]*)\b[^>]*\/>/g, '')
    .replace(/<\/?([A-Z][A-Za-z0-9]*)\b[^>]*>/g, '')
    // collapse 3+ blank lines to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function pathToUrl(relPath) {
  let p = relPath.replace(/\\/g, '/').replace(/\.mdx?$/, '');
  if (p.endsWith('/index')) p = p.slice(0, -('/index'.length));
  if (p === 'index') p = '';
  return `${SITE}/${p}${p ? '/' : ''}`;
}

const files = walk(DOCS_DIR)
  .map((f) => ({ f, rel: relative(DOCS_DIR, f) }))
  .sort((a, b) => sectionRank(a.rel) - sectionRank(b.rel) || a.rel.localeCompare(b.rel));

const header = `# TekiVex UI — full documentation for LLM ingestion

> This file is the expanded, single-document form of the TekiVex UI docs,
> generated from the live MDX source. It is intended for AI answer engines
> and LLMs to ingest the complete documentation in one fetch. The curated
> link map is at ${SITE}/llms.txt. Canonical HTML docs at ${SITE}/.

Generated from ${files.length} documentation pages. Source of truth:
https://github.com/007krcs/tekivex-ui (docs-site/src/content/docs).

================================================================================

`;

let body = '';
for (const { f, rel } of files) {
  const src = readFileSync(f, 'utf8');
  const { title, description, body: rawBody } = parseFrontmatter(src);
  const cleaned = cleanBody(rawBody);
  if (!cleaned && !title) continue;
  body += `\n\n## ${title ?? rel}\n`;
  body += `URL: ${pathToUrl(rel)}\n`;
  if (description) body += `${description}\n`;
  body += `\n${cleaned}\n`;
  body += `\n--------------------------------------------------------------------------------\n`;
}

writeFileSync(OUT, header + body, 'utf8');
const kb = (Buffer.byteLength(header + body, 'utf8') / 1024).toFixed(1);
console.log(`✓ llms-full.txt written — ${files.length} pages, ${kb} kB → ${relative(ROOT, OUT)}`);
