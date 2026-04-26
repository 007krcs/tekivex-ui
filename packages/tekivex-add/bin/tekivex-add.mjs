#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// tekivex-add — copy the source of a tekivex-ui component into your project.
//
// Usage:
//   npx @tekivex/add button
//   npx @tekivex/add card modal toast
//   npx @tekivex/add --list
//   npx @tekivex/add --dir src/ui button
//
// What it does:
//   1. Resolves the component name(s) against a registry that maps names
//      to their source files in github.com/007krcs/tekivex-ui
//   2. Downloads the source via the GitHub raw URL
//   3. Writes the file to <dir>/Tkx<Name>.tsx (defaults: src/components/ui/)
//   4. Reports each file written or skipped (already exists)
//
// Why use this vs npm-install tekivex-ui:
//   - You get the source, in your repo, that you can edit. No npm version
//     pinning, no breaking changes from upstream.
//   - Compatible with shadcn-style mental model: components are code you
//     own, not deps you import.
//   - Inverts the trade-off: tekivex-ui (the package) optimises for
//     tree-shaken updates; @tekivex/add optimises for full ownership.
// ─────────────────────────────────────────────────────────────────────────────

import { writeFile, mkdir, access, readFile } from 'node:fs/promises';
import { constants as fs } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const REPO_RAW_BASE = 'https://raw.githubusercontent.com/007krcs/tekivex-ui/master';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const positional = args.filter((a) => !a.startsWith('--'));

let outDir = 'src/components/ui';
const dirIdx = args.indexOf('--dir');
if (dirIdx !== -1 && args[dirIdx + 1]) {
  outDir = args[dirIdx + 1];
  // Remove the --dir + value pair from positional list.
  const i = positional.indexOf('--dir');
  if (i !== -1) positional.splice(i, 2);
  // Also remove any positional that matches the value
  const j = positional.indexOf(outDir);
  if (j !== -1) positional.splice(j, 1);
}

async function loadRegistry() {
  const path = join(__dirname, '..', 'registry.json');
  try {
    const raw = await readFile(path, 'utf8');
    return JSON.parse(raw);
  } catch {
    // Fallback: hit GitHub for the latest registry.
    const url = `${REPO_RAW_BASE}/packages/tekivex-add/registry.json`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not load registry from ${url} (HTTP ${res.status})`);
    return res.json();
  }
}

async function fileExists(p) {
  try {
    await access(p, fs.F_OK);
    return true;
  } catch {
    return false;
  }
}

function help() {
  console.log(`tekivex-add — copy tekivex-ui components into your project

Usage:
  npx @tekivex/add <component>...
  npx @tekivex/add --list
  npx @tekivex/add --dir src/ui <component>

Examples:
  npx @tekivex/add button
  npx @tekivex/add button card modal toast
  npx @tekivex/add --dir src/components button

Flags:
  --list             Show all available components
  --dir <path>       Output directory (default: src/components/ui)
  --force            Overwrite existing files
  --help             Show this message
`);
}

async function listComponents(registry) {
  console.log(`\nAvailable components (${registry.components.length}):\n`);
  for (const c of registry.components) {
    const deps = c.deps && c.deps.length ? `  → also pulls: ${c.deps.join(', ')}` : '';
    console.log(`  ${c.name.padEnd(20)} ${c.description || ''}${deps}`);
  }
  console.log();
}

async function fetchAndWrite(component, registry, force) {
  const written = [];
  const targets = [component, ...(component.deps || [])];

  for (const name of targets) {
    const entry = registry.components.find((c) => c.name === name);
    if (!entry) {
      console.error(`  ✗ Unknown component: ${name}`);
      continue;
    }
    for (const file of entry.files) {
      const dest = join(outDir, file.target);
      const exists = await fileExists(dest);
      if (exists && !force) {
        console.log(`  ⊙ ${dest} (exists, skipping; pass --force to overwrite)`);
        continue;
      }
      const url = `${REPO_RAW_BASE}/${file.source}`;
      const res = await fetch(url);
      if (!res.ok) {
        console.error(`  ✗ Could not fetch ${url} (HTTP ${res.status})`);
        continue;
      }
      const content = await res.text();
      await mkdir(dirname(dest), { recursive: true });
      await writeFile(dest, content);
      written.push(dest);
      console.log(`  ✓ ${dest}`);
    }
  }
  return written;
}

async function main() {
  if (flags.has('--help') || (positional.length === 0 && !flags.has('--list'))) {
    help();
    process.exit(0);
  }
  const registry = await loadRegistry();

  if (flags.has('--list')) {
    await listComponents(registry);
    return;
  }

  const force = flags.has('--force');
  console.log(`\nWriting to ${outDir}/\n`);

  let total = 0;
  for (const name of positional) {
    const comp = registry.components.find((c) => c.name === name || c.name === `Tkx${name[0].toUpperCase()}${name.slice(1)}`);
    if (!comp) {
      console.error(`  ✗ Unknown: ${name}. Try: npx @tekivex/add --list`);
      continue;
    }
    const written = await fetchAndWrite(comp, registry, force);
    total += written.length;
  }

  console.log(`\n✓ ${total} file${total === 1 ? '' : 's'} written\n`);
  console.log('Next steps:');
  console.log('  1. Wrap your app in <ThemeProvider>');
  console.log("  2. Import the component(s) you just added");
  console.log('  3. Edit them freely — they\'re yours now\n');
}

main().catch((err) => {
  console.error('✗', err?.message || err);
  process.exit(1);
});
