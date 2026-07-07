import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxField,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const FIELD_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible, accessible label — wired to the child control via htmlFor/id.' },
  { name: 'id', type: 'string', default: 'auto', description: "Explicit control id; defaults to the child's own id, else an auto useId() value." },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text below the control (hidden while an error shows).' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message; sets aria-invalid on the child and renders role="alert" text.' },
  { name: 'isInvalid', type: 'boolean', default: 'false', description: 'Force the invalid state without an error string.' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Adds aria-required plus a visual (aria-hidden) asterisk.' },
  { name: 'children', type: 'ReactElement | (field) => ReactNode', default: 'undefined', description: 'The control. A single element gets id / aria-describedby / aria-invalid / aria-required injected via cloneElement; a function child receives them to spread manually.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the root wrapper.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper div.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function FieldPage({ theme }: { theme: ThemeTokens }) {
  const [plan, setPlan] = useState('starter');
  const [amount, setAmount] = useState('');
  const [coupon, setCoupon] = useState('');

  const nativeControlStyle = {
    width: '100%',
    padding: '10px 12px',
    fontSize: '14px',
    fontFamily: 'inherit',
    color: theme.text,
    backgroundColor: theme.surface,
    border: `1.5px solid ${theme.border}`,
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const couponError =
    coupon !== '' && !/^[A-Z0-9]{6}$/.test(coupon)
      ? 'Coupon codes are exactly 6 uppercase letters or digits.'
      : undefined;

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '3.3.1 Error Identification', level: 'AA', status: 'PASS' },
            { criterion: '3.3.2 Labels or Instructions', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxField
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        The standalone form-control wrapper. TkxInput and TkxTextarea ship label / hint / error
        chrome built in — TkxField extracts that same chrome so any other control (a plain
        {' '}<code>{'<select>'}</code>, a third-party widget, TkxSlider) gets identical labelling and
        ARIA wiring for free.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> The child receives{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>id</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-describedby</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-invalid</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-required</code>{' '}
        automatically via cloneElement — or via the function-child form.
      </p>

      {/* ── 1. Wrapping a plain select ── */}
      <DemoSection
        title="Wrapping a Native <select>"
        description="Pass any single element as the child — TkxField clones it with the generated id so the label's htmlFor points at it, and wires aria-describedby to the hint."
        theme={theme}
        code={`<TkxField label="Plan" hint="You can change this at any time.">
  <select value={plan} onChange={(e) => setPlan(e.target.value)}>
    <option value="starter">Starter — Free</option>
    <option value="pro">Pro — ₹799/mo</option>
    <option value="enterprise">Enterprise — Contact us</option>
  </select>
</TkxField>`}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <TkxField label="Plan" hint="You can change this at any time.">
            <select
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              style={nativeControlStyle}
            >
              <option value="starter">Starter — Free</option>
              <option value="pro">Pro — ₹799/mo</option>
              <option value="enterprise">Enterprise — Contact us</option>
            </select>
          </TkxField>
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
            Selected plan: <strong style={{ color: theme.text }}>{plan}</strong>
          </p>
        </div>
      </DemoSection>

      {/* ── 2. Function child ── */}
      <DemoSection
        title="Function Child — Spread the Field Props Anywhere"
        description="When the control is nested (a wrapper div, an input-group, a portal), use the function-child form: it receives { id, aria-describedby, aria-invalid, aria-required } to spread onto the real input wherever it lives."
        theme={theme}
        code={`<TkxField label="Amount" hint="In INR, excluding GST." isRequired>
  {(field) => (
    <div className="input-group">
      <span>₹</span>
      <input
        {...field}
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </div>
  )}
</TkxField>`}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <TkxField label="Amount" hint="In INR, excluding GST." isRequired>
            {(field) => (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px', color: theme.textMuted, fontWeight: 600 }}>₹</span>
                <input
                  {...field}
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  style={nativeControlStyle}
                />
              </div>
            )}
          </TkxField>
        </div>
      </DemoSection>

      {/* ── 3. Error + hint ── */}
      <DemoSection
        title="Error & Hint States"
        description="The hint shows while the value is valid; the moment an error string is passed, the hint is replaced by a role='alert' message and the child gets aria-invalid. Try typing a lowercase or short code."
        theme={theme}
        code={`const couponError =
  coupon !== '' && !/^[A-Z0-9]{6}$/.test(coupon)
    ? 'Coupon codes are exactly 6 uppercase letters or digits.'
    : undefined;

<TkxField
  label="Coupon code"
  hint="6 characters, e.g. SAVE20 or DIWALI."
  error={couponError}
>
  <input
    type="text"
    value={coupon}
    onChange={(e) => setCoupon(e.target.value)}
  />
</TkxField>`}
      >
        <div style={{ width: '100%', maxWidth: '360px' }}>
          <TkxField
            label="Coupon code"
            hint="6 characters, e.g. SAVE20 or DIWALI."
            error={couponError}
          >
            <input
              type="text"
              placeholder="SAVE20"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              style={{
                ...nativeControlStyle,
                border: `1.5px solid ${couponError ? theme.danger : theme.border}`,
              }}
            />
          </TkxField>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={FIELD_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.1 Error Identification" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>ID Resolution & ARIA Wiring</p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 6px' }}>
          If the child already carries its own <code>id</code>, TkxField respects it so external wiring keeps working; otherwise an auto id is generated and injected.
        </p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: 0 }}>
          With the element-child form the field props are injected via <code>cloneElement</code>. If your control does not forward unknown props to its underlying input, prefer the function-child form and spread them explicitly.
        </p>
      </div>
    </div>
  );
}
