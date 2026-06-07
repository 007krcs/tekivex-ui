import { useState } from 'react';
import { TkxOTP } from 'tekivex-ui';
import { Preview } from '../Preview';

export function OTPBasic() {
  const [code, setCode] = useState('');
  return (
    <Preview label="Basic — 6-digit code (default)" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxOTP value={code} onChange={setCode} />
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Current value: <strong>{code || '(empty)'}</strong>
      </p>
    </Preview>
  );
}

export function OTPCustomLength() {
  const [code4, setCode4] = useState('');
  const [code8, setCode8] = useState('');
  return (
    <Preview label="Custom lengths — 4 and 8 digits" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
      <div>
        <p style={{ fontSize: 12, color: '#475569', margin: '0 0 6px' }}>4-digit PIN:</p>
        <TkxOTP length={4} value={code4} onChange={setCode4} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#475569', margin: '0 0 6px' }}>8-digit security code:</p>
        <TkxOTP length={8} value={code8} onChange={setCode8} />
      </div>
    </Preview>
  );
}

export function OTPWithComplete() {
  const [code, setCode] = useState('');
  const [submittedAt, setSubmittedAt] = useState<string | null>(null);
  return (
    <Preview label="With onComplete — fires when all digits filled" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxOTP
        value={code}
        onChange={(v) => { setCode(v); setSubmittedAt(null); }}
        onComplete={() => setSubmittedAt(new Date().toLocaleTimeString())}
      />
      {submittedAt && (
        <p style={{ marginTop: 8, fontSize: 12, color: '#0f766e', fontWeight: 600 }}>
          ✓ Code submitted at {submittedAt}
        </p>
      )}
    </Preview>
  );
}
