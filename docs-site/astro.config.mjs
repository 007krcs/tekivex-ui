import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

// ─────────────────────────────────────────────────────────────────────────────
// Astro + Starlight config for ui.tekivex.com
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
  site: 'https://ui.tekivex.com',
  integrations: [
    starlight({
      title: 'TekiVex UI',
      description:
        'React component library — 116 components, self-tested against WCAG 2.1 AAA (third-party audit on roadmap), built-in security primitives, 1,798 tests, RSC-ready. npm install tekivex-ui',
      logo: {
        // Lightning bolt (matches favicon)
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://ui.tekivex.com' },
        { icon: 'npm', label: 'npm', href: 'https://www.npmjs.com/package/tekivex-ui' },
      ],
      head: [
        {
          tag: 'meta',
          attrs: {
            name: 'keywords',
            content:
              'tekivex-ui, react component library, wcag 2.1 aaa, vite, webpack, nextjs, remix, react server components, atomic css, accessibility, xss protection',
          },
        },
        {
          // SoftwareApplication JSON-LD — duplicated here so every page carries it
          tag: 'script',
          attrs: { type: 'application/ld+json' },
          content: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'TekiVex UI',
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Web',
            url: 'https://ui.tekivex.com/',
            version: '3.0.2',
            license: 'https://ui.tekivex.com',
            codeRepository: 'https://ui.tekivex.com',
            downloadUrl: 'https://www.npmjs.com/package/tekivex-ui',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
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
