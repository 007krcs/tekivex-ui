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
      'TekiVex UI is a React component library covering 113 production primitives, a WebGL 3D toolkit, a Holographic UI family, and a printable-template pipeline. Read why we built it and how we plan to keep it maintained.',
    h1: 'About TekiVex UI',
    body:
      'TekiVex UI is an open-source React component library distributed under the MIT license. The Tekivex package family — tekivex-ui, tekivex-3d, tekivex-resume-templates, tekivex-biodata-templates, and tekivex-pdf — gives React developers 113 accessible components, a real WebGL 3D toolkit, holographic surfaces, browser-native PDF, and printable templates.',
  },
  {
    path: '/contact',
    title: 'Contact TekiVex UI',
    description:
      'Email, GitHub issue tracker, and a contact form for the TekiVex UI maintainers. Bug reports, feature requests, and consulting inquiries.',
    h1: 'Contact TekiVex UI',
    body:
      'Reach the TekiVex UI maintainers by GitHub issue (bugs, features, doc fixes) or by email at hello@tekivex.com (commercial inquiries), privacy@tekivex.com, legal@tekivex.com, or security@tekivex.com.',
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
      'Four working example applications built on the TekiVex UI stack — a 360° multi-scene tour, an AR/VR WebXR scene, a holographic UI gallery, and a fully configurable static blog with markdown editor.',
  },
  {
    path: '/examples/360',
    title: '360° tour example — TekiVex UI',
    description:
      'A working multi-scene 360° tour built with tekivex-3d: drag to look, click hotspots to teleport between scenes, optional fullscreen and gyroscope.',
    h1: '360° multi-scene tour',
    body:
      'Drag to look around. Click any glowing hotspot to teleport to another scene. On mobile, tilt your phone to control the camera. Built with TkxScene + TkxPanorama360 + TkxHotspot from tekivex-3d.',
  },
  {
    path: '/examples/ar-vr',
    title: 'AR / VR example — TekiVex UI',
    description:
      'A working WebXR demo: enter AR pass-through on Quest 3 / Vision Pro / ARCore phones, enter immersive VR on Quest, or interact with the 3D scene from any browser.',
    h1: 'AR / VR scene',
    body:
      'A floating product card with a holographic logo and ambient particles. Tap to enter AR pass-through (Quest 3, Vision Pro, modern Android) or immersive VR (Quest, Pico). Drag to orbit from any device.',
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
      'A fully configurable static blog: write posts with a markdown editor, upload cover images, drop in syntax-highlighted code blocks, organise by category and tags. No backend required.',
    h1: 'Configurable blog',
    body:
      'A complete blog application: write posts with a markdown editor, upload images, drop in syntax-highlighted code blocks, organise by category and tags, search the archive, configure your brand. All persisted in localStorage — swap one file to point at a real backend.',
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

function makeHtml(route) {
  let html = baseHtml;
  const url = `${ORIGIN}${route.path}`;

  // Title
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(route.title)}</title>`,
  );
  // Description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeHtml(route.description)}" />`,
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
    `<meta property="og:description" content="${escapeHtml(route.description)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}" />`,
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
      'Open-source React component library: 113 accessible primitives, a WebGL 3D + 360° toolkit, holographic UI, browser-native PDF, and printable templates. MIT licensed, WCAG 2.1 AAA.',
    h1: 'TekiVex UI — Production-grade React components, in 360°',
    body:
      'TekiVex UI is the React component library at the core of the Tekivex ecosystem — 113 accessible components across 13 npm packages including tekivex-ui, tekivex-3d, tekivex-resume-templates, tekivex-biodata-templates, and tekivex-pdf. WCAG 2.1 AAA, MIT licensed, zero runtime dependencies.',
  };
  writeFileSync(join(DIST, 'index.html'), makeHtml(home), 'utf8');
  count++;
}

console.log(`✓ prerendered ${count} routes`);
