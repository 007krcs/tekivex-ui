import { useState } from 'react';
import { TkxPhoneInput } from 'tekivex-ui';
import { Preview } from '../Preview';

export function PhoneInputBasic() {
  const [v, setV] = useState('');
  return (
    <Preview label="Basic — default country India" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 320 }}>
        <TkxPhoneInput value={v} onChange={setV} />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        E.164: <strong>{v || '(empty)'}</strong>
      </p>
    </Preview>
  );
}

export function PhoneInputUS() {
  const [v, setV] = useState('');
  return (
    <Preview label="Default country US">
      <div style={{ width: '100%', maxWidth: 320 }}>
        <TkxPhoneInput value={v} onChange={setV} defaultCountry="us" />
      </div>
    </Preview>
  );
}
