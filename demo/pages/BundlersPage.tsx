import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxCard, TkxCardHeader, TkxCardBody, TkxBadge, TkxAlert } from 'tekivex-ui';

// ─────────────────────────────────────────────────────────────────────────────
// BundlersPage — drop-in integration recipes for the bundlers/frameworks
// people actually use in 2026: Vite, Webpack 5, Next.js (App + Pages),
// Remix / React Router 7, Parcel, Rollup, and CRA (legacy).
//
// One page, copy-pasteable configs. Each recipe shows:
//   1. install command (canonical: tekivex-ui — unscoped)
//   2. bundler config delta
//   3. App.tsx wiring
//   4. verify-it-works snippet
// ─────────────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

interface Recipe {
  id: string;
  name: string;
  badge?: string;
  badgeVariant?: 'success' | 'primary' | 'warning' | 'info' | 'secondary';
  intro: string;
  steps: { title: string; lang: string; code: string; note?: string }[];
}

const RECIPES: Recipe[] = [
  // ── Vite ──────────────────────────────────────────────────────────────────
  {
    id: 'vite',
    name: 'Vite 5 / 6 / 7 / 8',
    badge: 'recommended',
    badgeVariant: 'success',
    intro: 'tekivex-ui ships ESM-first with TypeScript declarations. Vite needs no special config — just install, import the stylesheet once, and wrap your app in ThemeProvider.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom
# optional — only if you use the charts entry
npm install recharts`,
      },
      {
        title: '2. (Optional) vite.config.ts — pre-bundle for faster dev',
        lang: 'ts',
        code: `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['tekivex-ui', 'tekivex-ui/themes'],
  },
});`,
        note: 'Only needed if you see slow cold-starts in dev. Production builds always tree-shake.',
      },
      {
        title: '3. Wire ThemeProvider in main.tsx',
        lang: 'tsx',
        code: `import { createRoot } from 'react-dom/client';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';     // ← required, once, anywhere
import App from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={quantumDark}>
    <App />
  </ThemeProvider>,
);`,
      },
      {
        title: '4. Use any component',
        lang: 'tsx',
        code: `import { TkxButton, TkxCard, TkxCardBody } from 'tekivex-ui';

export default function App() {
  return (
    <TkxCard>
      <TkxCardBody>
        <TkxButton variant="primary">It works</TkxButton>
      </TkxCardBody>
    </TkxCard>
  );
}`,
      },
    ],
  },

  // ── Next.js App Router ────────────────────────────────────────────────────
  {
    id: 'next-app',
    name: 'Next.js 14 / 15 — App Router',
    badge: 'RSC ready',
    badgeVariant: 'primary',
    intro: 'tekivex-ui has 13 RSC-compatible components and a full client-side suite. Mark interactive components with "use client"; use server-safe primitives (Typography, Layout, Card) anywhere.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom`,
      },
      {
        title: '2. next.config.js — transpile + tree-shake',
        lang: 'js',
        code: `/** @type {import('next').NextConfig} */
module.exports = {
  transpilePackages: ['tekivex-ui'],
  experimental: {
    optimizePackageImports: ['tekivex-ui'],
  },
};`,
        note: 'optimizePackageImports drops bundle size by ~40% for client components.',
      },
      {
        title: '3. app/layout.tsx — global stylesheet + provider',
        lang: 'tsx',
        code: `import 'tekivex-ui/styles';
import { Providers } from './providers';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`,
      },
      {
        title: '4. app/providers.tsx — client boundary for ThemeProvider',
        lang: 'tsx',
        code: `'use client';
import { ThemeProvider, quantumDark } from 'tekivex-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}`,
        note: 'ThemeProvider must be a client component because it uses React context.',
      },
      {
        title: '5. Use server-safe components in RSC',
        lang: 'tsx',
        code: `// app/page.tsx — Server Component, no "use client" needed
import { TkxCard, TkxCardBody, TkxTypography } from 'tekivex-ui';

export default async function Home() {
  const data = await fetch('https://api.example.com/...').then(r => r.json());
  return (
    <TkxCard>
      <TkxCardBody>
        <TkxTypography variant="h1">{data.title}</TkxTypography>
      </TkxCardBody>
    </TkxCard>
  );
}`,
      },
    ],
  },

  // ── Next.js Pages Router ──────────────────────────────────────────────────
  {
    id: 'next-pages',
    name: 'Next.js — Pages Router',
    badge: 'legacy',
    badgeVariant: 'secondary',
    intro: 'For projects still on the Pages Router. Same package, different wiring.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom`,
      },
      {
        title: '2. next.config.js',
        lang: 'js',
        code: `module.exports = {
  transpilePackages: ['tekivex-ui'],
};`,
      },
      {
        title: '3. pages/_app.tsx',
        lang: 'tsx',
        code: `import type { AppProps } from 'next/app';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={quantumDark}>
      <Component {...pageProps} />
    </ThemeProvider>
  );
}`,
      },
    ],
  },

  // ── Webpack 5 ─────────────────────────────────────────────────────────────
  {
    id: 'webpack',
    name: 'Webpack 5 (CRA, custom, federated)',
    intro: 'Webpack handles tekivex-ui out of the box if your loader chain covers TypeScript, ESM, and CSS. Below is the minimal config you need on top of an existing Webpack 5 setup.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom
npm install --save-dev style-loader css-loader`,
      },
      {
        title: '2. webpack.config.js — module rules',
        lang: 'js',
        code: `module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.jsx', '.mjs'],
    // tekivex-ui ships ESM; ensure conditional exports resolve correctly
    conditionNames: ['import', 'require', 'default'],
  },
  module: {
    rules: [
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  // tekivex-ui has sideEffects: ["*.css"] — Webpack will tree-shake everything else
};`,
      },
      {
        title: '3. src/index.tsx',
        lang: 'tsx',
        code: `import { createRoot } from 'react-dom/client';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={quantumDark}>
    <App />
  </ThemeProvider>,
);`,
      },
      {
        title: 'Common pitfall: "Module not found" for tekivex-ui/styles',
        lang: 'js',
        code: `// If your Webpack version pre-dates conditional-exports support,
// import the resolved CSS path directly:
import 'tekivex-ui/dist/style.css';`,
        note: 'Required for Webpack < 5.55. Modern Webpack resolves the export map automatically.',
      },
    ],
  },

  // ── Remix / React Router 7 ────────────────────────────────────────────────
  {
    id: 'remix',
    name: 'Remix / React Router 7',
    intro: 'Remix uses Vite under the hood (v2.8+) and respects ESM exports. The only Remix-specific bit is loading the CSS via the route module, not a side-effect import.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom`,
      },
      {
        title: '2. app/root.tsx — load CSS via links()',
        lang: 'tsx',
        code: `import type { LinksFunction } from '@remix-run/node';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import tekivexStyles from 'tekivex-ui/dist/style.css?url';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: tekivexStyles },
];

export default function App() {
  return (
    <html lang="en">
      <body>
        <ThemeProvider theme={quantumDark}>
          <Outlet />
        </ThemeProvider>
      </body>
    </html>
  );
}`,
      },
    ],
  },

  // ── Parcel ────────────────────────────────────────────────────────────────
  {
    id: 'parcel',
    name: 'Parcel 2',
    intro: 'Zero-config — Parcel resolves the export map and bundles CSS automatically.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom`,
      },
      {
        title: '2. src/index.tsx',
        lang: 'tsx',
        code: `import { createRoot } from 'react-dom/client';
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={quantumDark}>
    <App />
  </ThemeProvider>,
);`,
      },
    ],
  },

  // ── Rollup ────────────────────────────────────────────────────────────────
  {
    id: 'rollup',
    name: 'Rollup (library consumers)',
    intro: 'If you are building your own React library that depends on tekivex-ui, mark it as external so it stays a peer dependency.',
    steps: [
      {
        title: 'rollup.config.js',
        lang: 'js',
        code: `import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/index.ts',
  external: [
    'react',
    'react-dom',
    'tekivex-ui',         // ← consumer brings their own
    /^tekivex-ui\\/.*/,   // ← also externalises subpath imports
  ],
  output: { file: 'dist/index.js', format: 'es' },
  plugins: [resolve(), typescript()],
};`,
      },
    ],
  },

  // ── Astro ─────────────────────────────────────────────────────────────────
  {
    id: 'astro',
    name: 'Astro (Islands)',
    intro: 'Use tekivex-ui inside React islands. The library is fully compatible with Astro\'s "use client"-equivalent island model.',
    steps: [
      {
        title: '1. Install + add React integration',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom
npx astro add react`,
      },
      {
        title: '2. Layout.astro — load styles globally',
        lang: 'html',
        code: `---
import 'tekivex-ui/styles';
---
<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /></head>
  <body><slot /></body>
</html>`,
      },
      {
        title: '3. Use as a hydrated React island',
        lang: 'astro',
        code: `---
import InteractiveCard from '../components/InteractiveCard.tsx';
---
<InteractiveCard client:load />`,
      },
    ],
  },

  // ── CRA (legacy) ──────────────────────────────────────────────────────────
  {
    id: 'cra',
    name: 'Create React App (legacy)',
    badge: 'legacy — migrate to Vite',
    badgeVariant: 'warning',
    intro: 'CRA is in maintenance mode. tekivex-ui works with it, but we recommend migrating to Vite for faster builds and smaller bundles.',
    steps: [
      {
        title: '1. Install',
        lang: 'bash',
        code: `npm install tekivex-ui react react-dom`,
      },
      {
        title: '2. src/index.tsx',
        lang: 'tsx',
        code: `import { ThemeProvider, quantumDark } from 'tekivex-ui';
import 'tekivex-ui/styles';
// ... rest of your CRA setup`,
      },
    ],
  },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function BundlersPage({ theme }: Props) {
  const page: CSSProperties = {
    padding: '48px clamp(16px, 4vw, 48px) 80px',
    maxWidth: 1100,
    margin: '0 auto',
    color: theme.text,
  };
  const h1: CSSProperties = {
    fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
    fontWeight: 900,
    letterSpacing: '-0.03em',
    margin: '0 0 12px',
  };
  const lead: CSSProperties = {
    color: theme.textMuted,
    fontSize: 17,
    lineHeight: 1.7,
    margin: '0 0 32px',
    maxWidth: 780,
  };
  const tocStyle: CSSProperties = {
    display: 'flex',
    gap: 8,
    flexWrap: 'wrap',
    margin: '0 0 40px',
  };
  const tocLink: CSSProperties = {
    padding: '6px 12px',
    borderRadius: 6,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    textDecoration: 'none',
    fontSize: 13,
    fontWeight: 600,
    background: theme.surface,
  };
  const sectionH2: CSSProperties = {
    fontSize: 22,
    fontWeight: 800,
    margin: '0 0 4px',
    display: 'flex',
    gap: 10,
    alignItems: 'center',
    flexWrap: 'wrap',
  };
  const stepTitle: CSSProperties = {
    fontWeight: 700,
    fontSize: 14,
    margin: '20px 0 8px',
    color: theme.text,
  };
  const codeBlock: CSSProperties = {
    background: theme.bg,
    border: `1px solid ${theme.border}`,
    borderRadius: 10,
    padding: '14px 16px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12.5,
    color: theme.text,
    overflowX: 'auto',
    whiteSpace: 'pre',
    lineHeight: 1.6,
    margin: 0,
  };
  const noteStyle: CSSProperties = {
    fontSize: 12,
    color: theme.textMuted,
    fontStyle: 'italic',
    margin: '8px 0 0',
  };

  return (
    <div style={page}>
      <h1 style={h1}>Bundler Integration</h1>
      <p style={lead}>
        Drop-in recipes for every major bundler and meta-framework. Pick yours, copy the snippets, ship.
        The package name is <code style={{ background: theme.surface, padding: '2px 6px', borderRadius: 4, color: theme.primary }}>tekivex-ui</code> — unscoped, on npm.
      </p>

      <TkxAlert variant="info" title="Canonical install">
        <code>npm install tekivex-ui</code> · works with npm 7+, pnpm, yarn, bun. Stylesheet loaded via <code>import 'tekivex-ui/styles'</code> (or as a URL in Remix-style frameworks).
      </TkxAlert>

      <div style={{ height: 24 }} />

      {/* Table of contents */}
      <nav aria-label="Bundlers on this page" style={tocStyle}>
        {RECIPES.map((r) => (
          <a key={r.id} href={`#${r.id}`} style={tocLink}>
            {r.name}
          </a>
        ))}
      </nav>

      {RECIPES.map((recipe) => (
        <section key={recipe.id} id={recipe.id} style={{ marginBottom: 56, scrollMarginTop: 80 }}>
          <TkxCard variant="glass" padding="lg">
            <TkxCardHeader
              title={
                <h2 style={sectionH2}>
                  {recipe.name}
                  {recipe.badge && (
                    <TkxBadge variant={recipe.badgeVariant || 'primary'} size="sm">
                      {recipe.badge}
                    </TkxBadge>
                  )}
                </h2>
              }
              subtitle={recipe.intro}
            />
            <TkxCardBody>
              {recipe.steps.map((step, idx) => (
                <div key={idx}>
                  <div style={stepTitle}>{step.title}</div>
                  <pre style={codeBlock}>{step.code}</pre>
                  {step.note && <p style={noteStyle}>{step.note}</p>}
                </div>
              ))}
            </TkxCardBody>
          </TkxCard>
        </section>
      ))}

      <TkxCard variant="outlined" padding="lg">
        <TkxCardBody>
          <h2 style={{ margin: '0 0 12px', fontSize: 22, fontWeight: 800 }}>Verify your install</h2>
          <p style={{ color: theme.textMuted, lineHeight: 1.75, margin: '0 0 12px', fontSize: 15 }}>
            Drop this into any page and start your dev server. If you see a styled card and a button, the integration is correct:
          </p>
          <pre style={codeBlock}>{`import { TkxCard, TkxCardBody, TkxButton, TkxBadge } from 'tekivex-ui';

export function HealthCheck() {
  return (
    <TkxCard>
      <TkxCardBody>
        <TkxBadge variant="success">tekivex-ui v2.6 ready</TkxBadge>
        <TkxButton style={{ marginLeft: 12 }}>Click me</TkxButton>
      </TkxCardBody>
    </TkxCard>
  );
}`}</pre>
          <p style={{ color: theme.textMuted, lineHeight: 1.75, margin: '16px 0 0', fontSize: 14 }}>
            Bundler not listed? <a href="https://github.com/007krcs/tekivex-ui/issues" style={{ color: theme.primary }}>Open an issue</a> with your config and we'll add a recipe.
          </p>
        </TkxCardBody>
      </TkxCard>
    </div>
  );
}
