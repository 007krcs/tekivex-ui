import type { CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { CodeBlock } from '../layout/CodeBlock';
import { WCAGBadge } from '../layout/WCAGBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

interface GettingStartedPageProps {
  theme: ThemeTokens;
}

// ── Code snippets ─────────────────────────────────────────────────────────────

const INSTALL_SNIPPET = `npm install tekivex-ui
# or
yarn add tekivex-ui
# or
pnpm add tekivex-ui`;

const THEME_PROVIDER_SNIPPET = `// main.tsx or App.tsx
import { ThemeProvider, quantumDark } from 'tekivex-ui';
import { App } from './App';

// Wrap your entire application in ThemeProvider.
// quantumDark is the default theme — swap for auroraLight
// or create your own with createTheme().
createRoot(document.getElementById('root')!).render(
  <ThemeProvider theme={quantumDark}>
    <App />
  </ThemeProvider>
);`;

const FIRST_COMPONENT_SNIPPET = `import { TkxButton, TkxCard, TkxCardHeader, TkxCardBody } from 'tekivex-ui';

export function WelcomeCard() {
  return (
    <TkxCard variant="elevated">
      <TkxCardHeader>
        <h2>Welcome to TekiVex UI</h2>
      </TkxCardHeader>
      <TkxCardBody>
        <p>Your first WCAG AAA-compliant component.</p>
        <TkxButton variant="solid" colorScheme="primary">
          Get started
        </TkxButton>
        <TkxButton variant="ghost" colorScheme="secondary" style={{ marginLeft: 8 }}>
          Learn more
        </TkxButton>
      </TkxCardBody>
    </TkxCard>
  );
}`;

const CUSTOM_THEME_SNIPPET = `import { createTheme, quantumDark, ThemeProvider } from 'tekivex-ui';

// createTheme() validates hex values and checks WCAG AA contrast.
// It will console.warn() if text/bg contrast drops below 4.5:1.
const brandTheme = createTheme(quantumDark, {
  primary: '#ff6b35',    // brand orange
  secondary: '#004e89',  // brand navy
  success: '#1a936f',
});

export function App() {
  return (
    <ThemeProvider theme={brandTheme}>
      {/* All components automatically pick up the new tokens */}
      <YourApp />
    </ThemeProvider>
  );
}`;

const TKX_CSS_SNIPPET = `import { tkx, cx, useTheme } from 'tekivex-ui';

function MyComponent() {
  const theme = useTheme();

  // tkx() produces a single atomic CSS class with true conflict resolution.
  // p-4 + p-8 → padding:32px (last value wins, no cascade wars).
  const buttonClass = tkx(
    'inline-flex items-center gap-2',
    'px-4 py-2',
    'rounded-lg',
    'font-semibold text-sm',
    'transition-colors duration-150',
    'hover:opacity-90',
    'focus:outline-none focus:ring-2',
    '@md:px-6 @md:py-3',         // responsive
    'motion-safe:transition-all', // respects prefers-reduced-motion
  );

  // cx() is just a className merger (no style injection)
  const wrapperClass = cx(
    'flex flex-col gap-4',
    theme.bg === '#0a0a0f' && 'bg-[#0a0a0f]',
  );

  return (
    <div className={wrapperClass}>
      <button className={buttonClass} style={{ backgroundColor: theme.primary }}>
        TKX-styled button
      </button>
    </div>
  );
}`;

const SSR_SNIPPET = `// SSR usage — extract atomic CSS before sending HTML
import { extractAtomicCSS, resetAtomicCSS } from 'tekivex-ui';
import { renderToString } from 'react-dom/server';

export function handleRequest(req, res) {
  // Reset per-request to avoid cross-request pollution
  resetAtomicCSS();

  const html = renderToString(<App />);

  // Extract all CSS generated during this render
  const { css, classMap } = extractAtomicCSS();

  res.send(\`
    <!DOCTYPE html>
    <html>
      <head>
        <style id="tkx-atomic">\${css}</style>
      </head>
      <body>
        <div id="root">\${html}</div>
      </body>
    </html>
  \`);
}`;

const WCAG_CHECKLIST_ITEMS = [
  { text: 'Color contrast ≥ 7:1 (AAA) for all text', pass: true },
  { text: 'Keyboard navigation — all interactive elements reachable', pass: true },
  { text: 'Focus ring visible on all focusable elements', pass: true },
  { text: 'ARIA roles, labels, and live regions on all components', pass: true },
  { text: 'Screen reader announcements for dynamic content', pass: true },
  { text: 'Motion reduced on prefers-reduced-motion: reduce', pass: true },
  { text: 'High-contrast mode support via forced-colors media query', pass: true },
  { text: 'No seizure-inducing animations (WCAG 2.3.3)', pass: true },
  { text: 'Touch target size ≥ 44×44px (WCAG 2.5.5)', pass: true },
  { text: 'Language of page declared in HTML lang attribute', pass: true },
];

// ── GettingStartedPage component ──────────────────────────────────────────────

export function GettingStartedPage({ theme }: GettingStartedPageProps) {
  const pageStyle: CSSProperties = {
    maxWidth: '860px',
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  const sectionStyle: CSSProperties = {
    marginBottom: '56px',
  };

  const h2Style: CSSProperties = {
    fontSize: '1.4rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const stepNumStyle = (color: string): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    backgroundColor: `${color}20`,
    color: color,
    fontSize: '12px',
    fontWeight: 800,
    flexShrink: 0,
  });

  const descStyle: CSSProperties = {
    fontSize: '14px',
    color: theme.textMuted,
    margin: '0 0 20px',
    lineHeight: '1.7',
  };

  const pageHeaderStyle: CSSProperties = {
    marginBottom: '48px',
    paddingBottom: '32px',
    borderBottom: `1px solid ${theme.border}`,
  };

  const pageTitleStyle: CSSProperties = {
    fontSize: '2rem',
    fontWeight: 800,
    color: theme.text,
    margin: '0 0 10px',
    letterSpacing: '-0.03em',
  };

  const pageDescStyle: CSSProperties = {
    fontSize: '15px',
    color: theme.textMuted,
    margin: '0 0 20px',
    lineHeight: '1.7',
    maxWidth: '600px',
  };

  const infoBoxStyle = (color: string): CSSProperties => ({
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1px solid ${color}30`,
    backgroundColor: `${color}08`,
    marginBottom: '20px',
    fontSize: '13.5px',
    color: theme.text,
    lineHeight: '1.6',
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-start',
  });

  const checklistStyle: CSSProperties = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '8px',
  };

  const checkItemStyle = (pass: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    borderRadius: '8px',
    border: `1px solid ${pass ? theme.success : theme.danger}25`,
    backgroundColor: `${pass ? theme.success : theme.danger}06`,
    fontSize: '13px',
    color: theme.text,
  });

  const checkIconStyle = (pass: boolean): CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: pass ? `${theme.success}25` : `${theme.danger}25`,
    color: pass ? theme.success : theme.danger,
    fontSize: '10px',
    fontWeight: 800,
    flexShrink: 0,
  });

  const divStyle: CSSProperties = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '0 0 56px',
    opacity: 0.5,
  };

  return (
    <div style={pageStyle}>
      {/* Page header */}
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>Getting Started</h1>
        <p style={pageDescStyle}>
          TekiVex UI is a zero-dependency React component library. No PostCSS,
          no build plugins, no configuration files required. Just install and render.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <WCAGBadge criterion="1.4.3 Contrast" level="AAA" status="PASS" />
          <WCAGBadge criterion="2.1.1 Keyboard" level="AAA" status="PASS" />
          <WCAGBadge criterion="4.1.2 Name/Role" level="AAA" status="PASS" />
        </div>
      </div>

      {/* Step 1: Install */}
      <section style={sectionStyle} aria-labelledby="step-1">
        <h2 id="step-1" style={h2Style}>
          <span style={stepNumStyle(theme.primary)}>1</span>
          Install
        </h2>
        <p style={descStyle}>
          Install the package from npm. TekiVex UI has zero runtime dependencies
          and ships complete TypeScript types.
        </p>
        <CodeBlock code={INSTALL_SNIPPET} language="bash" />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Step 2: ThemeProvider */}
      <section style={sectionStyle} aria-labelledby="step-2">
        <h2 id="step-2" style={h2Style}>
          <span style={stepNumStyle(theme.secondary)}>2</span>
          Wrap with ThemeProvider
        </h2>
        <p style={descStyle}>
          Wrap your root with <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>ThemeProvider</code>.
          It injects CSS custom properties onto <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>:root</code> and
          provides theme tokens to all child components via React context.
        </p>
        <div style={infoBoxStyle(theme.info)}>
          <span style={{ fontSize: '16px', flexShrink: 0 }}>ℹ️</span>
          <span>
            Two built-in themes are provided: <strong>quantumDark</strong> (default — dark neon aesthetic)
            and <strong>auroraLight</strong> (warm light theme). You can also create your own with{' '}
            <code style={{ fontFamily: 'monospace', fontSize: '12px', color: theme.primary }}>createTheme()</code>.
          </span>
        </div>
        <CodeBlock code={THEME_PROVIDER_SNIPPET} language="tsx" showLineNumbers title="main.tsx" />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Step 3: First component */}
      <section style={sectionStyle} aria-labelledby="step-3">
        <h2 id="step-3" style={h2Style}>
          <span style={stepNumStyle(theme.success)}>3</span>
          Render Your First Component
        </h2>
        <p style={descStyle}>
          Import components directly from <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>tekivex-ui</code>.
          Every component inherits theme tokens automatically — no className wiring needed.
        </p>
        <CodeBlock code={FIRST_COMPONENT_SNIPPET} language="tsx" showLineNumbers title="WelcomeCard.tsx" />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Step 4: Custom theme */}
      <section style={sectionStyle} aria-labelledby="step-4">
        <h2 id="step-4" style={h2Style}>
          <span style={stepNumStyle(theme.warning)}>4</span>
          Create a Custom Theme
        </h2>
        <p style={descStyle}>
          Use <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>createTheme()</code> to
          apply brand colors. The factory validates every hex value and will warn you
          if any combination fails WCAG AA contrast (4.5:1).
        </p>
        <CodeBlock code={CUSTOM_THEME_SNIPPET} language="tsx" showLineNumbers title="theme.ts" />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Step 5: TKX CSS */}
      <section style={sectionStyle} aria-labelledby="step-5">
        <h2 id="step-5" style={h2Style}>
          <span style={stepNumStyle(theme.info)}>5</span>
          Use the TKX CSS System
        </h2>
        <p style={descStyle}>
          The <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>tkx()</code> function
          generates atomic CSS with true conflict resolution — unlike Tailwind, the last
          matching property always wins. No cascade, no specificity battles.
        </p>
        <CodeBlock code={TKX_CSS_SNIPPET} language="tsx" showLineNumbers title="MyComponent.tsx" />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Step 6: SSR */}
      <section style={sectionStyle} aria-labelledby="step-6">
        <h2 id="step-6" style={h2Style}>
          <span style={stepNumStyle(theme.danger)}>6</span>
          Server-Side Rendering
        </h2>
        <p style={descStyle}>
          TekiVex UI is fully SSR-compatible. Use{' '}
          <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>extractAtomicCSS()</code> to
          pull the generated styles from a render pass and embed them in your HTML response.
        </p>
        <CodeBlock code={SSR_SNIPPET} language="tsx" showLineNumbers title="server.ts" />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* WCAG checklist */}
      <section aria-labelledby="wcag-checklist">
        <h2 id="wcag-checklist" style={{ ...h2Style, marginBottom: '8px' }}>
          WCAG 2.1 AAA Compliance Checklist
        </h2>
        <p style={{ ...descStyle, marginBottom: '20px' }}>
          Every built-in component satisfies these criteria out of the box.
        </p>
        <ul style={checklistStyle} role="list">
          {WCAG_CHECKLIST_ITEMS.map((item) => (
            <li key={item.text} style={checkItemStyle(item.pass)}>
              <span style={checkIconStyle(item.pass)} aria-hidden="true">
                {item.pass ? '✓' : '✗'}
              </span>
              <span>{item.text}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
