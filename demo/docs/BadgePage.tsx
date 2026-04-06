import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxBadge,
  TkxButton,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const BADGE_PROPS = [
  { name: 'variant', type: "'default' | 'primary' | 'secondary' | 'danger' | 'warning' | 'success' | 'info'", default: "'default'", description: 'Semantic color variant. Colors are sourced from the active theme tokens.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls font size, padding, and minimum height of the badge pill.' },
  { name: 'dot', type: 'boolean', default: 'false', description: 'Renders a circle dot instead of text content. Size is controlled by the size prop.' },
  { name: 'pulse', type: 'boolean', default: 'false', description: 'Adds a CSS pulse animation. Respects prefers-reduced-motion. Useful for live/active states.' },
  { name: 'outlined', type: 'boolean', default: 'false', description: 'Renders with a transparent background and colored border/text instead of a filled background.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of variant styles.' },
  { name: '...rest', type: 'HTMLAttributes<HTMLSpanElement>', default: '—', description: 'All standard span attributes forwarded to the root element (aria-label, role, etc.).' },
];

// ── All variants list ─────────────────────────────────────────────────────────

const ALL_VARIANTS = ['default', 'primary', 'secondary', 'danger', 'warning', 'success', 'info'] as const;

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconBell({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function IconInbox({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function BadgePage({ theme }: { theme: ThemeTokens }) {
  const [notifCount, setNotifCount] = useState(3);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
    display: 'flex' as const,
    alignItems: 'center',
    gap: '6px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  // Contrast reference for WCAG notes
  const contrastNotes: Array<{ variant: string; bg: string; note: string }> = [
    { variant: 'default', bg: theme.border, note: 'Foreground auto-selected for ≥ 7:1 contrast.' },
    { variant: 'primary', bg: theme.primary, note: 'White or black chosen for AAA contrast.' },
    { variant: 'secondary', bg: theme.secondary, note: 'White or black chosen for AAA contrast.' },
    { variant: 'danger', bg: theme.danger, note: 'Critical — white foreground typically passes AAA.' },
    { variant: 'warning', bg: theme.warning, note: 'Warning — black foreground used for most yellows.' },
    { variant: 'success', bg: theme.success, note: 'Success green — foreground auto-selected.' },
    { variant: 'info', bg: theme.info, note: 'Informational blue — foreground auto-selected.' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '1.4.1 Use of Color', level: 'AA', status: 'PASS' },
            { criterion: '2.5.3 Label in Name', level: 'AA', status: 'PASS' },
            { criterion: '4.1.3 Status Messages', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxBadge
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A compact label component for status, counts, categories, and indicators. Supports seven
        semantic variants, three sizes, filled and outlined styles, dot mode, and pulse animation.
        Foreground colors are auto-calculated for AAA contrast against every variant background.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Badge renders as a{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>{'<span>'}</code>.
        For status announcements add{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>role="status"</code>.
        Dot badges require an{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>aria-label</code>{' '}
        since they have no visible text content.
      </p>

      {/* ── 1. All Variants ── */}
      <DemoSection
        title="All Variants"
        description="Seven semantic variants mapped to theme token colors. The text foreground is auto-computed by getAccessibleForeground() to guarantee WCAG AAA contrast against each background."
        theme={theme}
        code={`<TkxBadge variant="default">Default</TkxBadge>
<TkxBadge variant="primary">Primary</TkxBadge>
<TkxBadge variant="secondary">Secondary</TkxBadge>
<TkxBadge variant="danger">Danger</TkxBadge>
<TkxBadge variant="warning">Warning</TkxBadge>
<TkxBadge variant="success">Success</TkxBadge>
<TkxBadge variant="info">Info</TkxBadge>`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {ALL_VARIANTS.map((v) => (
            <TkxBadge key={v} variant={v} style={{ textTransform: 'capitalize' }}>
              {v}
            </TkxBadge>
          ))}
        </div>
      </DemoSection>

      {/* ── 2. Outlined Style ── */}
      <DemoSection
        title="Outlined Style"
        description="outlined=true renders with a transparent background and 1px border using the variant color. The text also inherits the variant color. Useful on white/light backgrounds where filled badges are too heavy."
        theme={theme}
        code={`<TkxBadge variant="default" outlined>Default</TkxBadge>
<TkxBadge variant="primary" outlined>Primary</TkxBadge>
<TkxBadge variant="secondary" outlined>Secondary</TkxBadge>
<TkxBadge variant="danger" outlined>Danger</TkxBadge>
<TkxBadge variant="warning" outlined>Warning</TkxBadge>
<TkxBadge variant="success" outlined>Success</TkxBadge>
<TkxBadge variant="info" outlined>Info</TkxBadge>`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {ALL_VARIANTS.map((v) => (
            <TkxBadge key={v} variant={v} outlined style={{ textTransform: 'capitalize' }}>
              {v}
            </TkxBadge>
          ))}
        </div>
      </DemoSection>

      {/* ── 3. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three size presets: sm (12px text, 16px min-height), md (12px text, 20px min-height — default), lg (14px text, 24px min-height). Use sm for table cells and tight UIs, lg for hero labels."
        theme={theme}
        code={`<TkxBadge size="sm" variant="primary">sm — Small</TkxBadge>
<TkxBadge size="md" variant="primary">md — Medium (default)</TkxBadge>
<TkxBadge size="lg" variant="primary">lg — Large</TkxBadge>`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <TkxBadge size="sm" variant="primary">sm — Small</TkxBadge>
          <TkxBadge size="md" variant="primary">md — Medium (default)</TkxBadge>
          <TkxBadge size="lg" variant="primary">lg — Large</TkxBadge>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginTop: '12px' }}>
          <TkxBadge size="sm" variant="danger" outlined>sm outlined</TkxBadge>
          <TkxBadge size="md" variant="danger" outlined>md outlined</TkxBadge>
          <TkxBadge size="lg" variant="danger" outlined>lg outlined</TkxBadge>
        </div>
      </DemoSection>

      {/* ── 4. Dot Badges ── */}
      <DemoSection
        title="Dot Badges"
        description="dot=true renders a filled circle using the variant's background color. The children string is used as aria-label for screen reader accessibility. Sizes: sm (6px), md (8px), lg (10px)."
        theme={theme}
        code={`// Provide children as the accessible label
<TkxBadge dot variant="success">Online</TkxBadge>
<TkxBadge dot variant="danger">Offline</TkxBadge>
<TkxBadge dot variant="warning">Away</TkxBadge>
<TkxBadge dot variant="default">Unknown</TkxBadge>

// Size variants
<TkxBadge dot size="sm" variant="primary">Small dot</TkxBadge>
<TkxBadge dot size="md" variant="primary">Medium dot</TkxBadge>
<TkxBadge dot size="lg" variant="primary">Large dot</TkxBadge>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            {(['success', 'danger', 'warning', 'default', 'primary', 'info'] as const).map((v) => (
              <div key={v} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <TkxBadge dot variant={v} size="md">
                  {v.charAt(0).toUpperCase() + v.slice(1)}
                </TkxBadge>
                <span style={{ fontSize: '13px', color: theme.textMuted, textTransform: 'capitalize' }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>Sizes:</span>
            <TkxBadge dot size="sm" variant="primary">Small</TkxBadge>
            <TkxBadge dot size="md" variant="primary">Medium</TkxBadge>
            <TkxBadge dot size="lg" variant="primary">Large</TkxBadge>
          </div>
        </div>
      </DemoSection>

      {/* ── 5. Pulse Animation ── */}
      <DemoSection
        title="Pulse Animation"
        description="pulse=true adds a CSS pulse (opacity) animation. Suppressed when prefers-reduced-motion is enabled. Ideal for live, recording, or real-time indicators."
        theme={theme}
        code={`// Filled pulse badges
<TkxBadge variant="danger" pulse>● Live</TkxBadge>
<TkxBadge variant="success" pulse>● Recording</TkxBadge>
<TkxBadge variant="warning" pulse>● Processing</TkxBadge>

// Dot pulse
<TkxBadge dot variant="success" pulse>Active</TkxBadge>
<TkxBadge dot variant="danger" pulse>Recording</TkxBadge>`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <TkxBadge variant="danger" pulse>● Live</TkxBadge>
          <TkxBadge variant="success" pulse>● Recording</TkxBadge>
          <TkxBadge variant="warning" pulse>● Processing</TkxBadge>
          <TkxBadge variant="info" pulse>● Syncing</TkxBadge>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: '8px' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>Dot pulse:</span>
            <TkxBadge dot variant="success" pulse>Active</TkxBadge>
            <TkxBadge dot variant="danger" pulse>Recording</TkxBadge>
          </div>
        </div>
      </DemoSection>

      {/* ── 6. On Avatars ── */}
      <DemoSection
        title="On Avatars"
        description="Overlay a dot badge on an avatar using position: relative on the container and position: absolute on the badge. The aria-label on the dot badge describes the user's status."
        theme={theme}
        code={`// Position wrapper around avatar + dot
function AvatarWithStatus({ name, status, color }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Avatar circle */}
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        backgroundColor: theme.primary,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', fontWeight: 700, color: '#fff',
      }}>
        {name[0]}
      </div>
      {/* Status dot — absolutely positioned bottom-right */}
      <TkxBadge
        dot
        variant={color}
        size="sm"
        pulse={status === 'online'}
        style={{ position: 'absolute', bottom: 1, right: 1,
          boxShadow: '0 0 0 2px ' + theme.surface }}
      >
        {status}
      </TkxBadge>
    </div>
  );
}`}
      >
        <div style={{ display: 'flex', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
          {(
            [
              { name: 'Avery', bg: theme.primary, status: 'Online', variant: 'success', pulse: true },
              { name: 'Blake', bg: theme.secondary, status: 'Away', variant: 'warning', pulse: false },
              { name: 'Casey', bg: theme.danger, status: 'Busy', variant: 'danger', pulse: false },
              { name: 'Dana', bg: theme.textMuted, status: 'Offline', variant: 'default', pulse: false },
            ] as const
          ).map(({ name, bg, status, variant, pulse }) => (
            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700, color: '#fff' }}>
                  {name[0]}
                </div>
                <TkxBadge
                  dot
                  variant={variant}
                  size="sm"
                  pulse={pulse}
                  style={{ position: 'absolute', bottom: 1, right: 1, boxShadow: `0 0 0 2px ${theme.surface}` }}
                >
                  {status}
                </TkxBadge>
              </div>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{name}</span>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>{status}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 7. On Buttons ── */}
      <DemoSection
        title="On Buttons"
        description="Overlay a count badge on a button by wrapping both in a position: relative container. Click the button to add notifications, or clear to reset."
        theme={theme}
        code={`const [count, setCount] = useState(3);

<div style={{ position: 'relative', display: 'inline-block' }}>
  <TkxButton variant="outline" leftIcon={<IconBell />}>
    Notifications
  </TkxButton>
  {count > 0 && (
    <TkxBadge
      variant="danger"
      size="sm"
      aria-label={\`\${count} unread notifications\`}
      style={{
        position: 'absolute',
        top: -6,
        right: -8,
        minWidth: '18px',
        boxShadow: '0 0 0 2px ' + theme.surface,
      }}
    >
      {count > 99 ? '99+' : count}
    </TkxBadge>
  )}
</div>`}
      >
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Notifications button */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <TkxButton variant="outline" leftIcon={<IconBell color={theme.textMuted} />}>
              Notifications
            </TkxButton>
            {notifCount > 0 && (
              <TkxBadge
                variant="danger"
                size="sm"
                aria-label={`${notifCount} unread notifications`}
                style={{ position: 'absolute', top: -6, right: -8, minWidth: '18px', boxShadow: `0 0 0 2px ${theme.surface}` }}
              >
                {notifCount > 99 ? '99+' : notifCount}
              </TkxBadge>
            )}
          </div>

          {/* Inbox button */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <TkxButton variant="ghost" leftIcon={<IconInbox color={theme.textMuted} />}>
              Inbox
            </TkxButton>
            <TkxBadge
              variant="primary"
              size="sm"
              pulse
              style={{ position: 'absolute', top: -6, right: -8, minWidth: '18px', boxShadow: `0 0 0 2px ${theme.surface}` }}
            >
              12
            </TkxBadge>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <TkxButton size="sm" colorScheme="success" onClick={() => setNotifCount((n) => n + 1)}>
              + Add notification
            </TkxButton>
            <TkxButton size="sm" variant="outline" colorScheme="danger" onClick={() => setNotifCount(0)}>
              Clear all
            </TkxButton>
          </div>
        </div>
      </DemoSection>

      {/* ── 8. Status Indicators ── */}
      <DemoSection
        title="Status Indicators"
        description="A common pattern for user presence: dot + variant + label text. Use aria-label on the dot for screen readers, and pair it with visible text for WCAG 1.4.1 (Use of Color)."
        theme={theme}
        code={`// Status row component
function StatusRow({ label, variant, pulse = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <TkxBadge dot variant={variant} size="sm" pulse={pulse}>
        {label} status
      </TkxBadge>
      <span style={{ fontSize: '14px', color: theme.text }}>{label}</span>
    </div>
  );
}

<StatusRow label="Online"  variant="success" pulse />
<StatusRow label="Away"    variant="warning" />
<StatusRow label="Busy"    variant="danger" />
<StatusRow label="Offline" variant="default" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {(
            [
              { label: 'Online', variant: 'success', pulse: true },
              { label: 'Away', variant: 'warning', pulse: false },
              { label: 'Busy', variant: 'danger', pulse: false },
              { label: 'In a meeting', variant: 'secondary', pulse: false },
              { label: 'Offline', variant: 'default', pulse: false },
            ] as const
          ).map(({ label, variant, pulse }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TkxBadge dot variant={variant} size="sm" pulse={pulse}>
                {label} status
              </TkxBadge>
              <span style={{ fontSize: '14px', color: theme.text }}>{label}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 9. Custom Color via Theme ── */}
      <DemoSection
        title="Custom Color via Theme — createTheme"
        description="TkxBadge reads variant colors from the active ThemeProvider. Use createTheme to replace any color token — all badges using that variant update automatically."
        theme={theme}
        code={`import { createTheme, ThemeProvider, TkxBadge } from '@tekivex/ui';

// Override primary with your brand color
const brandTheme = createTheme({
  primary: '#7c3aed',   // violet
  secondary: '#0ea5e9', // sky
  success: '#10b981',   // emerald
  danger: '#ef4444',    // red
  warning: '#f59e0b',   // amber
  info: '#3b82f6',      // blue
});

function App() {
  return (
    <ThemeProvider theme={brandTheme}>
      <TkxBadge variant="primary">Violet</TkxBadge>
      <TkxBadge variant="secondary">Sky</TkxBadge>
      <TkxBadge variant="success">Emerald</TkxBadge>
    </ThemeProvider>
  );
}

// Or override inline via style for one-off colors:
<TkxBadge
  style={{ backgroundColor: '#7c3aed', color: '#fff', border: 'none' }}
>
  Custom Violet
</TkxBadge>`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
          {/* Simulated brand colors via style override */}
          {[
            { label: 'Violet', bg: '#7c3aed', color: '#fff' },
            { label: 'Sky', bg: '#0ea5e9', color: '#fff' },
            { label: 'Emerald', bg: '#10b981', color: '#fff' },
            { label: 'Rose', bg: '#f43f5e', color: '#fff' },
            { label: 'Amber', bg: '#f59e0b', color: '#000' },
            { label: 'Teal', bg: '#14b8a6', color: '#fff' },
          ].map(({ label, bg, color }) => (
            <TkxBadge key={label} style={{ backgroundColor: bg, color, border: 'none' }}>
              {label}
            </TkxBadge>
          ))}
          <span style={{ fontSize: '12px', color: theme.textMuted, marginLeft: '4px' }}>
            (brand colors via createTheme or style)
          </span>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={BADGE_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.4.1 Use of Color" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.6 Contrast (Enhanced)" level="AAA" status="PASS" />
        <WCAGBadge criterion="2.5.3 Label in Name" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.3 Status Messages" level="AA" status="PASS" />
      </div>

      {/* Contrast reference table */}
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, overflow: 'hidden', marginBottom: '24px' }}>
        <div style={{ padding: '12px 16px', backgroundColor: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: theme.textMuted, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Variant Contrast Reference
          </span>
        </div>
        <div style={{ padding: '4px 0' }}>
          {contrastNotes.map(({ variant, bg, note }) => (
            <div key={variant} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', borderBottom: `1px solid ${theme.border}` }}>
              <TkxBadge variant={variant as any} size="sm" style={{ minWidth: '80px', justifyContent: 'center', textTransform: 'capitalize' }}>
                {variant}
              </TkxBadge>
              <code style={{ fontSize: '11px', color: theme.textMuted, fontFamily: 'monospace', minWidth: '80px' }}>{bg}</code>
              <span style={{ fontSize: '13px', color: theme.textMuted }}>{note}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Color Is Not the Only Indicator</p>
        <p style={noteItemStyle}>WCAG 1.4.1 requires that color is never the only means of conveying information. Always pair a colored badge with text content or a distinct icon (e.g., "● Online" not just a green dot without label).</p>
        <p style={noteItemStyle}>Dot badges address this via the <code>aria-label</code> derived from children text. The <code>dot</code> variant uses <code>aria-label</code> so screen readers announce the status even without visible text.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Status Messages (WCAG 4.1.3)</p>
        <p style={noteItemStyle}>If a badge appears or updates dynamically (e.g., a notification count increasing), wrap the badge region in a <code>{'<div role="status" aria-live="polite">'}</code> so screen readers announce the change without losing focus.</p>
        <p style={noteItemStyle}>For critical alerts (e.g., error counts), use <code>aria-live="assertive"</code> to interrupt the screen reader immediately.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Pulse Animation</p>
        <p style={noteItemStyle}>The <code>pulse</code> animation (CSS <code>animate-pulse</code>) uses opacity oscillation — not motion/translation — which is generally safe. However, it is suppressed via <code>prefers-reduced-motion: reduce</code> in the tkx() engine for users who are sensitive to animation.</p>
        <p style={noteItemStyle}>Do not use <code>pulse</code> as the only indicator that something is "live" — pair it with a text label ("● Live") so static users understand the state.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Count Badges on Buttons</p>
        <p style={noteItemStyle}>When overlaying a count badge on a button, the button's accessible name should include the count so screen readers announce "Notifications, 3 unread" rather than just "Notifications".</p>
        <p style={noteItemStyle}>One approach: <code>{'<TkxButton aria-label={`Notifications (${count} unread)`}>'}</code>. The visual badge remains for sighted users; the aria-label gives screen reader users the count in context.</p>
      </div>
    </div>
  );
}
