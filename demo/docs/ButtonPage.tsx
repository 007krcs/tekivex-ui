import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxButton,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Inline SVG icon helpers used throughout demos ─────────────────────────────

function IconSend() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}

// ── Prop definitions ──────────────────────────────────────────────────────────

const BUTTON_PROPS = [
  { name: 'variant', type: "'solid' | 'outline' | 'ghost' | 'link'", default: "'solid'", description: 'Visual treatment of the button.' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl'", default: "'md'", description: 'Controls padding, font size, and minimum height.' },
  { name: 'colorScheme', type: "'primary' | 'secondary' | 'danger' | 'warning' | 'success'", default: "'primary'", description: 'Theme color applied to the button.' },
  { name: 'isLoading', type: 'boolean', default: 'false', description: 'Renders a spinner and sets aria-busy. Button is disabled while loading.' },
  { name: 'loadingText', type: 'string', default: 'undefined', description: 'Text shown beside the spinner. Falls back to children if not provided.' },
  { name: 'leftIcon', type: 'ReactNode', default: 'undefined', description: 'Icon rendered to the left of the label, wrapped in aria-hidden.' },
  { name: 'rightIcon', type: 'ReactNode', default: 'undefined', description: 'Icon rendered to the right of the label, wrapped in aria-hidden.' },
  { name: 'isFullWidth', type: 'boolean', default: 'false', description: 'Stretches the button to fill its container (w-full).' },
  { name: 'glow', type: 'boolean', default: 'false', description: 'Adds a box-shadow glow using the accent color. Respects prefers-reduced-motion.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables interaction. Sets aria-disabled and reduces opacity.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with the built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of variant styles.' },
  { name: '...rest', type: 'ButtonHTMLAttributes<HTMLButtonElement>', default: '—', description: 'All standard button attributes (onClick, type, form, etc.) are forwarded.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ButtonPage({ theme }: { theme: ThemeTokens }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadCount, setLoadCount] = useState(0);

  function handleLoadToggle() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setLoadCount((n) => n + 1);
    }, 2200);
  }

  // Shared section-level heading styles
  const sectionHeadingStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    color: theme.textMuted,
    margin: '0 0 24px',
  };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '40px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
    paddingLeft: '16px',
    position: 'relative' as const,
  };

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AAA', status: 'PASS' },
            { criterion: '2.4.7 Focus Visible', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxButton
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A fully accessible, theme-aware button built on the WAI-ARIA button pattern. Supports four visual
        variants, five color schemes, four sizes, loading states, icon slots, glow effects, and full-width
        layout — all with zero external dependencies.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Uses a native{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>{'<button>'}</code>
        {' '}element. Sets{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>aria-busy</code>
        {' '}during loading and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>aria-disabled</code>
        {' '}when disabled or loading. Icons are wrapped in aria-hidden spans.
      </p>

      {/* ── 1. All Variants ── */}
      <DemoSection
        title="All Variants"
        description="Four visual treatments: solid fills with the accent color, outline uses a colored border, ghost has no background or border, and link renders as underlined text."
        theme={theme}
        code={`<TkxButton variant="solid">Solid</TkxButton>
<TkxButton variant="outline">Outline</TkxButton>
<TkxButton variant="ghost">Ghost</TkxButton>
<TkxButton variant="link">Link</TkxButton>`}
      >
        <TkxButton variant="solid">Solid</TkxButton>
        <TkxButton variant="outline">Outline</TkxButton>
        <TkxButton variant="ghost">Ghost</TkxButton>
        <TkxButton variant="link">Link</TkxButton>
      </DemoSection>

      {/* ── 2. Color Schemes ── */}
      <DemoSection
        title="Color Schemes"
        description="Five semantic color schemes pulled directly from the active theme tokens. The text color is auto-calculated for WCAG AAA contrast against each background."
        theme={theme}
        code={`<TkxButton colorScheme="primary">Primary</TkxButton>
<TkxButton colorScheme="secondary">Secondary</TkxButton>
<TkxButton colorScheme="danger">Danger</TkxButton>
<TkxButton colorScheme="warning">Warning</TkxButton>
<TkxButton colorScheme="success">Success</TkxButton>`}
      >
        <TkxButton colorScheme="primary">Primary</TkxButton>
        <TkxButton colorScheme="secondary">Secondary</TkxButton>
        <TkxButton colorScheme="danger">Danger</TkxButton>
        <TkxButton colorScheme="warning">Warning</TkxButton>
        <TkxButton colorScheme="success">Success</TkxButton>
      </DemoSection>

      {/* ── 3. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Four sizes from compact sm to large xl. Each size adjusts padding, font size, and minimum height to maintain touch-target compliance (sm ≥ 32 px, md ≥ 40 px, lg ≥ 48 px, xl ≥ 56 px)."
        theme={theme}
        code={`<TkxButton size="sm">Small</TkxButton>
<TkxButton size="md">Medium</TkxButton>
<TkxButton size="lg">Large</TkxButton>
<TkxButton size="xl">Extra Large</TkxButton>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <TkxButton size="sm">Small</TkxButton>
          <TkxButton size="md">Medium</TkxButton>
          <TkxButton size="lg">Large</TkxButton>
          <TkxButton size="xl">Extra Large</TkxButton>
        </div>
      </DemoSection>

      {/* ── 4. Loading State ── */}
      <DemoSection
        title="Loading State"
        description="Click the button to trigger a 2.2-second simulated async operation. The spinner appears, aria-busy is set to true, and interaction is blocked. loadingText overrides the label during loading."
        theme={theme}
        code={`const [isLoading, setIsLoading] = useState(false);

function handleSubmit() {
  setIsLoading(true);
  // simulate async work
  setTimeout(() => setIsLoading(false), 2200);
}

<TkxButton
  isLoading={isLoading}
  loadingText="Saving…"
  onClick={handleSubmit}
>
  Save Changes
</TkxButton>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TkxButton
            isLoading={isLoading}
            loadingText="Saving…"
            onClick={handleLoadToggle}
            disabled={isLoading}
          >
            Save Changes
          </TkxButton>
          {loadCount > 0 && !isLoading && (
            <span style={{ fontSize: '13px', color: theme.success }}>
              ✓ Saved {loadCount} time{loadCount !== 1 ? 's' : ''}
            </span>
          )}
          {isLoading && (
            <span style={{ fontSize: '13px', color: theme.textMuted }}>
              aria-busy="true" is active — screen readers announce the loading state
            </span>
          )}
        </div>
      </DemoSection>

      {/* ── 5. With Icons ── */}
      <DemoSection
        title="With Icons"
        description="leftIcon and rightIcon accept any ReactNode. Icons are wrapped in aria-hidden spans so screen readers skip them — the button label carries the full accessible name."
        theme={theme}
        code={`// Left icon
<TkxButton leftIcon={<IconSend />}>Send Message</TkxButton>

// Right icon
<TkxButton rightIcon={<IconArrow />} variant="outline">
  Continue
</TkxButton>

// Both icons
<TkxButton leftIcon={<IconDownload />} rightIcon={<IconArrow />} colorScheme="success">
  Download Report
</TkxButton>

// Icon-only (provide aria-label for accessibility)
<TkxButton aria-label="Add item">
  <IconPlus />
</TkxButton>`}
      >
        <TkxButton leftIcon={<IconSend />}>Send Message</TkxButton>
        <TkxButton rightIcon={<IconArrow />} variant="outline">Continue</TkxButton>
        <TkxButton leftIcon={<IconDownload />} rightIcon={<IconArrow />} colorScheme="success">
          Download Report
        </TkxButton>
        <TkxButton aria-label="Add item">
          <IconPlus />
        </TkxButton>
      </DemoSection>

      {/* ── 6. Full Width ── */}
      <DemoSection
        title="Full Width"
        description="isFullWidth expands the button to 100% of its container. Useful for mobile layouts, form submissions, and stacked action groups."
        theme={theme}
        code={`<TkxButton isFullWidth>Full Width Solid</TkxButton>
<TkxButton isFullWidth variant="outline" colorScheme="secondary">
  Full Width Outline
</TkxButton>`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TkxButton isFullWidth>Full Width Solid</TkxButton>
          <TkxButton isFullWidth variant="outline" colorScheme="secondary">
            Full Width Outline
          </TkxButton>
        </div>
      </DemoSection>

      {/* ── 7. Glow Effect ── */}
      <DemoSection
        title="Glow Effect"
        description="The glow prop adds a box-shadow using the accent color at 33% opacity. Automatically suppressed when the user has prefers-reduced-motion enabled."
        theme={theme}
        code={`<TkxButton glow>Primary Glow</TkxButton>
<TkxButton glow colorScheme="danger">Danger Glow</TkxButton>
<TkxButton glow colorScheme="success">Success Glow</TkxButton>
<TkxButton glow colorScheme="warning">Warning Glow</TkxButton>`}
      >
        <TkxButton glow>Primary Glow</TkxButton>
        <TkxButton glow colorScheme="danger">Danger Glow</TkxButton>
        <TkxButton glow colorScheme="success">Success Glow</TkxButton>
        <TkxButton glow colorScheme="warning">Warning Glow</TkxButton>
      </DemoSection>

      {/* ── 8. Disabled State ── */}
      <DemoSection
        title="Disabled State"
        description="disabled sets opacity to 60%, cursor to not-allowed, and forwards aria-disabled. The button is excluded from tab order while preserving its visual presence."
        theme={theme}
        code={`<TkxButton disabled>Disabled Solid</TkxButton>
<TkxButton disabled variant="outline">Disabled Outline</TkxButton>
<TkxButton disabled variant="ghost">Disabled Ghost</TkxButton>
<TkxButton disabled colorScheme="danger">Disabled Danger</TkxButton>`}
      >
        <TkxButton disabled>Disabled Solid</TkxButton>
        <TkxButton disabled variant="outline">Disabled Outline</TkxButton>
        <TkxButton disabled variant="ghost">Disabled Ghost</TkxButton>
        <TkxButton disabled colorScheme="danger">Disabled Danger</TkxButton>
      </DemoSection>

      {/* ── 9. Custom CSS Override ── */}
      <DemoSection
        title="Custom CSS Override"
        description="Pass className (merged via tkx/cx) and style (merged on top of variant styles) for one-off customizations without touching the theme."
        theme={theme}
        code={`// Rounded pill via className
<TkxButton className="rounded-full">Pill Shape</TkxButton>

// Gradient via inline style
<TkxButton
  style={{
    background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
    border: 'none',
    color: '#fff',
    boxShadow: '0 4px 20px #7c3aed44',
  }}
>
  Gradient Button
</TkxButton>

// Wide letter spacing
<TkxButton
  variant="outline"
  style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '11px' }}
>
  SPACED OUT
</TkxButton>`}
      >
        <TkxButton className="rounded-full">Pill Shape</TkxButton>
        <TkxButton
          style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
            border: 'none',
            color: '#fff',
            boxShadow: '0 4px 20px #7c3aed44',
          }}
        >
          Gradient Button
        </TkxButton>
        <TkxButton
          variant="outline"
          style={{ letterSpacing: '0.15em', textTransform: 'uppercase', fontSize: '11px' }}
        >
          SPACED OUT
        </TkxButton>
      </DemoSection>

      {/* ── 10. Build Your Own ── */}
      <DemoSection
        title="Build Your Own — createTheme Brand Colors"
        description="createTheme lets you inject any brand palette. TkxButton reads colorScheme values from the active theme, so swapping the theme instantly rebrands all buttons."
        theme={theme}
        code={`import { createTheme, ThemeProvider, TkxButton } from '@tekivex/ui';

const brandTheme = createTheme({
  primary: '#ff6b35',   // brand orange
  secondary: '#1d3557', // navy
  success: '#2ec4b6',   // teal
  danger: '#e63946',
  warning: '#f4a261',
});

function App() {
  return (
    <ThemeProvider theme={brandTheme}>
      <TkxButton colorScheme="primary">Brand Primary</TkxButton>
      <TkxButton colorScheme="secondary">Brand Navy</TkxButton>
      <TkxButton colorScheme="success" glow>Teal Glow</TkxButton>
    </ThemeProvider>
  );
}`}
      >
        {/* Live preview uses current theme — the code snippet shows the pattern */}
        <TkxButton
          style={{ background: '#ff6b35', color: '#fff', border: 'none', boxShadow: '0 0 18px #ff6b3540' }}
        >
          Brand Primary
        </TkxButton>
        <TkxButton
          style={{ background: '#1d3557', color: '#fff', border: 'none' }}
        >
          Brand Navy
        </TkxButton>
        <TkxButton
          style={{ background: '#2ec4b6', color: '#fff', border: 'none', boxShadow: '0 0 18px #2ec4b640' }}
        >
          Teal Glow
        </TkxButton>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={BUTTON_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.6 Contrast (Enhanced)" level="AAA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="2.4.7 Focus Visible" level="AA" status="PASS" />
        <WCAGBadge criterion="2.5.3 Label in Name" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.primary }} aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
          </svg>
          Contrast &amp; Color
        </p>
        <p style={noteItemStyle}>Foreground color on solid buttons is calculated at runtime using <code>getAccessibleForeground()</code>, which picks from white, black, or the theme background to guarantee ≥ 7:1 contrast ratio (WCAG AAA 1.4.6).</p>
        <p style={noteItemStyle}>Outline and ghost variants use the theme accent color as the text/border color. Verify contrast against your specific background if using non-standard themes.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.primary }} aria-hidden="true">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Keyboard Navigation
        </p>
        <p style={noteItemStyle}><strong>Tab</strong> moves focus to the button. <strong>Enter</strong> or <strong>Space</strong> activates it — consistent with the WAI-ARIA button pattern.</p>
        <p style={noteItemStyle}>focus-visible:focus-ring applies a 2 px offset ring only for keyboard navigation, not on mouse click (uses :focus-visible CSS pseudo-class).</p>
        <p style={noteItemStyle}>Disabled buttons use <code>disabled</code> (native) which removes them from tab order. If you need them reachable, use <code>aria-disabled</code> without <code>disabled</code> and handle the preventDefault yourself.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.primary }} aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
          </svg>
          Loading &amp; Dynamic State
        </p>
        <p style={noteItemStyle}><code>aria-busy="true"</code> is set when <code>isLoading</code> is true. Screen readers (NVDA, JAWS, VoiceOver) announce "busy" when this attribute changes.</p>
        <p style={noteItemStyle}>The animated spinner uses <code>animate-spin</code>. The animation is automatically suppressed when <code>prefers-reduced-motion: reduce</code> is set in the OS.</p>
        <p style={noteItemStyle}>Provide a meaningful <code>loadingText</code> — e.g., "Saving changes…" rather than "Loading…" — so screen reader users understand what operation is in progress.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" style={{ color: theme.primary }} aria-hidden="true">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Icons &amp; Accessible Names
        </p>
        <p style={noteItemStyle}>Icon children passed to <code>leftIcon</code> and <code>rightIcon</code> are wrapped in <code>{'<span aria-hidden="true">'}</code>. The button's accessible name comes from its text content only.</p>
        <p style={noteItemStyle}>For icon-only buttons, always provide an <code>aria-label</code>: <code>{'<TkxButton aria-label="Close dialog"><IconX /></TkxButton>'}</code>.</p>
        <p style={noteItemStyle}>Do not rely on the icon alone to convey meaning — always pair icons with visible text where space allows (WCAG 1.1.1 Non-text Content).</p>
      </div>
    </div>
  );
}
