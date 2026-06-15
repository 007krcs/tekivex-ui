// ─────────────────────────────────────────────────────────────────────────────
// Static prerender — clones dist/index.html into one HTML file per route,
// with the title / description / canonical / JSON-LD already baked into the
// <head>, and a <noscript>-style summary in the body so search crawlers and
// AdSense see substantive content even before JavaScript hydrates.
//
// We deliberately do NOT try to SSR the React tree because the home page
// loads three.js and WebGL contexts that don't exist in Node. Instead we
// inject route-specific metadata + a content-rich <main> placeholder; the
// real React app then hydrates over it.
// ─────────────────────────────────────────────────────────────────────────────
import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const DIST = join(ROOT, 'dist');
const ORIGIN = 'https://ui.tekivex.com';

if (!existsSync(join(DIST, 'index.html'))) {
  console.error('✗ dist/index.html missing — run `vite build` first');
  process.exit(1);
}

const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf8');

function readSrc(p) {
  return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function extractEntries(filePath, fields) {
  const src = readSrc(filePath);
  const out = [];
  // Split on each `{ slug: '...'` boundary — works whether entries are
  // single-line (docs registry) or multi-line (blog post array).
  const parts = src.split(/\{\s*slug:\s*['"]/g).slice(1);
  for (const part of parts) {
    const slugMatch = part.match(/^([^'"]+)['"]/);
    if (!slugMatch) continue;
    const slug = slugMatch[1];
    // Body ends at the next entry boundary or the array close.
    const body = part.split(/\n\s*\];|,\s*\n?\s*\{\s*slug:/)[0];
    const obj = { slug };
    for (const f of fields) {
      // Match either '...' or "..." with the SAME quote at both ends, so
      // inner quotes of the opposite kind don't truncate the capture.
      const fieldRe = new RegExp(`${f}:\\s*(?:'([^']*)'|"([^"]*)")`);
      const fm = body.match(fieldRe);
      if (fm) obj[f] = fm[1] ?? fm[2];
    }
    out.push(obj);
  }
  return out;
}

const blogPosts = extractEntries(join(ROOT, 'src/pages/blog/posts.ts'), [
  'title',
  'summary',
  'publishedAt',
]);
const docPages = extractEntries(join(ROOT, 'src/pages/docs/docs-registry.ts'), [
  'name',
  'category',
  'summary',
  'pkg',
]);

// ─────────────────────────────────────────────────────────────────────────
// Route catalogue — every URL we want pre-baked.
// ─────────────────────────────────────────────────────────────────────────
const routes = [
  {
    path: '/about',
    title: 'About TekiVex UI — Open-source React components built for production',
    description:
      'TekiVex UI is an open-source React component library — 116 production components, a WebGL 3D toolkit, and a built-in security kernel. Read why we built it.',
    h1: 'About TekiVex UI',
    body:
      'TekiVex UI is an open-source React component library distributed under the MIT license. The Tekivex package family — tekivex-ui, tekivex-3d, and tekivex-pdf — gives React developers 113 accessible components, a real WebGL 3D toolkit, holographic surfaces, browser-native PDF, and printable templates.',
  },
  {
    path: '/contact',
    title: 'Contact TekiVex UI',
    description:
      'Email, GitHub issue tracker, and a contact form for the TekiVex UI maintainers. Bug reports, feature requests, and consulting inquiries.',
    h1: 'Contact TekiVex UI',
    body:
      'Reach the TekiVex UI maintainers by GitHub issue (bugs, features, doc fixes) or via the contact form on this page (commercial inquiries). Privacy / legal / security disclosures handled via dedicated channels listed below.',
  },
  {
    path: '/privacy',
    title: 'Privacy Policy — TekiVex UI',
    description:
      'How TekiVex UI collects, uses, and protects information about visitors to ui.tekivex.com and users of the open-source library.',
    h1: 'Privacy Policy',
    body:
      'TekiVex UI is an open-source React component library distributed under the MIT license. This page explains what information ui.tekivex.com (the documentation site) and the published npm packages collect, why, and how it is handled.',
  },
  {
    path: '/terms',
    title: 'Terms of Service — TekiVex UI',
    description:
      'The terms that govern use of the ui.tekivex.com documentation site and the TekiVex UI open-source packages.',
    h1: 'Terms of Service',
    body:
      'TekiVex UI is an open-source React component library distributed under the MIT license, and ui.tekivex.com is the documentation site for that project. These terms cover both — the rules of the road for using the site and the packages.',
  },
  {
    path: '/blog',
    title: 'Engineering blog — TekiVex UI',
    description:
      'Deep dives, postmortems, and pattern writeups from building the TekiVex UI library and the tekivex-3d toolkit.',
    h1: 'Engineering blog',
    body:
      'These are the engineering decisions behind the TekiVex UI components — why we picked certain architectures, what bugs forced rewrites, what we would do differently next time. New posts every couple of weeks.',
  },
  {
    path: '/docs',
    title: 'Component documentation — TekiVex UI',
    description:
      'API reference, examples, accessibility notes, and common pitfalls for every component in the TekiVex UI library.',
    h1: 'Component documentation',
    body:
      'API reference, examples, accessibility notes, and common pitfalls for every component shipped in TekiVex UI. Each page covers prop signatures, usage examples, and the WAI-ARIA accessibility model.',
  },
  {
    path: '/examples',
    title: 'Examples — TekiVex UI',
    description:
      'Working example applications built with TekiVex UI: 360° tours, WebXR AR/VR scenes, holographic UI surfaces, and a fully configurable static blog.',
    h1: 'Examples',
    body:
      'Five working example applications built on the TekiVex UI stack — a property tour with embedded 360°, an AR product preview, a live mission-control dashboard, a holographic UI gallery, and a configurable Medium-style blog.',
  },
  {
    path: '/examples/holographic',
    title: 'Holographic UI example — TekiVex UI',
    description:
      'A working gallery of every holographic surface in tekivex-ui: cards, badges, avatars, gauges, terminals, and progress with live prismatic effects.',
    h1: 'Holographic UI gallery',
    body:
      'Every holographic surface shipped in tekivex-ui — cards, badges, avatars, panels, gauges, terminals, and progress — rendered side-by-side with the props that control them.',
  },
  {
    path: '/examples/blog',
    title: 'Configurable blog example — TekiVex UI',
    description:
      'A Medium-style block editor — paragraph, heading, image, code, quote, list, and video blocks. No markdown shown to writers. Persists to localStorage.',
    h1: 'Configurable blog',
    body:
      'A complete block-based blog application: write posts with the same WYSIWYG blocks readers see, upload cover images, drop in syntax-highlighted code blocks, organise by category and tags, search the archive, configure your brand.',
  },
  {
    path: '/examples/property-tour',
    title: 'Property tour example — TekiVex UI',
    description:
      'A real-estate listing with an embedded 360° walkthrough — drag through rooms, click hotspots, request a viewing, and run a mortgage calculator.',
    h1: 'Property tour',
    body:
      'A real-estate listing with an embedded 360° walkthrough — drag through rooms, click hotspots, request a viewing, run a mortgage calculator.',
  },
  {
    path: '/examples/ar-product',
    title: 'AR product preview example — TekiVex UI',
    description:
      'An e-commerce product page where shoppers place the item in their real room with WebXR AR. Falls back to a draggable 3D viewer on devices without AR.',
    h1: 'AR product preview',
    body:
      'A furniture product page where shoppers place the item in their real room with WebXR AR — the shape every furniture, fashion, jewellery, or car-configurator brand needs. Falls back to a draggable 3D viewer on devices without AR.',
  },
  {
    path: '/examples/mission-control',
    title: 'Mission control example — TekiVex UI',
    description:
      'A live operations dashboard built with tekivex-ui holographic surfaces — KPI tiles, gauges, deploy pipeline, alert feed, and a live commit stream.',
    h1: 'Mission control',
    body:
      'A NOC / SRE-style live operations dashboard built entirely with the tekivex-ui holographic surfaces: KPI tiles, gauges, deploy pipeline, alert feed terminal, regional capacity, commit stream — all updating in real time.',
  },
  ...blogPosts.map((p) => ({
    path: `/blog/${p.slug}`,
    title: `${p.title} — TekiVex UI engineering blog`,
    description: p.summary,
    h1: p.title,
    body: p.summary,
    article: { datePublished: p.publishedAt },
  })),
  ...docPages.map((d) => ({
    path: `/docs/${d.slug}`,
    title: `${d.name} — TekiVex UI documentation`,
    description: d.summary,
    h1: d.name,
    body: `${d.name} is a ${d.category.toLowerCase()} component shipped in ${d.pkg}. ${d.summary}`,
  })),
];

// ─────────────────────────────────────────────────────────────────────────
// HTML rewriter — swap the head metadata + inject prerendered body content.
// Uses simple string replace; the existing index.html is small enough that
// this is cheap and reliable.
// ─────────────────────────────────────────────────────────────────────────
function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Clamp a description to a search/social-safe length at a word boundary.
// Google truncates ~155–160 chars; social previews ~125. Blog summaries
// double as card excerpts and can run long, so we clamp here when baking
// the <meta> tags rather than forcing authors to shorten the source.
function clampDescription(s, max = 155) {
  const t = String(s).replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(' ');
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut).replace(/[.,;:—-]+$/, '') + '…';
}

function makeHtml(route) {
  let html = baseHtml;
  const url = `${ORIGIN}${route.path}`;
  const metaDescription = clampDescription(route.description);

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(route.title)}</title>`,
  );
  // Description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(metaDescription)}" />`,
  );
  // Canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${url}" />`,
  );
  // OG title + URL + description
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeHtml(route.title)}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${url}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeHtml(metaDescription)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(metaDescription)}" />`,
  );

  // Prerendered body content — placed inside #root so the React hydrate
  // overwrites it. Crawlers see real H1 + paragraph + brand keywords.
  // Clean, professional pre-hydration markup. Crawlers and AdSense see this
  // straight from the HTML body; once React hydrates it is replaced by the
  // real app. Uses neutral light styling so it reads as a polished,
  // professional document rather than a placeholder.
  const ssr = `
      <main style="max-width:760px;margin:0 auto;padding:64px 24px;color:#1a1a2a;font:16px/1.65 -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
        <nav aria-label="Breadcrumb" style="font-size:13px;color:#6b6b8a;margin-bottom:24px"><a href="/" style="color:#3a86ff;text-decoration:none">Home</a></nav>
        <h1 style="font-size:2.4rem;font-weight:800;letter-spacing:-0.025em;color:#0a0a1a;margin:0 0 12px;line-height:1.15">${escapeHtml(route.h1)}</h1>
        <p style="color:#3a3a52;font-size:18px;line-height:1.6;margin:0 0 32px">${escapeHtml(route.body)}</p>
        <p style="color:#6b6b8a;font-size:13px;border-top:1px solid #e6e6ee;padding-top:20px">TekiVex UI · open-source React component library · MIT licensed · <a href="/about" style="color:#3a86ff;text-decoration:none">About</a> · <a href="/docs" style="color:#3a86ff;text-decoration:none">Docs</a> · <a href="/blog" style="color:#3a86ff;text-decoration:none">Blog</a></p>
      </main>`;
  html = html.replace('<div id="root"></div>', `<div id="root">${ssr}</div>`);

  // Article JSON-LD for blog posts
  if (route.article) {
    const ld = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: route.h1,
      description: route.description,
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      url,
      datePublished: route.article.datePublished,
      dateModified: route.article.datePublished,
      author: { '@type': 'Organization', name: 'TekiVex UI' },
      publisher: {
        '@type': 'Organization',
        name: 'TekiVex UI',
        url: ORIGIN,
        logo: { '@type': 'ImageObject', url: `${ORIGIN}/favicon.svg` },
      },
    });
    html = html.replace(
      '</head>',
      `    <script type="application/ld+json">${ld}</script>\n  </head>`,
    );
  }

  return html;
}

let count = 0;
for (const route of routes) {
  const dir = join(DIST, route.path.replace(/^\//, ''));
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), makeHtml(route), 'utf8');
  count++;
}

// Also bake the home-page content so the root is keyword-dense even before JS runs.
{
  const home = {
    path: '/',
    title: 'TekiVex UI — Production-grade React components, in 360°',
    description:
      'Open-source React component library — 116 accessible components, WCAG 2.1 AAA, a built-in security kernel, and a WebGL 3D toolkit. MIT licensed.',
    h1: 'TekiVex UI — Production-grade React components, in 360°',
    body:
      'TekiVex UI is the React component library at the core of the Tekivex ecosystem — 113 accessible components across 13 npm packages including tekivex-ui, tekivex-3d, and tekivex-pdf. WCAG 2.1 AAA, MIT licensed, zero runtime dependencies.',
  };
  writeFileSync(join(DIST, 'index.html'), makeHtml(home), 'utf8');
  count++;
}

console.log(`✓ prerendered ${count} routes`);
