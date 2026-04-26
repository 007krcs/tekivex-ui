import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxSnackbar, TkxButton } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Basic Demo ───────────────────────────────────────────────────────────────

function BasicDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <TkxButton onClick={() => setOpen(true)} disabled={open}>
        Show Snackbar
      </TkxButton>
      <TkxSnackbar
        message="This is a basic snackbar notification."
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

// ── Action Demo ──────────────────────────────────────────────────────────────

function ActionDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <TkxButton onClick={() => setOpen(true)} disabled={open}>
        Show with Action
      </TkxButton>
      <TkxSnackbar
        message="Item moved to trash."
        isOpen={open}
        onClose={() => setOpen(false)}
        action={{ label: 'Undo', onClick: () => setOpen(false) }}
        autoHideDuration={8000}
      />
    </div>
  );
}

// ── Variants Demo ────────────────────────────────────────────────────────────

function VariantsDemo() {
  const [active, setActive] = useState<string | null>(null);

  const variants = [
    { key: 'success', label: 'Success', message: 'Changes saved successfully!', color: 'success' as const },
    { key: 'error', label: 'Error', message: 'Failed to save changes.', color: 'danger' as const },
    { key: 'warning', label: 'Warning', message: 'Your session will expire soon.', color: 'warning' as const },
    { key: 'info', label: 'Info', message: 'A new update is available.', color: 'primary' as const },
  ];

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {variants.map((v) => (
          <TkxButton
            key={v.key}
            colorScheme={v.color}
            onClick={() => setActive(v.key)}
            disabled={active === v.key}
          >
            {v.label}
          </TkxButton>
        ))}
      </div>
      {variants.map((v) => (
        <TkxSnackbar
          key={v.key}
          message={v.message}
          isOpen={active === v.key}
          onClose={() => setActive(null)}
          variant={v.key as 'success' | 'error' | 'warning' | 'info'}
        />
      ))}
    </div>
  );
}

// ── Positions Demo ───────────────────────────────────────────────────────────

function PositionsDemo() {
  const [active, setActive] = useState<string | null>(null);

  const positions = [
    { key: 'bottom-left', label: 'Bottom Left' },
    { key: 'bottom-center', label: 'Bottom Center' },
    { key: 'bottom-right', label: 'Bottom Right' },
    { key: 'top-center', label: 'Top Center' },
  ] as const;

  return (
    <div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {positions.map((p) => (
          <TkxButton
            key={p.key}
            variant="outline"
            onClick={() => setActive(p.key)}
            disabled={active === p.key}
          >
            {p.label}
          </TkxButton>
        ))}
      </div>
      {positions.map((p) => (
        <TkxSnackbar
          key={p.key}
          message={`Snackbar at ${p.label.toLowerCase()}`}
          isOpen={active === p.key}
          onClose={() => setActive(null)}
          position={p.key}
        />
      ))}
    </div>
  );
}

// ── SnackbarPage ─────────────────────────────────────────────────────────────

export function SnackbarPage({ theme }: Props) {
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

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <h1 style={h1Style}>TkxSnackbar</h1>
      <p style={leadStyle}>
        A lightweight notification bar that appears briefly at the edge of the
        screen. Supports five semantic variants, four positions, optional action
        buttons, configurable auto-hide duration, and custom icons.
      </p>

      {/* ── Basic ── */}
      <DemoSection
        title="Basic Snackbar"
        description="A minimal snackbar with a message that auto-dismisses after the default duration (5 seconds). Controlled via isOpen and onClose."
        theme={theme}
        code={`const [open, setOpen] = useState(false);

<TkxButton onClick={() => setOpen(true)}>
  Show Snackbar
</TkxButton>

<TkxSnackbar
  message="This is a basic snackbar notification."
  isOpen={open}
  onClose={() => setOpen(false)}
/>`}
      >
        <BasicDemo />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── With Action ── */}
      <DemoSection
        title="With Action Button"
        description="Pass an action object with label and onClick to add an inline action button. Useful for undo operations or navigation."
        theme={theme}
        code={`<TkxSnackbar
  message="Item moved to trash."
  isOpen={open}
  onClose={() => setOpen(false)}
  action={{ label: 'Undo', onClick: () => setOpen(false) }}
  autoHideDuration={8000}
/>`}
      >
        <ActionDemo />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Variants ── */}
      <DemoSection
        title="Semantic Variants"
        description="Four semantic variants — success, error, warning, info — each with a distinct color and icon. The default variant uses the surface color."
        theme={theme}
        code={`<TkxSnackbar message="Changes saved!"       variant="success" isOpen={open} onClose={onClose} />
<TkxSnackbar message="Failed to save."       variant="error"   isOpen={open} onClose={onClose} />
<TkxSnackbar message="Session expiring soon." variant="warning" isOpen={open} onClose={onClose} />
<TkxSnackbar message="Update available."      variant="info"    isOpen={open} onClose={onClose} />`}
      >
        <VariantsDemo />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Positions ── */}
      <DemoSection
        title="Screen Positions"
        description="The position prop controls where the snackbar appears. Choose from bottom-left, bottom-center, bottom-right, or top-center."
        theme={theme}
        code={`<TkxSnackbar message="Bottom left"   position="bottom-left"   isOpen={open} onClose={onClose} />
<TkxSnackbar message="Bottom center" position="bottom-center" isOpen={open} onClose={onClose} />
<TkxSnackbar message="Bottom right"  position="bottom-right"  isOpen={open} onClose={onClose} />
<TkxSnackbar message="Top center"    position="top-center"    isOpen={open} onClose={onClose} />`}
      >
        <PositionsDemo />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'message', type: 'string', required: true, description: 'The notification message displayed in the snackbar.' },
            { name: 'isOpen', type: 'boolean', required: true, description: 'Controls visibility. When true the snackbar animates in; when false it animates out.' },
            { name: 'onClose', type: '() => void', description: 'Callback fired when the snackbar dismisses (by timeout or user action).' },
            { name: 'action', type: '{ label: string; onClick: () => void }', description: 'Optional inline action button with a label and click handler.' },
            { name: 'variant', type: '"default" | "success" | "error" | "warning" | "info"', default: '"default"', description: 'Semantic variant controlling color and icon.' },
            { name: 'position', type: '"bottom-left" | "bottom-center" | "bottom-right" | "top-center"', default: '"bottom-left"', description: 'Screen edge position of the snackbar.' },
            { name: 'autoHideDuration', type: 'number', default: '5000', description: 'Time in milliseconds before the snackbar auto-dismisses. Pass 0 to disable auto-hide.' },
            { name: 'icon', type: 'ReactNode', description: 'Custom icon overriding the default variant icon.' },
          ]}
        />
      </section>
    </div>
  );
}
