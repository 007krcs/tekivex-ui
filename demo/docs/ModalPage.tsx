import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxButton, TkxProgress, TkxAlert, TkxBadge, TkxModal, TkxInput } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Form Modal Demo ───────────────────────────────────────────────────────────

function FormModalDemo({ theme }: { theme: ThemeTokens }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setSubmitted(false);
  };

  return (
    <>
      <TkxButton colorScheme="primary" size="sm" onClick={() => { setSubmitted(false); setOpen(true); }}>
        Open form modal
      </TkxButton>
      {submitted && (
        <div style={{ marginTop: 10 }}>
          <TkxAlert variant="success" title="Profile updated">
            Name: <strong>{name || '(none)'}</strong> · Email: <strong>{email || '(none)'}</strong>
          </TkxAlert>
        </div>
      )}
      <TkxModal
        isOpen={open}
        onClose={handleClose}
        title="Edit Profile"
        size="sm"
        footer={
          <>
            <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={handleClose}>
              Cancel
            </TkxButton>
            <TkxButton colorScheme="primary" size="sm" onClick={handleSubmit}>
              Save changes
            </TkxButton>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <TkxInput
            label="Full name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            isRequired
          />
          <TkxInput
            label="Email address"
            type="email"
            placeholder="jane@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            isRequired
          />
        </div>
      </TkxModal>
    </>
  );
}

// ── Confirmation Dialog Demo ───────────────────────────────────────────────────

function ConfirmationDialogDemo({ theme }: { theme: ThemeTokens }) {
  const [open, setOpen] = useState(false);
  const [deleted, setDeleted] = useState(false);

  const confirm = () => { setDeleted(true); setOpen(false); };

  return (
    <>
      <TkxButton colorScheme="danger" variant="outline" size="sm" onClick={() => { setDeleted(false); setOpen(true); }}>
        Delete account
      </TkxButton>
      {deleted && (
        <div style={{ marginTop: 10 }}>
          <TkxAlert variant="danger" title="Account deleted">
            The account has been permanently removed.
          </TkxAlert>
        </div>
      )}
      <TkxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Delete Account?"
        size="sm"
        footer={
          <>
            <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={() => setOpen(false)}>
              Cancel
            </TkxButton>
            <TkxButton colorScheme="danger" size="sm" onClick={confirm}>
              Yes, delete permanently
            </TkxButton>
          </>
        }
      >
        <div>
          <TkxAlert variant="danger" title="This action cannot be undone">
            All your data, projects, and billing information will be permanently erased.
            There is no recovery option.
          </TkxAlert>
          <p style={{ marginTop: 16, fontSize: 14, lineHeight: 1.6, color: theme.text }}>
            Are you sure you want to delete your account?
          </p>
        </div>
      </TkxModal>
    </>
  );
}

// ── Nested Modals Demo ────────────────────────────────────────────────────────

function NestedModalsDemo() {
  const [outerOpen, setOuterOpen] = useState(false);
  const [innerOpen, setInnerOpen] = useState(false);

  return (
    <>
      <TkxButton colorScheme="primary" size="sm" onClick={() => setOuterOpen(true)}>
        Open outer modal
      </TkxButton>

      <TkxModal
        isOpen={outerOpen}
        onClose={() => { setOuterOpen(false); setInnerOpen(false); }}
        title="Outer Modal"
        size="md"
        footer={
          <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={() => { setOuterOpen(false); setInnerOpen(false); }}>
            Close
          </TkxButton>
        }
      >
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: '0 0 16px' }}>
          This is the outer modal. Click the button below to open a second,
          nested modal on top of this one.
        </p>
        <TkxButton colorScheme="primary" size="sm" onClick={() => setInnerOpen(true)}>
          Open inner modal
        </TkxButton>

        <TkxModal
          isOpen={innerOpen}
          onClose={() => setInnerOpen(false)}
          title="Inner Modal"
          size="sm"
          footer={
            <TkxButton colorScheme="primary" size="sm" onClick={() => setInnerOpen(false)}>
              Got it
            </TkxButton>
          }
        >
          <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            This is the inner (nested) modal. Focus is trapped here while it is open.
            Pressing Escape closes this modal; the outer modal remains.
          </p>
        </TkxModal>
      </TkxModal>
    </>
  );
}

// ── Loading State Modal Demo ──────────────────────────────────────────────────

function LoadingModalDemo() {
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState<number | undefined>(undefined);
  const [done, setDone] = useState(false);

  const startOperation = () => {
    setDone(false);
    setProgress(0);
    setOpen(true);

    let val = 0;
    const id = setInterval(() => {
      val += Math.floor(Math.random() * 12) + 5;
      if (val >= 100) {
        clearInterval(id);
        setProgress(100);
        setTimeout(() => { setDone(true); }, 400);
      } else {
        setProgress(val);
      }
    }, 200);
  };

  return (
    <>
      <TkxButton colorScheme="primary" size="sm" onClick={startOperation} disabled={open}>
        Run async operation
      </TkxButton>

      <TkxModal
        isOpen={open}
        onClose={() => { if (done) { setOpen(false); setProgress(undefined); setDone(false); } }}
        title={done ? 'Operation Complete' : 'Processing…'}
        size="sm"
        closeOnOverlayClick={done}
        footer={
          done ? (
            <TkxButton colorScheme="primary" size="sm" onClick={() => { setOpen(false); setProgress(undefined); setDone(false); }}>
              Done
            </TkxButton>
          ) : undefined
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, alignItems: 'center', textAlign: 'center', padding: '8px 0' }}>
          {done ? (
            <>
              <TkxBadge variant="success" size="lg">Complete</TkxBadge>
              <p style={{ fontSize: 14, margin: 0 }}>All tasks finished successfully.</p>
            </>
          ) : (
            <>
              <TkxProgress variant="circular" size="lg" label="Processing" />
              <div style={{ width: '100%' }}>
                <TkxProgress
                  value={progress}
                  variant="linear"
                  size="md"
                  label="Overall progress"
                  showValue
                />
              </div>
              <p style={{ fontSize: 13, margin: 0 }}>Please wait, this may take a moment…</p>
            </>
          )}
        </div>
      </TkxModal>
    </>
  );
}

// ── Custom Styling Demo ───────────────────────────────────────────────────────

function CustomStylingDemo({ theme }: { theme: ThemeTokens }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <TkxButton colorScheme="primary" size="sm" onClick={() => setOpen(true)}>
        Open styled modal
      </TkxButton>

      <TkxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Custom Styled Modal"
        size="sm"
        footer={
          <TkxButton colorScheme="primary" size="sm" onClick={() => setOpen(false)}>
            Close
          </TkxButton>
        }
      >
        <p style={{ fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          The modal panel accepts a{' '}
          <code style={{ fontFamily: 'monospace', fontSize: 12, backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 4px', borderRadius: 4 }}>
            style
          </code>{' '}
          prop for overriding layout properties. Custom borders, gradients, and backdrop
          colours are possible by targeting the panel via <code style={{ fontFamily: 'monospace', fontSize: 12, backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 4px', borderRadius: 4 }}>className</code>.
        </p>
      </TkxModal>
    </>
  );
}

// ── ModalPage ─────────────────────────────────────────────────────────────────

export function ModalPage({ theme }: Props) {
  // Per-demo open state
  const [basicOpen, setBasicOpen] = useState(false);
  const [smOpen, setSmOpen] = useState(false);
  const [mdOpen, setMdOpen] = useState(false);
  const [lgOpen, setLgOpen] = useState(false);
  const [fullOpen, setFullOpen] = useState(false);
  const [footerOpen, setFooterOpen] = useState(false);
  const [noOverlayOpen, setNoOverlayOpen] = useState(false);

  const pageStyle: CSSProperties = {
    maxWidth: 860,
    margin: '0 auto',
    padding: '48px 32px 80px',
  };

  const heroTagStyle: CSSProperties = {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: 9999,
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.04em',
    backgroundColor: `${theme.primary}18`,
    color: theme.primary,
    border: `1px solid ${theme.primary}35`,
    marginBottom: 24,
  };

  const h1Style: CSSProperties = {
    fontSize: '2rem',
    fontWeight: 800,
    color: theme.text,
    margin: '0 0 12px',
    letterSpacing: '-0.03em',
  };

  const leadStyle: CSSProperties = {
    fontSize: 15,
    color: theme.textMuted,
    lineHeight: 1.7,
    maxWidth: 620,
    margin: '0 0 20px',
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

  const wcagNoteStyle: CSSProperties = {
    fontSize: 13,
    color: theme.textMuted,
    lineHeight: 1.7,
    padding: '16px 18px',
    backgroundColor: `${theme.info}10`,
    border: `1px solid ${theme.info}30`,
    borderRadius: 10,
  };

  const wcagCodeStyle: CSSProperties = {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: 12,
    backgroundColor: `${theme.info}18`,
    color: theme.info,
    padding: '1px 5px',
    borderRadius: 4,
  };

  return (
    <div style={pageStyle}>
      {/* ── Hero ── */}
      <span style={heroTagStyle}>Component Docs</span>
      <h1 style={h1Style}>TkxModal</h1>
      <p style={leadStyle}>
        A portal-based dialog component implementing the WAI-ARIA{' '}
        <strong>dialog</strong> pattern. Provides automatic focus trapping, scroll
        locking, Escape-key dismissal, and focus restoration on close. Supports four
        sizes and an optional footer slot.
      </p>
      <WCAGBadgeGroup
        label="WCAG 2.1 Compliance"
        badges={[
          { criterion: '2.1.2 No Keyboard Trap', level: 'AA', status: 'PASS' },
          { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
          { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      <hr style={dividerStyle} />

      {/* ── Basic Modal ── */}
      <DemoSection
        title="Basic Modal"
        description="Open and close a modal with useState. The modal is portal-rendered to document.body and overlays the page."
        theme={theme}
        code={`const [open, setOpen] = useState(false);

<TkxButton onClick={() => setOpen(true)}>Open modal</TkxButton>

<TkxModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Welcome"
  size="md"
>
  <p>This is the modal body. Press Escape or click the backdrop to close.</p>
</TkxModal>`}
      >
        <TkxButton colorScheme="primary" size="sm" onClick={() => setBasicOpen(true)}>
          Open modal
        </TkxButton>
        <TkxModal
          isOpen={basicOpen}
          onClose={() => setBasicOpen(false)}
          title="Welcome"
          size="md"
        >
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: theme.text }}>
            This is the modal body. Press{' '}
            <kbd style={wcagCodeStyle}>Escape</kbd> or click the backdrop to close.
            Focus is automatically trapped inside while the modal is open.
          </p>
        </TkxModal>
      </DemoSection>

      {/* ── Modal Sizes ── */}
      <DemoSection
        title="Modal Sizes"
        description="Four sizes — sm (400 px), md (560 px, default), lg (720 px), and full (100vw). Each uses separate useState to allow independent open/close."
        theme={theme}
        code={`const [smOpen, setSmOpen] = useState(false);
const [mdOpen, setMdOpen] = useState(false);
const [lgOpen, setLgOpen] = useState(false);
const [fullOpen, setFullOpen] = useState(false);

<TkxButton onClick={() => setSmOpen(true)}>sm</TkxButton>
<TkxButton onClick={() => setMdOpen(true)}>md</TkxButton>
<TkxButton onClick={() => setLgOpen(true)}>lg</TkxButton>
<TkxButton onClick={() => setFullOpen(true)}>full</TkxButton>

<TkxModal isOpen={smOpen}   onClose={() => setSmOpen(false)}   title="Small modal"      size="sm">   …</TkxModal>
<TkxModal isOpen={mdOpen}   onClose={() => setMdOpen(false)}   title="Medium modal"     size="md">   …</TkxModal>
<TkxModal isOpen={lgOpen}   onClose={() => setLgOpen(false)}   title="Large modal"      size="lg">   …</TkxModal>
<TkxModal isOpen={fullOpen} onClose={() => setFullOpen(false)} title="Full-screen modal" size="full"> …</TkxModal>`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            { label: 'sm', open: smOpen, setOpen: setSmOpen },
            { label: 'md', open: mdOpen, setOpen: setMdOpen },
            { label: 'lg', open: lgOpen, setOpen: setLgOpen },
            { label: 'full', open: fullOpen, setOpen: setFullOpen },
          ].map(({ label, open, setOpen: setter }) => (
            <TkxButton key={label} colorScheme="primary" variant="outline" size="sm" onClick={() => setter(true)}>
              Size: {label}
            </TkxButton>
          ))}
        </div>

        {[
          { label: 'sm', size: 'sm' as const, open: smOpen, setOpen: setSmOpen },
          { label: 'md', size: 'md' as const, open: mdOpen, setOpen: setMdOpen },
          { label: 'lg', size: 'lg' as const, open: lgOpen, setOpen: setLgOpen },
          { label: 'full', size: 'full' as const, open: fullOpen, setOpen: setFullOpen },
        ].map(({ label, size, open, setOpen: setter }) => (
          <TkxModal
            key={label}
            isOpen={open}
            onClose={() => setter(false)}
            title={`${label.charAt(0).toUpperCase() + label.slice(1)} modal (${label})`}
            size={size}
            footer={
              <TkxButton colorScheme="primary" size="sm" onClick={() => setter(false)}>
                Close
              </TkxButton>
            }
          >
            <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: theme.text }}>
              This modal uses <code style={wcagCodeStyle}>size="{label}"</code>.
              The panel max-width is{' '}
              {{ sm: '400 px', md: '560 px', lg: '720 px', full: '100vw' }[label]}.
            </p>
          </TkxModal>
        ))}
      </DemoSection>

      {/* ── With Footer Actions ── */}
      <DemoSection
        title="With Footer Actions"
        description="Pass a footer prop to render Cancel / Confirm buttons in the modal footer bar. The footer is fixed-height and scrolls independently from the body."
        theme={theme}
        code={`<TkxModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Publish article?"
  size="sm"
  footer={
    <>
      <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </TkxButton>
      <TkxButton colorScheme="primary" size="sm" onClick={handleConfirm}>
        Publish
      </TkxButton>
    </>
  }
>
  <p>The article will be visible to all readers immediately.</p>
</TkxModal>`}
      >
        <TkxButton colorScheme="primary" size="sm" onClick={() => setFooterOpen(true)}>
          Open modal with footer
        </TkxButton>
        <TkxModal
          isOpen={footerOpen}
          onClose={() => setFooterOpen(false)}
          title="Publish article?"
          size="sm"
          footer={
            <>
              <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={() => setFooterOpen(false)}>
                Cancel
              </TkxButton>
              <TkxButton colorScheme="primary" size="sm" onClick={() => setFooterOpen(false)}>
                Publish
              </TkxButton>
            </>
          }
        >
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: theme.text }}>
            The article will be visible to all readers immediately upon confirmation.
            You can unpublish it at any time from the dashboard.
          </p>
        </TkxModal>
      </DemoSection>

      {/* ── Confirmation Dialog ── */}
      <DemoSection
        title="Confirmation Dialog"
        description="A danger-themed confirmation modal for destructive actions. Uses a danger alert in the body and a red confirm button to reinforce severity."
        theme={theme}
        code={`<TkxModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Delete Account?"
  size="sm"
  footer={
    <>
      <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </TkxButton>
      <TkxButton colorScheme="danger" size="sm" onClick={confirmDelete}>
        Yes, delete permanently
      </TkxButton>
    </>
  }
>
  <TkxAlert variant="danger" title="This action cannot be undone">
    All data will be permanently erased.
  </TkxAlert>
</TkxModal>`}
      >
        <ConfirmationDialogDemo theme={theme} />
      </DemoSection>

      {/* ── Form Modal ── */}
      <DemoSection
        title="Form Modal"
        description="A modal containing TkxInput fields. Labels and focus management are handled automatically — the first focusable element inside receives focus on open."
        theme={theme}
        code={`const [name, setName] = useState('');
const [email, setEmail] = useState('');

<TkxModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Edit Profile"
  size="sm"
  footer={
    <>
      <TkxButton variant="outline" colorScheme="secondary" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </TkxButton>
      <TkxButton colorScheme="primary" size="sm" onClick={handleSubmit}>
        Save changes
      </TkxButton>
    </>
  }
>
  <TkxInput label="Full name"      placeholder="Jane Doe"          value={name}  onChange={e => setName(e.target.value)}  isRequired />
  <TkxInput label="Email address"  type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} isRequired />
</TkxModal>`}
      >
        <FormModalDemo theme={theme} />
      </DemoSection>

      {/* ── No Overlay Close ── */}
      <DemoSection
        title="No Overlay Close"
        description="Set closeOnOverlayClick=false to prevent the modal from closing when the user clicks the backdrop. Useful for forms with unsaved state."
        theme={theme}
        code={`<TkxModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Unsaved Changes"
  size="sm"
  closeOnOverlayClick={false}
>
  <p>Clicking outside this modal does nothing. Only the × button or Escape closes it.</p>
</TkxModal>`}
      >
        <TkxButton colorScheme="primary" size="sm" onClick={() => setNoOverlayOpen(true)}>
          Open (no overlay close)
        </TkxButton>
        <TkxModal
          isOpen={noOverlayOpen}
          onClose={() => setNoOverlayOpen(false)}
          title="Unsaved Changes"
          size="sm"
          closeOnOverlayClick={false}
          footer={
            <TkxButton colorScheme="primary" size="sm" onClick={() => setNoOverlayOpen(false)}>
              Dismiss
            </TkxButton>
          }
        >
          <p style={{ fontSize: 14, lineHeight: 1.7, margin: 0, color: theme.text }}>
            Clicking outside this modal has no effect.{' '}
            Use the <strong>×</strong> button, the <kbd style={wcagCodeStyle}>Escape</kbd> key,
            or the Dismiss button below to close.
          </p>
        </TkxModal>
      </DemoSection>

      {/* ── Nested Modals ── */}
      <DemoSection
        title="Nested Modals"
        description="A second modal opened from within the first. Each modal independently manages scroll lock, focus trap, and Escape handling using a shared scroll-lock counter."
        theme={theme}
        code={`const [outerOpen, setOuterOpen] = useState(false);
const [innerOpen, setInnerOpen] = useState(false);

<TkxModal isOpen={outerOpen} onClose={() => { setOuterOpen(false); setInnerOpen(false); }} title="Outer Modal">
  <TkxButton onClick={() => setInnerOpen(true)}>Open inner modal</TkxButton>

  <TkxModal isOpen={innerOpen} onClose={() => setInnerOpen(false)} title="Inner Modal" size="sm">
    <p>Focus is trapped here while this modal is open.</p>
  </TkxModal>
</TkxModal>`}
      >
        <NestedModalsDemo />
      </DemoSection>

      {/* ── Loading State Modal ── */}
      <DemoSection
        title="Loading State Modal"
        description="A modal displaying TkxProgress (both circular and linear) during an async operation. The close button and overlay click are disabled until the task completes."
        theme={theme}
        code={`const [open, setOpen] = useState(false);
const [progress, setProgress] = useState<number | undefined>(undefined);

<TkxModal
  isOpen={open}
  onClose={() => { if (done) setOpen(false); }}
  title={done ? 'Operation Complete' : 'Processing…'}
  size="sm"
  closeOnOverlayClick={done}
>
  {done ? (
    <TkxBadge variant="success" size="lg">Complete</TkxBadge>
  ) : (
    <>
      <TkxProgress variant="circular" size="lg" label="Processing" />
      <TkxProgress value={progress} variant="linear" size="md" label="Overall progress" showValue />
    </>
  )}
</TkxModal>`}
      >
        <LoadingModalDemo />
      </DemoSection>

      {/* ── Custom Styling ── */}
      <DemoSection
        title="Custom Styling"
        description="The modal dialog panel forwards className and style, allowing custom borders, radii, and background colours. The overlay and backdrop are separate from the panel."
        theme={theme}
        code={`<TkxModal
  isOpen={open}
  onClose={() => setOpen(false)}
  title="Custom Styled Modal"
  size="sm"
>
  <p>Pass className or style to the modal to override the panel appearance.</p>
</TkxModal>`}
      >
        <CustomStylingDemo theme={theme} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Prop Table ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'isOpen', type: 'boolean', required: true, description: 'Controls whether the modal is visible. Manage with useState.' },
            { name: 'onClose', type: '() => void', required: true, description: 'Callback fired when the user closes the modal (× button, Escape, or overlay click).' },
            { name: 'title', type: 'string', required: true, description: 'Dialog title rendered in the header and used as aria-labelledby for the dialog element.' },
            { name: 'children', type: 'ReactNode', required: true, description: 'Modal body content. Any ReactNode is accepted.' },
            { name: 'size', type: '"sm" | "md" | "lg" | "full"', default: '"md"', description: 'Controls the max-width of the dialog panel. "full" stretches to the full viewport.' },
            { name: 'closeOnOverlayClick', type: 'boolean', default: 'true', description: 'When false, clicking the backdrop does not fire onClose.' },
            { name: 'closeOnEscape', type: 'boolean', default: 'true', description: 'When false, pressing Escape does not fire onClose.' },
            { name: 'footer', type: 'ReactNode', description: 'Content rendered in the footer bar, typically action buttons. Omit to hide the footer.' },
          ]}
        />
      </section>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <section aria-labelledby="wcag-heading">
        <h2 id="wcag-heading" style={sectionHeadStyle}>Accessibility Notes</h2>
        <div style={wcagNoteStyle}>
          <p style={{ margin: '0 0 10px' }}>
            <code style={wcagCodeStyle}>TkxModal</code> implements the WAI-ARIA{' '}
            <a href="https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/" style={{ color: theme.info }}>
              dialog (modal) pattern
            </a>{' '}
            with the following built-in behaviours:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>
              <strong>Focus trap</strong> — keyboard focus is confined to the modal panel via{' '}
              <code style={wcagCodeStyle}>useFocusTrap()</code>. Tab and Shift+Tab cycle only
              through focusable elements inside the dialog, preventing users from interacting
              with background content (WCAG 2.1.2).
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>Focus restoration</strong> — when the modal closes, focus returns to the
              element that triggered it, preserving navigation context for keyboard and screen
              reader users.
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>Scroll lock</strong> — <code style={wcagCodeStyle}>document.body.overflow</code>{' '}
              is set to <code style={wcagCodeStyle}>hidden</code> while a modal is open. A
              reference counter handles nested modals so scroll is only restored when all
              modals are closed.
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>ARIA attributes</strong> — the panel carries{' '}
              <code style={wcagCodeStyle}>role="dialog"</code>,{' '}
              <code style={wcagCodeStyle}>aria-modal="true"</code>, and{' '}
              <code style={wcagCodeStyle}>aria-labelledby</code> pointing to the title heading,
              giving screen readers a complete accessible description.
            </li>
            <li>
              <strong>Escape key</strong> — pressing <kbd style={wcagCodeStyle}>Escape</kbd>{' '}
              fires <code style={wcagCodeStyle}>onClose</code> by default. Set{' '}
              <code style={wcagCodeStyle}>closeOnEscape=false</code> only when the dialog
              contains an action that cannot be safely abandoned.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
