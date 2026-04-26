import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxSelect,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const SELECT_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label rendered as a <label> element, associated via htmlFor/id.' },
  { name: 'options', type: 'SelectOption[]', required: true, description: 'Array of { value, label, group?, disabled? } objects to populate the list.' },
  { name: 'value', type: 'string | string[]', default: 'undefined', description: 'Controlled selected value(s). Use an array when multiple is true.' },
  { name: 'onChange', type: '(value: string | string[]) => void', default: 'undefined', description: 'Callback fired when the selection changes.' },
  { name: 'placeholder', type: 'string', default: "'Select…'", description: 'Placeholder text shown when no value is selected.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Renders a search input inside the dropdown to filter options in real time.' },
  { name: 'clearable', type: 'boolean', default: 'false', description: 'Shows a clear (×) button when a value is selected.' },
  { name: 'multiple', type: 'boolean', default: 'false', description: 'Enables multi-select mode. Selected values appear as tags.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls padding and font size of the trigger element.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction and reduces opacity to 60%.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message shown below. Sets aria-invalid and aria-describedby.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text shown below the select (hidden when error is present).' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows a red asterisk and sets aria-required on the underlying input.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper div.' },
];

// ── Sample data ───────────────────────────────────────────────────────────────

const FRAMEWORK_OPTIONS = [
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'angular', label: 'Angular' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'solid', label: 'SolidJS' },
  { value: 'qwik', label: 'Qwik' },
];

const GROUPED_OPTIONS = [
  { value: 'js', label: 'JavaScript', group: 'Scripting' },
  { value: 'ts', label: 'TypeScript', group: 'Scripting' },
  { value: 'py', label: 'Python', group: 'Scripting' },
  { value: 'rust', label: 'Rust', group: 'Systems' },
  { value: 'go', label: 'Go', group: 'Systems' },
  { value: 'cpp', label: 'C++', group: 'Systems' },
  { value: 'css', label: 'CSS', group: 'Styling' },
  { value: 'sass', label: 'Sass', group: 'Styling' },
];

const COUNTRY_OPTIONS = [
  { value: 'us', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'ca', label: 'Canada' },
  { value: 'au', label: 'Australia' },
  { value: 'de', label: 'Germany' },
  { value: 'fr', label: 'France' },
  { value: 'jp', label: 'Japan' },
  { value: 'in', label: 'India' },
  { value: 'br', label: 'Brazil' },
  { value: 'mx', label: 'Mexico' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function SelectPage({ theme }: { theme: ThemeTokens }) {
  const [basic, setBasic] = useState('');
  const [searchable, setSearchable] = useState('');
  const [clearable, setClearable] = useState('react');
  const [grouped, setGrouped] = useState('');
  const [multi, setMulti] = useState<string[]>([]);
  const [sizes, setSizes] = useState({ sm: '', md: '', lg: '' });

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
    display: 'flex' as const,
    alignItems: 'center',
    gap: '6px',
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
            { criterion: '3.3.1 Error Identification', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxSelect
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A fully accessible, theme-aware select component built on the WAI-ARIA combobox pattern. Supports
        searchable filtering, clearable values, grouped options, multi-select, and three sizes — all keyboard
        navigable with screen reader announcements at every interaction.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Uses{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="combobox"</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-haspopup="listbox"</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-expanded</code>.
        Options use{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="option"</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-selected</code>.
      </p>

      {/* ── 1. Basic Select ── */}
      <DemoSection
        title="Basic Select"
        description="The simplest usage: provide a label and an options array. The dropdown is keyboard-navigable with arrow keys, Enter to select, and Escape to close."
        theme={theme}
        code={`<TkxSelect
  label="Framework"
  options={[
    { value: 'react', label: 'React' },
    { value: 'vue', label: 'Vue' },
    { value: 'angular', label: 'Angular' },
  ]}
  value={value}
  onChange={setValue}
  placeholder="Pick a framework…"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Framework"
            options={FRAMEWORK_OPTIONS}
            value={basic}
            onChange={(v) => setBasic(v as string)}
            placeholder="Pick a framework…"
          />
          {basic && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              Selected: <strong style={{ color: theme.text }}>{basic}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 2. Searchable ── */}
      <DemoSection
        title="Searchable"
        description="The searchable prop renders a text input inside the dropdown so users can filter a long list instantly. Useful when there are more than 8–10 options."
        theme={theme}
        code={`<TkxSelect
  label="Country"
  options={countryOptions}
  searchable
  placeholder="Search countries…"
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Country"
            options={COUNTRY_OPTIONS}
            searchable
            placeholder="Search countries…"
            value={searchable}
            onChange={(v) => setSearchable(v as string)}
          />
        </div>
      </DemoSection>

      {/* ── 3. Clearable ── */}
      <DemoSection
        title="Clearable"
        description="When clearable is true, a × button appears on the trigger whenever a value is selected. Clicking it clears the selection and fires onChange with an empty string."
        theme={theme}
        code={`<TkxSelect
  label="Preferred Framework"
  options={frameworkOptions}
  clearable
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Preferred Framework"
            options={FRAMEWORK_OPTIONS}
            clearable
            value={clearable}
            onChange={(v) => setClearable(v as string)}
          />
        </div>
      </DemoSection>

      {/* ── 4. Grouped Options ── */}
      <DemoSection
        title="Grouped Options"
        description="Add a group field to each option object. TkxSelect renders visual group headers inside the listbox. Groups are aria-hidden dividers — screen readers read each option's label directly."
        theme={theme}
        code={`const options = [
  { value: 'js',   label: 'JavaScript', group: 'Scripting' },
  { value: 'ts',   label: 'TypeScript', group: 'Scripting' },
  { value: 'rust', label: 'Rust',       group: 'Systems'   },
  { value: 'go',   label: 'Go',         group: 'Systems'   },
  { value: 'css',  label: 'CSS',        group: 'Styling'   },
];

<TkxSelect
  label="Language"
  options={options}
  searchable
  placeholder="Choose a language…"
  value={value}
  onChange={setValue}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Language"
            options={GROUPED_OPTIONS}
            searchable
            placeholder="Choose a language…"
            value={grouped}
            onChange={(v) => setGrouped(v as string)}
          />
        </div>
      </DemoSection>

      {/* ── 5. Multi-Select ── */}
      <DemoSection
        title="Multi-Select"
        description="Set multiple to enable selection of more than one option. Each selected item appears as a removable tag on the trigger. The underlying value is a string array."
        theme={theme}
        code={`const [selected, setSelected] = useState<string[]>([]);

<TkxSelect
  label="Tech Stack"
  options={frameworkOptions}
  multiple
  searchable
  clearable
  placeholder="Select frameworks…"
  value={selected}
  onChange={(v) => setSelected(v as string[])}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <TkxSelect
            label="Tech Stack"
            options={FRAMEWORK_OPTIONS}
            multiple
            searchable
            clearable
            placeholder="Select frameworks…"
            value={multi}
            onChange={(v) => setMulti(v as string[])}
          />
          {multi.length > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              {multi.length} selected: <strong style={{ color: theme.text }}>{multi.join(', ')}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 6. Disabled ── */}
      <DemoSection
        title="Disabled State"
        description="disabled prevents all interaction and reduces opacity. The combobox trigger receives aria-disabled and is removed from the tab order."
        theme={theme}
        code={`<TkxSelect
  label="Plan (locked)"
  options={[{ value: 'enterprise', label: 'Enterprise' }]}
  value="enterprise"
  disabled
  hint="Contact sales to change your plan."
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Plan (locked)"
            options={[{ value: 'enterprise', label: 'Enterprise' }]}
            value="enterprise"
            onChange={() => {}}
            disabled
            hint="Contact sales to change your plan."
          />
        </div>
      </DemoSection>

      {/* ── 7. Error State ── */}
      <DemoSection
        title="Error State"
        description="Pass an error string to display a validation message. The trigger border switches to theme.danger and aria-invalid is set on the combobox input."
        theme={theme}
        code={`<TkxSelect
  label="Country"
  options={countryOptions}
  value=""
  onChange={setValue}
  error="Please select a country to continue."
  isRequired
/>`}
      >
        <div style={{ width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Country"
            options={COUNTRY_OPTIONS}
            value=""
            onChange={() => {}}
            error="Please select a country to continue."
            isRequired
          />
        </div>
      </DemoSection>

      {/* ── 8. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes — sm, md, and lg — adjust the trigger height, padding, and font size. Minimum touch targets are maintained at all sizes (sm ≥ 32 px, md ≥ 40 px, lg ≥ 48 px)."
        theme={theme}
        code={`<TkxSelect label="Small"  size="sm" options={options} value={sm}  onChange={setSm}  />
<TkxSelect label="Medium" size="md" options={options} value={md}  onChange={setMd}  />
<TkxSelect label="Large"  size="lg" options={options} value={lg}  onChange={setLg}  />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '320px' }}>
          <TkxSelect
            label="Small"
            size="sm"
            options={FRAMEWORK_OPTIONS}
            value={sizes.sm}
            onChange={(v) => setSizes((s) => ({ ...s, sm: v as string }))}
            placeholder="Small select…"
          />
          <TkxSelect
            label="Medium"
            size="md"
            options={FRAMEWORK_OPTIONS}
            value={sizes.md}
            onChange={(v) => setSizes((s) => ({ ...s, md: v as string }))}
            placeholder="Medium select…"
          />
          <TkxSelect
            label="Large"
            size="lg"
            options={FRAMEWORK_OPTIONS}
            value={sizes.lg}
            onChange={(v) => setSizes((s) => ({ ...s, lg: v as string }))}
            placeholder="Large select…"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={SELECT_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.1 Error Identification" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Keyboard Navigation</p>
        <p style={noteItemStyle}><strong>Space / Enter / Arrow Down</strong> opens the dropdown. <strong>Arrow Up/Down</strong> moves between options. <strong>Enter</strong> selects the focused option. <strong>Escape</strong> closes without changing the value.</p>
        <p style={noteItemStyle}>In searchable mode, typing filters options in real time. The listbox stays open while the user types.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Screen Reader Announcements</p>
        <p style={noteItemStyle}>The trigger element uses <code>aria-haspopup="listbox"</code> and <code>aria-expanded</code>. When expanded, <code>aria-activedescendant</code> points to the currently focused option id so screen readers announce the option without moving DOM focus.</p>
        <p style={noteItemStyle}>In multi-select mode, the tag count is included in the trigger's accessible name: e.g., "Tech Stack, 3 selected, combobox".</p>
      </div>
    </div>
  );
}
