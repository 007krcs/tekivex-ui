// ─────────────────────────────────────────────────────────────────────────────
// Build-time SEO assets:
//   • sitemap.xml  — main URL index for Google, with image extension
//   • sitemap-index.xml — points at the main sitemap (room to grow)
//   • rss.xml      — Atom-style RSS feed for the blog
//   • humans.txt   — human-readable site credits
// All emitted into dist/ (post-build) and public/ (so vite dev serves them).
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const BASE = 'https://www.tekivex.com/ui';
const TODAY = new Date().toISOString().slice(0, 10);
const NOW_RFC = new Date().toUTCString();

function readSrc(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function extractSlugs(filePath) {
  const src = readSrc(filePath);
  const slugs = [];
  const re = /slug:\s*['"]([a-z0-9-]+)['"]/g;
  let m;
  while ((m = re.exec(src)) !== null) slugs.push(m[1]);
  return slugs;
}

function extractBlogPosts(filePath) {
  // Pull slug + title + summary + publishedAt from each entry.
  const src = readSrc(filePath);
  const out = [];
  const parts = src.split(/\{\s*slug:\s*['"]/g).slice(1);
  for (const part of parts) {
    const slugMatch = part.match(/^([^'"]+)['"]/);
    if (!slugMatch) continue;
    const body = part.split(/\n\s*\];|,\s*\n?\s*\{\s*slug:/)[0];
    const grab = (f) => {
      const m = body.match(new RegExp(`${f}:\\s*(?:'([^']*)'|"([^"]*)")`));
      return m ? (m[1] ?? m[2]) : undefined;
    };
    const title = grab('title');
    const summary = grab('summary');
    const publishedAt = grab('publishedAt');
    if (title && summary && publishedAt) {
      out.push({ slug: slugMatch[1], title, summary, publishedAt });
    }
  }
  return out;
}

const blogSlugs = extractSlugs(join(ROOT, 'src/pages/blog/posts.ts'));
const docSlugs  = extractSlugs(join(ROOT, 'src/pages/docs/docs-registry.ts'));
const blogPosts = extractBlogPosts(join(ROOT, 'src/pages/blog/posts.ts'));

const staticRoutes = [
  { loc: '/',                       changefreq: 'weekly',  priority: '1.0'  },
  { loc: '/about',                  changefreq: 'monthly', priority: '0.8'  },
  { loc: '/contact',                changefreq: 'monthly', priority: '0.6'  },
  { loc: '/privacy',                changefreq: 'yearly',  priority: '0.4'  },
  { loc: '/terms',                  changefreq: 'yearly',  priority: '0.4'  },
  { loc: '/blog',                   changefreq: 'weekly',  priority: '0.9'  },
  { loc: '/docs',                   changefreq: 'weekly',  priority: '0.95' },
  { loc: '/examples',               changefreq: 'weekly',  priority: '0.9'  },
  { loc: '/examples/holographic',   changefreq: 'monthly', priority: '0.85' },
  { loc: '/examples/blog',            changefreq: 'monthly', priority: '0.85' },
  { loc: '/examples/property-tour',   changefreq: 'monthly', priority: '0.9'  },
  { loc: '/examples/ar-product',      changefreq: 'monthly', priority: '0.9'  },
  { loc: '/examples/mission-control', changefreq: 'monthly', priority: '0.9'  },
];

const blogRoutes = blogSlugs.map((s) => ({
  loc: `/blog/${s}`,
  changefreq: 'monthly',
  priority: '0.8',
}));

const docRoutes = docSlugs.map((s) => ({
  loc: `/docs/${s}`,
  changefreq: 'monthly',
  priority: '0.85',
}));

const all = [...staticRoutes, ...blogRoutes, ...docRoutes];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n` +
  `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"\n` +
  `        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
  all
    .map(
      (r) =>
        `  <url>\n    <loc>${BASE}${r.loc}</loc>\n    <lastmod>${TODAY}</lastmod>\n    <changefreq>${r.changefreq}</changefreq>\n    <priority>${r.priority}</priority>\n    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${r.loc}"/>\n  </url>`,
    )
    .join('\n') +
  `\n</urlset>\n`;

const sitemapIndex =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  `  <sitemap>\n    <loc>${BASE}/sitemap.xml</loc>\n    <lastmod>${TODAY}</lastmod>\n  </sitemap>\n` +
  `</sitemapindex>\n`;

// RSS feed for the blog
const rssItems = blogPosts
  .map(
    (p) =>
      `  <item>\n    <title>${escapeXml(p.title)}</title>\n    <link>${BASE}/blog/${p.slug}</link>\n    <guid>${BASE}/blog/${p.slug}</guid>\n    <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>\n    <description>${escapeXml(p.summary)}</description>\n  </item>`,
  )
  .join('\n');

const rss =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n` +
  `<channel>\n` +
  `  <title>TekiVex UI engineering blog</title>\n` +
  `  <link>${BASE}/blog</link>\n` +
  `  <description>Deep dives, postmortems, and pattern writeups from building the TekiVex UI library and the tekivex-3d toolkit.</description>\n` +
  `  <language>en-us</language>\n` +
  `  <lastBuildDate>${NOW_RFC}</lastBuildDate>\n` +
  `  <atom:link href="${BASE}/rss.xml" rel="self" type="application/rss+xml"/>\n` +
  `${rssItems}\n` +
  `</channel>\n</rss>\n`;

const humans = [
  '/* TEAM */',
  '  Project: TekiVex UI',
  '  Site:    https://www.tekivex.com/ui',
  '  Source:  https://github.com/007krcs/tekivex-ui',
  '',
  '/* SITE */',
  `  Last update: ${TODAY}`,
  '  Standards: HTML5, CSS3, ES2022, WCAG 2.1 AAA',
  '  Components: React 19, three.js, recharts',
  '  Components count: 113',
  '  Packages: tekivex-ui, tekivex-3d, tekivex-pdf',
  '  License: MIT',
  '',
].join('\n');

function escapeXml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function writeAll(name, content) {
  const dist = join(ROOT, 'dist');
  if (!existsSync(dist)) mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, name), content, 'utf8');
  const pub = join(ROOT, 'public');
  if (!existsSync(pub)) mkdirSync(pub, { recursive: true });
  writeFileSync(join(pub, name), content, 'utf8');
}

writeAll('sitemap.xml', xml);
writeAll('sitemap-index.xml', sitemapIndex);
writeAll('rss.xml', rss);
writeAll('humans.txt', humans);

console.log(`✓ sitemap.xml (${all.length} URLs), sitemap-index.xml, rss.xml (${blogPosts.length} posts), humans.txt`);
