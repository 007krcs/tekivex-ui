import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxCheckbox,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const CHECKBOX_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label text associated with the checkbox via htmlFor/id.' },
  { name: 'checked', type: 'boolean', default: 'undefined', description: 'Controlled checked state. Use with onChange for a controlled checkbox.' },
  { name: 'defaultChecked', type: 'boolean', default: 'false', description: 'Uncontrolled initial checked state.' },
  { name: 'onChange', type: '(checked: boolean) => void', default: 'undefined', description: 'Callback fired when the checked state changes.' },
  { name: 'isIndeterminate', type: 'boolean', default: 'false', description: 'Renders the checkbox in an indeterminate (mixed) visual state. Sets aria-checked="mixed".' },
  { name: 'colorScheme', type: "'primary' | 'secondary' | 'danger' | 'warning' | 'success'", default: "'primary'", description: 'Theme color applied to the checked/indeterminate fill.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the checkbox width, height, and label font size.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents interaction. Sets the disabled attribute and reduces opacity.' },
  { name: 'isInvalid', type: 'boolean', default: 'false', description: 'Applies a danger border to signal an invalid state without a message.' },
  { name: 'errorMessage', type: 'string', default: 'undefined', description: 'Validation error shown below the checkbox with aria-describedby.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Supplementary text shown below the label (hidden when errorMessage is set).' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper.' },
  { name: '...rest', type: 'InputHTMLAttributes<HTMLInputElement>', default: '—', description: 'All standard checkbox input attributes forwarded to the underlying input.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function CheckboxPage({ theme }: { theme: ThemeTokens }) {
  const [basic, setBasic] = useState(false);
  const [parentChecked, setParentChecked] = useState(false);
  const [children, setChildren] = useState({ html: false, css: false, js: false });
  const [permissions, setPermissions] = useState({
    read: true,
    write: false,
    delete: false,
    admin: false,
  });

  const allChildrenChecked = Object.values(children).every(Boolean);
  const someChildrenChecked = Object.values(children).some(Boolean) && !allChildrenChecked;

  function handleParentChange(checked: boolean) {
    setParentChecked(checked);
    setChildren({ html: checked, css: checked, js: checked });
  }

  function handleChildChange(key: keyof typeof children, checked: boolean) {
    const next = { ...children, [key]: checked };
    setChildren(next);
    const all = Object.values(next).every(Boolean);
    setParentChecked(all);
  }

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
        TkxCheckbox
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A fully accessible, theme-aware checkbox built on a native{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<input type="checkbox">'}</code>.
        Supports indeterminate state, five color schemes, three sizes, error messaging, and composable checkbox groups.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Uses a native checkbox input for maximum compatibility.
        Indeterminate state is set via both the DOM <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>indeterminate</code> property
        and <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-checked="mixed"</code>.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Checkbox"
        description="Controlled checkbox with label. The checked state is managed externally via the checked and onChange props."
        theme={theme}
        code={`const [checked, setChecked] = useState(false);

<TkxCheckbox
  label="Accept terms and conditions"
  checked={checked}
  onChange={setChecked}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TkxCheckbox
            label="Accept terms and conditions"
            checked={basic}
            onChange={setBasic}
          />
          <p style={{ margin: 0, fontSize: '12px', color: theme.textMuted }}>
            State: <strong style={{ color: theme.text }}>{basic ? 'checked' : 'unchecked'}</strong>
          </p>
        </div>
      </DemoSection>

      {/* ── 2. Indeterminate ── */}
      <DemoSection
        title="Indeterminate State"
        description="Use isIndeterminate for parent checkboxes in a nested list. Both the visual dash indicator and aria-checked='mixed' are applied, satisfying WCAG 4.1.2."
        theme={theme}
        code={`// Parent checkbox
<TkxCheckbox
  label="Select all skills"
  checked={allChecked}
  isIndeterminate={someChecked && !allChecked}
  onChange={handleParentChange}
/>

// Children
<TkxCheckbox label="HTML" checked={children.html} onChange={(c) => handleChildChange('html', c)} />
<TkxCheckbox label="CSS"  checked={children.css}  onChange={(c) => handleChildChange('css', c)}  />
<TkxCheckbox label="JS"   checked={children.js}   onChange={(c) => handleChildChange('js', c)}   />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TkxCheckbox
            label="Select all skills"
            checked={allChildrenChecked}
            isIndeterminate={someChildrenChecked}
            onChange={handleParentChange}
          />
          <div style={{ paddingLeft: '28px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <TkxCheckbox
              label="HTML"
              checked={children.html}
              onChange={(c) => handleChildChange('html', c)}
            />
            <TkxCheckbox
              label="CSS"
              checked={children.css}
              onChange={(c) => handleChildChange('css', c)}
            />
            <TkxCheckbox
              label="JavaScript"
              checked={children.js}
              onChange={(c) => handleChildChange('js', c)}
            />
          </div>
        </div>
      </DemoSection>

      {/* ── 3. Color Schemes ── */}
      <DemoSection
        title="Color Schemes"
        description="Five semantic color schemes control the fill and focus ring of the checked state. The default is primary — switch to danger for destructive confirmations, success for opt-ins."
        theme={theme}
        code={`<TkxCheckbox label="Primary"   colorScheme="primary"   defaultChecked />
<TkxCheckbox label="Secondary" colorScheme="secondary" defaultChecked />
<TkxCheckbox label="Success"   colorScheme="success"   defaultChecked />
<TkxCheckbox label="Warning"   colorScheme="warning"   defaultChecked />
<TkxCheckbox label="Danger"    colorScheme="danger"    defaultChecked />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TkxCheckbox label="Primary" colorScheme="primary" defaultChecked />
          <TkxCheckbox label="Secondary" colorScheme="secondary" defaultChecked />
          <TkxCheckbox label="Success" colorScheme="success" defaultChecked />
          <TkxCheckbox label="Warning" colorScheme="warning" defaultChecked />
          <TkxCheckbox label="Danger" colorScheme="danger" defaultChecked />
        </div>
      </DemoSection>

      {/* ── 4. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes adjust the checkbox box dimensions and label font size. All sizes meet the WCAG 2.5.5 minimum touch target of 44×44 px for the clickable area."
        theme={theme}
        code={`<TkxCheckbox label="Small checkbox"  size="sm" defaultChecked />
<TkxCheckbox label="Medium checkbox" size="md" defaultChecked />
<TkxCheckbox label="Large checkbox"  size="lg" defaultChecked />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <TkxCheckbox label="Small checkbox" size="sm" defaultChecked />
          <TkxCheckbox label="Medium checkbox" size="md" defaultChecked />
          <TkxCheckbox label="Large checkbox" size="lg" defaultChecked />
        </div>
      </DemoSection>

      {/* ── 5. Disabled ── */}
      <DemoSection
        title="Disabled State"
        description="Disabled checkboxes set the native disabled attribute, reduce opacity, and show a not-allowed cursor. Both checked and unchecked disabled states are demonstrated."
        theme={theme}
        code={`<TkxCheckbox label="Disabled unchecked" disabled />
<TkxCheckbox label="Disabled checked"   disabled defaultChecked />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TkxCheckbox label="Disabled unchecked" disabled />
          <TkxCheckbox label="Disabled checked" disabled defaultChecked />
        </div>
      </DemoSection>

      {/* ── 6. Error State ── */}
      <DemoSection
        title="Error State with errorMessage"
        description="Provide errorMessage to show a validation error below the checkbox. The error is linked via aria-describedby so screen readers announce it on focus."
        theme={theme}
        code={`<TkxCheckbox
  label="I agree to the Terms of Service"
  errorMessage="You must accept the terms to continue."
  isRequired
/>`}
      >
        <TkxCheckbox
          label="I agree to the Terms of Service"
          errorMessage="You must accept the terms to continue."
        />
      </DemoSection>

      {/* ── 7. Checkbox Group ── */}
      <DemoSection
        title="Checkbox Group"
        description="Compose multiple TkxCheckbox components into a permission selector. Each checkbox manages its own state independently within the group."
        theme={theme}
        code={`const [perms, setPerms] = useState({ read: true, write: false, delete: false, admin: false });

function toggle(key: string) {
  setPerms(p => ({ ...p, [key]: !p[key] }));
}

<fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
  <legend>API Permissions</legend>
  <TkxCheckbox label="Read"    checked={perms.read}   onChange={() => toggle('read')}   />
  <TkxCheckbox label="Write"   checked={perms.write}  onChange={() => toggle('write')}  />
  <TkxCheckbox label="Delete"  checked={perms.delete} onChange={() => toggle('delete')} colorScheme="danger" />
  <TkxCheckbox label="Admin"   checked={perms.admin}  onChange={() => toggle('admin')}  colorScheme="warning" />
</fieldset>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            API Permissions
          </p>
          {(Object.keys(permissions) as Array<keyof typeof permissions>).map((key) => (
            <TkxCheckbox
              key={key}
              label={key.charAt(0).toUpperCase() + key.slice(1)}
              checked={permissions[key]}
              onChange={(c) => setPermissions((p) => ({ ...p, [key]: c }))}
              colorScheme={key === 'delete' ? 'danger' : key === 'admin' ? 'warning' : 'primary'}
              hint={
                key === 'delete' ? 'Allows permanent deletion of records.' :
                key === 'admin'  ? 'Full administrative access.' : undefined
              }
            />
          ))}
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
            Active: <strong style={{ color: theme.text }}>
              {Object.entries(permissions).filter(([, v]) => v).map(([k]) => k).join(', ') || 'none'}
            </strong>
          </p>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={CHECKBOX_PROPS} />
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
        <WCAGBadge criterion="2.5.5 Target Size" level="AAA" status="PASS" />
        <WCAGBadge criterion="3.3.1 Error Identification" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Indeterminate State</p>
        <p style={noteItemStyle}>The indeterminate visual is set via the DOM <code>input.indeterminate</code> property (not an attribute) in a <code>useEffect</code>. Additionally, <code>aria-checked="mixed"</code> is applied so screen readers announce "mixed" rather than "checked" or "unchecked". This satisfies WCAG 4.1.2 Name, Role, Value.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Grouping with fieldset</p>
        <p style={noteItemStyle}>When composing a group of related checkboxes, wrap them in a <code>{'<fieldset>'}</code> with a <code>{'<legend>'}</code> to provide a group label for screen readers. TkxCheckbox renders a native checkbox so fieldset/legend semantics work correctly.</p>
      </div>
    </div>
  );
}
