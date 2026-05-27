// One-shot cleanup: replace every github.com/007krcs/* and github.com/sponsors/007krcs
// reference across the codebase with ui.tekivex.com. Keep only the public
// issue-report repo URL (https://github.com/007krcs/tekivex-ui).
import fs from 'node:fs';
import path from 'node:path';

const ALLOWED = 'https://github.com/007krcs/tekivex-ui';
const SITE = 'https://ui.tekivex.com';

function walk(dir, exts) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', 'dist', '.git', 'package-lock.json'].includes(f.name)) continue;
    const p = path.join(dir, f.name);
    if (f.isDirectory()) out.push(...walk(p, exts));
    else if (exts.some((e) => f.name.endsWith(e))) out.push(p);
  }
  return out;
}

const targets = [
  ...walk('packages', ['.json', '.md', '.mjs', '.ts', '.tsx', '.mdx']),
  ...walk('scripts', ['.mjs', '.ts', '.js']),
  ...walk('docs-site/src', ['.md', '.mdx', '.ts', '.tsx', '.mjs', '.astro']),
  ...walk('demo', ['.tsx', '.ts', '.mjs']),
  'README.md',
  'package.json',
].filter((f) => fs.existsSync(f) && !f.endsWith('package-lock.json'));

let touched = 0;
for (const f of targets) {
  let s = fs.readFileSync(f, 'utf8');
  const orig = s;

  // 1. /blob/, /tree/, /raw/ source-code links → site
  s = s.replace(
    /https?:\/\/github\.com\/007krcs\/tekivex-ui\/(blob|tree|raw)\/[^\s)"`'<>]+/g,
    SITE,
  );

  // 2. /issues paths on the source repo → issue-report repo
  s = s.replace(
    /https?:\/\/github\.com\/007krcs\/tekivex-ui\/issues(\/new)?/g,
    ALLOWED + '/issues',
  );

  // 3. Bare source-repo URL → site
  s = s.replace(
    /https?:\/\/github\.com\/007krcs\/tekivex-ui(\.git)?(?![\w\-/])/g,
    SITE,
  );

  // 4. github.com/sponsors/007krcs → site
  s = s.replace(/https?:\/\/github\.com\/sponsors\/007krcs/g, SITE);

  // 5. user profile github.com/007krcs (no trailing path) → site
  s = s.replace(/https?:\/\/github\.com\/007krcs(?![\w\-/])/g, SITE);

  // 6. github.com/seemaalmas → site
  s = s.replace(/https?:\/\/github\.com\/seemaalmas/g, SITE);

  // 7. user-only github.com/novaai0401-ui → site (legacy team identity)
  s = s.replace(
    /https?:\/\/github\.com\/novaai0401-ui[\w\-/]*/g,
    SITE,
  );

  if (s !== orig) {
    fs.writeFileSync(f, s);
    touched++;
    console.log('  ✓', f);
  }
}
console.log('Total touched:', touched);
