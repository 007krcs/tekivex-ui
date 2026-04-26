import { useState, useEffect, type CSSProperties } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxButton, TkxAlert, TkxBadge } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Success Toast Pattern Demo ────────────────────────────────────────────────

function SuccessToastDemo({ theme }: { theme: ThemeTokens }) {
  const [visible, setVisible] = useState(false);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!visible) return;
    setCountdown(3);
    const cd = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(cd); return 0; }
        return c - 1;
      });
    }, 1000);
    const dismiss = setTimeout(() => setVisible(false), 3000);
    return () => { clearInterval(cd); clearTimeout(dismiss); };
  }, [visible]);

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <TkxButton
        size="sm"
        colorScheme="success"
        onClick={() => setVisible(true)}
        disabled={visible}
      >
        Trigger success alert
      </TkxButton>
      {visible && (
        <div style={{ marginTop: 12 }}>
          <TkxAlert
            variant="success"
            title="Changes saved"
            dismissible
            onDismiss={() => setVisible(false)}
          >
            Your profile has been updated. Auto-dismissing in {countdown}s.
          </TkxAlert>
        </div>
      )}
    </div>
  );
}

// ── System Notification Demo ──────────────────────────────────────────────────

function SystemNotificationDemo({ theme }: { theme: ThemeTokens }) {
  const [dismissed, setDismissed] = useState(false);

  return (
    <div style={{ width: '100%', maxWidth: 540 }}>
      {dismissed ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: theme.textMuted }}>Banner dismissed.</span>
          <TkxButton size="sm" variant="ghost" colorScheme="primary" onClick={() => setDismissed(false)}>
            Restore
          </TkxButton>
        </div>
      ) : (
        <TkxAlert
          variant="warning"
          title="Scheduled maintenance"
          dismissible
          onDismiss={() => setDismissed(true)}
        >
          The platform will be unavailable on{' '}
          <strong>Saturday, 12 April 2026 from 02:00–04:00 UTC</strong>.
          Please save your work before that window.{' '}
          <a href="#" style={{ color: 'inherit', fontWeight: 600 }}>Learn more</a>
        </TkxAlert>
      )}
    </div>
  );
}

// ── Form Validation Summary Demo ──────────────────────────────────────────────

function FormValidationDemo({ theme }: { theme: ThemeTokens }) {
  const errors = [
    'First name is required.',
    'Email address is not valid.',
    'Password must be at least 8 characters.',
  ];

  const [visible, setVisible] = useState(true);

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      {visible ? (
        <TkxAlert
          variant="danger"
          title={`${errors.length} errors prevented submission`}
          dismissible
          onDismiss={() => setVisible(false)}
        >
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {errors.map((e) => (
              <li key={e} style={{ marginBottom: 3, fontSize: 13 }}>{e}</li>
            ))}
          </ul>
        </TkxAlert>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: theme.textMuted }}>Alert dismissed.</span>
          <TkxButton size="sm" variant="ghost" colorScheme="primary" onClick={() => setVisible(true)}>
            Restore
          </TkxButton>
        </div>
      )}
    </div>
  );
}

// ── Custom Content Demo ───────────────────────────────────────────────────────

function CustomContentDemo({ theme }: { theme: ThemeTokens }) {
  const inlineCodeStyle: CSSProperties = {
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    fontSize: 12,
    backgroundColor: `${theme.info}22`,
    color: theme.info,
    padding: '1px 5px',
    borderRadius: 4,
    border: `1px solid ${theme.info}30`,
  };

  return (
    <div style={{ width: '100%', maxWidth: 540 }}>
      <TkxAlert variant="info" title="API rate limiting applied">
        Your current plan allows{' '}
        <strong>1 000 requests / minute</strong>. You are at{' '}
        <TkxBadge variant="warning" size="sm">87%</TkxBadge> capacity.
        Upgrade to the Pro plan or throttle requests by setting{' '}
        <code style={inlineCodeStyle}>X-Rate-Limit-Strategy: backoff</code> in
        your request headers.{' '}
        <a href="#" style={{ color: 'inherit', fontWeight: 600, textDecoration: 'underline' }}>
          View rate limit docs
        </a>
      </TkxAlert>
    </div>
  );
}

// ── Alert Stack Demo ──────────────────────────────────────────────────────────

function AlertStackDemo({ theme }: { theme: ThemeTokens }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const alerts: { id: string; variant: 'info' | 'success' | 'warning' | 'danger'; title: string; body: string }[] = [
    { id: 'a1', variant: 'success', title: 'Deployment complete', body: 'v2.4.1 is live on production. Zero downtime detected.' },
    { id: 'a2', variant: 'warning', title: 'High memory usage', body: 'Worker process is using 89% of available RAM.' },
    { id: 'a3', variant: 'danger', title: 'Build failed', body: 'Step "lint" exited with code 1. Check the build logs.' },
  ];

  const visible = alerts.filter((a) => !dismissed.has(a.id));

  return (
    <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {visible.length === 0 ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: theme.textMuted }}>All alerts dismissed.</span>
          <TkxButton size="sm" variant="ghost" colorScheme="primary" onClick={() => setDismissed(new Set())}>
            Reset
          </TkxButton>
        </div>
      ) : (
        visible.map((a) => (
          <TkxAlert
            key={a.id}
            variant={a.variant}
            title={a.title}
            dismissible
            onDismiss={() => setDismissed((s) => new Set([...s, a.id]))}
          >
            {a.body}
          </TkxAlert>
        ))
      )}
    </div>
  );
}

// ── Dismissible Demo ──────────────────────────────────────────────────────────

function DismissibleDemo({ theme }: { theme: ThemeTokens }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      {open ? (
        <TkxAlert
          variant="info"
          title="New feature available"
          dismissible
          onDismiss={() => setOpen(false)}
        >
          The redesigned dashboard is now available to all users.{' '}
          <a href="#" style={{ color: 'inherit', fontWeight: 600 }}>Enable it in settings</a>
        </TkxAlert>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 13, color: theme.textMuted }}>Alert dismissed.</span>
          <TkxButton size="sm" variant="ghost" colorScheme="primary" onClick={() => setOpen(true)}>
            Show again
          </TkxButton>
        </div>
      )}
    </div>
  );
}

// ── Custom Icon Demo ──────────────────────────────────────────────────────────

function CustomIconDemo() {
  const RocketIcon = (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );

  return (
    <div style={{ width: '100%', maxWidth: 480 }}>
      <TkxAlert
        variant="success"
        title="Release shipped!"
        icon={RocketIcon}
      >
        Version 3.0.0 has been deployed to all regions. Check the changelog for full release notes.
      </TkxAlert>
    </div>
  );
}

// ── AlertPage ─────────────────────────────────────────────────────────────────

export function AlertPage({ theme }: Props) {
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
      <h1 style={h1Style}>TkxAlert</h1>
      <p style={leadStyle}>
        An inline notification component with four semantic variants — info, success,
        warning, and danger. Automatically applies the correct WAI-ARIA live region role
        ({' '}
        <code style={{ ...wcagCodeStyle, fontSize: 13 }}>role="alert"</code> for danger/warning,{' '}
        <code style={{ ...wcagCodeStyle, fontSize: 13 }}>role="status"</code> for info/success)
        and announces to screen readers via <code style={{ ...wcagCodeStyle, fontSize: 13 }}>aria-live</code>.
      </p>
      <WCAGBadgeGroup
        label="WCAG 2.1 Compliance"
        badges={[
          { criterion: '1.4.1 Use of Color', level: 'AA', status: 'PASS' },
          { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
          { criterion: '4.1.3 Status Messages', level: 'AA', status: 'PASS' },
        ]}
      />

      <hr style={dividerStyle} />

      {/* ── All Variants ── */}
      <DemoSection
        title="All Variants"
        description="The four semantic variants — info, success, warning, danger — each with an appropriate icon and colour treatment."
        theme={theme}
        code={`<TkxAlert variant="info">    This is an informational message.</TkxAlert>
<TkxAlert variant="success"> Your changes have been saved successfully.</TkxAlert>
<TkxAlert variant="warning"> Your session will expire in 5 minutes.</TkxAlert>
<TkxAlert variant="danger">  Unable to delete resource. Check permissions.</TkxAlert>`}
      >
        <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TkxAlert variant="info">This is an informational message.</TkxAlert>
          <TkxAlert variant="success">Your changes have been saved successfully.</TkxAlert>
          <TkxAlert variant="warning">Your session will expire in 5 minutes.</TkxAlert>
          <TkxAlert variant="danger">Unable to delete resource. Check permissions.</TkxAlert>
        </div>
      </DemoSection>

      {/* ── With Title ── */}
      <DemoSection
        title="With Title"
        description="Pass the title prop to add a bold heading above the body content. The title is also used for the screen reader announcement."
        theme={theme}
        code={`<TkxAlert variant="info"    title="Did you know?">       You can export data in CSV, JSON, or XML formats.</TkxAlert>
<TkxAlert variant="success" title="Payment received">     Invoice #1082 for $240.00 has been paid.</TkxAlert>
<TkxAlert variant="warning" title="Quota almost reached"> 92% of your monthly request limit used.</TkxAlert>
<TkxAlert variant="danger"  title="Authentication failed">Invalid credentials. Account locked after 3 attempts.</TkxAlert>`}
      >
        <div style={{ width: '100%', maxWidth: 540, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <TkxAlert variant="info" title="Did you know?">You can export data in CSV, JSON, or XML formats.</TkxAlert>
          <TkxAlert variant="success" title="Payment received">Invoice #1082 for $240.00 has been paid.</TkxAlert>
          <TkxAlert variant="warning" title="Quota almost reached">92% of your monthly request limit used.</TkxAlert>
          <TkxAlert variant="danger" title="Authentication failed">Invalid credentials. Account locked after 3 attempts.</TkxAlert>
        </div>
      </DemoSection>

      {/* ── Dismissible ── */}
      <DemoSection
        title="Dismissible"
        description="Pass dismissible and onDismiss to add a close button. Visibility is controlled via useState."
        theme={theme}
        code={`const [open, setOpen] = useState(true);

{open && (
  <TkxAlert
    variant="info"
    title="New feature available"
    dismissible
    onDismiss={() => setOpen(false)}
  >
    The redesigned dashboard is now available to all users.
  </TkxAlert>
)}`}
      >
        <DismissibleDemo theme={theme} />
      </DemoSection>

      {/* ── Custom Icon ── */}
      <DemoSection
        title="Custom Icon"
        description="Replace the default variant icon with any ReactNode via the icon prop. Provide aria-hidden on the icon element to avoid duplicate announcements."
        theme={theme}
        code={`const RocketIcon = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
       stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84..." />
    {/* ... */}
  </svg>
);

<TkxAlert variant="success" title="Release shipped!" icon={RocketIcon}>
  Version 3.0.0 has been deployed to all regions.
</TkxAlert>`}
      >
        <CustomIconDemo />
      </DemoSection>

      {/* ── Alert Stack ── */}
      <DemoSection
        title="Alert Stack"
        description="Multiple alerts stacked vertically. Each is independently dismissible. Demonstrates layout with a list of concurrent notifications."
        theme={theme}
        code={`const [dismissed, setDismissed] = useState<Set<string>>(new Set());
const alerts = [
  { id: 'a1', variant: 'success', title: 'Deployment complete', body: '...' },
  { id: 'a2', variant: 'warning', title: 'High memory usage', body: '...' },
  { id: 'a3', variant: 'danger',  title: 'Build failed', body: '...' },
];

{alerts
  .filter(a => !dismissed.has(a.id))
  .map(a => (
    <TkxAlert
      key={a.id}
      variant={a.variant}
      title={a.title}
      dismissible
      onDismiss={() => setDismissed(s => new Set([...s, a.id]))}
    >
      {a.body}
    </TkxAlert>
  ))}`}
      >
        <AlertStackDemo theme={theme} />
      </DemoSection>

      {/* ── System Notification ── */}
      <DemoSection
        title="System Notification Banner"
        description="A realistic full-width maintenance banner with rich content and a dismissible close button."
        theme={theme}
        code={`<TkxAlert
  variant="warning"
  title="Scheduled maintenance"
  dismissible
  onDismiss={() => setDismissed(true)}
>
  The platform will be unavailable on{' '}
  <strong>Saturday, 12 April 2026 from 02:00–04:00 UTC</strong>.
  <a href="#">Learn more</a>
</TkxAlert>`}
      >
        <SystemNotificationDemo theme={theme} />
      </DemoSection>

      {/* ── Form Validation Summary ── */}
      <DemoSection
        title="Form Validation Summary"
        description="A danger alert listing multiple field-level validation errors. Using role=alert ensures screen readers announce the errors immediately when the alert mounts."
        theme={theme}
        code={`<TkxAlert
  variant="danger"
  title={\`\${errors.length} errors prevented submission\`}
  dismissible
  onDismiss={() => setVisible(false)}
>
  <ul>
    {errors.map((e) => <li key={e}>{e}</li>)}
  </ul>
</TkxAlert>`}
      >
        <FormValidationDemo theme={theme} />
      </DemoSection>

      {/* ── Success Toast Pattern ── */}
      <DemoSection
        title="Success Toast Pattern"
        description="A success alert that auto-dismisses after 3 seconds using useEffect. A countdown informs the user before the alert disappears."
        theme={theme}
        code={`const [visible, setVisible] = useState(false);

useEffect(() => {
  if (!visible) return;
  const t = setTimeout(() => setVisible(false), 3000);
  return () => clearTimeout(t);
}, [visible]);

{visible && (
  <TkxAlert variant="success" title="Changes saved" dismissible onDismiss={() => setVisible(false)}>
    Your profile has been updated. Auto-dismissing in {countdown}s.
  </TkxAlert>
)}`}
      >
        <SuccessToastDemo theme={theme} />
      </DemoSection>

      {/* ── Custom Content ── */}
      <DemoSection
        title="Custom Content"
        description="The children prop accepts any ReactNode. Embed inline badges, code snippets, and links for rich notification content."
        theme={theme}
        code={`<TkxAlert variant="info" title="API rate limiting applied">
  Your current plan allows <strong>1 000 requests / minute</strong>.
  You are at <TkxBadge variant="warning" size="sm">87%</TkxBadge> capacity.
  Set <code>X-Rate-Limit-Strategy: backoff</code> in your headers.
  <a href="#">View rate limit docs</a>
</TkxAlert>`}
      >
        <CustomContentDemo theme={theme} />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Prop Table ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'variant', type: '"info" | "success" | "warning" | "danger"', required: true, description: 'Semantic variant that controls colour, icon, and ARIA role.' },
            { name: 'children', type: 'ReactNode', required: true, description: 'Body content of the alert. Accepts any ReactNode including rich markup.' },
            { name: 'title', type: 'string', description: 'Optional bold heading displayed above the body. Also used as the screen reader announcement.' },
            { name: 'dismissible', type: 'boolean', default: 'false', description: 'Renders a close button. Must be used together with onDismiss.' },
            { name: 'onDismiss', type: '() => void', description: 'Callback fired when the dismiss button is clicked. Required when dismissible is true.' },
            { name: 'icon', type: 'ReactNode', description: 'Override the default variant icon. Provide aria-hidden on the element to avoid duplicate announcements.' },
            { name: 'className', type: 'string', description: 'Additional CSS class names forwarded to the root element.' },
            { name: 'style', type: 'CSSProperties', description: 'Inline styles forwarded to the root element.' },
          ]}
        />
      </section>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <section aria-labelledby="wcag-heading">
        <h2 id="wcag-heading" style={sectionHeadStyle}>Accessibility Notes</h2>
        <div style={wcagNoteStyle}>
          <p style={{ margin: '0 0 10px' }}>
            <code style={wcagCodeStyle}>TkxAlert</code> selects the correct live region role
            automatically based on the <code style={wcagCodeStyle}>variant</code> prop.
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>
              <strong>danger</strong> and <strong>warning</strong> variants use{' '}
              <code style={wcagCodeStyle}>role="alert"</code>, which maps to an{' '}
              <code style={wcagCodeStyle}>aria-live="assertive"</code> region. Screen readers
              interrupt the current announcement to read the alert immediately.
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>info</strong> and <strong>success</strong> variants use{' '}
              <code style={wcagCodeStyle}>role="status"</code> (
              <code style={wcagCodeStyle}>aria-live="polite"</code>), announcing the message
              after the current speech queue is empty.
            </li>
            <li style={{ marginBottom: 6 }}>
              The <code style={wcagCodeStyle}>title</code> string is also passed to{' '}
              <code style={wcagCodeStyle}>useAnnounce()</code> so it is read aloud even when the
              alert is rendered outside a live region boundary.
            </li>
            <li>
              Color is never the sole means of conveying information — each variant also
              carries a distinct icon shape, satisfying WCAG 1.4.1 Use of Color (Level AA).
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
