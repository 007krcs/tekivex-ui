import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxInput,
  TkxButton,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const INPUT_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label text. Rendered as a <label> element properly associated via htmlFor/id. Also used for aria-label fallback.' },
  { name: 'id', type: 'string', default: 'auto', description: 'Input id. Auto-generated with useId() if not provided. Used to associate the label.' },
  { name: 'error', type: 'string', default: 'undefined', description: 'Error message shown below the input with an icon. Sets aria-invalid and aria-describedby.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Hint text shown below the input (hidden when error is present). Linked via aria-describedby.' },
  { name: 'leftAddon', type: 'ReactNode', default: 'undefined', description: 'Node rendered on the left side inside the input border (icon, currency symbol, country code, etc.).' },
  { name: 'rightAddon', type: 'ReactNode', default: 'undefined', description: 'Node rendered on the right side inside the input border (unit, button, icon, etc.).' },
  { name: 'isInvalid', type: 'boolean', default: 'false', description: 'Manually set error state without a message. Sets aria-invalid and applies danger border color.' },
  { name: 'isRequired', type: 'boolean', default: 'false', description: 'Shows a red asterisk beside the label and sets aria-required on the input.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the input and reduces opacity to 60%.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names applied to the root wrapper div.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper div.' },
  { name: '...rest', type: 'InputHTMLAttributes<HTMLInputElement>', default: '—', description: 'All standard input attributes (type, placeholder, value, onChange, onBlur, etc.) forwarded to the input.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconSearch({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function IconMail({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IconEye({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconEyeOff({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function IconX({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconUser({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function InputPage({ theme }: { theme: ThemeTokens }) {
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<typeof formValues>>({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  function handleFormChange(field: keyof typeof formValues, value: string) {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  function handleFormSubmit() {
    const errors: Partial<typeof formValues> = {};
    if (!formValues.firstName.trim()) errors.firstName = 'First name is required.';
    if (!formValues.lastName.trim()) errors.lastName = 'Last name is required.';
    if (!formValues.email.includes('@')) errors.email = 'Enter a valid email address.';
    if (Object.keys(errors).length) {
      setFormErrors(errors);
    } else {
      setFormSubmitted(true);
      setFormErrors({});
    }
  }

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

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
            { criterion: '2.4.6 Labels/Instructions', level: 'AA', status: 'PASS' },
            { criterion: '3.3.1 Error Identification', level: 'AA', status: 'PASS' },
            { criterion: '3.3.2 Labels / Instructions', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxInput
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        An accessible, theme-aware text input built on the WAI-ARIA textbox pattern. Features
        auto-associated labels, error and hint states linked via <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>aria-describedby</code>,
        left/right addon slots, required field indicators, and full HTML input attribute forwarding.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Every input is paired with a visible{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>{'<label>'}</code>{' '}
        via <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>htmlFor/id</code>.
        Errors set <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>aria-invalid="true"</code>{' '}
        and link to the message via <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>aria-describedby</code>.
      </p>

      {/* ── 1. Basic Input ── */}
      <DemoSection
        title="Basic Input"
        description="Provide a label (required) and optional placeholder. The id is auto-generated with useId() if not provided, ensuring the label association always works."
        theme={theme}
        code={`<TkxInput
  label="Full Name"
  placeholder="e.g. Avery Chen"
/>

<TkxInput
  label="Company"
  placeholder="Your company name"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
          <TkxInput label="Full Name" placeholder="e.g. Avery Chen" />
          <TkxInput label="Company" placeholder="Your company name" />
        </div>
      </DemoSection>

      {/* ── 2. Required Field ── */}
      <DemoSection
        title="Required Field"
        description="isRequired renders a red asterisk beside the label and sets aria-required on the input. The asterisk is aria-hidden — screen readers use aria-required instead."
        theme={theme}
        code={`<TkxInput
  label="Email Address"
  type="email"
  placeholder="you@company.com"
  isRequired
/>

<TkxInput
  label="Password"
  type="password"
  placeholder="Min. 8 characters"
  isRequired
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
          <TkxInput label="Email Address" type="email" placeholder="you@company.com" isRequired />
          <TkxInput label="Password" type="password" placeholder="Min. 8 characters" isRequired />
        </div>
      </DemoSection>

      {/* ── 3. Error State ── */}
      <DemoSection
        title="Error State"
        description="Pass an error string to show the validation message with an icon. The border switches to theme.danger, aria-invalid is set to true, and the message is linked via aria-describedby for screen readers."
        theme={theme}
        code={`<TkxInput
  label="Email Address"
  type="email"
  value="not-an-email"
  error="Please enter a valid email address."
  isRequired
/>

<TkxInput
  label="Username"
  value="x"
  error="Username must be at least 3 characters."
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
          <TkxInput
            label="Email Address"
            type="email"
            defaultValue="not-an-email"
            error="Please enter a valid email address."
            isRequired
          />
          <TkxInput
            label="Username"
            defaultValue="x"
            error="Username must be at least 3 characters."
          />
        </div>
      </DemoSection>

      {/* ── 4. Hint Text ── */}
      <DemoSection
        title="Hint Text"
        description="hint renders supplementary guidance below the input, linked via aria-describedby. It is hidden when an error message is present to avoid conflicting announcements."
        theme={theme}
        code={`<TkxInput
  label="Password"
  type="password"
  placeholder="Create a password"
  hint="Must be at least 8 characters with one uppercase and one number."
  isRequired
/>

<TkxInput
  label="Username"
  placeholder="Pick a unique username"
  hint="3–20 characters. Letters, numbers, and underscores only."
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', maxWidth: '400px' }}>
          <TkxInput
            label="Password"
            type="password"
            placeholder="Create a password"
            hint="Must be at least 8 characters with one uppercase and one number."
            isRequired
          />
          <TkxInput
            label="Username"
            placeholder="Pick a unique username"
            hint="3–20 characters. Letters, numbers, and underscores only."
          />
        </div>
      </DemoSection>

      {/* ── 5. With Addons ── */}
      <DemoSection
        title="With Addons"
        description="leftAddon and rightAddon accept any ReactNode rendered flush with the input border. Common uses: currency symbols, country codes, search icons, copy buttons, or unit labels."
        theme={theme}
        code={`// Icon left addon
<TkxInput
  label="Search"
  placeholder="Search components..."
  leftAddon={<IconSearch />}
/>

// Text left addon (currency)
<TkxInput
  label="Price"
  type="number"
  placeholder="0.00"
  leftAddon="$"
/>

// Text right addon (domain)
<TkxInput
  label="Subdomain"
  placeholder="yourname"
  rightAddon=".tekivex.io"
/>

// Both addons
<TkxInput
  label="Website"
  placeholder="example"
  leftAddon="https://"
  rightAddon=".com"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '400px' }}>
          <TkxInput
            label="Search"
            placeholder="Search components..."
            leftAddon={<IconSearch color={theme.textMuted} />}
          />
          <TkxInput
            label="Price"
            type="number"
            placeholder="0.00"
            leftAddon={<span style={{ fontWeight: 600 }}>$</span>}
          />
          <TkxInput
            label="Subdomain"
            placeholder="yourname"
            rightAddon={<span style={{ fontSize: '13px', whiteSpace: 'nowrap' }}>.tekivex.io</span>}
          />
          <TkxInput
            label="Website"
            placeholder="example"
            leftAddon={<span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>https://</span>}
            rightAddon={<span style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>.com</span>}
          />
        </div>
      </DemoSection>

      {/* ── 6. Disabled State ── */}
      <DemoSection
        title="Disabled State"
        description="disabled reduces opacity to 60%, prevents interaction, and sets the disabled attribute on the input element. The label remains visible and legible."
        theme={theme}
        code={`<TkxInput
  label="Account Email"
  value="avery@tekivex.io"
  disabled
  hint="Contact support to change your account email."
/>

<TkxInput
  label="SSO Provider"
  value="Google Workspace"
  disabled
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
          <TkxInput
            label="Account Email"
            defaultValue="avery@tekivex.io"
            disabled
            hint="Contact support to change your account email."
          />
          <TkxInput
            label="SSO Provider"
            defaultValue="Google Workspace"
            disabled
          />
        </div>
      </DemoSection>

      {/* ── 7. Input Types ── */}
      <DemoSection
        title="Input Types"
        description="TkxInput forwards the type attribute to the native input. The password field below includes a show/hide toggle implemented via a rightAddon button."
        theme={theme}
        code={`// Email
<TkxInput label="Email" type="email" placeholder="you@example.com" />

// Password with show/hide toggle
const [show, setShow] = useState(false);
<TkxInput
  label="Password"
  type={show ? 'text' : 'password'}
  placeholder="••••••••"
  rightAddon={
    <button
      type="button"
      onClick={() => setShow(s => !s)}
      aria-label={show ? 'Hide password' : 'Show password'}
      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: theme.textMuted }}
    >
      {show ? <IconEyeOff /> : <IconEye />}
    </button>
  }
/>

// Number
<TkxInput label="Age" type="number" placeholder="18" min={1} max={120} />

// Search
<TkxInput label="Search" type="search" placeholder="Search…" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
          <TkxInput label="Email" type="email" placeholder="you@example.com" leftAddon={<IconMail color={theme.textMuted} />} />
          <TkxInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            isRequired
            rightAddon={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: theme.textMuted, display: 'flex', alignItems: 'center' }}
              >
                {showPassword ? <IconEyeOff color={theme.textMuted} /> : <IconEye color={theme.textMuted} />}
              </button>
            }
          />
          <TkxInput label="Age" type="number" placeholder="18" min={1} max={120} />
          <TkxInput label="Search" type="search" placeholder="Search…" leftAddon={<IconSearch color={theme.textMuted} />} />
        </div>
      </DemoSection>

      {/* ── 8. Search Bar Example ── */}
      <DemoSection
        title="Search Bar Example"
        description="A full-featured search bar with a leading icon addon, live clear button, and type='search' for browser-native UX. The clear button only appears when the field has content."
        theme={theme}
        code={`const [query, setQuery] = useState('');

<TkxInput
  label="Search documentation"
  type="search"
  placeholder="Search components, props, patterns…"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  leftAddon={<IconSearch />}
  rightAddon={
    query ? (
      <button
        type="button"
        aria-label="Clear search"
        onClick={() => setQuery('')}
        style={{ /* style */ }}
      >
        <IconX />
      </button>
    ) : undefined
  }
/>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          <TkxInput
            label="Search documentation"
            type="search"
            placeholder="Search components, props, patterns…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftAddon={<IconSearch color={theme.textMuted} />}
            rightAddon={
              searchQuery ? (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', color: theme.textMuted, display: 'flex', alignItems: 'center' }}
                >
                  <IconX color={theme.textMuted} />
                </button>
              ) : undefined
            }
          />
          {searchQuery && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
              Searching for: <strong style={{ color: theme.text }}>"{searchQuery}"</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── 9. Form Group Example ── */}
      <DemoSection
        title="Form Group Example"
        description="Multiple TkxInput fields composed into a live-validated contact form. Click Submit to trigger error states on empty required fields."
        theme={theme}
        code={`const [values, setValues] = useState({ firstName: '', lastName: '', email: '', phone: '' });
const [errors, setErrors] = useState({});

function handleSubmit() {
  const e = {};
  if (!values.firstName) e.firstName = 'First name is required.';
  if (!values.lastName)  e.lastName  = 'Last name is required.';
  if (!values.email.includes('@')) e.email = 'Enter a valid email.';
  setErrors(e);
}

<form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
    <TkxInput label="First Name" isRequired
      value={values.firstName} onChange={…} error={errors.firstName} />
    <TkxInput label="Last Name" isRequired
      value={values.lastName} onChange={…} error={errors.lastName} />
  </div>
  <TkxInput label="Email" type="email" isRequired
    value={values.email} onChange={…} error={errors.email}
    leftAddon={<IconMail />} />
  <TkxInput label="Phone" type="tel"
    value={values.phone} onChange={…}
    leftAddon="+1" hint="Optional. Used only for 2FA." />
  <TkxButton type="submit" isFullWidth>Submit</TkxButton>
</form>`}
      >
        <div style={{ width: '100%', maxWidth: '480px' }}>
          {formSubmitted ? (
            <div style={{ padding: '20px 24px', borderRadius: '10px', backgroundColor: `${theme.success}15`, border: `1px solid ${theme.success}30`, color: theme.success, fontSize: '14px', fontWeight: 600 }}>
              ✓ Form submitted successfully! Values: {JSON.stringify(formValues)}
            </div>
          ) : (
            <form
              onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }}
              style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
              noValidate
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <TkxInput
                  label="First Name"
                  isRequired
                  placeholder="Avery"
                  leftAddon={<IconUser color={theme.textMuted} />}
                  value={formValues.firstName}
                  onChange={(e) => handleFormChange('firstName', e.target.value)}
                  error={formErrors.firstName}
                />
                <TkxInput
                  label="Last Name"
                  isRequired
                  placeholder="Chen"
                  value={formValues.lastName}
                  onChange={(e) => handleFormChange('lastName', e.target.value)}
                  error={formErrors.lastName}
                />
              </div>
              <TkxInput
                label="Email Address"
                type="email"
                isRequired
                placeholder="you@company.com"
                leftAddon={<IconMail color={theme.textMuted} />}
                value={formValues.email}
                onChange={(e) => handleFormChange('email', e.target.value)}
                error={formErrors.email}
              />
              <TkxInput
                label="Phone Number"
                type="tel"
                placeholder="(555) 000-0000"
                leftAddon={<span style={{ fontSize: '13px', fontWeight: 600 }}>+1</span>}
                value={formValues.phone}
                onChange={(e) => handleFormChange('phone', e.target.value)}
                hint="Optional. Used only for two-factor authentication."
              />
              <TkxButton type="submit" isFullWidth>
                Submit Form
              </TkxButton>
            </form>
          )}
        </div>
      </DemoSection>

      {/* ── 10. Custom Styling ── */}
      <DemoSection
        title="Custom Styling"
        description="Pass style to the root wrapper or use className for atomic CSS overrides. For the input border and background, apply style directly to the wrapper — the inner input inherits theme colors."
        theme={theme}
        code={`// Rounded pill style via style override on wrapper
<TkxInput
  label="Search"
  placeholder="Pill search input"
  leftAddon={<IconSearch />}
  style={{ '--input-radius': '9999px' } as CSSProperties}
  className="rounded-full"
/>

// Brand accent border
<TkxInput
  label="API Key"
  placeholder="tkx_live_..."
  style={{
    // Wrapper styling
  }}
  className="font-mono"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', maxWidth: '380px' }}>
          <TkxInput
            label="Monospace Input"
            placeholder="tkx_live_abc123..."
            hint="API keys use monospace font for readability."
            style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}
          />
          <TkxInput
            label="Compact Search"
            placeholder="Quick find…"
            leftAddon={<IconSearch color={theme.textMuted} />}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={INPUT_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* ── WCAG Notes ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="1.4.3 Contrast (Minimum)" level="AA" status="PASS" />
        <WCAGBadge criterion="2.4.6 Headings and Labels" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.1 Error Identification" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.2 Labels or Instructions" level="AA" status="PASS" />
        <WCAGBadge criterion="3.3.3 Error Suggestion" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Label Association</p>
        <p style={noteItemStyle}>Every TkxInput renders a visible <code>{'<label>'}</code> element connected to the input via <code>htmlFor</code> / <code>id</code>. The <code>id</code> is auto-generated using React's <code>useId()</code> hook when not provided, so you never accidentally create duplicate IDs.</p>
        <p style={noteItemStyle}>Never use <code>placeholder</code> as a replacement for <code>label</code> — placeholders disappear on input and have very low contrast by default.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Error State & aria-invalid</p>
        <p style={noteItemStyle}>When <code>error</code> is provided, the input receives <code>aria-invalid="true"</code> and <code>aria-describedby</code> pointing to the error element's id. Screen readers announce the error message when the user focuses the field.</p>
        <p style={noteItemStyle}>Error messages include an icon (<code>aria-hidden="true"</code>) and are wrapped in <code>role="alert"</code> for live announcement — so VoiceOver and NVDA announce them immediately when they appear.</p>
        <p style={noteItemStyle}>The hint is hidden when an error is shown to prevent two competing <code>aria-describedby</code> messages. Both ids are still linked to the input so the active message is announced.</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Required Fields</p>
        <p style={noteItemStyle}>The visual red asterisk is <code>aria-hidden="true"</code>. Screen readers are notified via <code>aria-required="true"</code> on the input element.</p>
        <p style={noteItemStyle}>Add a note near the form header indicating that "* denotes required fields" as a sighted-user convention (WCAG 3.3.2).</p>
      </div>

      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Addons & Keyboard Access</p>
        <p style={noteItemStyle}>Addons are decorative by default (wrapped in a <code>div</code>). If your addon contains an interactive element (like the password show/hide toggle), ensure it has an <code>aria-label</code> and is reachable via Tab.</p>
        <p style={noteItemStyle}>For the password show/hide pattern, the toggle button should announce its state change: <code>aria-label="Show password"</code> when hidden, <code>"Hide password"</code> when shown.</p>
      </div>
    </div>
  );
}
