import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxComboBox,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const COMBOBOX_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label rendered as a <label>, associated via htmlFor/id and used as the listbox aria-label.' },
  { name: 'options', type: 'ComboBoxOption[]', default: '[]', description: 'Selectable options: { value, label, disabled? }.' },
  { name: 'value', type: 'string[]', default: 'undefined', description: 'Controlled selection. Omit for uncontrolled mode.' },
  { name: 'defaultValue', type: 'string[]', default: 'undefined', description: 'Uncontrolled initial selection.' },
  { name: 'onChange', type: '(values: string[], selectedOptions: ComboBoxOption[]) => void', default: 'undefined', description: 'Fired whenever the selection changes, with both raw values and the resolved option objects.' },
  { name: 'placeholder', type: 'string', default: 'undefined', description: 'Placeholder shown in the input while nothing is selected.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text below the control (hidden while an error shows).' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message with role="alert". Sets aria-invalid and a theme.danger border.' },
  { name: 'isInvalid', type: 'boolean', default: 'false', description: 'Force the invalid state without an error string.' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows a red asterisk and sets aria-required on the input.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction and reduces opacity.' },
  { name: 'clearable', type: 'boolean', default: 'true', description: 'Show a "clear all" affordance when something is selected.' },
  { name: 'maxSelected', type: 'number', default: 'undefined', description: 'Cap the number of selected values; remaining options become aria-disabled until one is removed.' },
  { name: 'id', type: 'string', default: 'auto', description: 'Explicit id for the input. Defaults to a React useId() value.' },
  { name: 'name', type: 'string', default: 'undefined', description: "Renders a hidden input joining values with ',' for plain form posts." },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper div.' },
];

// ── Sample data ───────────────────────────────────────────────────────────────

const TAG_OPTIONS = [
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'docs', label: 'Documentation' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'perf', label: 'Performance' },
  { value: 'security', label: 'Security' },
  { value: 'design', label: 'Design' },
  { value: 'i18n', label: 'Internationalisation' },
];

const RECIPIENT_OPTIONS = [
  { value: 'asha', label: 'Asha Patel' },
  { value: 'ravi', label: 'Ravi Kumar' },
  { value: 'meera', label: 'Meera Iyer' },
  { value: 'john', label: 'John Carter' },
  { value: 'li', label: 'Li Wei' },
  { value: 'sofia', label: 'Sofia García' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ComboBoxPage({ theme }: { theme: ThemeTokens }) {
  const [tags, setTags] = useState<string[]>(['bug', 'a11y']);
  const [recipients, setRecipients] = useState<string[]>([]);
  const [required, setRequired] = useState<string[]>([]);

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '3.3.1 Error Identification', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxComboBox
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A multi-select combobox with token chips. TkxAutocomplete is single-select; this fills the
        multi-select gap — recipients, tags, filters. Selected values render as removable chips
        before the text input, typing filters the list, and Enter toggles the active option
        without closing the dropdown.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> The input uses{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="combobox"</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-expanded</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-activedescendant</code>{' '}
        and an{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-multiselectable</code>{' '}
        listbox. Backspace on an empty query removes the last chip.
      </p>

      {/* ── 1. Multi-select with chips ── */}
      <DemoSection
        title="Multi-Select with Chips"
        description="Click or focus the input to open the list, type to filter, and toggle options with click or Enter — the list stays open (multi-select convention). Each selection renders as a removable chip; Backspace on an empty query removes the last one."
        theme={theme}
        code={`const [tags, setTags] = useState<string[]>(['bug', 'a11y']);

<TkxComboBox
  label="Issue labels"
  options={TAG_OPTIONS}
  value={tags}
  onChange={(values) => setTags(values)}
  placeholder="Add labels…"
  hint="Type to filter; Enter toggles the active option."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxComboBox
            label="Issue labels"
            options={TAG_OPTIONS}
            value={tags}
            onChange={(values) => setTags(values)}
            placeholder="Add labels…"
            hint="Type to filter; Enter toggles the active option."
          />
          {tags.length > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              {tags.length} selected: <strong style={{ color: theme.text }}>{tags.join(', ')}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 2. maxSelected ── */}
      <DemoSection
        title="maxSelected — Cap the Selection"
        description="maxSelected={3} blocks further selections once three recipients are chosen: remaining options become aria-disabled while already-selected ones stay interactive so they can be deselected."
        theme={theme}
        code={`<TkxComboBox
  label="Recipients"
  options={RECIPIENT_OPTIONS}
  value={recipients}
  onChange={(values) => setRecipients(values)}
  maxSelected={3}
  placeholder="Up to 3 people…"
  hint="At the cap, unselected options are disabled until you remove one."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxComboBox
            label="Recipients"
            options={RECIPIENT_OPTIONS}
            value={recipients}
            onChange={(values) => setRecipients(values)}
            maxSelected={3}
            placeholder="Up to 3 people…"
            hint="At the cap, unselected options are disabled until you remove one."
          />
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: recipients.length >= 3 ? theme.warning : theme.textMuted }}>
            {recipients.length} / 3 selected{recipients.length >= 3 ? ' — cap reached' : ''}
          </p>
        </div>
      </DemoSection>

      {/* ── 3. Error state ── */}
      <DemoSection
        title="Error & Required State"
        description="Pass an error string to switch the border to theme.danger, set aria-invalid on the combobox input, and announce the message via role='alert'. Here the error clears as soon as at least one option is picked."
        theme={theme}
        code={`<TkxComboBox
  label="Notification channels"
  options={TAG_OPTIONS}
  value={required}
  onChange={(values) => setRequired(values)}
  isRequired
  error={required.length === 0 ? 'Pick at least one channel.' : undefined}
  placeholder="Select channels…"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxComboBox
            label="Notification channels"
            options={TAG_OPTIONS}
            value={required}
            onChange={(values) => setRequired(values)}
            isRequired
            error={required.length === 0 ? 'Pick at least one channel.' : undefined}
            placeholder="Select channels…"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={COMBOBOX_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>Keyboard Navigation</p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 6px' }}>
          <strong>Arrow Down / Up</strong> opens the list and moves the active option (skipping disabled ones). <strong>Enter</strong> toggles the active option without closing the list. <strong>Escape</strong> closes it. <strong>Backspace</strong> on an empty query removes the most recent chip.
        </p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: 0 }}>
          Focus stays on the text input throughout — options are referenced via <code>aria-activedescendant</code>, so screen readers announce each option without DOM focus moving.
        </p>
      </div>
    </div>
  );
}
