import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxRadio,
  TkxRadioGroup,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const RADIO_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label text associated with this radio button via htmlFor/id.' },
  { name: 'value', type: 'string', required: true, description: 'The value submitted when this radio is selected.' },
  { name: 'checked', type: 'boolean', default: 'undefined', description: 'Controlled checked state.' },
  { name: 'onChange', type: '(value: string) => void', default: 'undefined', description: 'Callback with the radio value when selected.' },
  { name: 'colorScheme', type: "'primary' | 'secondary' | 'danger' | 'warning' | 'success'", default: "'primary'", description: 'Theme color applied to the selected radio dot and ring.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the radio circle size and label font size.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction and sets the disabled attribute.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Supplementary text rendered below the label.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
];

const RADIO_GROUP_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Group label rendered as a <legend> inside a <fieldset> for screen readers.' },
  { name: 'value', type: 'string', default: 'undefined', description: 'Controlled selected value for the group.' },
  { name: 'onChange', type: '(value: string) => void', default: 'undefined', description: 'Callback fired when any radio in the group changes.' },
  { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction of the radio buttons within the group.' },
  { name: 'colorScheme', type: "'primary' | 'secondary' | 'danger' | 'warning' | 'success'", default: "'primary'", description: 'Default color scheme propagated to all child TkxRadio elements.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Default size propagated to all child TkxRadio elements.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all radio buttons within the group.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Validation error shown below the group with aria-describedby.' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows an asterisk on the legend and sets aria-required.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'TkxRadio components to render inside the group.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function RadioPage({ theme }: { theme: ThemeTokens }) {
  const [plan, setPlan] = useState('');
  const [vertical, setVertical] = useState('monthly');
  const [horizontal, setHorizontal] = useState('md');
  const [colorPick, setColorPick] = useState('primary');
  const [notify, setNotify] = useState('');

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

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '1.4.3 Contrast', level: 'AAA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '3.3.2 Labels', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxRadio &amp; TkxRadioGroup
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        Native radio inputs wrapped with accessible group semantics. TkxRadioGroup uses a{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<fieldset>'}</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<legend>'}</code>{' '}
        so screen readers announce the group name before each option. Arrow key navigation moves between options within the group.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Radio groups follow the WAI-ARIA radio group pattern.
        Arrow Up/Down (vertical) and Arrow Left/Right (horizontal) cycle through options. Tab moves focus to the next
        interactive element outside the group.
      </p>

      {/* ── 1. Basic TkxRadio ── */}
      <DemoSection
        title="Basic TkxRadio"
        description="Individual radio buttons can be used standalone when only one option needs labeling. For groups of related options, always use TkxRadioGroup instead."
        theme={theme}
        code={`<TkxRadio
  label="Receive newsletter"
  value="newsletter"
  checked={checked}
  onChange={(v) => setChecked(v)}
/>`}
      >
        <TkxRadio
          label="Receive newsletter updates"
          value="newsletter"
          checked={plan === 'newsletter'}
          onChange={() => setPlan('newsletter')}
        />
      </DemoSection>

      {/* ── 2. TkxRadioGroup Vertical ── */}
      <DemoSection
        title="TkxRadioGroup — Vertical (Default)"
        description="The default vertical layout stacks radio buttons in a column. The fieldset/legend structure ensures screen readers announce 'Billing Cycle, radio group' before reading each option."
        theme={theme}
        code={`const [billing, setBilling] = useState('monthly');

<TkxRadioGroup
  label="Billing Cycle"
  value={billing}
  onChange={setBilling}
>
  <TkxRadio value="monthly"  label="Monthly — $12/mo" />
  <TkxRadio value="annual"   label="Annual — $99/yr (save 31%)" />
  <TkxRadio value="lifetime" label="Lifetime — $249 one-time" />
</TkxRadioGroup>`}
      >
        <TkxRadioGroup
          label="Billing Cycle"
          value={vertical}
          onChange={setVertical}
        >
          <TkxRadio value="monthly" label="Monthly — $12/mo" hint="Billed on the same date each month." />
          <TkxRadio value="annual" label="Annual — $99/yr (save 31%)" hint="Billed once per year. Cancel anytime." />
          <TkxRadio value="lifetime" label="Lifetime — $249 one-time" hint="Pay once, use forever." />
        </TkxRadioGroup>
      </DemoSection>

      {/* ── 3. TkxRadioGroup Horizontal ── */}
      <DemoSection
        title="TkxRadioGroup — Horizontal"
        description="Set direction='horizontal' for short options that fit on one line. Arrow Left/Right navigate between options in horizontal groups (WAI-ARIA radio group pattern)."
        theme={theme}
        code={`<TkxRadioGroup
  label="T-Shirt Size"
  value={size}
  onChange={setSize}
  direction="horizontal"
>
  <TkxRadio value="sm" label="S" />
  <TkxRadio value="md" label="M" />
  <TkxRadio value="lg" label="L" />
  <TkxRadio value="xl" label="XL" />
</TkxRadioGroup>`}
      >
        <TkxRadioGroup
          label="T-Shirt Size"
          value={horizontal}
          onChange={setHorizontal}
          direction="horizontal"
        >
          <TkxRadio value="sm" label="S" />
          <TkxRadio value="md" label="M" />
          <TkxRadio value="lg" label="L" />
          <TkxRadio value="xl" label="XL" />
          <TkxRadio value="2xl" label="2XL" />
        </TkxRadioGroup>
      </DemoSection>

      {/* ── 4. Disabled ── */}
      <DemoSection
        title="Disabled"
        description="Set disabled on TkxRadioGroup to disable all options, or on individual TkxRadio elements to disable specific choices. Disabled options are aria-disabled and skip-focused."
        theme={theme}
        code={`// All disabled
<TkxRadioGroup label="Region (locked)" value="us-east" onChange={() => {}} disabled>
  <TkxRadio value="us-east" label="US East (N. Virginia)" />
  <TkxRadio value="eu-west" label="EU West (Ireland)" />
</TkxRadioGroup>

// Selectively disabled
<TkxRadioGroup label="Plan" value="pro" onChange={setPlan}>
  <TkxRadio value="free"       label="Free"       />
  <TkxRadio value="pro"        label="Pro"         />
  <TkxRadio value="enterprise" label="Enterprise" disabled hint="Contact sales." />
</TkxRadioGroup>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <TkxRadioGroup label="Region (locked)" value="us-east" onChange={() => {}} disabled>
            <TkxRadio value="us-east" label="US East (N. Virginia)" />
            <TkxRadio value="eu-west" label="EU West (Ireland)" />
            <TkxRadio value="ap-southeast" label="AP Southeast (Singapore)" />
          </TkxRadioGroup>

          <TkxRadioGroup label="Subscription Plan" value={plan || 'pro'} onChange={setPlan}>
            <TkxRadio value="free" label="Free" hint="Up to 3 projects." />
            <TkxRadio value="pro" label="Pro — $12/mo" hint="Unlimited projects, priority support." />
            <TkxRadio value="enterprise" label="Enterprise" disabled hint="Contact sales for custom pricing." />
          </TkxRadioGroup>
        </div>
      </DemoSection>

      {/* ── 5. Color Schemes ── */}
      <DemoSection
        title="Color Schemes"
        description="Each TkxRadio (or TkxRadioGroup) accepts a colorScheme prop that changes the selected dot and focus ring color. Useful for semantic contexts like danger confirmation forms."
        theme={theme}
        code={`<TkxRadioGroup label="Status" value={value} onChange={setValue}>
  <TkxRadio value="primary"   label="Primary"   colorScheme="primary"   />
  <TkxRadio value="success"   label="Success"   colorScheme="success"   />
  <TkxRadio value="warning"   label="Warning"   colorScheme="warning"   />
  <TkxRadio value="danger"    label="Danger"    colorScheme="danger"    />
  <TkxRadio value="secondary" label="Secondary" colorScheme="secondary" />
</TkxRadioGroup>`}
      >
        <TkxRadioGroup label="Color Scheme Preview" value={colorPick} onChange={setColorPick}>
          <TkxRadio value="primary" label="Primary" colorScheme="primary" />
          <TkxRadio value="secondary" label="Secondary" colorScheme="secondary" />
          <TkxRadio value="success" label="Success" colorScheme="success" />
          <TkxRadio value="warning" label="Warning" colorScheme="warning" />
          <TkxRadio value="danger" label="Danger" colorScheme="danger" />
        </TkxRadioGroup>
      </DemoSection>

      {/* ── 6. Error State ── */}
      <DemoSection
        title="Error State"
        description="Pass error to TkxRadioGroup to show a required-field validation message below the group. The error is linked via aria-describedby to the fieldset."
        theme={theme}
        code={`<TkxRadioGroup
  label="Notification Preference"
  value={notify}
  onChange={setNotify}
  error="Please select a notification method."
  isRequired
>
  <TkxRadio value="email" label="Email" />
  <TkxRadio value="sms"   label="SMS"   />
  <TkxRadio value="push"  label="Push notification" />
</TkxRadioGroup>`}
      >
        <TkxRadioGroup
          label="Notification Preference"
          value={notify}
          onChange={setNotify}
          error={!notify ? 'Please select a notification method.' : undefined}
          isRequired
        >
          <TkxRadio value="email" label="Email" />
          <TkxRadio value="sms" label="SMS" />
          <TkxRadio value="push" label="Push notification" />
          <TkxRadio value="none" label="No notifications" />
        </TkxRadioGroup>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Tables */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxRadio Props
      </h2>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={RADIO_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxRadioGroup Props
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={RADIO_GROUP_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.2 Labels or Instructions" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Radio Group Keyboard Pattern</p>
        <p style={noteItemStyle}>Within a TkxRadioGroup, only the selected option (or the first option if none selected) is in the tab sequence. Arrow keys cycle between options and simultaneously select them — this matches the WAI-ARIA radio group pattern and prevents tab-stop clutter in long forms.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>fieldset + legend</p>
        <p style={noteItemStyle}>TkxRadioGroup wraps its children in a <code>{'<fieldset>'}</code>. The group label prop becomes a <code>{'<legend>'}</code> — screen readers announce the legend before each radio button, giving full context even when navigating non-linearly.</p>
        <p style={noteItemStyle}>Do not use generic labels like "Option 1" — the legend plus individual labels must together convey the full choice: e.g., "Billing Cycle — Monthly" makes sense out of context.</p>
      </div>
    </div>
  );
}
