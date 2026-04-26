import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxTooltip, TkxButton, TkxBadge,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';
import type { CSSProperties } from 'react';

interface Props { theme: ThemeTokens }

// ── Icon helpers ──────────────────────────────────────────────────────────────

function IconBold() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function IconItalic() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function IconUnderline() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function IconAlignLeft() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function IconAlignCenter() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  );
}

function IconAlignRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

// ── Icon button helper ────────────────────────────────────────────────────────

function IconBtn({ label, children, theme }: { label: string; children: React.ReactNode; theme: ThemeTokens }) {
  const btnStyle: CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 36, height: 36, borderRadius: 8,
    border: `1px solid ${theme.border}`,
    backgroundColor: 'transparent',
    color: theme.textMuted,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  };
  return (
    <TkxTooltip content={label}>
      <button type="button" style={btnStyle} aria-label={label}>{children}</button>
    </TkxTooltip>
  );
}

// ── Delay Demo ────────────────────────────────────────────────────────────────

function DelayDemo({ theme }: { theme: ThemeTokens }) {
  const [log, setLog] = useState<string>('Hover a button to see the delay in action');
  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
        <TkxTooltip content="Instant — delay=0" placement="top" delay={0}>
          <TkxButton variant="outline" size="sm" onMouseEnter={() => setLog('Instant tooltip (delay=0)')} onMouseLeave={() => setLog('Hover a button to see the delay')}>
            No delay
          </TkxButton>
        </TkxTooltip>
        <TkxTooltip content="Fast — delay=150ms" placement="top" delay={150}>
          <TkxButton variant="outline" size="sm" onMouseEnter={() => setLog('Fast tooltip (delay=150)')} onMouseLeave={() => setLog('Hover a button to see the delay')}>
            150 ms
          </TkxButton>
        </TkxTooltip>
        <TkxTooltip content="Default — delay=300ms" placement="top" delay={300}>
          <TkxButton variant="outline" size="sm" onMouseEnter={() => setLog('Default tooltip (delay=300)')} onMouseLeave={() => setLog('Hover a button to see the delay')}>
            300 ms (default)
          </TkxButton>
        </TkxTooltip>
        <TkxTooltip content="Slow — delay=800ms" placement="top" delay={800}>
          <TkxButton variant="outline" size="sm" onMouseEnter={() => setLog('Slow tooltip (delay=800)')} onMouseLeave={() => setLog('Hover a button to see the delay')}>
            800 ms
          </TkxButton>
        </TkxTooltip>
      </div>
      <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted, fontFamily: 'monospace', padding: '8px 12px', borderRadius: 6, backgroundColor: theme.surfaceAlt, border: `1px solid ${theme.border}` }}>{log}</p>
    </div>
  );
}

// ── Rich Tooltip — table header ───────────────────────────────────────────────

function RichTooltipDemo({ theme }: { theme: ThemeTokens }) {
  const thStyle: CSSProperties = {
    padding: '10px 14px', textAlign: 'left', fontSize: '12px', fontWeight: 600,
    color: theme.textMuted, backgroundColor: theme.surfaceAlt, borderBottom: `2px solid ${theme.border}`,
    cursor: 'help',
  };
  const tdStyle: CSSProperties = { padding: '10px 14px', fontSize: '13px', color: theme.text, borderBottom: `1px solid ${theme.border}` };
  const rows = [
    { name: 'Alice Chen', score: 94.2, trend: '+2.1%' },
    { name: 'Bob Martinez', score: 87.5, trend: '-0.8%' },
    { name: 'Carol White', score: 91.0, trend: '+5.3%' },
  ];
  return (
    <div style={{ width: '100%', border: `1px solid ${theme.border}`, borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
        <thead>
          <tr>
            <th style={thStyle}>Name</th>
            <th style={thStyle}>
              <TkxTooltip
                content="Performance score out of 100. Calculated from task completion, response time, and quality metrics."
                placement="top"
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Score <IconInfo />
                </span>
              </TkxTooltip>
            </th>
            <th style={thStyle}>
              <TkxTooltip content="Week-over-week change relative to prior period average." placement="top">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  Trend <IconInfo />
                </span>
              </TkxTooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name}>
              <td style={tdStyle}>{r.name}</td>
              <td style={tdStyle}>{r.score}</td>
              <td style={{ ...tdStyle, color: r.trend.startsWith('+') ? '#06d6a0' : '#f72585' }}>{r.trend}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export function TooltipPage({ theme }: Props) {
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

  const placementNote: CSSProperties = {
    fontSize: '11px', color: theme.textMuted, textAlign: 'center', marginTop: 6,
  };

  return (
    <div style={pageStyle}>
      {/* Hero */}
      <span style={badgeStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxTooltip</h1>
      <p style={descStyle}>
        <strong>TkxTooltip</strong> implements the WAI-ARIA tooltip pattern. It appears on hover and focus,
        dismisses on Escape or blur, and injects <code>aria-describedby</code> on the trigger element
        so screen readers announce the tooltip content automatically.
      </p>
      <WCAGBadgeGroup
        label="WCAG Compliance"
        badges={[
          { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
          { criterion: '1.4.13 Content on Hover/Focus', level: 'AA', status: 'PASS' },
          { criterion: '4.1.3 Status Messages', level: 'AA', status: 'PASS' },
        ]}
      />

      {/* 1. Basic Tooltip */}
      <DemoSection
        theme={theme}
        title="Basic Tooltip"
        description="Hover or focus the button to trigger the tooltip. The default placement is top with a 300 ms delay."
        code={`<TkxTooltip content="Save your changes">
  <TkxButton variant="primary">Save</TkxButton>
</TkxTooltip>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 16 }}>
          <TkxTooltip content="Save your changes">
            <TkxButton variant="primary">Save</TkxButton>
          </TkxTooltip>
          <TkxTooltip content="Discard unsaved changes and revert">
            <TkxButton variant="ghost">Discard</TkxButton>
          </TkxTooltip>
          <TkxTooltip content="Preview how this looks to end users">
            <TkxButton variant="outline">Preview</TkxButton>
          </TkxTooltip>
        </div>
      </DemoSection>

      {/* 2. Placements */}
      <DemoSection
        theme={theme}
        title="Placements"
        description="Tooltips can appear on any of the four sides: top, bottom, left, or right."
        code={`<TkxTooltip content="Top tooltip" placement="top">
  <TkxButton>Top</TkxButton>
</TkxTooltip>
<TkxTooltip content="Bottom tooltip" placement="bottom">
  <TkxButton>Bottom</TkxButton>
</TkxTooltip>
<TkxTooltip content="Left tooltip" placement="left">
  <TkxButton>Left</TkxButton>
</TkxTooltip>
<TkxTooltip content="Right tooltip" placement="right">
  <TkxButton>Right</TkxButton>
</TkxTooltip>`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', paddingTop: 24, paddingBottom: 8 }}>
          {(['top', 'bottom', 'left', 'right'] as const).map((p) => (
            <div key={p} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <TkxTooltip content={`${p.charAt(0).toUpperCase() + p.slice(1)} placement tooltip`} placement={p}>
                <TkxButton variant="outline" size="sm" style={{ textTransform: 'capitalize' }}>{p}</TkxButton>
              </TkxTooltip>
              <span style={placementNote}>{p}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* 3. On Buttons */}
      <DemoSection
        theme={theme}
        title="On Icon Buttons"
        description="Tooltips are especially valuable on icon-only buttons where there is no visible text label."
        code={`<TkxTooltip content="Delete item" placement="top">
  <button aria-label="Delete item" style={iconBtnStyle}>
    <TrashIcon />
  </button>
</TkxTooltip>`}
      >
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingTop: 12 }}>
          <IconBtn label="Download file" theme={theme}><IconDownload /></IconBtn>
          <IconBtn label="Share with team" theme={theme}><IconShare /></IconBtn>
          <IconBtn label="Settings" theme={theme}><IconSettings /></IconBtn>
          <IconBtn label="Delete permanently" theme={theme}><IconTrash /></IconBtn>
        </div>
      </DemoSection>

      {/* 4. On Disabled Elements */}
      <DemoSection
        theme={theme}
        title="On Disabled Elements"
        description="Disabled buttons cannot receive mouse or focus events. Wrap them in a span so the tooltip still works."
        code={`{/* Wrap disabled button in a span — the span receives events */}
<TkxTooltip content="You need editor permissions to publish">
  <span style={{ display: 'inline-flex', cursor: 'not-allowed' }}>
    <TkxButton disabled style={{ pointerEvents: 'none' }}>
      Publish
    </TkxButton>
  </span>
</TkxTooltip>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 8 }}>
          <TkxTooltip content="You need editor permissions to publish">
            <span style={{ display: 'inline-flex', cursor: 'not-allowed' }}>
              <TkxButton disabled style={{ pointerEvents: 'none' }} variant="primary">Publish</TkxButton>
            </span>
          </TkxTooltip>
          <TkxTooltip content="Upgrade to Pro to enable this feature">
            <span style={{ display: 'inline-flex', cursor: 'not-allowed' }}>
              <TkxButton disabled style={{ pointerEvents: 'none' }} variant="outline">Export CSV</TkxButton>
            </span>
          </TkxTooltip>
        </div>
      </DemoSection>

      {/* 5. Custom Delay */}
      <DemoSection
        theme={theme}
        title="Custom Delay"
        description="Control how long to wait before showing the tooltip. delay=0 for instant feedback, delay=800 for non-intrusive hints."
        code={`<TkxTooltip content="Instant" delay={0}>
  <TkxButton>No delay</TkxButton>
</TkxTooltip>

<TkxTooltip content="Slow hint" delay={800}>
  <TkxButton>800 ms</TkxButton>
</TkxTooltip>`}
      >
        <DelayDemo theme={theme} />
      </DemoSection>

      {/* 6. Rich Tooltips */}
      <DemoSection
        theme={theme}
        title="Rich Tooltips"
        description="Tooltip content on table column headers explains metric definitions. Hover the Score and Trend headers."
        code={`<TkxTooltip
  content="Performance score out of 100. Calculated from task completion, response time, and quality metrics."
  placement="top"
>
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
    Score <InfoIcon />
  </span>
</TkxTooltip>`}
      >
        <RichTooltipDemo theme={theme} />
      </DemoSection>

      {/* 7. Toolbar with Tooltips */}
      <DemoSection
        theme={theme}
        title="Toolbar with Tooltips"
        description="A text-formatting toolbar where every icon button has an accessible tooltip label."
        code={`const tools = [
  { icon: <BoldIcon />, label: 'Bold (⌘B)' },
  { icon: <ItalicIcon />, label: 'Italic (⌘I)' },
  { icon: <UnderlineIcon />, label: 'Underline (⌘U)' },
  { icon: <LinkIcon />, label: 'Insert Link (⌘K)' },
];

tools.map(({ icon, label }) => (
  <TkxTooltip content={label} key={label}>
    <button aria-label={label} style={btnStyle}>{icon}</button>
  </TkxTooltip>
))`}
      >
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 2,
            padding: '6px 8px', borderRadius: 8,
            border: `1px solid ${theme.border}`, backgroundColor: theme.surface,
          }}
        >
          {[
            { icon: <IconBold />, label: 'Bold (⌘B)' },
            { icon: <IconItalic />, label: 'Italic (⌘I)' },
            { icon: <IconUnderline />, label: 'Underline (⌘U)' },
            { icon: <IconLink />, label: 'Insert Link (⌘K)' },
          ].map(({ icon, label }) => (
            <TkxTooltip content={label} key={label} placement="top" delay={100}>
              <button
                type="button"
                aria-label={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 6,
                  border: 'none', backgroundColor: 'transparent',
                  color: theme.textMuted, cursor: 'pointer',
                }}
              >
                {icon}
              </button>
            </TkxTooltip>
          ))}
          <div style={{ width: 1, height: 20, backgroundColor: theme.border, margin: '0 4px' }} />
          {[
            { icon: <IconAlignLeft />, label: 'Align Left' },
            { icon: <IconAlignCenter />, label: 'Align Center' },
            { icon: <IconAlignRight />, label: 'Align Right' },
          ].map(({ icon, label }) => (
            <TkxTooltip content={label} key={label} placement="top" delay={100}>
              <button
                type="button"
                aria-label={label}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 6,
                  border: 'none', backgroundColor: 'transparent',
                  color: theme.textMuted, cursor: 'pointer',
                }}
              >
                {icon}
              </button>
            </TkxTooltip>
          ))}
        </div>
      </DemoSection>

      {/* 8. Custom Styling */}
      <DemoSection
        theme={theme}
        title="Custom Styling"
        description="Apply additional className or inline styles to the trigger element. The tooltip itself inherits your theme tokens."
        code={`<TkxTooltip content="This button uses the danger variant" placement="right">
  <TkxButton variant="danger">Delete Account</TkxButton>
</TkxTooltip>

<TkxTooltip content="Badge tooltips work too" placement="bottom">
  <TkxBadge variant="info">Hover me</TkxBadge>
</TkxTooltip>`}
      >
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', paddingTop: 8 }}>
          <TkxTooltip content="This will permanently delete your account" placement="right">
            <TkxButton variant="danger" size="sm">Delete Account</TkxButton>
          </TkxTooltip>
          <TkxTooltip content="Verified accounts get priority support" placement="bottom">
            <TkxBadge variant="info">Verified</TkxBadge>
          </TkxTooltip>
          <TkxTooltip content="Your subscription renews on April 6, 2027" placement="top">
            <TkxBadge variant="success">Pro Plan</TkxBadge>
          </TkxTooltip>
        </div>
      </DemoSection>

      {/* Props */}
      <h2 style={h2Style}>Props</h2>
      <PropTable props={[
        { name: 'content', type: 'string', required: true, description: 'The tooltip text. Sanitized before rendering. HTML is not supported.' },
        { name: 'children', type: 'ReactElement', required: true, description: 'The trigger element. Must be a single focusable React element.' },
        { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'top'", description: 'Which side to render the tooltip relative to the trigger.' },
        { name: 'delay', type: 'number', default: '300', description: 'Milliseconds to wait before showing the tooltip on hover.' },
      ]} />

      {/* WCAG Notes */}
      <h2 style={h2Style}>Accessibility Notes</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={noteStyle}><strong>aria-describedby:</strong> When the tooltip is visible, the trigger element gains <code>aria-describedby</code> pointing to the tooltip element's <code>id</code>. Screen readers announce the tooltip text as supplementary description.</div>
        <div style={noteStyle}><strong>Keyboard access:</strong> Tooltips appear when the trigger receives keyboard focus, satisfying WCAG 1.4.13 (Content on Hover or Focus). They persist until the trigger loses focus.</div>
        <div style={noteStyle}><strong>Escape to dismiss:</strong> Pressing <kbd>Escape</kbd> hides an active tooltip without moving focus. This follows the WAI-ARIA Tooltip pattern and satisfies the "dismissible" requirement of WCAG 1.4.13.</div>
        <div style={noteStyle}><strong>Disabled elements:</strong> Wrap disabled buttons in a focusable <code>&lt;span&gt;</code> to ensure keyboard users can still access the tooltip explanation. Set <code>pointerEvents: none</code> on the disabled button to prevent double-triggering.</div>
      </div>
    </div>
  );
}
