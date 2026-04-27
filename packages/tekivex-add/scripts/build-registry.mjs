#!/usr/bin/env node
// Auto-build the registry.json from src/components/ — every Tkx*.tsx
// becomes one entry. Run this when new components land.

import { readdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..', '..', '..');
const SRC = join(ROOT, 'src', 'components');
const OUT = join(__dirname, '..', 'registry.json');

const SKIP = new Set(['TkxThemeBuilder.tsx', 'TkxPlayground.tsx']);

function kebab(name) {
  return name
    .replace(/^Tkx/, '')
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

async function main() {
  const entries = await readdir(SRC);
  const components = [];

  for (const file of entries) {
    if (!file.endsWith('.tsx') || SKIP.has(file)) continue;
    const componentName = basename(file, '.tsx'); // TkxButton
    const slug = kebab(componentName); // button
    const sourcePath = `src/components/${file}`;

    // Best-effort dependency detection — read imports of `./TkxXxx`.
    const content = await readFile(join(SRC, file), 'utf8');
    const importRe = /from\s+['"]\.\/(Tkx[A-Z][\w]*)['"];?/g;
    const deps = new Set();
    let m;
    while ((m = importRe.exec(content)) !== null) {
      const depSlug = kebab(m[1]);
      if (depSlug !== slug) deps.add(depSlug);
    }

    components.push({
      name: slug,
      description: deriveDescription(content, componentName),
      files: [
        { source: sourcePath, target: `${componentName}.tsx` },
      ],
      deps: [...deps],
    });
  }

  components.sort((a, b) => a.name.localeCompare(b.name));

  const registry = {
    schemaVersion: 1,
    repo: 'https://ui.tekivex.com',
    components,
  };

  await writeFile(OUT, JSON.stringify(registry, null, 2));
  console.log(`✓ ${components.length} components → ${OUT}`);
}

function deriveDescription(content, name) {
  // Try to pull the first sentence from the leading // comment block.
  const lines = content.split('\n').slice(0, 30);
  for (const line of lines) {
    const t = line.replace(/^\/\/+/, '').replace(/^─+$/, '').trim();
    if (!t || t.startsWith("'use") || t.startsWith('import')) continue;
    if (t.startsWith(name)) {
      const desc = t.replace(`${name} —`, '').replace(`${name} -`, '').trim();
      if (desc) return desc.slice(0, 80);
    }
  }
  return '';
}

main().catch((err) => {
  console.error('✗', err);
  process.exit(1);
});
