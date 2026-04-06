import { useState, type CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxToggle, TkxBadge } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props { theme: ThemeTokens }

// ── Feature Flags Panel Demo ──────────────────────────────────────────────────

function FeatureFlagsDemo({ theme }: { theme: ThemeTokens }) {
  const [flags, setFlags] = useState({
    notifications: true,
    darkMode: false,
    analytics: true,
    autoSave: true,
    betaFeatures: false,
  });

  type FlagKey = keyof typeof flags;

  const toggle = (key: FlagKey) =>
    setFlags((f) => ({ ...f, [key]: !f[key] }));

  const items: { key: FlagKey; label: string; description: string }[] = [
    { key: 'notifications', label: 'Push Notifications', description: 'Receive alerts for activity and mentions.' },
    { key: 'darkMode', label: 'Dark Mode', description: 'Switch the interface to a dark colour scheme.' },
    { key: 'analytics', label: 'Usage Analytics', description: 'Help improve the product by sending anonymous usage data.' },
    { key: 'autoSave', label: 'Auto-save', description: 'Automatically save changes every 30 seconds.' },
    { key: 'betaFeatures', label: 'Beta Features', description: 'Enable experimental features not yet in general availability.' },
  ];

  const panelStyle: CSSProperties = {
    width: '100%',
    maxWidth: 480,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  };

  const panelHeaderStyle: CSSProperties = {
    padding: '14px 18px',
    borderBottom: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const rowStyle = (isLast: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
    gap: 12,
  });

  const enabledCount = Object.values(flags).filter(Boolean).length;

  return (
    <div style={panelStyle} role="group" aria-label="Feature flags settings">
      <div style={panelHeaderStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Feature Flags</span>
        <TkxBadge variant="primary" size="sm">{enabledCount} / {items.length} on</TkxBadge>
      </div>
      {items.map((item, i) => (
        <div key={item.key} style={rowStyle(i === items.length - 1)}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 2 }}>{item.label}</div>
            <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.4 }}>{item.description}</div>
          </div>
          <TkxToggle
            checked={flags[item.key]}
            onChange={() => toggle(item.key)}
            label={item.label}
            hideLabel
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}

// ── Notifications Settings Demo ───────────────────────────────────────────────

function NotificationsDemo({ theme }: { theme: ThemeTokens }) {
  const [settings, setSettings] = useState({
    email: true,
    push: false,
    sms: false,
  });

  type NKey = keyof typeof settings;
  const toggle = (k: NKey) => setSettings((s) => ({ ...s, [k]: !s[k] }));

  const channels: { key: NKey; label: string; description: string; icon: React.ReactNode }[] = [
    {
      key: 'email',
      label: 'Email Notifications',
      description: 'Receive a daily digest and instant alerts via email.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
    },
    {
      key: 'push',
      label: 'Push Notifications',
      description: 'Browser and mobile push alerts for real-time updates.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      key: 'sms',
      label: 'SMS Notifications',
      description: 'Text message alerts for critical account activity.',
      icon: (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
  ];

  const panelStyle: CSSProperties = {
    width: '100%',
    maxWidth: 480,
    border: `1px solid ${theme.border}`,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.surface,
  };

  const panelHeaderStyle: CSSProperties = {
    padding: '14px 18px',
    borderBottom: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
  };

  const rowStyle = (isLast: boolean): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '14px 18px',
    borderBottom: isLast ? 'none' : `1px solid ${theme.border}`,
  });

  const iconBoxStyle = (active: boolean): CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: active ? `${theme.primary}18` : `${theme.border}40`,
    color: active ? theme.primary : theme.textMuted,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 200ms',
  });

  return (
    <div style={panelStyle} role="group" aria-label="Notification channel settings">
      <div style={panelHeaderStyle}>
        <span style={{ fontSize: 13, fontWeight: 700, color: theme.text }}>Notification Channels</span>
        <p style={{ fontSize: 12, color: theme.textMuted, margin: '2px 0 0' }}>
          Choose how you want to be notified.
        </p>
      </div>
      {channels.map((ch, i) => (
        <div key={ch.key} style={rowStyle(i === channels.length - 1)}>
          <div style={iconBoxStyle(settings[ch.key])}>{ch.icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: theme.text, marginBottom: 1 }}>{ch.label}</div>
            <div style={{ fontSize: 12, color: theme.textMuted }}>{ch.description}</div>
          </div>
          <TkxToggle
            checked={settings[ch.key]}
            onChange={() => toggle(ch.key)}
            label={ch.label}
            hideLabel
            size="sm"
          />
        </div>
      ))}
    </div>
  );
}

// ── Toggle Group Demo ─────────────────────────────────────────────────────────

function ToggleGroupDemo({ theme }: { theme: ThemeTokens }) {
  const [state, setState] = useState({
    wifi: true,
    bluetooth: false,
    locationServices: true,
    vpn: false,
    airdrop: true,
  });

  type K = keyof typeof state;
  const toggle = (k: K) => setState((s) => ({ ...s, [k]: !s[k] }));

  const items: { key: K; label: string }[] = [
    { key: 'wifi', label: 'Wi-Fi' },
    { key: 'bluetooth', label: 'Bluetooth' },
    { key: 'locationServices', label: 'Location Services' },
    { key: 'vpn', label: 'VPN' },
    { key: 'airdrop', label: 'AirDrop' },
  ];

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 320,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        padding: '12px 16px',
        border: `1px solid ${theme.border}`,
        borderRadius: 12,
        backgroundColor: theme.surface,
      }}
      role="group"
      aria-label="Connectivity settings"
    >
      <p style={{ margin: '0 0 10px', fontSize: 12, fontWeight: 700, color: theme.textMuted, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
        Connectivity
      </p>
      {items.map((item) => (
        <div
          key={item.key}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 0',
          }}
        >
          <TkxToggle
            checked={state[item.key]}
            onChange={() => toggle(item.key)}
            label={item.label}
            size="md"
          />
        </div>
      ))}
    </div>
  );
}

// ── TogglePage ────────────────────────────────────────────────────────────────

export function TogglePage({ theme }: Props) {
  const [basic, setBasic] = useState(false);
  const [customStyled, setCustomStyled] = useState(true);
  const [hiddenLabel, setHiddenLabel] = useState(false);

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
      <h1 style={h1Style}>TkxToggle</h1>
      <p style={leadStyle}>
        A binary on/off control implementing the WAI-ARIA{' '}
        <strong>switch</strong> pattern. Supports three sizes, hidden labels, and
        disabled states. Keyboard accessible via <kbd style={{ ...wcagCodeStyle, fontSize: 12 }}>Space</kbd>{' '}
        and <kbd style={{ ...wcagCodeStyle, fontSize: 12 }}>Enter</kbd>.
      </p>
      <WCAGBadgeGroup
        label="WCAG 2.1 Compliance"
        badges={[
          { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
          { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
        ]}
      />

      <hr style={dividerStyle} />

      {/* ── Basic Toggle ── */}
      <DemoSection
        title="Basic Toggle"
        description="Controlled toggle with visible label. State is managed via useState — pass checked and onChange."
        theme={theme}
        code={`const [enabled, setEnabled] = useState(false);

<TkxToggle
  checked={enabled}
  onChange={setEnabled}
  label="Enable feature"
  size="md"
/>`}
      >
        <TkxToggle
          checked={basic}
          onChange={setBasic}
          label="Enable feature"
          size="md"
        />
        <TkxBadge variant={basic ? 'success' : 'default'} size="sm" style={{ marginLeft: 12 }}>
          {basic ? 'On' : 'Off'}
        </TkxBadge>
      </DemoSection>

      {/* ── Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes — sm, md (default), lg — maintain the same visual language at different scales."
        theme={theme}
        code={`<TkxToggle checked={true} onChange={() => {}} label="Small"  size="sm" />
<TkxToggle checked={true} onChange={() => {}} label="Medium" size="md" />
<TkxToggle checked={true} onChange={() => {}} label="Large"  size="lg" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <TkxToggle checked onChange={() => {}} label={`Size: ${s}`} size={s} />
              <span style={{ fontSize: 11, color: theme.textMuted, fontFamily: 'monospace' }}>{s}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── Hidden Label ── */}
      <DemoSection
        title="Hidden Label"
        description="Pass hideLabel to visually hide the label while preserving it as the accessible name via aria-label on the underlying switch button."
        theme={theme}
        code={`<TkxToggle
  checked={hiddenLabel}
  onChange={setHiddenLabel}
  label="Dark mode"
  hideLabel
  size="md"
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <TkxToggle
            checked={hiddenLabel}
            onChange={setHiddenLabel}
            label="Dark mode"
            hideLabel
            size="md"
          />
          <span style={{ fontSize: 13, color: theme.textMuted }}>
            Label hidden visually; accessible to screen readers
          </span>
        </div>
      </DemoSection>

      {/* ── Disabled State ── */}
      <DemoSection
        title="Disabled State"
        description="The disabled prop reduces opacity and blocks interaction. Both on and off states are shown for completeness."
        theme={theme}
        code={`<TkxToggle checked={false} onChange={() => {}} label="Disabled (off)" disabled />
<TkxToggle checked={true}  onChange={() => {}} label="Disabled (on)"  disabled />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <TkxToggle checked={false} onChange={() => {}} label="Disabled (off)" disabled size="md" />
          <TkxToggle checked onChange={() => {}} label="Disabled (on)" disabled size="md" />
        </div>
      </DemoSection>

      {/* ── Toggle Group ── */}
      <DemoSection
        title="Toggle Group"
        description="Multiple toggles grouped inside a settings panel. Each toggle is independently controlled."
        theme={theme}
        code={`const [state, setState] = useState({
  wifi: true, bluetooth: false, locationServices: true,
  vpn: false, airdrop: true,
});

<div role="group" aria-label="Connectivity settings">
  {items.map((item) => (
    <TkxToggle
      key={item.key}
      checked={state[item.key]}
      onChange={() => setState(s => ({ ...s, [item.key]: !s[item.key] }))}
      label={item.label}
    />
  ))}
</div>`}
      >
        <ToggleGroupDemo theme={theme} />
      </DemoSection>

      {/* ── Feature Flags Panel ── */}
      <DemoSection
        title="Feature Flags Panel"
        description="Realistic settings UI with five independent feature toggles. A badge in the header reflects the count of enabled flags."
        theme={theme}
        code={`const [flags, setFlags] = useState({
  notifications: true, darkMode: false, analytics: true,
  autoSave: true, betaFeatures: false,
});

<div role="group" aria-label="Feature flags settings">
  {items.map((item) => (
    <div key={item.key}>
      <div>
        <strong>{item.label}</strong>
        <p>{item.description}</p>
      </div>
      <TkxToggle
        checked={flags[item.key]}
        onChange={() => setFlags(f => ({ ...f, [item.key]: !f[item.key] }))}
        label={item.label}
        hideLabel
        size="sm"
      />
    </div>
  ))}
</div>`}
      >
        <FeatureFlagsDemo theme={theme} />
      </DemoSection>

      {/* ── Notifications Settings ── */}
      <DemoSection
        title="Notifications Settings"
        description="Email, push, and SMS notification channels with icons and descriptions. Demonstrates real-world layout patterns for a preferences screen."
        theme={theme}
        code={`const [settings, setSettings] = useState({ email: true, push: false, sms: false });

{channels.map((ch) => (
  <div key={ch.key} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
    <div style={{ ...iconBoxStyle(settings[ch.key]) }}>{ch.icon}</div>
    <div>
      <strong>{ch.label}</strong>
      <p>{ch.description}</p>
    </div>
    <TkxToggle
      checked={settings[ch.key]}
      onChange={() => setSettings(s => ({ ...s, [ch.key]: !s[ch.key] }))}
      label={ch.label}
      hideLabel
      size="sm"
    />
  </div>
))}`}
      >
        <NotificationsDemo theme={theme} />
      </DemoSection>

      {/* ── Custom Styling ── */}
      <DemoSection
        title="Custom Styling"
        description="Override the root element via className or style. The track color is driven by theme.primary; the label inherits theme.text."
        theme={theme}
        code={`<TkxToggle
  checked={customStyled}
  onChange={setCustomStyled}
  label="Custom styled toggle"
  size="lg"
  style={{ padding: '10px 16px', border: \`1px solid \${theme.border}\`, borderRadius: 10 }}
/>`}
      >
        <TkxToggle
          checked={customStyled}
          onChange={setCustomStyled}
          label="Custom styled toggle"
          size="lg"
          style={{
            padding: '10px 16px',
            border: `1px solid ${theme.border}`,
            borderRadius: 10,
            backgroundColor: theme.surfaceAlt,
          }}
        />
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Prop Table ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={sectionHeadStyle}>Props</h2>
        <PropTable
          props={[
            { name: 'checked', type: 'boolean', required: true, description: 'Current on/off state of the toggle. Must be controlled.' },
            { name: 'onChange', type: '(checked: boolean) => void', required: true, description: 'Callback fired when the user toggles the switch. Receives the new boolean state.' },
            { name: 'label', type: 'string', required: true, description: 'Visible label text (or accessible name when hideLabel is true).' },
            { name: 'size', type: '"sm" | "md" | "lg"', default: '"md"', description: 'Controls the dimensions of the track and thumb.' },
            { name: 'hideLabel', type: 'boolean', default: 'false', description: 'Hides the label visually while keeping it as the accessible name for screen readers.' },
            { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the toggle, reducing opacity and blocking interaction.' },
            { name: 'className', type: 'string', description: 'Additional CSS class names forwarded to the root wrapper element.' },
            { name: 'style', type: 'CSSProperties', description: 'Inline styles forwarded to the root wrapper element.' },
          ]}
        />
      </section>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <section aria-labelledby="wcag-heading">
        <h2 id="wcag-heading" style={sectionHeadStyle}>Accessibility Notes</h2>
        <div style={wcagNoteStyle}>
          <p style={{ margin: '0 0 10px' }}>
            <code style={wcagCodeStyle}>TkxToggle</code> implements the WAI-ARIA{' '}
            <strong>switch</strong> design pattern using a native{' '}
            <code style={wcagCodeStyle}>&lt;button&gt;</code> element.
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>
              The button carries <code style={wcagCodeStyle}>role="switch"</code> and{' '}
              <code style={wcagCodeStyle}>aria-checked</code> (true/false), giving screen
              readers a semantically correct on/off control.
            </li>
            <li style={{ marginBottom: 6 }}>
              When <code style={wcagCodeStyle}>hideLabel</code> is true, the label string is
              applied as <code style={wcagCodeStyle}>aria-label</code> on the button so the
              accessible name is never missing.
            </li>
            <li style={{ marginBottom: 6 }}>
              Both <kbd style={wcagCodeStyle}>Space</kbd> and <kbd style={wcagCodeStyle}>Enter</kbd>{' '}
              toggle the switch, matching browser-native button behaviour and the ARIA
              switch pattern specification.
            </li>
            <li>
              The disabled state uses the native <code style={wcagCodeStyle}>disabled</code>{' '}
              attribute, which removes the element from the tab order and communicates the
              state to assistive technologies.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
