#!/usr/bin/env node
/**
 * Rewrite relative module specifiers in emitted .d.ts files so they resolve
 * under Node16 / NodeNext.
 *
 * Why this is needed: tsconfig.json uses `moduleResolution: "bundler"`, so tsc
 * emits declarations with extensionless relative specifiers
 * (`export * from './src/themes'`). Bundler resolution is fine with that;
 * Node16/NodeNext is not — it requires a full path with a `.js` extension, and
 * a directory specifier must name the index file explicitly.
 *
 * Without this, a consumer on `"moduleResolution": "NodeNext"` resolves our
 * declarations to an empty module and every named type import fails silently.
 * `attw --profile node16` reported 226 distinct broken specifiers before this
 * script existed.
 *
 * Also strips CSS imports, which tsc copies into declarations from
 * `import './src/styles/global.css'` in the entry — a type declaration has no
 * business importing a stylesheet, and no resolver can follow it.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const DIST = resolve(process.cwd(), 'dist');

/** Every .d.ts under dist/. */
function declarationFiles(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...declarationFiles(full));
    else if (entry.endsWith('.d.ts')) out.push(full);
  }
  return out;
}

/**
 * Resolve a relative specifier to what Node16 needs:
 *   './x'  -> './x.js'        when dist/.../x.d.ts exists
 *   './x'  -> './x/index.js'  when dist/.../x/index.d.ts exists
 */
function rewriteSpecifier(spec, fromFile) {
  if (!spec.startsWith('.')) return null;
  if (/\.(js|cjs|mjs|json)$/.test(spec)) return null;
  if (/\.css$/.test(spec)) return null; // handled by the strip pass

  const base = dirname(fromFile);
  if (existsSync(join(base, `${spec}.d.ts`))) return `${spec}.js`;
  if (existsSync(join(base, spec, 'index.d.ts'))) return `${spec}/index.js`;
  return null;
}

if (!existsSync(DIST)) {
  console.error('dist/ not found — run the build first.');
  process.exit(1);
}

const files = declarationFiles(DIST);
let changedFiles = 0;
let rewritten = 0;
let stripped = 0;

// from '…' | import('…') — covers import, export, and dynamic type imports.
const SPECIFIER = /(from\s+|import\()(['"])(\.[^'"]*)\2/g;
const CSS_IMPORT = /^\s*import\s+['"][^'"]+\.css['"];?\s*$/gm;

for (const file of files) {
  const original = readFileSync(file, 'utf8');

  const withoutCss = original.replace(CSS_IMPORT, () => {
    stripped++;
    return '';
  });

  const updated = withoutCss.replace(SPECIFIER, (match, kw, quote, spec) => {
    const next = rewriteSpecifier(spec, file);
    if (!next) return match;
    rewritten++;
    return `${kw}${quote}${next}${quote}`;
  });

  if (updated !== original) {
    writeFileSync(file, updated);
    changedFiles++;
  }
}

console.log(
  `dts specifiers: ${rewritten} rewritten, ${stripped} css import(s) stripped, ` +
    `${changedFiles}/${files.length} file(s) touched`,
);
