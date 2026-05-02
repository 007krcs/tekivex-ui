// ─────────────────────────────────────────────────────────────────────────────
// Build-time sitemap generator. Reads the route table + the blog and docs
// registries (parsed as TS source) and writes dist/sitemap.xml that Google's
// crawler can pick up. Runs after `vite build`.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const BASE = 'https://ui.tekivex.com';
const TODAY = new Date().toISOString().slice(0, 10);

function extractSlugs(filePath) {
  if (!existsSync(filePath)) return [];
  const src = readFileSync(filePath, 'utf8');
  const slugs = [];
  // Match `slug: 'foo-bar'` lines
  const re = /slug:\s*['"]([a-z0-9-]+)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) slugs.push(m[1]);
  return slugs;
}

const blogSlugs = extractSlugs(join(ROOT, 'src/pages/blog/posts.ts'));
const docSlugs  = extractSlugs(join(ROOT, 'src/pages/docs/docs-registry.ts'));

const staticRoutes = [
  { loc: '/',         changefreq: 'weekly',  priority: '1.0' },
  { loc: '/about',    changefreq: 'monthly', priority: '0.7' },
  { loc: '/contact',  changefreq: 'monthly', priority: '0.6' },
  { loc: '/privacy',  changefreq: 'yearly',  priority: '0.4' },
  { loc: '/terms',    changefreq: 'yearly',  priority: '0.4' },
  { loc: '/blog',     changefreq: 'weekly',  priority: '0.8' },
  { loc: '/docs',     changefreq: 'weekly',  priority: '0.9' },
];

const blogRoutes = blogSlugs.map((s) => ({
  loc: `/blog/${s}`,
  changefreq: 'monthly',
  priority: '0.7',
}));

const docRoutes = docSlugs.map((s) => ({
  loc: `/docs/${s}`,
  changefreq: 'monthly',
  priority: '0.8',
}));

const all = [...staticRoutes, ...blogRoutes, ...docRoutes];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  all
    .map(
      (r) =>
        `  <url>\n    <loc>${BASE}${r.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

const dist = join(ROOT, 'dist');
if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
writeFileSync(join(dist, 'sitemap.xml'), xml, 'utf8');

// Also drop a copy in public/ so `vite dev` serves it during local testing.
const pub = join(ROOT, 'public');
if (existsSync(pub)) writeFileSync(join(pub, 'sitemap.xml'), xml, 'utf8');

console.log(`✓ sitemap.xml written with ${all.length} URLs`);
