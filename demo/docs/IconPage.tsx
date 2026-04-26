import { type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable, type PropDef } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';
import { CodeBlock } from '../layout/CodeBlock';
import { TkxIcon, ICON_CATEGORIES, type IconName } from '../../src/components/TkxIcon';
import { TkxLogo } from '../../src/components/TkxLogo';

// ── Props ──────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Icon prop definitions ──────────────────────────────────────────────────────

const ICON_PROPS: PropDef[] = [
  {
    name: 'name',
    type: 'IconName',
    description: 'Name of a built-in icon. One of 60+ available icon names organized by category.',
  },
  {
    name: 'size',
    type: 'number | string',
    default: '24',
    description: 'Width and height of the SVG element. Accepts any CSS size (e.g. 32, "2rem", "1.5em").',
  },
  {
    name: 'color',
    type: 'string',
    default: 'currentColor',
    description: 'Stroke/fill color. Accepts a theme token name (e.g. "primary", "danger") or any CSS color value.',
  },
  {
    name: 'strokeWidth',
    type: 'number',
    default: '2',
    description: 'Width of strokes used in outlined (non-filled) icons.',
  },
  {
    name: 'filled',
    type: 'boolean',
    default: 'false',
    description: 'When true, renders icons in filled style instead of the default outlined/stroke style.',
  },
  {
    name: 'label',
    type: 'string',
    description: 'If provided, adds role="img" and aria-label for semantic (non-decorative) usage. If omitted, aria-hidden="true" is set.',
  },
  {
    name: 'children',
    type: 'ReactNode',
    description: 'Custom SVG path content. When provided, overrides the built-in icon paths. Use this to embed any custom SVG inside the TkxIcon wrapper.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS class names applied to the root SVG element.',
  },
  {
    name: 'style',
    type: 'React.CSSProperties',
    description: 'Inline styles applied to the root SVG element.',
  },
];

// ── Logo prop definitions ──────────────────────────────────────────────────────

const LOGO_PROPS: PropDef[] = [
  {
    name: 'text',
    type: 'string',
    default: '"TekiVex"',
    description: 'Brand name text. The last portion is automatically colored with the primary accent.',
  },
  {
    name: 'tagline',
    type: 'string',
    description: 'Optional tagline displayed below the brand name.',
  },
  {
    name: 'variant',
    type: '"full" | "icon-only" | "text-only"',
    default: '"full"',
    description: 'Controls which parts of the logo are rendered: full (mark + text), icon-only, or text-only.',
  },
  {
    name: 'size',
    type: '"sm" | "md" | "lg" | "xl"',
    default: '"md"',
    description: 'Preset size that scales both the mark and typography proportionally.',
  },
  {
    name: 'orientation',
    type: '"horizontal" | "stacked"',
    default: '"horizontal"',
    description: 'Layout direction: horizontal places the mark to the left, stacked places it above the text.',
  },
  {
    name: 'mark',
    type: 'ReactNode',
    description: 'Custom icon/mark to replace the default hexagonal quantum symbol.',
  },
  {
    name: 'color',
    type: 'string',
    description: 'Override the primary color used for the mark and accent text portion.',
  },
  {
    name: 'onClick',
    type: '() => void',
    description: 'Click handler. When provided, the logo becomes interactive with keyboard support.',
  },
  {
    name: 'className',
    type: 'string',
    description: 'Additional CSS class names applied to the root element.',
  },
  {
    name: 'style',
    type: 'React.CSSProperties',
    description: 'Inline styles applied to the root element.',
  },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function SectionTitle({ children, theme }: { children: string; theme: ThemeTokens }) {
  const style: CSSProperties = {
    fontSize: '1.25rem',
    fontWeight: 700,
    color: theme.text,
    margin: '48px 0 8px',
    letterSpacing: '-0.02em',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  };
  const accentStyle: CSSProperties = {
    display: 'inline-block',
    width: 4,
    height: '1.1em',
    borderRadius: 2,
    backgroundColor: theme.primary,
    flexShrink: 0,
  };
  return (
    <h2 style={style}>
      <span style={accentStyle} aria-hidden="true" />
      {children}
    </h2>
  );
}

function Divider({ theme }: { theme: ThemeTokens }) {
  return (
    <hr
      style={{
        border: 'none',
        borderTop: `1px solid ${theme.border}`,
        margin: '40px 0',
      }}
    />
  );
}

// Icon gallery cell
function IconCell({ name, theme }: { name: IconName; theme: ThemeTokens }) {
  const cellStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '12px 8px',
    borderRadius: 8,
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    cursor: 'default',
    minWidth: 72,
    transition: 'border-color 0.15s ease, background-color 0.15s ease',
  };
  const labelStyle: CSSProperties = {
    fontSize: 10,
    color: theme.textMuted,
    textAlign: 'center',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    wordBreak: 'break-all',
    lineHeight: 1.3,
  };
  return (
    <div
      style={cellStyle}
      title={name}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = theme.primary + '60';
        (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.primary + '0a';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor = theme.border;
        (e.currentTarget as HTMLDivElement).style.backgroundColor = theme.surfaceAlt;
      }}
    >
      <TkxIcon name={name} size={20} color={theme.text} />
      <span style={labelStyle}>{name}</span>
    </div>
  );
}

// Category section within the icon gallery
function CategoryBlock({ category, names, theme }: { category: string; names: IconName[]; theme: ThemeTokens }) {
  const headStyle: CSSProperties = {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: theme.textMuted,
    margin: '0 0 10px',
  };
  const gridStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
  };
  return (
    <div style={{ marginBottom: 24 }}>
      <p style={headStyle}>{category}</p>
      <div style={gridStyle}>
        {names.map((name) => (
          <IconCell key={name} name={name} theme={theme} />
        ))}
      </div>
    </div>
  );
}

// ── IconPage ───────────────────────────────────────────────────────────────────

export function IconPage({ theme }: Props) {
  const pageStyle: CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  const h1Style: CSSProperties = {
    fontSize: '2.25rem',
    fontWeight: 800,
    color: theme.text,
    margin: '0 0 12px',
    letterSpacing: '-0.04em',
    lineHeight: 1.1,
  };

  const descStyle: CSSProperties = {
    fontSize: '15px',
    color: theme.textMuted,
    lineHeight: '1.7',
    maxWidth: 620,
    margin: '0 0 24px',
  };

  const heroBadgeStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 12px',
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    backgroundColor: theme.primary + '18',
    color: theme.primary,
    border: '1px solid ' + theme.primary + '35',
    marginBottom: 20,
  };

  const calloutStyle: CSSProperties = {
    backgroundColor: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderLeft: `3px solid ${theme.info}`,
    borderRadius: 8,
    padding: '14px 18px',
    fontSize: 13.5,
    color: theme.textMuted,
    lineHeight: 1.6,
    margin: '0 0 32px',
  };

  const propSectionStyle: CSSProperties = {
    marginTop: 40,
  };

  const propHeadStyle: CSSProperties = {
    fontSize: '1rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 12px',
    letterSpacing: '-0.01em',
  };

  // ── Icon gallery (all categories) ─────────────────────────────────────────

  const allIconsGallery = (
    <div style={{ width: '100%' }}>
      {Object.entries(ICON_CATEGORIES).map(([category, names]) => (
        <CategoryBlock
          key={category}
          category={category}
          names={names}
          theme={theme}
        />
      ))}
    </div>
  );

  // ── Icon sizes ─────────────────────────────────────────────────────────────

  const sizesDemo = (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 20, flexWrap: 'wrap' }}>
      {([16, 20, 24, 32, 48] as const).map((sz) => (
        <div key={sz} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <TkxIcon name="star" size={sz} color={theme.primary} />
          <span style={{ fontSize: 10, color: theme.textMuted, fontFamily: 'monospace' }}>{sz}px</span>
        </div>
      ))}
    </div>
  );

  // ── Icon colors ────────────────────────────────────────────────────────────

  type ColorToken = keyof ThemeTokens;
  const colorTokens: { token: ColorToken; label: string }[] = [
    { token: 'primary', label: 'primary' },
    { token: 'secondary', label: 'secondary' },
    { token: 'danger', label: 'danger' },
    { token: 'warning', label: 'warning' },
    { token: 'success', label: 'success' },
    { token: 'info', label: 'info' },
    { token: 'text', label: 'text' },
    { token: 'textMuted', label: 'textMuted' },
  ];

  const colorsDemo = (
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
      {colorTokens.map(({ token, label }) => (
        <div key={token} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <TkxIcon name="heart" size={24} color={token} />
          <span style={{ fontSize: 10, color: theme.textMuted, fontFamily: 'monospace' }}>{label}</span>
        </div>
      ))}
    </div>
  );

  // ── Semantic vs decorative ─────────────────────────────────────────────────

  const semanticDemo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TkxIcon name="check-circle" size={20} color={theme.success} />
        <span style={{ fontSize: 14, color: theme.textMuted }}>
          Decorative icon — <code style={{ color: theme.primary, fontSize: 12 }}>aria-hidden="true"</code> (no label prop)
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TkxIcon name="alert-triangle" size={20} color={theme.warning} label="Warning" />
        <span style={{ fontSize: 14, color: theme.textMuted }}>
          Semantic icon — <code style={{ color: theme.primary, fontSize: 12 }}>role="img" aria-label="Warning"</code> (label prop set)
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <TkxIcon name="info-circle" size={20} color={theme.info} label="Information" />
        <span style={{ fontSize: 14, color: theme.textMuted }}>
          Semantic icon — <code style={{ color: theme.primary, fontSize: 12 }}>role="img" aria-label="Information"</code>
        </span>
      </div>
    </div>
  );

  // ── Filled vs outlined ─────────────────────────────────────────────────────

  const filledIcons: IconName[] = ['star', 'heart', 'bookmark', 'play', 'shield', 'bell'];

  const filledDemo = (
    <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textMuted }}>
          Outlined (default)
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          {filledIcons.map((name) => (
            <TkxIcon key={name} name={name} size={24} color={theme.primary} filled={false} />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: theme.textMuted }}>
          Filled
        </span>
        <div style={{ display: 'flex', gap: 12 }}>
          {filledIcons.map((name) => (
            <TkxIcon key={name} name={name} size={24} color={theme.primary} filled={true} />
          ))}
        </div>
      </div>
    </div>
  );

  // ── Logo full variant ──────────────────────────────────────────────────────

  const logoFullDemo = (
    <div style={{ padding: '16px 0' }}>
      <TkxLogo size="lg" tagline="Quantum UI System" />
    </div>
  );

  // ── Logo variants ──────────────────────────────────────────────────────────

  const logoVariantsDemo = (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <TkxLogo variant="full" />
        <span style={{ fontSize: 11, color: theme.textMuted }}>full</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <TkxLogo variant="icon-only" />
        <span style={{ fontSize: 11, color: theme.textMuted }}>icon-only</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <TkxLogo variant="text-only" />
        <span style={{ fontSize: 11, color: theme.textMuted }}>text-only</span>
      </div>
    </div>
  );

  // ── Logo sizes ─────────────────────────────────────────────────────────────

  const logoSizesDemo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map((sz) => (
        <div key={sz} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <TkxLogo size={sz} />
          <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: 'monospace' }}>size="{sz}"</span>
        </div>
      ))}
    </div>
  );

  // ── Logo stacked orientation ───────────────────────────────────────────────

  const logoStackedDemo = (
    <div style={{ display: 'flex', gap: 48, flexWrap: 'wrap', alignItems: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <TkxLogo orientation="horizontal" tagline="Quantum UI" />
        <span style={{ fontSize: 11, color: theme.textMuted }}>horizontal</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <TkxLogo orientation="stacked" tagline="Quantum UI" />
        <span style={{ fontSize: 11, color: theme.textMuted }}>stacked</span>
      </div>
    </div>
  );

  // ── Custom brand example ───────────────────────────────────────────────────

  const customMark = (
    <svg width={36} height={36} viewBox="0 0 36 36" fill="none" aria-hidden="true">
      <rect width="36" height="36" rx="8" fill={theme.secondary + '20'} />
      <circle cx="18" cy="18" r="8" stroke={theme.secondary} strokeWidth="2" fill="none" />
      <circle cx="18" cy="18" r="3" fill={theme.secondary} />
      <line x1="18" y1="4" x2="18" y2="10" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="26" x2="18" y2="32" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
      <line x1="4" y1="18" x2="10" y2="18" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="18" x2="32" y2="18" stroke={theme.secondary} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );

  const customBrandDemo = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <TkxLogo
        text="AstroFlow"
        tagline="Design System"
        mark={customMark}
        color={theme.secondary}
        size="md"
      />
      <TkxLogo
        text="NovaSpark"
        tagline="Component Library"
        color={theme.warning}
        size="md"
      />
    </div>
  );

  // ── Logo in navbar ─────────────────────────────────────────────────────────

  const navbarDemo = (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 20px',
        backgroundColor: theme.surfaceAlt,
        borderRadius: 10,
        border: `1px solid ${theme.border}`,
        width: '100%',
        boxSizing: 'border-box',
      }}
      aria-label="Example navigation bar"
    >
      <TkxLogo size="sm" />
      <div style={{ display: 'flex', gap: 8 }}>
        {['Docs', 'Components', 'Themes', 'GitHub'].map((item) => (
          <span
            key={item}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: theme.textMuted,
              cursor: 'pointer',
            }}
          >
            {item}
          </span>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <TkxIcon name="search" size={16} color={theme.textMuted} />
        <TkxIcon name="moon" size={16} color={theme.textMuted} />
      </div>
    </nav>
  );

  // ── Custom icon children example ───────────────────────────────────────────

  const customChildrenDemo = (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
      <TkxIcon size={32} color={theme.primary} label="Custom diamond icon">
        <polygon
          points="12 2 22 12 12 22 2 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="3" fill="currentColor" />
      </TkxIcon>
      <TkxIcon size={32} color={theme.secondary} label="Custom target icon">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="12" cy="12" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <line x1="12" y1="2" x2="12" y2="5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="12" y1="19" x2="12" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="2" y1="12" x2="5" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="19" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </TkxIcon>
      <span style={{ fontSize: 13, color: theme.textMuted, lineHeight: 1.5 }}>
        Custom SVG paths passed as children inherit the wrapper's ARIA and sizing props.
      </span>
    </div>
  );

  return (
    <div style={pageStyle}>
      {/* ── Hero ────────────────────────────────────────────────────────────── */}
      <span style={heroBadgeStyle}>
        <TkxIcon name="grid" size={12} color={theme.primary} />
        Component Docs
      </span>
      <h1 style={h1Style}>Icons &amp; Logo</h1>
      <p style={descStyle}>
        <strong>TkxIcon</strong> ships 60+ built-in SVG icons as pure path data — no icon font,
        no external sprite, no network request. Fully themeable, WCAG-compliant, and composable
        with custom SVG children. <strong>TkxLogo</strong> provides a configurable brand mark
        for TekiVex or any custom product.
      </p>

      <WCAGBadgeGroup
        badges={[
          { criterion: '1.1.1 Non-text Content', level: 'AA', status: 'PASS' },
          { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      <p style={{ ...calloutStyle, marginTop: 24 }}>
        Decorative icons automatically get <code style={{ color: theme.primary }}>aria-hidden="true"</code>.
        Pass a <code style={{ color: theme.primary }}>label</code> prop to promote an icon to semantic,
        adding <code style={{ color: theme.primary }}>role="img"</code> and an accessible name.
      </p>

      {/* ── Icon Gallery ────────────────────────────────────────────────────── */}
      <SectionTitle theme={theme}>TkxIcon</SectionTitle>

      <DemoSection
        title="Icon Gallery"
        description="All 60+ built-in icons organized by category. Hover to highlight."
        code={`import { TkxIcon } from 'tekivex-ui';

// Basic usage
<TkxIcon name="home" size={24} />

// With color token
<TkxIcon name="star" size={24} color="primary" />

// Semantic (non-decorative)
<TkxIcon name="alert-triangle" size={24} color="warning" label="Warning" />`}
        theme={theme}
      >
        {allIconsGallery}
      </DemoSection>

      {/* ── Sizes ───────────────────────────────────────────────────────────── */}
      <DemoSection
        title="Icon Sizes"
        description="Use any number or CSS string for the size prop. Common sizes are 16, 20, 24, 32, and 48."
        code={`<TkxIcon name="star" size={16} color="primary" />
<TkxIcon name="star" size={20} color="primary" />
<TkxIcon name="star" size={24} color="primary" />
<TkxIcon name="star" size={32} color="primary" />
<TkxIcon name="star" size={48} color="primary" />

// CSS string sizes also work
<TkxIcon name="star" size="1.5em" color="primary" />
<TkxIcon name="star" size="2rem" color="primary" />`}
        theme={theme}
      >
        {sizesDemo}
      </DemoSection>

      {/* ── Colors ──────────────────────────────────────────────────────────── */}
      <DemoSection
        title="Icon Colors — Theme Tokens"
        description="Pass a theme token name as the color prop and TkxIcon resolves it to the current theme value automatically."
        code={`// Theme token names
<TkxIcon name="heart" color="primary" />
<TkxIcon name="heart" color="secondary" />
<TkxIcon name="heart" color="danger" />
<TkxIcon name="heart" color="warning" />
<TkxIcon name="heart" color="success" />
<TkxIcon name="heart" color="info" />

// Also accepts any CSS color
<TkxIcon name="heart" color="#ff6b6b" />
<TkxIcon name="heart" color="rgba(0, 245, 212, 0.8)" />`}
        theme={theme}
      >
        {colorsDemo}
      </DemoSection>

      {/* ── Semantic vs decorative ───────────────────────────────────────────── */}
      <DemoSection
        title="Semantic vs Decorative"
        description="Icons without a label are aria-hidden (decorative). Set label to provide an accessible name for screen readers."
        code={`// Decorative — aria-hidden="true" (default, no label)
<TkxIcon name="check-circle" color="success" />

// Semantic — role="img" aria-label="Warning"
<TkxIcon name="alert-triangle" color="warning" label="Warning" />

// In a button context — icon is decorative, button has its own label
<button aria-label="Delete item">
  <TkxIcon name="trash" color="danger" />
</button>`}
        theme={theme}
      >
        {semanticDemo}
      </DemoSection>

      {/* ── Filled vs outlined ──────────────────────────────────────────────── */}
      <DemoSection
        title="Filled vs Outlined"
        description="Toggle the filled prop to switch between stroke-based (outlined) and fill-based rendering."
        code={`// Outlined (default)
<TkxIcon name="star" color="primary" filled={false} />

// Filled
<TkxIcon name="star" color="primary" filled={true} />

// Works on all icon types
<TkxIcon name="heart" color="danger" filled />
<TkxIcon name="bookmark" color="primary" filled />`}
        theme={theme}
      >
        {filledDemo}
      </DemoSection>

      {/* ── Custom SVG children ──────────────────────────────────────────────── */}
      <DemoSection
        title="Custom SVG Children"
        description="Pass any SVG content as children. TkxIcon provides the wrapper with correct viewBox, sizing, and ARIA attributes."
        code={`// Pass custom SVG paths as children
<TkxIcon size={32} color="primary" label="Custom diamond icon">
  <polygon
    points="12 2 22 12 12 22 2 12"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinejoin="round"
  />
  <circle cx="12" cy="12" r="3" fill="currentColor" />
</TkxIcon>`}
        theme={theme}
      >
        {customChildrenDemo}
      </DemoSection>

      {/* ── TkxIcon PropTable ────────────────────────────────────────────────── */}
      <div style={propSectionStyle}>
        <h3 style={propHeadStyle}>TkxIcon Props</h3>
        <PropTable props={ICON_PROPS} />
      </div>

      <Divider theme={theme} />

      {/* ── TkxLogo ─────────────────────────────────────────────────────────── */}
      <SectionTitle theme={theme}>TkxLogo</SectionTitle>

      {/* Full variant */}
      <DemoSection
        title="Default Logo"
        description="The default TekiVex logo with a hexagonal quantum mark, brand name, and optional tagline."
        code={`import { TkxLogo } from 'tekivex-ui';

<TkxLogo />

// With tagline
<TkxLogo tagline="Quantum UI System" size="lg" />`}
        theme={theme}
      >
        {logoFullDemo}
      </DemoSection>

      {/* Variants */}
      <DemoSection
        title="Logo Variants"
        description='Three variants control which parts of the logo are visible: "full", "icon-only", and "text-only".'
        code={`<TkxLogo variant="full" />
<TkxLogo variant="icon-only" />
<TkxLogo variant="text-only" />`}
        theme={theme}
      >
        {logoVariantsDemo}
      </DemoSection>

      {/* Sizes */}
      <DemoSection
        title="Logo Sizes"
        description="Four preset sizes scale both the mark and typography proportionally."
        code={`<TkxLogo size="sm" />
<TkxLogo size="md" />
<TkxLogo size="lg" />
<TkxLogo size="xl" />`}
        theme={theme}
      >
        {logoSizesDemo}
      </DemoSection>

      {/* Orientation */}
      <DemoSection
        title="Orientation"
        description='Choose between "horizontal" (mark left of text) and "stacked" (mark above text) layouts.'
        code={`<TkxLogo orientation="horizontal" tagline="Quantum UI" />
<TkxLogo orientation="stacked" tagline="Quantum UI" />`}
        theme={theme}
      >
        {logoStackedDemo}
      </DemoSection>

      {/* Custom brand */}
      <DemoSection
        title="Custom Brand"
        description="Override the text, color, and mark to create a completely custom logo for any product."
        code={`// Custom mark SVG
const myMark = (
  <svg width={36} height={36} viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="rgba(123, 47, 247, 0.12)" />
    <circle cx="18" cy="18" r="8" stroke="#7b2ff7" strokeWidth="2" fill="none" />
    <circle cx="18" cy="18" r="3" fill="#7b2ff7" />
  </svg>
);

<TkxLogo
  text="AstroFlow"
  tagline="Design System"
  mark={myMark}
  color="#7b2ff7"
/>`}
        theme={theme}
      >
        {customBrandDemo}
      </DemoSection>

      {/* Navbar example */}
      <DemoSection
        title="Logo in a Navbar"
        description="A real-world usage example: TkxLogo in a responsive navigation bar alongside TkxIcon actions."
        code={`<nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px' }}>
  <TkxLogo size="sm" />

  <div style={{ display: 'flex', gap: 8 }}>
    {['Docs', 'Components', 'Themes', 'GitHub'].map((item) => (
      <a key={item} href="#">{item}</a>
    ))}
  </div>

  <div style={{ display: 'flex', gap: 8 }}>
    <TkxIcon name="search" size={16} />
    <TkxIcon name="moon" size={16} />
  </div>
</nav>`}
        theme={theme}
      >
        {navbarDemo}
      </DemoSection>

      {/* ── TkxLogo PropTable ────────────────────────────────────────────────── */}
      <div style={propSectionStyle}>
        <h3 style={propHeadStyle}>TkxLogo Props</h3>
        <PropTable props={LOGO_PROPS} />
      </div>

      <Divider theme={theme} />

      {/* ── Custom Icons Guide ───────────────────────────────────────────────── */}
      <SectionTitle theme={theme}>Using Custom Icons</SectionTitle>

      <p style={{ ...descStyle, marginBottom: 20 }}>
        When you need an icon not in the built-in set, pass SVG content as children.
        TkxIcon handles the wrapper, viewBox (0 0 24 24), dimensions, and ARIA attributes for you.
        Use <code style={{ color: theme.primary, fontSize: 13 }}>currentColor</code> in paths to
        inherit the resolved color.
      </p>

      <CodeBlock
        code={`import { TkxIcon } from 'tekivex-ui';

// 1. Custom path as children
<TkxIcon size={24} color="primary" label="Quantum ring">
  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
  <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.4" />
  <path d="M12 3 L12 21 M3 12 L21 12" stroke="currentColor" strokeWidth="1" opacity="0.4" />
</TkxIcon>

// 2. Reusable custom icon component
function QuantumIcon(props: Omit<TkxIconProps, 'children'>) {
  return (
    <TkxIcon {...props}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="4" fill="currentColor" opacity="0.4" />
    </TkxIcon>
  );
}

// 3. Inline in a button (decorative — button itself carries the label)
<button aria-label="Quantum action">
  <TkxIcon size={16} color="primary">
    <path d="M12 2L19 7V17L12 22L5 17V7L12 2Z"
      stroke="currentColor" strokeWidth="2" fill="none" />
  </TkxIcon>
</button>`}
        language="tsx"
        title="Custom icon patterns"
        showLineNumbers
      />
    </div>
  );
}
