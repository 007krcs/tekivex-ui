import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxPopover, TkxButton } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const POPOVER_PROPS = [
  { name: 'trigger', type: 'ReactNode', default: '—', description: 'The element that triggers the popover on click. Typically a button or icon.' },
  { name: 'content', type: 'ReactNode', default: '—', description: 'The content rendered inside the popover panel.' },
  { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Preferred placement relative to the trigger. Auto-flips if insufficient viewport space.' },
  { name: 'isOpen', type: 'boolean', default: 'undefined', description: 'Controlled open state. When provided, the component becomes fully controlled.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined', description: 'Callback fired when the popover open state changes. Required for controlled mode.' },
  { name: 'closeOnClickOutside', type: 'boolean', default: 'true', description: 'Whether clicking outside the popover closes it.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of base popover styles.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function PopoverPage({ theme }: { theme: ThemeTokens }) {
  const [controlledOpen, setControlledOpen] = useState(false);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const popoverContentStyle = {
    padding: '16px',
    fontSize: '14px',
    color: theme.text,
    maxWidth: '240px',
    lineHeight: '1.6',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxPopover
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A floating content panel anchored to a trigger element. Supports four placements
        with automatic flipping, controlled and uncontrolled modes, click-outside dismissal,
        and portal rendering for correct z-index stacking.
      </p>

      {/* ── 1. Basic Popover ── */}
      <DemoSection
        title="Basic Popover"
        description="Click the trigger button to toggle a popover with content. By default, the popover appears below the trigger and closes when clicking outside."
        theme={theme}
        code={`<TkxPopover
  trigger={<TkxButton>Open Popover</TkxButton>}
  content={
    <div style={{ padding: 16 }}>
      <p>This is the popover content.</p>
    </div>
  }
/>`}
      >
        <TkxPopover
          trigger={<TkxButton>Open Popover</TkxButton>}
          content={
            <div style={popoverContentStyle}>
              <p style={{ margin: '0 0 8px', fontWeight: 600 }}>Popover Title</p>
              <p style={{ margin: 0, color: theme.textMuted }}>
                This is a basic popover with some descriptive content inside.
              </p>
            </div>
          }
        />
      </DemoSection>

      {/* ── 2. Placements ── */}
      <DemoSection
        title="Placements"
        description="Use the placement prop to position the popover relative to the trigger: top, bottom, left, or right. The popover auto-flips when there is insufficient viewport space."
        theme={theme}
        code={`<TkxPopover placement="top"    trigger={<TkxButton>Top</TkxButton>}    content={...} />
<TkxPopover placement="bottom" trigger={<TkxButton>Bottom</TkxButton>} content={...} />
<TkxPopover placement="left"   trigger={<TkxButton>Left</TkxButton>}   content={...} />
<TkxPopover placement="right"  trigger={<TkxButton>Right</TkxButton>}  content={...} />`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', padding: '40px 0' }}>
          {(['top', 'bottom', 'left', 'right'] as const).map((placement) => (
            <TkxPopover
              key={placement}
              placement={placement}
              trigger={
                <TkxButton variant="outline" style={{ textTransform: 'capitalize' }}>
                  {placement}
                </TkxButton>
              }
              content={
                <div style={popoverContentStyle}>
                  <p style={{ margin: 0, color: theme.textMuted }}>
                    Popover placed on the <strong style={{ color: theme.text }}>{placement}</strong>.
                  </p>
                </div>
              }
            />
          ))}
        </div>
      </DemoSection>

      {/* ── 3. Controlled Popover ── */}
      <DemoSection
        title="Controlled Popover"
        description="Pass isOpen and onOpenChange to fully control the popover state externally. This allows programmatic open/close, integration with other UI state, or preventing close under certain conditions."
        theme={theme}
        code={`const [open, setOpen] = useState(false);

<TkxPopover
  isOpen={open}
  onOpenChange={setOpen}
  trigger={<TkxButton>Controlled</TkxButton>}
  content={
    <div style={{ padding: 16 }}>
      <p>Controlled popover content</p>
      <TkxButton size="sm" onClick={() => setOpen(false)}>
        Close
      </TkxButton>
    </div>
  }
/>

<TkxButton variant="outline" onClick={() => setOpen(!open)}>
  Toggle from outside
</TkxButton>`}
      >
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          <TkxPopover
            isOpen={controlledOpen}
            onOpenChange={setControlledOpen}
            trigger={<TkxButton>Controlled Trigger</TkxButton>}
            content={
              <div style={popoverContentStyle}>
                <p style={{ margin: '0 0 12px', fontWeight: 600 }}>Controlled Popover</p>
                <p style={{ margin: '0 0 12px', color: theme.textMuted }}>
                  This popover is externally controlled.
                </p>
                <TkxButton size="sm" onClick={() => setControlledOpen(false)}>
                  Close from inside
                </TkxButton>
              </div>
            }
          />
          <TkxButton variant="outline" onClick={() => setControlledOpen(!controlledOpen)}>
            Toggle from outside
          </TkxButton>
          <span style={{ fontSize: '13px', color: theme.textMuted }}>
            State: <strong style={{ color: controlledOpen ? theme.primary : theme.text }}>{controlledOpen ? 'Open' : 'Closed'}</strong>
          </span>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={POPOVER_PROPS} />
      </div>
    </div>
  );
}
