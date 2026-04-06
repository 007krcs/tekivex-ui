import { useState } from 'react';
import { TkxOTP, type ThemeTokens } from '@tekivex/ui';

export function OTPPage({ theme }: { theme: ThemeTokens }) {
  const [basic6, setBasic6] = useState('');
  const [basic4, setBasic4] = useState('');
  const [masked, setMasked] = useState('');
  const [numeric, setNumeric] = useState('');

  const sectionStyle = {
    marginBottom: '40px',
  };

  const labelStyle = {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.08em',
    marginBottom: '12px',
  };

  const demoBoxStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: '12px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '16px',
  };

  const valueTagStyle = {
    marginTop: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: '6px',
    padding: '4px 12px',
    fontSize: '13px',
    color: theme.textMuted,
    fontFamily: 'monospace',
  };

  const tableWrapStyle = {
    overflowX: 'auto' as const,
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  };

  const thStyle = {
    background: theme.surfaceAlt,
    color: theme.textMuted,
    fontWeight: 600,
    padding: '10px 16px',
    textAlign: 'left' as const,
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

  const tdStyle = {
    padding: '10px 16px',
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
    verticalAlign: 'top' as const,
  };

  const codeStyle = {
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    padding: '1px 6px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: theme.primary,
  };

  const props = [
    { name: 'length', type: 'number', default: '6', description: 'Number of OTP input boxes.' },
    { name: 'value', type: 'string', default: '—', description: 'Controlled value of the OTP.' },
    { name: 'onChange', type: '(value: string) => void', default: '—', description: 'Called on every change with the current value string.' },
    { name: 'onComplete', type: '(value: string) => void', default: '—', description: 'Fired when all boxes are filled.' },
    { name: 'type', type: "'number' | 'alphanumeric' | 'alpha'", default: "'number'", description: 'Character type allowed in boxes.' },
    { name: 'mask', type: 'boolean', default: 'false', description: 'Renders input as password (●) dots.' },
    { name: 'autoFocus', type: 'boolean', default: 'false', description: 'Auto-focuses first box on mount.' },
    { name: 'isDisabled', type: 'boolean', default: 'false', description: 'Disables all input boxes.' },
    { name: 'isInvalid', type: 'boolean', default: 'false', description: 'Applies error styling to all boxes.' },
    { name: 'errorMessage', type: 'string', default: '—', description: 'Error text shown below boxes when isInvalid is true.' },
    { name: 'hint', type: 'string', default: '—', description: 'Helper text shown below boxes.' },
    { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls box dimensions and font size.' },
    { name: 'separator', type: 'ReactNode', default: '—', description: 'Custom element rendered between boxes at separatorPosition.' },
    { name: 'separatorPosition', type: 'number', default: '—', description: 'Index after which the separator is inserted.' },
    { name: 'style', type: 'CSSProperties', default: '—', description: 'Inline style override for the root element.' },
  ];

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: '48px 32px', color: theme.text }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: theme.text, margin: '0 0 10px' }}>
          TkxOTP
        </h1>
        <p style={{ fontSize: '16px', color: theme.textMuted, margin: 0, maxWidth: '600px' }}>
          One-time password input with configurable length, character type, masking, and validation states.
          Supports keyboard navigation and clipboard paste.
        </p>
      </div>

      {/* Basic 6-digit */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Basic — 6-digit</div>
        <div style={demoBoxStyle}>
          <TkxOTP
            length={6}
            value={basic6}
            onChange={setBasic6}
            onComplete={(v) => console.log('Complete:', v)}
          />
          <div style={valueTagStyle}>
            <span style={{ color: theme.textMuted }}>value:</span>
            <span style={{ color: theme.text }}>{basic6 || '——'}</span>
          </div>
        </div>
      </div>

      {/* 4-digit */}
      <div style={sectionStyle}>
        <div style={labelStyle}>4-digit with hint</div>
        <div style={demoBoxStyle}>
          <TkxOTP
            length={4}
            value={basic4}
            onChange={setBasic4}
            hint="Enter your 4-digit PIN"
            size="lg"
          />
          <div style={valueTagStyle}>
            <span style={{ color: theme.textMuted }}>value:</span>
            <span style={{ color: theme.text }}>{basic4 || '——'}</span>
          </div>
        </div>
      </div>

      {/* Masked OTP */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Masked (password mode)</div>
        <div style={demoBoxStyle}>
          <TkxOTP
            length={6}
            value={masked}
            onChange={setMasked}
            mask={true}
            hint="Digits are hidden as you type"
          />
          <div style={valueTagStyle}>
            <span style={{ color: theme.textMuted }}>actual value:</span>
            <span style={{ color: theme.text }}>{masked || '——'}</span>
          </div>
        </div>
      </div>

      {/* Numeric with separator */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Numeric-only with separator</div>
        <div style={demoBoxStyle}>
          <TkxOTP
            length={6}
            value={numeric}
            onChange={setNumeric}
            type="number"
            separator={
              <span style={{ color: theme.textMuted, fontSize: '18px', userSelect: 'none' }}>–</span>
            }
            separatorPosition={3}
            hint="Only digits are accepted"
            size="sm"
          />
          <div style={valueTagStyle}>
            <span style={{ color: theme.textMuted }}>value:</span>
            <span style={{ color: theme.text }}>{numeric || '——'}</span>
          </div>
        </div>
      </div>

      {/* Invalid state */}
      <div style={sectionStyle}>
        <div style={labelStyle}>Invalid / error state</div>
        <div style={demoBoxStyle}>
          <TkxOTP
            length={6}
            value="123"
            isInvalid={true}
            errorMessage="Incorrect code. Please try again."
          />
        </div>
      </div>

      {/* Props table */}
      <div style={{ marginTop: '56px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
          Props
        </h2>
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Prop</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Default</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {props.map((p, i) => (
                <tr
                  key={p.name}
                  style={{ background: i % 2 === 0 ? 'transparent' : theme.surfaceAlt }}
                >
                  <td style={tdStyle}>
                    <code style={codeStyle}>{p.name}</code>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: theme.secondary }}>
                    {p.type}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: theme.textMuted }}>
                    {p.default}
                  </td>
                  <td style={{ ...tdStyle, color: theme.textMuted }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
