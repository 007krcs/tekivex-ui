import type { ThemeTokens } from '@tekivex/ui';
import { TkxDivider, TkxButton, TkxBadge } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';
import type { CSSProperties } from 'react';

interface Props { theme: ThemeTokens }

// ── Icon helpers ──────────────────────────────────────────────────────────────

function IconGoogle() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

function IconGithub() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// ── Form Field helper ─────────────────────────────────────────────────────────

function FormField({ label, placeholder, type = 'text', theme }: { label: string; placeholder: string; type?: string; theme: ThemeTokens }) {
  const labelStyle: CSSProperties = { fontSize: '12px', fontWeight: 600, color: theme.textMuted, marginBottom: 4, display: 'block' };
  const inputStyle: CSSProperties = {
    width: '100%', padding: '9px 12px', borderRadius: 6,
    border: `1px solid ${theme.border}`, backgroundColor: theme.bg,
    color: theme.text, fontSize: '14px', boxSizing: 'border-box', outline: 'none',
  };
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} placeholder={placeholder} style={inputStyle} />
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function DividerPage({ theme }: Props) {
  const pageStyle: CSSProperties = { maxWidth: '860px', margin: '0 auto', padding: '48px 32px 80px' };
  const h1Style: CSSProperties = { fontSize: '2rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em' };
  const descStyle: CSSProperties = { fontSize: '15px', color: theme.textMuted, lineHeight: '1.7', maxWidth: '620px', margin: '0 0 24px' };
  const h2Style: CSSProperties = { fontSize: '1.2rem', fontWeight: 700, color: theme.text, margin: '48px 0 16px', letterSpacing: '-0.02em' };
  const noteStyle: CSSProperties = { fontSize: '13px', color: theme.textMuted, lineHeight: '1.7', padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt + '50' };
  const badgeStyle: CSSProperties = {
    display: 'inline-block', padding: '3px 10px', borderRadius: '9999px',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.04em',
    backgroundColor: theme.primary + '18', color: theme.primary,
    border: '1px solid ' + theme.primary + '35', marginBottom: '24px',
  };

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <span style={badgeStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxDivider</h1>
      <p style={descStyle}>
        <strong>TkxDivider</strong> renders a semantic <code>role="separator"</code> element that visually
        separates sections of content. It supports horizontal and vertical orientations, three line variants,
        and an optional text label for "or" patterns.
      </p>
      <WCAGBadgeGroup
        label="WCAG Compliance"
        badges={[
          { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
          { criterion: '1.4.1 Use of Colour', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      {/* 1. Basic Horizontal */}
      <DemoSection
        theme={theme}
        title="Basic Horizontal"
        description="The default divider is a full-width horizontal line using the theme border colour."
        code={`<p>Section one</p>
<TkxDivider />
<p>Section two</p>`}
      >
        <div style={{ width: '100%' }}>
          <p style={{ margin: '0 0 16px', fontSize: '14px', color: theme.textMuted }}>Content above the divider</p>
          <TkxDivider />
          <p style={{ margin: '16px 0 0', fontSize: '14px', color: theme.textMuted }}>Content below the divider</p>
        </div>
      </DemoSection>

      {/* 2. With Label */}
      <DemoSection
        theme={theme}
        title="With Label"
        description='The label prop renders centred text between two lines. Classic use-case: an "OR" separator in login forms.'
        code={`<TkxDivider label="OR" />
<TkxDivider label="Continue with" />
<TkxDivider label="Section 2" />`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TkxDivider label="OR" />
          <TkxDivider label="Continue with" />
          <TkxDivider label="April 2026" />
        </div>
      </DemoSection>

      {/* 3. Vertical Divider */}
      <DemoSection
        theme={theme}
        title="Vertical Divider"
        description="Use orientation='vertical' inside a flex row to separate items side-by-side. The divider stretches to the height of its container."
        code={`<div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 40 }}>
  <span>Home</span>
  <TkxDivider orientation="vertical" />
  <span>About</span>
  <TkxDivider orientation="vertical" />
  <span>Contact</span>
</div>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: '100%' }}>
          {/* Nav-style */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>Navigation breadcrumb</p>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, height: 36, padding: '0 12px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
              {['Dashboard', 'Projects', 'Alpha Design System', 'Components'].map((item, i, arr) => (
                <span key={item} style={{ display: 'inline-flex', alignItems: 'center', gap: 12, height: '100%' }}>
                  <span style={{ fontSize: '13px', color: i === arr.length - 1 ? theme.text : theme.textMuted, fontWeight: i === arr.length - 1 ? 600 : 400 }}>{item}</span>
                  {i < arr.length - 1 && <TkxDivider orientation="vertical" />}
                </span>
              ))}
            </div>
          </div>

          {/* Stat cards */}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>Inline stats</p>
            <div style={{ display: 'inline-flex', alignItems: 'stretch', padding: '12px 20px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surface, gap: 24 }}>
              {[
                { label: 'Total Users', value: '3,847' },
                { label: 'Active Today', value: '892' },
                { label: 'New This Week', value: '204' },
              ].map((stat, i, arr) => (
                <span key={stat.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 24 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: theme.text }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: theme.textMuted }}>{stat.label}</div>
                  </div>
                  {i < arr.length - 1 && <TkxDivider orientation="vertical" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </DemoSection>

      {/* 4. Variants */}
      <DemoSection
        theme={theme}
        title="Variants"
        description="Three line styles: solid (default), dashed, and dotted."
        code={`<TkxDivider variant="solid" />
<TkxDivider variant="dashed" />
<TkxDivider variant="dotted" />`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 20 }}>
          {(['solid', 'dashed', 'dotted'] as const).map((v) => (
            <div key={v}>
              <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted, textTransform: 'capitalize' }}>{v}</p>
              <TkxDivider variant={v} />
            </div>
          ))}
          <div>
            <p style={{ margin: '0 0 8px', fontSize: '12px', fontWeight: 600, color: theme.textMuted }}>dashed with label</p>
            <TkxDivider variant="dashed" label="OR" />
          </div>
        </div>
      </DemoSection>

      {/* 5. In a Form */}
      <DemoSection
        theme={theme}
        title="In a Form"
        description="Dividers with labels visually and semantically separate form sections (e.g., Personal Info vs. Account Details)."
        code={`<form>
  <TkxDivider label="Personal Information" />
  <FormField label="Full Name" placeholder="Jane Doe" />
  <FormField label="Email" placeholder="jane@example.com" type="email" />

  <TkxDivider label="Account Settings" />
  <FormField label="Username" placeholder="janedoe" />
  <FormField label="Password" placeholder="••••••••" type="password" />
</form>`}
      >
        <div style={{ width: '100%', maxWidth: 420 }}>
          <TkxDivider label="Personal Information" />
          <div style={{ marginTop: 16 }}>
            <FormField label="Full Name" placeholder="Jane Doe" theme={theme} />
            <FormField label="Email Address" placeholder="jane@example.com" type="email" theme={theme} />
          </div>
          <TkxDivider label="Account Settings" />
          <div style={{ marginTop: 16 }}>
            <FormField label="Username" placeholder="janedoe" theme={theme} />
            <FormField label="Password" placeholder="••••••••" type="password" theme={theme} />
          </div>
        </div>
      </DemoSection>

      {/* 6. In a Sidebar */}
      <DemoSection
        theme={theme}
        title="In a Sidebar"
        description="A vertical divider separating a navigation sidebar from main content, simulating an application shell layout."
        code={`<div style={{ display: 'flex', height: 240, gap: 0 }}>
  <nav style={{ width: 160, padding: 16 }}>
    {/* nav items */}
  </nav>
  <TkxDivider orientation="vertical" />
  <main style={{ flex: 1, padding: 16 }}>
    {/* page content */}
  </main>
</div>`}
      >
        <div style={{ display: 'flex', height: 220, width: '100%', border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden' }}>
          <nav style={{ width: 160, flexShrink: 0, padding: '12px 8px', backgroundColor: theme.surfaceAlt + '40' }}>
            <p style={{ margin: '0 0 12px', padding: '0 8px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: theme.textMuted }}>Navigation</p>
            {['Overview', 'Analytics', 'Reports', 'Settings'].map((item, i) => (
              <div key={item} style={{ padding: '8px 10px', borderRadius: 6, marginBottom: 2, fontSize: '13px', color: i === 0 ? theme.primary : theme.textMuted, fontWeight: i === 0 ? 600 : 400, backgroundColor: i === 0 ? theme.primary + '10' : 'transparent', cursor: 'pointer' }}>{item}</div>
            ))}
          </nav>
          <TkxDivider orientation="vertical" />
          <main style={{ flex: 1, padding: '16px 20px' }}>
            <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: '16px', color: theme.text }}>Overview</p>
            <p style={{ margin: 0, fontSize: '13px', color: theme.textMuted, lineHeight: '1.6' }}>
              The vertical TkxDivider separates the navigation sidebar from the main content area.
              It stretches to fill the available height automatically.
            </p>
          </main>
        </div>
      </DemoSection>

      {/* 7. In Cards */}
      <DemoSection
        theme={theme}
        title="In Cards"
        description="Horizontal dividers inside a card separate distinct sections such as header, body, and footer."
        code={`<div style={{ padding: 20, border: \`1px solid \${theme.border}\`, borderRadius: 10 }}>
  {/* Card header */}
  <h3>Team Activity</h3>
  <TkxDivider />
  {/* Card body */}
  <p>...</p>
  <TkxDivider />
  {/* Card footer */}
  <TkxButton>View All</TkxButton>
</div>`}
      >
        <div style={{ width: '100%', maxWidth: 400, border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden', backgroundColor: theme.surface }}>
          {/* Header */}
          <div style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: theme.text }}>Team Activity</p>
              <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>Last 7 days</p>
            </div>
            <TkxBadge variant="success" size="sm">Live</TkxBadge>
          </div>
          <TkxDivider />
          {/* Body */}
          <div style={{ padding: '14px 16px' }}>
            {[
              { name: 'Alice Chen', action: 'merged a pull request', time: '2m ago' },
              { name: 'Bob Martinez', action: 'opened a new issue', time: '14m ago' },
              { name: 'Carol White', action: 'updated the design tokens', time: '1h ago' },
            ].map((item, i, arr) => (
              <div key={item.name}>
                <div style={{ padding: '8px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <span style={{ fontSize: '13px', color: theme.text }}>
                    <strong>{item.name}</strong> {item.action}
                  </span>
                  <span style={{ fontSize: '11px', color: theme.textMuted, flexShrink: 0, marginLeft: 8 }}>{item.time}</span>
                </div>
                {i < arr.length - 1 && <TkxDivider variant="dashed" />}
              </div>
            ))}
          </div>
          <TkxDivider />
          {/* Footer */}
          <div style={{ padding: '12px 16px', backgroundColor: theme.surfaceAlt + '40' }}>
            <TkxButton variant="ghost" size="sm" style={{ width: '100%' }}>View All Activity</TkxButton>
          </div>
        </div>
      </DemoSection>

      {/* 8. Login Form Pattern */}
      <DemoSection
        theme={theme}
        title="Login Form Pattern"
        description='Complete login form with email/password fields, a divider labelled "or", and social login buttons.'
        code={`<form style={{ maxWidth: 360 }}>
  <h2>Sign in</h2>
  <FormField label="Email" type="email" placeholder="you@example.com" />
  <FormField label="Password" type="password" placeholder="••••••••" />
  <TkxButton variant="primary" style={{ width: '100%' }}>Sign In</TkxButton>

  <TkxDivider label="or" style={{ margin: '20px 0' }} />

  <TkxButton variant="outline" style={{ width: '100%', marginBottom: 8 }}>
    <GoogleIcon /> Continue with Google
  </TkxButton>
  <TkxButton variant="outline" style={{ width: '100%' }}>
    <GithubIcon /> Continue with GitHub
  </TkxButton>
</form>`}
      >
        <div style={{ width: '100%', maxWidth: 360 }}>
          <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: '18px', color: theme.text }}>Sign in to your account</p>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: theme.textMuted }}>Welcome back! Please enter your details.</p>
          <FormField label="Email" type="email" placeholder="you@example.com" theme={theme} />
          <FormField label="Password" type="password" placeholder="••••••••" theme={theme} />
          <TkxButton variant="primary" style={{ width: '100%', justifyContent: 'center' }}>Sign In</TkxButton>

          <TkxDivider label="or" style={{ margin: '20px 0' }} />

          <TkxButton
            variant="outline"
            style={{ width: '100%', justifyContent: 'center', marginBottom: 8 }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconGoogle />
              Continue with Google
            </span>
          </TkxButton>
          <TkxButton
            variant="outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <IconGithub />
              Continue with GitHub
            </span>
          </TkxButton>
        </div>
      </DemoSection>

      {/* Props */}
      <h2 style={h2Style}>Props</h2>
      <PropTable props={[
        { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Direction of the separator. Vertical dividers require the parent to have a defined height.' },
        { name: 'label', type: 'string', description: 'Optional centred text label. When provided, the divider renders as a flex row with two line segments flanking the text.' },
        { name: 'variant', type: "'solid' | 'dashed' | 'dotted'", default: "'solid'", description: 'CSS border-style of the separator line.' },
        { name: 'className', type: 'string', description: 'Additional class names for the wrapper element.' },
        { name: 'style', type: 'CSSProperties', description: 'Inline styles for the wrapper element. Useful for controlling margin and colour.' },
      ]} />

      {/* WCAG Notes */}
      <h2 style={h2Style}>Accessibility Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={noteStyle}><strong>role="separator":</strong> Both horizontal and vertical variants carry <code>role="separator"</code>, which tells assistive technologies that this element marks a thematic boundary between groups of content.</div>
        <div style={noteStyle}><strong>aria-orientation:</strong> The component sets <code>aria-orientation="horizontal"</code> or <code>aria-orientation="vertical"</code> to match the visual orientation. Screen readers may use this to announce the divider appropriately.</div>
        <div style={noteStyle}><strong>Colour contrast:</strong> The divider colour inherits from the theme's <code>border</code> token. Ensure the border colour meets at least 3:1 contrast against adjacent backgrounds to satisfy WCAG 1.4.11 (Non-text Contrast).</div>
        <div style={noteStyle}><strong>Label text:</strong> The label inside a divider is visible text, not an ARIA attribute. It is read aloud by screen readers as part of normal reading flow. Keep labels short (1–3 words) for clarity.</div>
      </div>
    </div>
  );
}
