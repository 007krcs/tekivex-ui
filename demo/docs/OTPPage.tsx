import { useState } from 'react';
import { TkxOTP, type ThemeTokens } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';

export function OTPPage({ theme }: { theme: ThemeTokens }) {
  const [basic6, setBasic6] = useState('');
  const [basic4, setBasic4] = useState('');
  const [masked, setMasked] = useState('');
  const [numeric, setNumeric] = useState('');

  const codeInline = {
    fontSize: '12px',
    backgroundColor: `${theme.primary}14`,
    color: theme.primary,
    padding: '1px 5px',
    borderRadius: '4px',
    fontFamily: 'monospace',
  };

  const valueTag = {
    marginTop: '8px',
    display: 'inline-flex' as const,
    alignItems: 'center' as const,
    gap: '6px',
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '13px',
    color: theme.textMuted,
    fontFamily: 'monospace',
  };

  const propRows = [
    ['length', 'number', '6', 'Number of OTP input boxes'],
    ['value', 'string', '—', 'Controlled value'],
    ['onChange', '(value: string) => void', '—', 'Called on every change'],
    ['onComplete', '(value: string) => void', '—', 'Fired when all boxes are filled'],
    ['type', "'number' | 'alphanumeric' | 'alpha'", "'number'", 'Allowed character type'],
    ['mask', 'boolean', 'false', 'Render as password dots'],
    ['autoFocus', 'boolean', 'false', 'Auto-focus first box on mount'],
    ['isDisabled', 'boolean', 'false', 'Disable all boxes'],
    ['isInvalid', 'boolean', 'false', 'Apply error styling'],
    ['errorMessage', 'string', '—', 'Error text below boxes'],
    ['hint', 'string', '—', 'Helper text below boxes'],
    ['size', "'sm' | 'md' | 'lg'", "'md'", 'Box size'],
    ['separator', 'ReactNode', '—', 'Element between boxes at separatorPosition'],
    ['separatorPosition', 'number', '—', 'Index after which separator is inserted'],
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em' }}>
        TkxOTP
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        One-time password input with configurable length, character type, masking, and validation states.
        Supports keyboard navigation, clipboard paste, and auto-advance.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Import:</strong>{' '}
        <code style={codeInline}>{'import { TkxOTP } from \'tekivex-ui\''}</code>
      </p>

      {/* Basic 6-digit */}
      <DemoSection
        title="Basic — 6-digit"
        description="The default 6-box OTP input. Type a digit and focus auto-advances to the next box. Paste support fills all boxes at once."
        theme={theme}
        code={`import { useState } from 'react';
import { TkxOTP } from 'tekivex-ui';

function MyOTP() {
  const [value, setValue] = useState('');

  return (
    <TkxOTP
      length={6}
      value={value}
      onChange={setValue}
      onComplete={(v) => console.log('OTP complete:', v)}
    />
  );
}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          <TkxOTP length={6} value={basic6} onChange={setBasic6} onComplete={(v) => console.log('Complete:', v)} />
          <div style={valueTag}>
            <span>value:</span> <span style={{ color: theme.text }}>{basic6 || '——'}</span>
          </div>
        </div>
      </DemoSection>

      {/* 4-digit with hint */}
      <DemoSection
        title="4-digit with Hint"
        description="Use length={4} for a shorter code. The hint prop adds helper text below the boxes. Large size with size='lg'."
        theme={theme}
        code={`<TkxOTP
  length={4}
  value={value}
  onChange={setValue}
  hint="Enter your 4-digit PIN"
  size="lg"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          <TkxOTP length={4} value={basic4} onChange={setBasic4} hint="Enter your 4-digit PIN" size="lg" />
          <div style={valueTag}>
            <span>value:</span> <span style={{ color: theme.text }}>{basic4 || '——'}</span>
          </div>
        </div>
      </DemoSection>

      {/* Masked */}
      <DemoSection
        title="Masked (Password Mode)"
        description="Set mask={true} to hide digits as dots. Useful for sensitive codes like PINs."
        theme={theme}
        code={`<TkxOTP
  length={6}
  value={value}
  onChange={setValue}
  mask={true}
  hint="Digits are hidden as you type"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          <TkxOTP length={6} value={masked} onChange={setMasked} mask={true} hint="Digits are hidden as you type" />
          <div style={valueTag}>
            <span>actual value:</span> <span style={{ color: theme.text }}>{masked || '——'}</span>
          </div>
        </div>
      </DemoSection>

      {/* Numeric with separator */}
      <DemoSection
        title="Numeric-only with Separator"
        description="Use type='number' to restrict to digits only. The separator prop inserts a custom element between boxes at the specified position."
        theme={theme}
        code={`<TkxOTP
  length={6}
  value={value}
  onChange={setValue}
  type="number"
  separator={<span style={{ color: '#999', fontSize: '18px' }}>–</span>}
  separatorPosition={3}
  hint="Only digits are accepted"
  size="sm"
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, width: '100%' }}>
          <TkxOTP
            length={6}
            value={numeric}
            onChange={setNumeric}
            type="number"
            separator={<span style={{ color: theme.textMuted, fontSize: '18px', userSelect: 'none' }}>–</span>}
            separatorPosition={3}
            hint="Only digits are accepted"
            size="sm"
          />
          <div style={valueTag}>
            <span>value:</span> <span style={{ color: theme.text }}>{numeric || '——'}</span>
          </div>
        </div>
      </DemoSection>

      {/* Invalid state */}
      <DemoSection
        title="Invalid / Error State"
        description="Set isInvalid={true} to apply error styling. Use errorMessage for a descriptive error below the inputs."
        theme={theme}
        code={`<TkxOTP
  length={6}
  value="123"
  isInvalid={true}
  errorMessage="Incorrect code. Please try again."
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <TkxOTP length={6} value="123" isInvalid={true} errorMessage="Incorrect code. Please try again." />
        </div>
      </DemoSection>

      {/* Props table */}
      <div style={{ marginTop: '64px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: '0 0 24px', letterSpacing: '-0.02em' }}>
          Props
        </h2>
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: `1px solid ${theme.border}` }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Prop', 'Type', 'Default', 'Description'].map((h) => (
                  <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: theme.textMuted, fontWeight: 600, background: theme.surfaceAlt, borderBottom: `1px solid ${theme.border}`, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {propRows.map(([prop, type, def, desc], i) => (
                <tr key={prop} style={{ background: i % 2 === 0 ? 'transparent' : theme.surfaceAlt }}>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}` }}>
                    <code style={codeInline}>{prop}</code>
                  </td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontFamily: 'monospace', fontSize: 12, color: theme.info }}>{type}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, fontFamily: 'monospace', fontSize: 12, color: theme.textMuted }}>{def}</td>
                  <td style={{ padding: '10px 14px', borderBottom: `1px solid ${theme.border}`, color: theme.text }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
