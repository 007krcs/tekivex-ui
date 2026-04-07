import { type CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxSpeedDial } from '@tekivex/ui';
import type { SpeedDialAction } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Sample icons ─────────────────────────────────────────────────────────────

function EditIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function PrintIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

// ── Sample actions ───────────────────────────────────────────────────────────

const ACTIONS: SpeedDialAction[] = [
  { id: 'edit', icon: <EditIcon />, label: 'Edit', onClick: () => {} },
  { id: 'copy', icon: <CopyIcon />, label: 'Copy', onClick: () => {} },
  { id: 'share', icon: <ShareIcon />, label: 'Share', onClick: () => {} },
  { id: 'print', icon: <PrintIcon />, label: 'Print', onClick: () => {} },
];

// ── SpeedDialPage ────────────────────────────────────────────────────────────

export function SpeedDialPage({ theme }: Props) {
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
    position: 'relative',
    height: 280,
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    overflow: 'hidden',
  };

  const labelStyle: CSSProperties = {
    position: 'absolute',
    top: 12,
    left: 16,
    fontSize: 12,
    fontWeight: 600,
    color: theme.textMuted,
    letterSpacing: '0.04em',
    textTransform: 'uppercase' as const,
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <h1 style={h1Style}>TkxSpeedDial</h1>
      <p style={leadStyle}>
        A floating action button that reveals a set of quick actions when
        activated. Supports four expansion directions, four corner positions,
        custom trigger icons, and keyboard navigation.
      </p>

      {/* ── Basic ── */}
      <DemoSection
        title="Basic Speed Dial"
        description="A speed dial in the default bottom-right position expanding upward. Hover or click the FAB to reveal actions."
        theme={theme}
        code={`const actions = [
  { id: 'edit',  icon: <EditIcon />,  label: 'Edit',  onClick: () => {} },
  { id: 'copy',  icon: <CopyIcon />,  label: 'Copy',  onClick: () => {} },
  { id: 'share', icon: <ShareIcon />, label: 'Share', onClick: () => {} },
  { id: 'print', icon: <PrintIcon />, label: 'Print', onClick: () => {} },
];

<TkxSpeedDial actions={actions} />`}
      >
        <div style={demoBoxStyle}>
          <span style={labelStyle}>Bottom-right (default)</span>
          <TkxSpeedDial actions={ACTIONS} />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Directions ── */}
      <DemoSection
        title="Expansion Directions"
        description="The direction prop controls which way the action items expand: up, down, left, or right."
        theme={theme}
        code={`<TkxSpeedDial actions={actions} direction="up" />
<TkxSpeedDial actions={actions} direction="down" />
<TkxSpeedDial actions={actions} direction="left" />
<TkxSpeedDial actions={actions} direction="right" />`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {(['up', 'down', 'left', 'right'] as const).map((dir) => (
            <div key={dir} style={demoBoxStyle}>
              <span style={labelStyle}>direction=&quot;{dir}&quot;</span>
              <TkxSpeedDial
                actions={ACTIONS}
                direction={dir}
                position={dir === 'down' ? 'top-right' : dir === 'right' ? 'bottom-left' : 'bottom-right'}
              />
            </div>
          ))}
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Positions ── */}
      <DemoSection
        title="Corner Positions"
        description="The position prop places the FAB in any of the four corners. Each position automatically adjusts the default expansion direction."
        theme={theme}
        code={`<TkxSpeedDial actions={actions} position="bottom-right" />
<TkxSpeedDial actions={actions} position="bottom-left" />
<TkxSpeedDial actions={actions} position="top-right" />
<TkxSpeedDial actions={actions} position="top-left" />`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {(['bottom-right', 'bottom-left', 'top-right', 'top-left'] as const).map((pos) => (
            <div key={pos} style={demoBoxStyle}>
              <span style={{ ...labelStyle, left: pos.includes('left') ? 'auto' : 16, right: pos.includes('left') ? 16 : 'auto' }}>
                position=&quot;{pos}&quot;
              </span>
              <TkxSpeedDial actions={ACTIONS} position={pos} />
            </div>
          ))}
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'actions', type: 'SpeedDialAction[]', required: true, description: 'Array of action items to display. Each has an id, icon, label, and optional onClick handler.' },
            { name: 'icon', type: 'ReactNode', description: 'Custom icon for the main FAB trigger. Defaults to a plus/close icon.' },
            { name: 'direction', type: '"up" | "down" | "left" | "right"', default: '"up"', description: 'Direction in which the action items expand from the FAB.' },
            { name: 'position', type: '"bottom-right" | "bottom-left" | "top-right" | "top-left"', default: '"bottom-right"', description: 'Corner position of the FAB within its container.' },
            { name: 'className', type: 'string', description: 'Additional CSS class names forwarded to the root element.' },
            { name: 'style', type: 'CSSProperties', description: 'Inline styles forwarded to the root element.' },
          ]}
        />
      </section>
    </div>
  );
}
