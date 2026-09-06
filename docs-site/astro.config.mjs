import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// ─────────────────────────────────────────────────────────────────────────────
// Astro + Starlight config for www.tekivex.com/ui
//
// Key wins over the old hash-routed SPA:
//   1. Real flat URLs (/getting-started, /components/button, …) — Google can
//      crawl, index, and rank each page independently.
//   2. SSG: pages prerender to static HTML at build time, so each one ships
//      a real <title>, <h1>, and visible body content on first byte.
//   3. Auto-sitemap built from the actual page inventory.
//   4. tekivex-ui still runs as a React island via @astrojs/react where
//      interactive demos are needed.
// ─────────────────────────────────────────────────────────────────────────────

export default defineConfig({
  site: 'https://www.tekivex.com',
  base: process.env.SITE_BASE || '/',
  integrations: [
    starlight({
      title: 'TekiVex UI',
      description:
        'React component library — 116 components, WCAG 2.1 AAA, built-in security kernel, RSC-ready. MIT, npm install tekivex-ui.',
      logo: {
        // Lightning bolt (matches favicon)
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://www.tekivex.com/ui' },
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/tekivex-ui' },
      ],
      head: [
        // Search-engine ownership verification — Google Search Console + Bing
        // Webmaster Tools. Carried on every Astro page so verification works
        // regardless of which URL the tool fetches.
        {
          tag: 'meta',
          attrs: {
            name: 'google-site-verification',
            content: 'iJGXqeB5Lxtpbl6GP-wcDDNHViHyKCE7WTeu08E4F7Y',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'msvalidate.01',
            content: '15ACD6CF5E1FCB9BA9E115BA8C0B6BD8',
          },
        },
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'tekivex-ui, react component library, wcag 2.1 aaa, vite, webpack, nextjs, remix, react server components, atomic css, accessibility, xss protection',
          },
        },
        {
          // Site-wide structured data graph — SoftwareApplication +
          // Organization + WebSite(SearchAction). Carried on every page so
          // any crawl entry point surfaces the full entity graph. Per-page
          // BreadcrumbList + TechArticle are injected by src/components/Head.astro.
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'SoftwareApplication',
                '@id': 'https://www.tekivex.com/ui/#software',
                name: 'TekiVex UI',
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'Web',
                description:
                  'Production-grade React component library — 116 components, WCAG 2.1 AAA, built-in security kernel with published threat model, headless primitives, zero-runtime CSS engine, 44-locale i18n.',
                url: 'https://www.tekivex.com/ui/',
                softwareVersion: '3.20.1',
                license: 'https://opensource.org/licenses/MIT',
                codeRepository: 'https://github.com/007krcs/tekivex-ui',
                downloadUrl: 'https://www.npmjs.com/package/tekivex-ui',
                installUrl: 'https://www.npmjs.com/package/tekivex-ui',
                programmingLanguage: ['TypeScript', 'JavaScript'],
                operatingSystem: 'Web',
                offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
                author: { '@id': 'https://www.tekivex.com/ui/#org' },
                publisher: { '@id': 'https://www.tekivex.com/ui/#org' },
              },
              {
                '@type': 'Organization',
                '@id': 'https://www.tekivex.com/ui/#org',
                name: 'TekiVex UI',
                url: 'https://www.tekivex.com/ui/',
                logo: 'https://www.tekivex.com/ui/og-image.png',
                sameAs: [
                  'https://www.npmjs.com/package/tekivex-ui',
                  'https://github.com/007krcs/tekivex-ui',
                ],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://www.tekivex.com/ui/#website',
                name: 'TekiVex UI',
                url: 'https://www.tekivex.com/ui/',
                description:
                  'Documentation for TekiVex UI — accessible, secure React component library.',
                publisher: { '@id': 'https://www.tekivex.com/ui/#org' },
                inLanguage: 'en',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate:
                      'https://www.tekivex.com/ui/?q={search_term_string}',
                  },
                  'query-input': 'required name=search_term_string',
                },
              },
            ],
          }),
        },
      ],
      sidebar: [
        {
          label: 'Getting started',
          items: [
            { label: 'Overview', link: '/' },
            { label: 'Install', link: '/getting-started/' },
            { label: 'Bundlers — Vite, Webpack, Next.js', link: '/bundlers/' },
            { label: 'Theme & dark mode', link: '/themes/' },
            { label: 'RSC compatibility', link: '/rsc/' },
            { label: 'Quick reference — by use case', link: '/quick-reference/' },
          ],
        },
        {
          label: 'Recipes',
          items: [
            { label: 'Index', link: '/recipes/' },
            { label: 'Secure file upload', link: '/recipes/secure-file-upload/' },
            { label: 'Tamper-evident audit trail', link: '/recipes/audit-trail/' },
            { label: 'PII redaction before LLM', link: '/recipes/pii-redaction-before-llm/' },
            { label: 'Peer chat with media', link: '/recipes/peer-chat-with-media/' },
            { label: 'DataGrid with tree data', link: '/recipes/data-grid-with-tree-data/' },
            { label: 'Async field validation', link: '/recipes/async-field-validation/' },
            { label: 'AAA dark mode (SSR-safe)', link: '/recipes/aaa-dark-mode-ssr-safe/' },
            { label: 'India address form', link: '/recipes/india-address-form/' },
          ],
        },
        {
          label: 'Industry blueprints',
          items: [
            { label: 'Index', link: '/blueprints/' },
            { label: 'Healthtech — patient intake form', link: '/blueprints/healthtech-patient-intake/' },
          ],
        },
        {
          label: 'Components',
          autogenerate: { directory: 'components' },
          collapsed: true,
        },
        {
          label: 'Templates',
          autogenerate: { directory: 'templates' },
          collapsed: true,
        },
        {
          label: 'Ecosystem',
          items: [
            { label: 'Companion packages', link: '/ecosystem/' },
            { label: 'Security model', link: '/security/' },
            { label: 'Accessibility', link: '/accessibility/' },
            { label: 'Honest comparison', link: '/comparison/' },
            { label: 'License', link: '/license/' },
          ],
        },
        // Cross-links to /playground/ and /book/ are intentionally NOT
        // declared as Starlight sidebar items because those paths are
        // served by separate Vite apps (the demo SPA and tkx-book
        // catalog), not Astro content entries. Starlight's sidebar
        // validator rejects link entries that don't resolve to
        // collection slugs. Discoverability is preserved by:
        //   - The "Try it without installing" CardGrid on the homepage
        //   - The Ecosystem page links
      ],
      customCss: ['./src/styles/global.css'],
      lastUpdated: true,
      // Custom Head override — injects per-page Open Graph, Twitter Card,
      // canonical URL, BreadcrumbList + TechArticle JSON-LD. See
      // src/components/Head.astro.
      components: {
        Head: './src/components/Head.astro',
      },
    }),
    react(),
    sitemap(),
  ],
  vite: {
    optimizeDeps: {
      include: ['tekivex-ui'],
    },
    ssr: {
      noExternal: ['tekivex-ui'],
    },
  },
});
