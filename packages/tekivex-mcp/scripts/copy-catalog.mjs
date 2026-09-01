// The catalog is data, not code, so tsc does not emit it. Copy it next to the
// compiled output so `import './catalog.json'` resolves at runtime.
import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const here = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(here, '../dist'), { recursive: true });
copyFileSync(join(here, '../src/catalog.json'), join(here, '../dist/catalog.json'));
console.log('catalog.json -> dist/');
