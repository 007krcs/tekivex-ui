import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
// TkxQuantumForm is in the experimental surface — pin your version, API may change.
import { TkxQuantumForm } from '../../src/experimental';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const EXPERIMENTAL_BANNER = {
  background: 'rgba(247, 37, 133, 0.10)',
  border: '1px solid rgba(247, 37, 133, 0.45)',
  color: '#f72585',
  padding: '12px 16px',
  borderRadius: 8,
  marginBottom: 24,
  fontSize: 14,
  fontWeight: 500,
} as const;

// ── Prop definitions ──────────────────────────────────────────────────────────

const QUANTUM_FORM_PROPS = [
  { name: 'fields', type: 'QuantumFieldConfig[]', required: true, description: 'Array of field config objects. Each object needs at minimum a name string. All other properties (label, type, placeholder, required) are auto-inferred by the quantum engine if not provided.' },
  { name: 'onSubmit', type: '(values: Record<string, string>) => void | Promise<void>', required: true, description: 'Callback fired when the form passes validation. Receives a map of field names to their trimmed string values.' },
  { name: 'submitLabel', type: 'string', default: "'Submit'", description: 'Text displayed on the submit button.' },
  { name: 'layout', type: "'vertical' | 'horizontal'", default: "'vertical'", description: "Controls field arrangement. 'vertical' stacks label above input; 'horizontal' places them side by side in a two-column grid." },
  { name: 'showConfidence', type: 'boolean', default: 'false', description: 'When true, displays a confidence percentage bar below each field showing how certain the quantum engine is about its type inference.' },
  { name: 'showQuantumState', type: 'boolean', default: 'false', description: 'When true, renders a Bloch sphere qubit visualizer next to each field showing the quantum superposition state before it collapses to a type.' },
];

const FIELD_CONFIG_PROPS = [
  { name: 'name', type: 'string', required: true, description: 'The field identifier. Also used as the key in the onSubmit values map. The quantum engine tokenizes this name to infer field type, label, and validation.' },
  { name: 'label', type: 'string', description: 'Override the auto-inferred label. If omitted, the engine generates a human-readable label from the field name (e.g. "firstName" → "First Name").' },
  { name: 'type', type: 'string', description: "Override the auto-inferred input type (e.g. 'email', 'password', 'tel', 'date'). If omitted, the quantum engine infers the best type." },
  { name: 'required', type: 'boolean', description: 'Override the required flag. If omitted, the engine infers required status from the field name semantics.' },
  { name: 'placeholder', type: 'string', description: 'Override the auto-generated placeholder text.' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function QuantumFormPage({ theme }: { theme: ThemeTokens }) {
  const [registrationResult, setRegistrationResult] = useState<Record<string, string> | null>(null);
  const [paymentResult, setPaymentResult] = useState<Record<string, string> | null>(null);
  const [profileResult, setProfileResult] = useState<Record<string, string> | null>(null);
  const [loginResult, setLoginResult] = useState<Record<string, string> | null>(null);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const calloutStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.primary}30`,
    backgroundColor: `${theme.primary}08`,
    padding: '20px 24px',
    marginBottom: '40px',
  };

  const calloutHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.primary,
    margin: '0 0 10px',
  };

  const calloutBodyStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.75',
    margin: 0,
  };

  const resultBoxStyle = {
    marginTop: '16px',
    borderRadius: '8px',
    border: `1px solid ${theme.success}30`,
    backgroundColor: `${theme.success}08`,
    padding: '12px 16px',
  };

  const resultHeadStyle = {
    fontSize: '12px',
    fontWeight: 700 as const,
    color: theme.success,
    margin: '0 0 8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

  const resultCodeStyle = {
    fontSize: '12px',
    color: theme.text,
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
    whiteSpace: 'pre-wrap' as const,
    margin: 0,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Experimental banner — surface API instability up front */}
      <div role="alert" style={EXPERIMENTAL_BANNER}>
        ⚠ <strong>Experimental.</strong> This component is in the
        <code style={{ background: 'rgba(247,37,133,0.15)', padding: '2px 6px', borderRadius: 4, margin: '0 4px' }}>
          tekivex-ui/experimental
        </code>
        subpath. The API may change or be removed between minor versions — pin your version explicitly.
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxQuantumForm
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '660px', margin: '0 0 8px' }}>
        A quantum-AI powered smart form. Pass a list of field names and the engine automatically
        infers field types, labels, placeholders, and validation rules — no manual configuration
        needed. Powered by a Quantum Boltzmann Machine and Grover-inspired Amplitude Amplification.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '660px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Zero config:</strong> Pass{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          fields={`[{ name: 'email' }]`}
        </code>{' '}
        and get a fully validated email field with correct input type, accessible label, and
        error messaging — all inferred automatically.
      </p>

      {/* Quantum explanation callout */}
      <div style={calloutStyle}>
        <p style={calloutHeadStyle}>
          ⚛ How it works: Quantum Boltzmann Machine + Amplitude Amplification
        </p>
        <p style={calloutBodyStyle}>
          Each field name is tokenized and run through a Quantum Boltzmann Machine. Possible field
          types exist in quantum superposition — email, password, phone, date, text, and more are
          all candidate states with associated probability amplitudes. Amplitude Amplification
          (Grover-inspired) ranks candidates in O(√N) time. The system collapses to the
          highest-probability type + validation set, producing human-readable labels, placeholders,
          and rules automatically. Confidence scores reflect the amplitude of the winning state.
        </p>
      </div>

      {/* ── 1. Registration Form ── */}
      <DemoSection
        title="Registration Form"
        description="Six fields including password confirmation. showQuantumState=true renders a Bloch sphere visualizer per field. showConfidence=true adds amplitude confidence bars beneath each input."
        theme={theme}
        code={`<TkxQuantumForm
  fields={[
    { name: 'firstName' },
    { name: 'lastName' },
    { name: 'email' },
    { name: 'password' },
    { name: 'confirm_password' },
    { name: 'phone' },
  ]}
  onSubmit={(values) => console.log('Registration:', values)}
  submitLabel="Create Account"
  showConfidence={true}
  showQuantumState={true}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxQuantumForm
            fields={[
              { name: 'firstName' },
              { name: 'lastName' },
              { name: 'email' },
              { name: 'password' },
              { name: 'confirm_password' },
              { name: 'phone' },
            ]}
            onSubmit={(values) => setRegistrationResult(values)}
            submitLabel="Create Account"
            showConfidence={true}
            showQuantumState={true}
          />
          {registrationResult && (
            <div style={resultBoxStyle}>
              <p style={resultHeadStyle}>Submitted values</p>
              <pre style={resultCodeStyle}>{JSON.stringify(registrationResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </DemoSection>

      {/* ── 2. Payment Form ── */}
      <DemoSection
        title="Payment Form"
        description="Seven billing fields. The quantum engine infers address, city, zip code, and country types automatically from field names. showConfidence=true shows field inference certainty."
        theme={theme}
        code={`<TkxQuantumForm
  fields={[
    { name: 'cardholderName' },
    { name: 'email' },
    { name: 'phone' },
    { name: 'billingAddress' },
    { name: 'city' },
    { name: 'zipCode' },
    { name: 'country' },
  ]}
  onSubmit={(values) => console.log('Payment:', values)}
  submitLabel="Continue to Payment"
  showConfidence={true}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxQuantumForm
            fields={[
              { name: 'cardholderName' },
              { name: 'email' },
              { name: 'phone' },
              { name: 'billingAddress' },
              { name: 'city' },
              { name: 'zipCode' },
              { name: 'country' },
            ]}
            onSubmit={(values) => setPaymentResult(values)}
            submitLabel="Continue to Payment"
            showConfidence={true}
          />
          {paymentResult && (
            <div style={resultBoxStyle}>
              <p style={resultHeadStyle}>Submitted values</p>
              <pre style={resultCodeStyle}>{JSON.stringify(paymentResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </DemoSection>

      {/* ── 3. Profile Form ── */}
      <DemoSection
        title="Profile Form — Horizontal Layout"
        description='layout="horizontal" arranges each field as a label-on-left, input-on-right two-column row. Best for dense forms on wide screens.'
        theme={theme}
        code={`<TkxQuantumForm
  fields={[
    { name: 'username' },
    { name: 'bio' },
    { name: 'website' },
    { name: 'birthday' },
    { name: 'company' },
  ]}
  onSubmit={(values) => console.log('Profile:', values)}
  submitLabel="Save Profile"
  layout="horizontal"
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxQuantumForm
            fields={[
              { name: 'username' },
              { name: 'bio' },
              { name: 'website' },
              { name: 'birthday' },
              { name: 'company' },
            ]}
            onSubmit={(values) => setProfileResult(values)}
            submitLabel="Save Profile"
            layout="horizontal"
          />
          {profileResult && (
            <div style={resultBoxStyle}>
              <p style={resultHeadStyle}>Submitted values</p>
              <pre style={resultCodeStyle}>{JSON.stringify(profileResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </DemoSection>

      {/* ── 4. Login Form ── */}
      <DemoSection
        title="Login Form — Minimal"
        description="Two fields, no confidence bars, no quantum state visualizers. The lightest possible configuration — just pass field names and an onSubmit handler."
        theme={theme}
        code={`<TkxQuantumForm
  fields={[
    { name: 'email' },
    { name: 'password' },
  ]}
  onSubmit={(values) => console.log('Login:', values)}
  submitLabel="Sign In"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <TkxQuantumForm
            fields={[
              { name: 'email' },
              { name: 'password' },
            ]}
            onSubmit={(values) => setLoginResult(values)}
            submitLabel="Sign In"
          />
          {loginResult && (
            <div style={resultBoxStyle}>
              <p style={resultHeadStyle}>Submitted values</p>
              <pre style={resultCodeStyle}>{JSON.stringify(loginResult, null, 2)}</pre>
            </div>
          )}
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Tables ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxQuantumFormProps
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 20px', lineHeight: '1.6' }}>
        All props accepted by{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          TkxQuantumForm
        </code>.
      </p>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={QUANTUM_FORM_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        QuantumFieldConfig
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 20px', lineHeight: '1.6' }}>
        Shape of each object in the{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          fields
        </code>{' '}
        array. Only{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          name
        </code>{' '}
        is required — all other properties are auto-inferred.
      </p>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={FIELD_CONFIG_PROPS} />
      </div>

    </div>
  );
}
