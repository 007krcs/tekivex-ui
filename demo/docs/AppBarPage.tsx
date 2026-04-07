import { type CSSProperties, type ReactNode } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxAppBar } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Sample icons ─────────────────────────────────────────────────────────────

function LogoIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="4" stroke={color} strokeWidth={2} />
      <path d="M8 12h8M12 8v8" stroke={color} strokeWidth={2} strokeLinecap="round" />
    </svg>
  );
}

function SearchIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function BellIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function UserIcon({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Helper: icon button ──────────────────────────────────────────────────────

function IconBtn({ children, theme }: { children: ReactNode; theme: ThemeTokens }) {
  return (
    <button
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 6,
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-label="action"
    >
      {children}
    </button>
  );
}

// ── AppBarPage ───────────────────────────────────────────────────────────────

export function AppBarPage({ theme }: Props) {
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
    letterSpacing: '-0.03em',
    lineHeight: 1.15,
  };

  const leadStyle: CSSProperties = {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 1.75,
    maxWidth: 640,
    margin: '0 0 48px',
  };

  const dividerStyle: CSSProperties = {
    border: 'none',
    borderTop: `1px solid ${theme.border}`,
    margin: '40px 0',
  };

  const sectionHeadStyle: CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 700,
    color: theme.text,
    margin: '0 0 16px',
    letterSpacing: '-0.02em',
  };

  const demoBoxStyle: CSSProperties = {
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    overflow: 'hidden',
    backgroundColor: theme.surfaceAlt,
  };

  const actionsRow = (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      <IconBtn theme={theme}><SearchIcon color={theme.text} /></IconBtn>
      <IconBtn theme={theme}><BellIcon color={theme.text} /></IconBtn>
      <IconBtn theme={theme}><UserIcon color={theme.text} /></IconBtn>
    </div>
  );

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <h1 style={h1Style}>TkxAppBar</h1>
      <p style={leadStyle}>
        A top application bar component supporting logo, title, navigation, and
        action slots. Comes in three visual variants — default, transparent, and
        elevated — with fixed, sticky, or static positioning.
      </p>

      {/* ── Default ── */}
      <DemoSection
        title="Default App Bar"
        description="The default variant renders a solid bar with the surface background. Pass logo, title, and actions props to populate each slot."
        theme={theme}
        code={`<TkxAppBar
  logo={<LogoIcon color={theme.primary} />}
  title="My Application"
  actions={
    <div style={{ display: 'flex', gap: 4 }}>
      <IconButton><SearchIcon /></IconButton>
      <IconButton><BellIcon /></IconButton>
      <IconButton><UserIcon /></IconButton>
    </div>
  }
  position="static"
/>`}
      >
        <div style={demoBoxStyle}>
          <TkxAppBar
            logo={<LogoIcon color={theme.primary} />}
            title="My Application"
            actions={actionsRow}
            position="static"
          />
          <div style={{ padding: 24, fontSize: 13, color: theme.textMuted }}>
            Page content below the app bar.
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Transparent ── */}
      <DemoSection
        title="Transparent Variant"
        description="The transparent variant removes the background, suitable for overlaying on hero images or gradient sections."
        theme={theme}
        code={`<TkxAppBar
  variant="transparent"
  title="TekiVex"
  actions={actions}
  position="static"
/>`}
      >
        <div style={{
          ...demoBoxStyle,
          background: `linear-gradient(135deg, ${theme.primary}30, ${theme.primary}08)`,
        }}>
          <TkxAppBar
            variant="transparent"
            logo={<LogoIcon color={theme.primary} />}
            title="TekiVex"
            actions={actionsRow}
            position="static"
          />
          <div style={{ padding: 24, fontSize: 13, color: theme.textMuted }}>
            Hero section content with transparent app bar overlay.
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Elevated ── */}
      <DemoSection
        title="Elevated Variant"
        description="The elevated variant adds a shadow beneath the bar to visually separate it from scrollable content."
        theme={theme}
        code={`<TkxAppBar
  variant="elevated"
  logo={<LogoIcon color={theme.primary} />}
  title="Dashboard"
  actions={actions}
  position="static"
/>`}
      >
        <div style={demoBoxStyle}>
          <TkxAppBar
            variant="elevated"
            logo={<LogoIcon color={theme.primary} />}
            title="Dashboard"
            actions={actionsRow}
            position="static"
          />
          <div style={{ padding: 24, fontSize: 13, color: theme.textMuted }}>
            Page content with an elevated app bar casting a shadow above.
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'title', type: 'ReactNode', description: 'Title text or element displayed in the center-left area of the bar.' },
            { name: 'logo', type: 'ReactNode', description: 'Logo element rendered at the leading edge of the bar.' },
            { name: 'actions', type: 'ReactNode', description: 'Action elements (buttons, icons) rendered at the trailing edge.' },
            { name: 'navigation', type: 'ReactNode', description: 'Navigation element (e.g., hamburger menu) rendered before the logo.' },
            { name: 'position', type: '"fixed" | "sticky" | "static"', default: '"fixed"', description: 'CSS positioning behavior of the app bar.' },
            { name: 'variant', type: '"default" | "transparent" | "elevated"', default: '"default"', description: 'Visual style variant. Default uses a solid background, transparent removes it, elevated adds a shadow.' },
            { name: 'color', type: '"primary" | "surface"', default: '"surface"', description: 'Background color scheme applied to the bar.' },
          ]}
        />
      </section>
    </div>
  );
}
