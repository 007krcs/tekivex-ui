// ─────────────────────────────────────────────────────────────────────────────
// fix-esm-imports.mjs
//
// Post-build fixer: TypeScript with `module: ESNext` emits
// `import { foo } from './theme'` — Node ESM requires `./theme.js`.
// Rewrites every relative import in dist/ to include the `.js` extension.
//
// Why not switch to `moduleResolution: nodenext`: that mode requires every
// SOURCE file to use `.js` extensions on relative imports, which is a
// big sweep across the codebase. This post-build fixer is a 30-line
// alternative that achieves the same runtime correctness without touching
// the source.
// ─────────────────────────────────────────────────────────────────────────────

import { readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

const DIST = './dist';

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) files.push(...(await walk(p)));
    else if (e.name.endsWith('.js') || e.name.endsWith('.d.ts')) files.push(p);
  }
  return files;
}

let fixed = 0;
for (const file of await walk(DIST)) {
  let s = readFileSync(file, 'utf8');
  const orig = s;
  // Match: from './foo' or from "./foo" or from './foo/bar'
  // Skip already-extensioned (.js, .json, .css, etc.)
  s = s.replace(
    /from\s+(['"])(\.{1,2}\/[^'"]+?)\1/g,
    (m, quote, path) => {
      if (/\.(js|mjs|cjs|json|css|svg|png|jpg)$/.test(path)) return m;
      // For directories (like './templates'), TS resolves to './templates/index.js'
      // Try directory match first
      const distPath = join(file, '..', path);
      if (existsSync(distPath) && statSync(distPath).isDirectory()) {
        return `from ${quote}${path}/index.js${quote}`;
      }
      return `from ${quote}${path}.js${quote}`;
    },
  );
  // Same for `export ... from './foo'`
  s = s.replace(
    /export\s+(?:\*|\{[^}]*\})\s+from\s+(['"])(\.{1,2}\/[^'"]+?)\1/g,
    (m, quote, path) => {
      if (/\.(js|mjs|cjs|json|css|svg|png|jpg)$/.test(path)) return m;
      const distPath = join(file, '..', path);
      if (existsSync(distPath) && statSync(distPath).isDirectory()) {
        return m.replace(path, `${path}/index.js`);
      }
      return m.replace(path, `${path}.js`);
    },
  );
  if (s !== orig) {
    writeFileSync(file, s);
    fixed++;
  }
}

console.log(`fix-esm-imports: rewrote ${fixed} files in ${DIST}/`);
