import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  useToast,
  TkxButton,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TOAST_PROPS = [
  { name: 'id', type: 'string', default: 'auto', description: 'Unique identifier for the toast. Auto-generated if not provided.' },
  { name: 'title', type: 'string', required: true, description: 'Primary message displayed in the toast.' },
  { name: 'description', type: 'string', default: 'undefined', description: 'Optional secondary line of text beneath the title.' },
  { name: 'variant', type: "'default' | 'success' | 'danger' | 'warning' | 'info'", default: "'default'", description: 'Semantic color and icon applied to the toast.' },
  { name: 'duration', type: 'number', default: '4000', description: 'Auto-dismiss delay in milliseconds. Pass 0 for a persistent toast that must be manually dismissed.' },
  { name: 'position', type: "'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'", default: "'bottom-right'", description: 'Screen position of the toast stack.' },
  { name: 'action', type: '{ label: string; onClick: () => void }', default: 'undefined', description: 'Optional action button rendered inside the toast.' },
  { name: 'onClose', type: '() => void', default: 'undefined', description: 'Callback fired when the toast is dismissed (manually or by timeout).' },
  { name: 'closable', type: 'boolean', default: 'true', description: 'Whether the toast renders a manual close (×) button.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Custom icon overriding the variant default.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ToastPage({ theme }: { theme: ThemeTokens }) {
  const toast = useToast();
  const [position, setPosition] = useState<
    'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
  >('bottom-right');

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

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
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  const POSITIONS: Array<typeof position> = [
    'top-left', 'top-center', 'top-right',
    'bottom-left', 'bottom-center', 'bottom-right',
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.2.1 Timing Adjustable', level: 'AA', status: 'PASS' },
            { criterion: '4.1.3 Status Messages', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        useToast
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A hook-driven toast notification system with five semantic variants, six screen positions, persistent mode,
        and action buttons. Toasts use{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="status"</code>{' '}
        or{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="alert"</code>{' '}
        so screen readers announce them without moving focus.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Usage:</strong> Call <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>const toast = useToast()</code>{' '}
        inside any component wrapped by <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>ThemeProvider</code>.
        Then call <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>toast.show(options)</code> to display a toast.
      </p>

      {/* ── 1. Variants ── */}
      <DemoSection
        title="Toast Variants"
        description="Five semantic variants — default, success, danger, warning, info — each with a distinct icon and color drawn from the active theme. Click any button to trigger a live toast."
        theme={theme}
        code={`const toast = useToast();

toast.show({ title: 'Changes saved',          variant: 'success' });
toast.show({ title: 'Payment failed',         variant: 'danger'  });
toast.show({ title: 'Session expiring soon',  variant: 'warning' });
toast.show({ title: 'Update available',       variant: 'info'    });
toast.show({ title: 'Notification',           variant: 'default' });`}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <TkxButton
            colorScheme="success"
            onClick={() => toast.show({ title: 'Changes saved successfully!', description: 'All 3 fields were updated.', variant: 'success' })}
          >
            Success
          </TkxButton>
          <TkxButton
            colorScheme="danger"
            onClick={() => toast.show({ title: 'Payment failed', description: 'Card was declined. Please try another.', variant: 'danger' })}
          >
            Danger
          </TkxButton>
          <TkxButton
            colorScheme="warning"
            onClick={() => toast.show({ title: 'Session expiring in 5 minutes', description: 'Save your work before it expires.', variant: 'warning' })}
          >
            Warning
          </TkxButton>
          <TkxButton
            variant="outline"
            onClick={() => toast.show({ title: 'Update available — v2.1.0', description: 'Refresh the page to apply updates.', variant: 'info' })}
          >
            Info
          </TkxButton>
          <TkxButton
            variant="ghost"
            onClick={() => toast.show({ title: 'Clipboard copied', variant: 'default' })}
          >
            Default
          </TkxButton>
        </div>
      </DemoSection>

      {/* ── 2. Persistent Toast ── */}
      <DemoSection
        title="Persistent Toast (duration=0)"
        description="Set duration=0 to disable auto-dismiss. The user must manually close the toast via the × button. Use for critical errors or confirmations requiring user acknowledgment."
        theme={theme}
        code={`toast.show({
  title: 'Critical error occurred',
  description: 'Contact support if this issue persists.',
  variant: 'danger',
  duration: 0, // never auto-dismiss
});`}
      >
        <TkxButton
          colorScheme="danger"
          variant="outline"
          onClick={() => toast.show({
            title: 'Critical error — action required',
            description: 'This toast will not auto-dismiss. You must close it manually.',
            variant: 'danger',
            duration: 0,
          })}
        >
          Show Persistent Toast
        </TkxButton>
      </DemoSection>

      {/* ── 3. Toast with Action ── */}
      <DemoSection
        title="Toast with Action Button"
        description="Provide an action object with label and onClick to render a clickable button inside the toast. Common use cases: Undo, Retry, View details."
        theme={theme}
        code={`toast.show({
  title: '3 items moved to trash',
  variant: 'default',
  action: {
    label: 'Undo',
    onClick: () => {
      console.log('Undo triggered');
      toast.show({ title: 'Action undone', variant: 'success' });
    },
  },
});`}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <TkxButton
            onClick={() => toast.show({
              title: '3 files moved to trash',
              variant: 'default',
              action: {
                label: 'Undo',
                onClick: () => toast.show({ title: 'Move undone', variant: 'success' }),
              },
            })}
          >
            Move Files (with Undo)
          </TkxButton>
          <TkxButton
            colorScheme="danger"
            variant="outline"
            onClick={() => toast.show({
              title: 'Failed to save changes',
              variant: 'danger',
              duration: 0,
              action: {
                label: 'Retry',
                onClick: () => toast.show({ title: 'Retrying…', variant: 'info' }),
              },
            })}
          >
            Show Error with Retry
          </TkxButton>
        </div>
      </DemoSection>

      {/* ── 4. Positions ── */}
      <DemoSection
        title="All Positions"
        description="Six screen positions control where the toast stack appears. Select a position below and click 'Show Toast' to preview it. The default is bottom-right."
        theme={theme}
        code={`// Select a position and fire a toast from that corner
toast.show({
  title: \`Toast at \${position}\`,
  variant: 'info',
  position: 'top-center', // any of the 6 positions
});`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                onClick={() => setPosition(pos)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: `1px solid ${pos === position ? theme.primary : theme.border}`,
                  backgroundColor: pos === position ? `${theme.primary}15` : 'transparent',
                  color: pos === position ? theme.primary : theme.textMuted,
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: pos === position ? 600 : 400,
                }}
              >
                {pos}
              </button>
            ))}
          </div>
          <TkxButton
            variant="outline"
            onClick={() => toast.show({
              title: `Positioned at: ${position}`,
              description: 'This is the selected toast position.',
              variant: 'info',
              position,
            })}
          >
            Show Toast at "{position}"
          </TkxButton>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        ToastItem Options
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={TOAST_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="2.2.1 Timing Adjustable" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.3 Status Messages" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Live Region Roles</p>
        <p style={noteItemStyle}><strong>success / info / default</strong> variants use <code>role="status"</code> (polite live region) — screen readers announce them at the next convenient pause.</p>
        <p style={noteItemStyle}><strong>danger / warning</strong> variants use <code>role="alert"</code> (assertive live region) — announced immediately, interrupting current reading. Reserve for critical errors only to avoid being intrusive.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Timing &amp; WCAG 2.2.1</p>
        <p style={noteItemStyle}>WCAG 2.2.1 Timing Adjustable requires that timed content can be extended, paused, or turned off. TkxToast satisfies this with: (a) <code>duration=0</code> for persistent toasts, (b) the close button always present, and (c) the timer pauses on hover/focus so keyboard and pointer users can read at their own pace.</p>
      </div>
    </div>
  );
}
