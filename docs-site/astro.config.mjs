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
        'Production-ready React component library — 99 WCAG 2.1 AAA components, built-in security kernel, 1034 tests, RSC-ready. npm install tekivex-ui',
      logo: {
        // Lightning bolt (matches favicon)
        src: './src/assets/logo.svg',
        replacesTitle: false,
      },
      social: [
        { icon: 'github', label: 'GitHub', href: 'https://github.com/007krcs/tekivex-ui' },
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
            license: 'https://github.com/007krcs/tekivex-ui/blob/master/LICENSE',
            codeRepository: 'https://github.com/007krcs/tekivex-ui',
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
        {
          label: 'Try it live',
          items: [
            {
              label: '🎮 Interactive playground',
              link: '/playground/',
              attrs: { 'data-external': 'true' },
            },
            {
              label: '📖 Component catalog (book)',
              link: '/book/',
              attrs: { 'data-external': 'true' },
            },
          ],
        },
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
