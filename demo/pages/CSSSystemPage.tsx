import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { tkx, extractAtomicCSS, resetAtomicCSS } from 'tekivex-ui';
import { CodeBlock } from '../layout/CodeBlock';

// ── Types ─────────────────────────────────────────────────────────────────────

interface CSSSystemPageProps {
  theme: ThemeTokens;
}

// ── Code snippets ─────────────────────────────────────────────────────────────

const BASICS_SNIPPET = `import { tkx, tx, cx } from 'tekivex-ui';

// tkx() — full atomic CSS engine. Injects styles, returns className.
const cls = tkx('flex items-center gap-4 p-4 rounded-lg bg-surface text-primary');

// tx() — alias for tkx(), same behavior
const cls2 = tx('font-bold text-xl hover:opacity-80');

// cx() — className merger only. NO style injection. Use for combining strings.
const merged = cx('base-class', isActive && 'active', 'extra');`;

const CONFLICT_SNIPPET = `import { tkx } from 'tekivex-ui';

// Without TKX: Tailwind gives you a battle
// "p-4 p-8" → both classes are in the DOM, cascade decides (bad)

// With TKX: TRUE conflict resolution
const cls = tkx('p-4 p-8');
// Result → padding: 32px  (p-8 wins, p-4 is discarded at the property level)

// Works for all shorthand properties:
const cls2 = tkx('px-2 px-6 py-2 py-4');
// Result → padding-left: 24px; padding-right: 24px; padding-top: 16px; padding-bottom: 16px

// Layered overrides — useful for variant merging:
function Button({ size }: { size: 'sm' | 'lg' }) {
  return (
    <button className={tkx(
      'px-4 py-2 text-sm',                    // base
      size === 'sm' && 'px-2 py-1 text-xs',   // override
      size === 'lg' && 'px-6 py-3 text-base', // override
    )}>
      Click me
    </button>
  );
}`;

const VARIANTS_SNIPPET = `import { tkx } from 'tekivex-ui';

// Pseudo-class variants
const cls = tkx(
  'bg-surface',
  'hover:bg-surfaceAlt',     // mouse hover
  'focus:ring-2',            // keyboard focus
  'active:scale-95',         // pressed state
  'disabled:opacity-50',     // disabled
  'focus-visible:outline-2', // visible focus only
);

// Responsive variants (mobile-first)
const responsive = tkx(
  'text-sm',          // base (all sizes)
  '@sm:text-base',    // ≥ 640px
  '@md:text-lg',      // ≥ 768px
  '@lg:text-xl',      // ≥ 1024px
  '@xl:text-2xl',     // ≥ 1280px
);

// Accessibility variants
const a11y = tkx(
  'transition-all',                 // plays animation by default
  'motion-safe:transition-all',     // only if user allows motion
  'motion-reduce:transition-none',  // explicitly disable for sensitive users
  'contrast-more:border-2',         // extra visible border in high-contrast mode
  'contrast-less:opacity-80',       // reduce contrast when requested
  'print:hidden',                   // hide when printing
);

// Dark mode variant
const themed = tkx(
  'bg-white text-black',
  'dark:bg-gray-900 dark:text-white',
);`;

const SPACING_SNIPPET = `import { tkx } from 'tekivex-ui';

// All spacing utilities follow the same scale:
// 1 = 4px, 2 = 8px, 3 = 12px, 4 = 16px, 5 = 20px, 6 = 24px
// 8 = 32px, 10 = 40px, 12 = 48px, 16 = 64px ...

const spacing = tkx(
  // Padding
  'p-4',      // padding: 16px
  'px-6',     // padding-left: 24px; padding-right: 24px
  'py-2',     // padding-top: 8px; padding-bottom: 8px
  'pt-3',     // padding-top: 12px
  'pr-4',     // padding-right: 16px
  'pb-5',     // padding-bottom: 20px
  'pl-6',     // padding-left: 24px

  // Margin
  'm-auto',   // margin: auto
  'mx-4',     // margin-left: 16px; margin-right: 16px
  'my-6',     // margin-top: 24px; margin-bottom: 24px
  'mt-0',     // margin-top: 0
  '-mt-2',    // margin-top: -8px (negative margins supported)

  // Gap (flex/grid)
  'gap-4',    // gap: 16px
  'gap-x-6',  // column-gap: 24px
  'gap-y-3',  // row-gap: 12px
);

// Arbitrary values — wrap in square brackets
const arbitrary = tkx(
  'w-[420px]',
  'h-[calc(100vh-64px)]',
  'mt-[13px]',
  'gap-[7px]',
  'p-[2rem]',
);`;

const TYPOGRAPHY_SNIPPET = `import { tkx } from 'tekivex-ui';

const typography = tkx(
  // Font size (with matching line-height auto-set)
  'text-xs',     // 0.75rem / 1rem
  'text-sm',     // 0.875rem / 1.25rem
  'text-base',   // 1rem / 1.5rem
  'text-lg',     // 1.125rem / 1.75rem
  'text-xl',     // 1.25rem / 1.75rem
  'text-2xl',    // 1.5rem / 2rem
  'text-4xl',    // 2.25rem / 2.5rem

  // Font weight
  'font-thin',       // 100
  'font-light',      // 300
  'font-normal',     // 400
  'font-medium',     // 500
  'font-semibold',   // 600
  'font-bold',       // 700
  'font-extrabold',  // 800

  // Alignment and decoration
  'text-center',
  'text-right',
  'uppercase',
  'lowercase',
  'capitalize',
  'truncate',        // overflow: hidden + text-overflow: ellipsis + nowrap
  'line-clamp-3',    // -webkit-line-clamp: 3

  // Leading and tracking
  'leading-tight',   // 1.25
  'leading-relaxed', // 1.625
  'tracking-wide',   // 0.025em
  'tracking-widest', // 0.1em
);`;

const COLORS_SNIPPET = `import { tkx } from 'tekivex-ui';

// Theme tokens — automatically follow ThemeContext
const themed = tkx(
  'text-primary',       // color: var(--tkx-primary)
  'bg-surface',         // background-color: var(--tkx-surface)
  'border-border',      // border-color: var(--tkx-border)
  'text-textMuted',     // color: var(--tkx-textMuted)
  'bg-surfaceAlt',
  'text-success',
  'bg-danger',
  'text-warning',
  'ring-secondary',     // outline / box-shadow ring
);

// Opacity modifiers (append /opacity to any color)
const withOpacity = tkx(
  'bg-primary/20',      // background-color: color-mix(..., 20%)
  'text-primary/80',    // 80% opacity text
  'border-border/50',
);

// Arbitrary color values
const arbitrary = tkx(
  'bg-[#1a1a2e]',
  'text-[rgba(0,245,212,0.9)]',
  'border-[hsl(280,70%,50%)]',
);`;

const LAYOUT_SNIPPET = `import { tkx } from 'tekivex-ui';

const layout = tkx(
  // Display
  'block', 'inline-block', 'inline', 'flex', 'inline-flex',
  'grid', 'inline-grid', 'hidden',

  // Flex
  'flex-row', 'flex-col', 'flex-wrap', 'flex-nowrap',
  'items-center', 'items-start', 'items-end', 'items-stretch',
  'justify-center', 'justify-between', 'justify-around', 'justify-end',
  'flex-1', 'flex-auto', 'flex-none', 'shrink-0', 'grow',

  // Grid
  'grid-cols-2', 'grid-cols-3', 'grid-cols-[1fr_2fr_1fr]',
  'col-span-2', 'row-span-3',
  'place-items-center',

  // Position
  'relative', 'absolute', 'fixed', 'sticky',
  'inset-0', 'top-4', 'left-0', 'right-0', 'bottom-0',
  'z-10', 'z-50', 'z-[100]',

  // Overflow
  'overflow-hidden', 'overflow-auto', 'overflow-x-scroll',
  'truncate',
);`;

const BORDERS_EFFECTS_SNIPPET = `import { tkx } from 'tekivex-ui';

const borders = tkx(
  // Border width
  'border', 'border-2', 'border-t', 'border-b-4',

  // Border radius
  'rounded-sm',   // 2px
  'rounded',      // 4px
  'rounded-md',   // 6px
  'rounded-lg',   // 8px
  'rounded-xl',   // 12px
  'rounded-2xl',  // 16px
  'rounded-full', // 9999px

  // Shadows
  'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl',

  // Opacity
  'opacity-0', 'opacity-50', 'opacity-100',

  // Ring (focus styles)
  'ring', 'ring-2', 'ring-4', 'ring-offset-2',

  // Transitions
  'transition', 'transition-colors', 'transition-opacity',
  'duration-150', 'duration-300', 'duration-500',
  'ease-in', 'ease-out', 'ease-in-out',

  // Transform
  'scale-95', 'scale-100', 'scale-105',
  'rotate-45', '-rotate-12',
  'translate-x-4', '-translate-y-2',
  'skew-x-3',
);`;

const SSR_SNIPPET = `import { extractAtomicCSS, resetAtomicCSS } from 'tekivex-ui';
import { renderToString } from 'react-dom/server';

// ── Express / Node.js example ──────────────────────────────────────────────

app.get('*', (req, res) => {
  // Per-request reset prevents CSS leaking between requests
  resetAtomicCSS();

  // Render — all tkx() calls populate the atomic registry
  const html = renderToString(
    <ThemeProvider theme={quantumDark}>
      <App />
    </ThemeProvider>
  );

  // Pull the generated styles
  const { css } = extractAtomicCSS();

  res.send(\`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style id="tkx-atomic">\${css}</style>
  <!-- On hydration the client merges rather than re-injects -->
</head>
<body>
  <div id="root">\${html}</div>
  <script src="/client.js"></script>
</body>
</html>\`);
});`;

const PLAYGROUND_INITIAL = `tkx(
  'flex items-center gap-3',
  'px-5 py-2.5',
  'rounded-xl',
  'font-semibold text-sm',
  'bg-surface border border-border',
  'text-primary',
  'shadow-md',
  'hover:shadow-lg hover:border-primary',
  'focus:ring-2 focus:ring-offset-2',
  'transition-all duration-200',
  'active:scale-95',
  '@md:px-6 @md:py-3 @md:text-base',
  'motion-safe:transition-all',
  'motion-reduce:transition-none',
)`;

// ── Reference data ────────────────────────────────────────────────────────────

const UTILITY_CATEGORIES = [
  {
    title: 'Layout',
    color: '#00f5d4',
    utilities: [
      'flex', 'grid', 'block', 'inline-flex', 'hidden',
      'flex-col', 'flex-row', 'flex-wrap',
      'items-center', 'items-start', 'justify-between', 'justify-center',
      'flex-1', 'shrink-0', 'grow',
      'grid-cols-2', 'grid-cols-3', 'col-span-2',
      'relative', 'absolute', 'fixed', 'sticky',
      'inset-0', 'top-0', 'z-10', 'z-50',
      'overflow-hidden', 'overflow-auto',
      'w-full', 'h-full', 'min-h-screen',
    ],
  },
  {
    title: 'Spacing',
    color: '#7b2ff7',
    utilities: [
      'p-0', 'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6', 'p-8', 'p-10', 'p-12',
      'px-4', 'py-2', 'pt-3', 'pr-4', 'pb-5', 'pl-6',
      'm-auto', 'mx-4', 'my-6', 'mt-0', '-mt-2',
      'gap-1', 'gap-2', 'gap-3', 'gap-4', 'gap-6', 'gap-8',
      'gap-x-4', 'gap-y-2',
      'space-x-4', 'space-y-2',
    ],
  },
  {
    title: 'Typography',
    color: '#f72585',
    utilities: [
      'text-xs', 'text-sm', 'text-base', 'text-lg', 'text-xl',
      'text-2xl', 'text-3xl', 'text-4xl', 'text-5xl',
      'font-thin', 'font-light', 'font-normal', 'font-medium',
      'font-semibold', 'font-bold', 'font-extrabold',
      'text-left', 'text-center', 'text-right',
      'uppercase', 'lowercase', 'capitalize', 'normal-case',
      'truncate', 'line-clamp-2', 'line-clamp-3',
      'leading-none', 'leading-tight', 'leading-normal', 'leading-relaxed',
      'tracking-tight', 'tracking-normal', 'tracking-wide', 'tracking-widest',
      'italic', 'not-italic', 'underline', 'line-through', 'no-underline',
    ],
  },
  {
    title: 'Colors',
    color: '#ffbe0b',
    utilities: [
      'text-primary', 'text-secondary', 'text-danger', 'text-warning',
      'text-success', 'text-info', 'text-textMuted',
      'bg-bg', 'bg-surface', 'bg-surfaceAlt',
      'border-border', 'border-primary', 'border-secondary',
      'text-white', 'text-black',
      'bg-primary/20', 'bg-secondary/10', 'text-primary/80',
    ],
  },
  {
    title: 'Borders & Radius',
    color: '#06d6a0',
    utilities: [
      'border', 'border-0', 'border-2', 'border-4',
      'border-t', 'border-r', 'border-b', 'border-l',
      'rounded-none', 'rounded-sm', 'rounded', 'rounded-md',
      'rounded-lg', 'rounded-xl', 'rounded-2xl', 'rounded-3xl', 'rounded-full',
      'rounded-t-lg', 'rounded-b-xl',
      'shadow-sm', 'shadow', 'shadow-md', 'shadow-lg', 'shadow-xl', 'shadow-none',
      'ring', 'ring-2', 'ring-4', 'ring-offset-2',
    ],
  },
  {
    title: 'Effects & Transforms',
    color: '#3a86ff',
    utilities: [
      'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',
      'blur-sm', 'blur', 'blur-md', 'blur-lg',
      'scale-90', 'scale-95', 'scale-100', 'scale-105', 'scale-110',
      'rotate-0', 'rotate-45', 'rotate-90', 'rotate-180',
      '-rotate-12', '-rotate-45',
      'translate-x-0', 'translate-x-4', '-translate-x-2',
      'translate-y-0', '-translate-y-2', 'translate-y-full',
      'skew-x-3', 'skew-y-3',
      'origin-center', 'origin-top-left',
    ],
  },
  {
    title: 'Transitions & Animations',
    color: '#cba6f7',
    utilities: [
      'transition', 'transition-colors', 'transition-opacity',
      'transition-transform', 'transition-all', 'transition-none',
      'duration-75', 'duration-100', 'duration-150', 'duration-200',
      'duration-300', 'duration-500', 'duration-700', 'duration-1000',
      'ease-linear', 'ease-in', 'ease-out', 'ease-in-out',
      'delay-75', 'delay-100', 'delay-150', 'delay-300',
      'animate-none', 'animate-spin', 'animate-ping', 'animate-pulse',
      'animate-bounce', 'animate-fade-in',
    ],
  },
  {
    title: 'Variants',
    color: '#fab387',
    utilities: [
      'hover:*', 'focus:*', 'focus-visible:*', 'active:*',
      'disabled:*', 'checked:*', 'selected:*',
      '@sm:*', '@md:*', '@lg:*', '@xl:*', '@2xl:*',
      'dark:*', 'light:*',
      'motion-safe:*', 'motion-reduce:*',
      'contrast-more:*', 'contrast-less:*',
      'forced-colors:*', 'print:*', 'screen:*',
      'group-hover:*', 'peer-checked:*',
    ],
  },
];

// ── CSSSystemPage component ────────────────────────────────────────────────────

export function CSSSystemPage({ theme }: CSSSystemPageProps) {
  const [playgroundInput, setPlaygroundInput] = useState(PLAYGROUND_INITIAL);
  const [playgroundOutput, setPlaygroundOutput] = useState('');
  const [playgroundClass, setPlaygroundClass] = useState('');
  const [activeTab, setActiveTab] = useState('basics');

  const runPlayground = () => {
    try {
      resetAtomicCSS();
      // Parse the tkx() call from the input string
      // Extract the arguments between the outer tkx( ... )
      const inner = playgroundInput
        .replace(/^tkx\s*\(\s*/s, '')
        .replace(/\s*\)\s*$/s, '');

      // Build a safe argument list — split by quoted strings
      const args: string[] = [];
      const regex = /'([^'\\]|\\.)*'|"([^"\\]|\\.)*"/g;
      let match;
      while ((match = regex.exec(inner)) !== null) {
        args.push(match[0].slice(1, -1));
      }

      if (args.length === 0) {
        setPlaygroundOutput('No class strings found. Make sure to use quoted strings.');
        setPlaygroundClass('');
        return;
      }

      const cls = tkx(...args);
      const { css } = extractAtomicCSS();

      setPlaygroundClass(cls);
      setPlaygroundOutput(css);
    } catch (err) {
      setPlaygroundOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
      setPlaygroundClass('');
    }
  };

  const pageStyle: CSSProperties = {
    maxWidth: '960px',
    margin: '0 auto',
    padding: '48px 32px 80px',
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
    margin: 0,
    lineHeight: '1.7',
    maxWidth: '680px',
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
  };

  const descStyle: CSSProperties = {
    fontSize: '14px',
    color: theme.textMuted,
    margin: '0 0 20px',
    lineHeight: '1.7',
  };

  const tabListStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '4px',
    borderBottom: `1px solid ${theme.border}`,
    marginBottom: '24px',
    paddingBottom: '1px',
  };

  const getTabStyle = (id: string): CSSProperties => ({
    padding: '7px 14px',
    borderRadius: '6px 6px 0 0',
    border: 'none',
    backgroundColor: activeTab === id ? theme.surface : 'transparent',
    color: activeTab === id ? theme.primary : theme.textMuted,
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: activeTab === id ? 600 : 400,
    borderBottom: activeTab === id ? `2px solid ${theme.primary}` : '2px solid transparent',
    transition: 'color 0.15s ease',
    fontFamily: 'inherit',
    marginBottom: '-1px',
  });

  const divStyle: CSSProperties = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '0 0 56px',
    opacity: 0.5,
  };

  const utilGridStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: '16px',
  };

  const utilCardStyle = (color: string): CSSProperties => ({
    borderRadius: '10px',
    border: `1px solid ${color}25`,
    backgroundColor: `${color}05`,
    padding: '16px',
    overflow: 'hidden',
  });

  const utilCardTitleStyle = (color: string): CSSProperties => ({
    fontSize: '12px',
    fontWeight: 700,
    color: color,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '10px',
  });

  const utilTagStyle: CSSProperties = {
    display: 'inline-block',
    padding: '2px 7px',
    borderRadius: '4px',
    fontSize: '11px',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    backgroundColor: `${theme.surface}`,
    border: `1px solid ${theme.border}`,
    color: theme.text,
    margin: '2px',
  };

  // Playground styles
  const playgroundStyle: CSSProperties = {
    borderRadius: '12px',
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  };

  const playgroundHeaderStyle: CSSProperties = {
    padding: '12px 16px',
    backgroundColor: theme.surfaceAlt,
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const playgroundTitleStyle: CSSProperties = {
    fontSize: '12px',
    fontWeight: 700,
    color: theme.textMuted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  const runBtnStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: theme.primary,
    color: theme.bg,
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'opacity 0.15s ease',
    fontFamily: 'inherit',
    letterSpacing: '0.02em',
  };

  const textareaStyle: CSSProperties = {
    width: '100%',
    minHeight: '180px',
    padding: '16px',
    backgroundColor: '#0d0d14',
    border: 'none',
    color: '#cdd6f4',
    fontSize: '13px',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    lineHeight: '1.65',
    resize: 'vertical',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const outputAreaStyle: CSSProperties = {
    borderTop: `1px solid ${theme.border}`,
  };

  const outputLabelStyle: CSSProperties = {
    padding: '10px 16px',
    fontSize: '11px',
    fontWeight: 700,
    color: theme.textMuted,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    backgroundColor: theme.surfaceAlt,
    borderBottom: `1px solid ${theme.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const classBadgeStyle: CSSProperties = {
    fontFamily: '"JetBrains Mono", monospace',
    fontSize: '11px',
    color: theme.primary,
    backgroundColor: `${theme.primary}12`,
    padding: '2px 8px',
    borderRadius: '4px',
    border: `1px solid ${theme.primary}25`,
  };

  const outputPreStyle: CSSProperties = {
    margin: 0,
    padding: '16px',
    backgroundColor: '#0d0d14',
    color: '#cdd6f4',
    fontSize: '12px',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    lineHeight: '1.65',
    overflow: 'auto',
    maxHeight: '240px',
    whiteSpace: 'pre',
    minHeight: '80px',
  };

  const TABS = [
    { id: 'basics', label: 'Basics' },
    { id: 'conflict', label: 'Conflict Resolution' },
    { id: 'variants', label: 'Variants' },
    { id: 'spacing', label: 'Spacing' },
    { id: 'typography', label: 'Typography' },
    { id: 'colors', label: 'Colors' },
    { id: 'layout', label: 'Layout' },
    { id: 'borders', label: 'Borders & Effects' },
    { id: 'ssr', label: 'SSR' },
  ];

  const snippetMap: Record<string, { code: string; title: string }> = {
    basics: { code: BASICS_SNIPPET, title: 'tkx, tx, cx API' },
    conflict: { code: CONFLICT_SNIPPET, title: 'Conflict Resolution' },
    variants: { code: VARIANTS_SNIPPET, title: 'Variants' },
    spacing: { code: SPACING_SNIPPET, title: 'Spacing' },
    typography: { code: TYPOGRAPHY_SNIPPET, title: 'Typography' },
    colors: { code: COLORS_SNIPPET, title: 'Colors' },
    layout: { code: LAYOUT_SNIPPET, title: 'Layout' },
    borders: { code: BORDERS_EFFECTS_SNIPPET, title: 'Borders & Effects' },
    ssr: { code: SSR_SNIPPET, title: 'SSR Usage' },
  };

  return (
    <div style={pageStyle}>
      {/* Page header */}
      <div style={pageHeaderStyle}>
        <h1 style={pageTitleStyle}>TKX Atomic CSS Engine</h1>
        <p style={pageDescStyle}>
          TKX is a zero-config, runtime atomic CSS engine that ships with TekiVex UI.
          It solves Tailwind's core limitation — true property-level conflict resolution —
          while adding theme awareness, motion safety, and WCAG integration that
          Tailwind simply cannot provide.
        </p>
      </div>

      {/* Why section */}
      <section style={sectionStyle} aria-labelledby="why-title">
        <h2 id="why-title" style={h2Style}>Why TKX?</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '12px',
            marginBottom: '24px',
          }}
        >
          {[
            {
              num: '1',
              color: theme.primary,
              title: 'True Conflict Resolution',
              desc: 'p-4 + p-8 → padding:32px. Property-level merge. No cascade hacks.',
            },
            {
              num: '2',
              color: theme.secondary,
              title: 'Theme-Aware Tokens',
              desc: 'text-primary auto-follows ThemeContext. Tailwind needs PostCSS for this.',
            },
            {
              num: '3',
              color: theme.success,
              title: 'Motion Safety Built-in',
              desc: 'transition-* silently no-ops when prefers-reduced-motion is set.',
            },
            {
              num: '4',
              color: theme.warning,
              title: 'Zero Build Config',
              desc: 'No tailwind.config.js, no PostCSS, no purge step. Just import and use.',
            },
            {
              num: '5',
              color: theme.info,
              title: 'Single Merged Class',
              desc: 'One class per element. Clean DOM, zero specificity wars, easy debugging.',
            },
            {
              num: '6',
              color: theme.danger,
              title: 'Full TypeScript',
              desc: 'Utility string types with autocomplete. Catch typos at compile time.',
            },
          ].map((item) => (
            <div
              key={item.num}
              style={{
                padding: '16px',
                borderRadius: '10px',
                border: `1px solid ${item.color}20`,
                backgroundColor: `${item.color}05`,
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  backgroundColor: `${item.color}20`,
                  color: item.color,
                  fontSize: '11px',
                  fontWeight: 800,
                  marginBottom: '8px',
                }}
              >
                {item.num}
              </div>
              <div
                style={{ fontSize: '13px', fontWeight: 700, color: theme.text, marginBottom: '4px' }}
              >
                {item.title}
              </div>
              <div style={{ fontSize: '12px', color: theme.textMuted, lineHeight: '1.5' }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Code reference tabs */}
      <section style={sectionStyle} aria-labelledby="reference-title">
        <h2 id="reference-title" style={h2Style}>
          API Reference
        </h2>
        <p style={descStyle}>
          Browse the complete TKX utility reference organized by category.
        </p>

        <div
          style={tabListStyle}
          role="tablist"
          aria-label="TKX API reference categories"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`tabpanel-${tab.id}`}
              id={`tab-${tab.id}`}
              style={getTabStyle(tab.id)}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {Object.entries(snippetMap).map(([id, { code, title }]) => (
          <div
            key={id}
            id={`tabpanel-${id}`}
            role="tabpanel"
            aria-labelledby={`tab-${id}`}
            hidden={activeTab !== id}
          >
            <CodeBlock code={code} language="tsx" showLineNumbers title={title} />
          </div>
        ))}
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Utility quick reference grid */}
      <section style={sectionStyle} aria-labelledby="util-grid-title">
        <h2 id="util-grid-title" style={h2Style}>
          Utility Quick Reference
        </h2>
        <p style={descStyle}>
          All available TKX utilities organized by category. Click any badge to see its
          usage in the API Reference above.
        </p>

        <div style={utilGridStyle}>
          {UTILITY_CATEGORIES.map((cat) => (
            <div key={cat.title} style={utilCardStyle(cat.color)}>
              <div style={utilCardTitleStyle(cat.color)}>{cat.title}</div>
              <div>
                {cat.utilities.map((u) => (
                  <code key={u} style={utilTagStyle}>
                    {u}
                  </code>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Variant system */}
      <section style={sectionStyle} aria-labelledby="variants-title">
        <h2 id="variants-title" style={h2Style}>
          Variant System
        </h2>
        <p style={descStyle}>
          Prepend any variant prefix to a utility. Variants stack — you can combine
          responsive + pseudo-class + accessibility variants on the same utility.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '10px',
          }}
        >
          {[
            { group: 'Pseudo-class', variants: ['hover:', 'focus:', 'focus-visible:', 'active:', 'disabled:', 'checked:', 'placeholder:', 'first:', 'last:', 'odd:', 'even:'] },
            { group: 'Responsive', variants: ['@sm: (≥640px)', '@md: (≥768px)', '@lg: (≥1024px)', '@xl: (≥1280px)', '@2xl: (≥1536px)'] },
            { group: 'Accessibility', variants: ['motion-safe:', 'motion-reduce:', 'contrast-more:', 'contrast-less:', 'forced-colors:', 'print:', 'screen:'] },
            { group: 'Theme', variants: ['dark:', 'light:'] },
          ].map((vg) => (
            <div
              key={vg.group}
              style={{
                padding: '14px',
                borderRadius: '10px',
                border: `1px solid ${theme.border}`,
                backgroundColor: theme.surface,
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: theme.textMuted,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                {vg.group}
              </div>
              {vg.variants.map((v) => (
                <div key={v} style={{ marginBottom: '4px' }}>
                  <code
                    style={{
                      fontSize: '12px',
                      fontFamily: '"JetBrains Mono", monospace',
                      color: theme.primary,
                      backgroundColor: `${theme.primary}10`,
                      padding: '1px 5px',
                      borderRadius: '3px',
                    }}
                  >
                    {v}
                  </code>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Arbitrary values */}
      <section style={sectionStyle} aria-labelledby="arbitrary-title">
        <h2 id="arbitrary-title" style={h2Style}>
          Arbitrary Values
        </h2>
        <p style={descStyle}>
          Escape the scale with square bracket notation. Works for any utility that
          accepts a value: dimensions, colors, durations, calc() expressions, and more.
        </p>
        <CodeBlock
          code={`// Sizes
tkx('w-[420px]', 'h-[calc(100vh-64px)]', 'max-w-[72ch]')

// Colors
tkx('bg-[#1a1a2e]', 'text-[rgba(0,245,212,0.9)]', 'border-[hsl(280,70%,50%)]')

// Timing
tkx('duration-[350ms]', 'delay-[125ms]')

// CSS custom properties
tkx('bg-[var(--brand-bg)]', 'text-[var(--brand-fg)]')

// Combined with variants
tkx('hover:bg-[#ff6b35]', '@md:w-[640px]', 'focus:ring-[3px]')`}
          language="tsx"
          title="Arbitrary Values"
        />
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* ── Recipes: Real-World Patterns ── */}
      <section style={sectionStyle} aria-labelledby="recipes-title">
        <h2 id="recipes-title" style={h2Style}>
          Recipes — Real-World Patterns
        </h2>
        <p style={descStyle}>
          Copy-paste these production patterns. Each recipe shows how to build common UI
          components using only TKX utilities — no custom CSS needed.
        </p>

        {/* Recipe 1: Card Layout */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
            1. Responsive Card Grid
          </div>
          <CodeBlock
            code={`import { tkx } from 'tekivex-ui';

// Container: centers content, responsive padding
const container = tkx('max-w-[1200px] mx-auto px-4 @md:px-6 @lg:px-8');

// Card grid: 1 col mobile → 2 col tablet → 3 col desktop
const grid = tkx('grid gap-6 @sm:grid-cols-2 @lg:grid-cols-3');

// Card: surface bg, border, rounded, hover lift
const card = tkx(
  'bg-surface border border-border rounded-xl p-6',
  'hover:shadow-lg hover:-translate-y-1',
  'transition-all duration-200',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
);

// Card title + description
const title = tkx('text-lg font-bold text-primary mb-2');
const desc = tkx('text-sm text-textMuted leading-relaxed');

function ProductGrid() {
  return (
    <div className={container}>
      <div className={grid}>
        {products.map(p => (
          <div key={p.id} className={card}>
            <h3 className={title}>{p.name}</h3>
            <p className={desc}>{p.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`}
            language="tsx"
            title="Recipe: Responsive Card Grid"
          />
        </div>

        {/* Recipe 2: Form Layout */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
            2. Form with Validation
          </div>
          <CodeBlock
            code={`import { tkx, cx } from 'tekivex-ui';

const form = tkx('flex flex-col gap-5 max-w-[480px]');

const fieldGroup = tkx('flex flex-col gap-1');

const label = tkx('text-sm font-semibold text-textMuted');

// Input: changes border color on focus and error
const input = (hasError: boolean) => tkx(
  'w-full px-4 py-3 rounded-lg bg-surface border text-base',
  'focus:outline-none focus:ring-2 focus:ring-primary/40',
  'placeholder:text-textMuted/50',
  hasError ? 'border-danger focus:ring-danger/40' : 'border-border',
  'disabled:opacity-50 disabled:cursor-not-allowed',
);

const errorText = tkx('text-xs text-danger mt-1');

const submitBtn = tkx(
  'px-6 py-3 rounded-lg bg-primary text-white font-bold',
  'hover:opacity-90 active:scale-[0.98]',
  'disabled:opacity-50 disabled:cursor-not-allowed',
  'transition-all duration-150',
  'motion-reduce:transition-none',
);

function LoginForm() {
  return (
    <form className={form}>
      <div className={fieldGroup}>
        <label className={label}>Email</label>
        <input className={input(false)} placeholder="you@company.com" />
      </div>
      <div className={fieldGroup}>
        <label className={label}>Password</label>
        <input className={input(true)} type="password" />
        <span className={errorText}>Password must be 8+ characters</span>
      </div>
      <button className={submitBtn}>Sign In</button>
    </form>
  );
}`}
            language="tsx"
            title="Recipe: Form with Validation States"
          />
        </div>

        {/* Recipe 3: Navigation Bar */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
            3. Responsive Navigation Bar
          </div>
          <CodeBlock
            code={`import { tkx } from 'tekivex-ui';

const nav = tkx(
  'fixed top-0 left-0 right-0 z-50',
  'flex items-center justify-between',
  'px-4 @md:px-8 py-3',
  'bg-surface/80 backdrop-blur-lg',
  'border-b border-border',
);

const logo = tkx('text-xl font-extrabold text-primary tracking-tight');

// Links: hidden on mobile, flex on desktop
const links = tkx('hidden @md:flex items-center gap-6');

const link = (active: boolean) => tkx(
  'text-sm font-medium transition-colors duration-150',
  active ? 'text-primary' : 'text-textMuted hover:text-primary',
);

// Hamburger: visible on mobile only
const hamburger = tkx(
  'flex @md:hidden items-center justify-center',
  'w-10 h-10 rounded-lg',
  'hover:bg-surfaceAlt',
  'transition-colors',
);

const cta = tkx(
  'px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold',
  'hover:opacity-90 transition-opacity',
);`}
            language="tsx"
            title="Recipe: Responsive Nav Bar"
          />
        </div>

        {/* Recipe 4: Dashboard Stats */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
            4. Dashboard Stat Cards
          </div>
          <CodeBlock
            code={`import { tkx } from 'tekivex-ui';

const statsGrid = tkx('grid grid-cols-2 @lg:grid-cols-4 gap-4');

const statCard = tkx(
  'bg-surface border border-border rounded-xl p-5',
  'hover:border-primary/30 transition-colors',
);

const statLabel = tkx(
  'text-xs font-bold uppercase tracking-widest text-textMuted mb-2',
);

const statValue = tkx(
  'text-2xl @lg:text-3xl font-extrabold text-primary tracking-tight',
);

const statChange = (positive: boolean) => tkx(
  'inline-flex items-center gap-1 mt-2 text-xs font-semibold',
  positive ? 'text-success' : 'text-danger',
);

// Usage
<div className={statsGrid}>
  <div className={statCard}>
    <div className={statLabel}>Revenue</div>
    <div className={statValue}>$48.2K</div>
    <span className={statChange(true)}>↑ 12.5%</span>
  </div>
</div>`}
            language="tsx"
            title="Recipe: Dashboard Stats"
          />
        </div>

        {/* Recipe 5: TKX vs Tailwind comparison */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
            5. TKX vs Tailwind — Side by Side
          </div>
          <CodeBlock
            code={`// ❌ TAILWIND: Conflict — both p-4 and p-8 stay in DOM, cascade decides
<div className="p-4 p-8 bg-white text-black dark:bg-gray-900">
  {/* Which padding wins? Depends on CSS source order — UNPREDICTABLE */}
</div>

// ✅ TKX: True merge — p-8 wins, p-4 is discarded at property level
<div className={tkx('p-4 p-8 bg-white text-black dark:bg-gray-900')}>
  {/* Guaranteed: padding: 32px. Always deterministic. */}
</div>

// ❌ TAILWIND: Need cn() / clsx / tailwind-merge for conditional styles
import { cn } from '../lib/utils'; // extra dependency
<div className={cn('px-4 py-2', isLarge && 'px-6 py-3')}>

// ✅ TKX: Conditional merging is built in — no extra library
<div className={tkx('px-4 py-2', isLarge && 'px-6 py-3')}>

// ❌ TAILWIND: Theme needs PostCSS config + custom colors
// tailwind.config.js → theme.extend.colors.brand → ...

// ✅ TKX: Theme tokens work automatically from React context
<div className={tkx('text-primary bg-surface border-border')}>
  {/* Colors auto-follow ThemeProvider — no config needed */}
</div>

// ❌ TAILWIND: No built-in a11y variants
// Need custom plugins for motion-safe, contrast-more

// ✅ TKX: Accessibility variants are first-class
<div className={tkx(
  'transition-all',
  'motion-reduce:transition-none',  // built-in
  'contrast-more:border-2',         // built-in
  'print:hidden',                    // built-in
)}>
</div>`}
            language="tsx"
            title="TKX vs Tailwind — Why TKX Wins"
          />
        </div>
      </section>

      <div style={divStyle} aria-hidden="true" />

      {/* Live playground */}
      <section aria-labelledby="playground-title">
        <h2 id="playground-title" style={h2Style}>
          Live Playground
        </h2>
        <p style={descStyle}>
          Type a <code style={{ fontFamily: 'monospace', color: theme.primary, fontSize: '13px' }}>tkx()</code> call
          and click Run to see the generated atomic CSS.
        </p>

        <div style={playgroundStyle}>
          <div style={playgroundHeaderStyle}>
            <span style={playgroundTitleStyle}>TKX Playground</span>
            <button
              type="button"
              style={runBtnStyle}
              onClick={runPlayground}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = '0.85')
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.opacity = '1')
              }
            >
              ▶ Run
            </button>
          </div>

          <textarea
            style={textareaStyle}
            value={playgroundInput}
            onChange={(e) => setPlaygroundInput(e.target.value)}
            spellCheck={false}
            aria-label="TKX playground input — enter a tkx() call"
          />

          {(playgroundOutput || playgroundClass) && (
            <div style={outputAreaStyle}>
              <div style={outputLabelStyle}>
                <span>Generated CSS</span>
                {playgroundClass && (
                  <code style={classBadgeStyle}>className="{playgroundClass}"</code>
                )}
              </div>
              <pre style={outputPreStyle} aria-live="polite">
                {playgroundOutput || '/* Click Run to generate CSS */'}
              </pre>
            </div>
          )}

          {!playgroundOutput && !playgroundClass && (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: theme.textMuted,
                fontSize: '13px',
                borderTop: `1px solid ${theme.border}`,
              }}
            >
              Click <strong style={{ color: theme.primary }}>Run</strong> to generate atomic CSS from the expression above.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
