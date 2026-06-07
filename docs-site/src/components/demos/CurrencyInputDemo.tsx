import { useState } from 'react';
import { TkxCurrencyInput } from 'tekivex-ui';
import { Preview } from '../Preview';

export function CurrencyInputINR() {
  const [v, setV] = useState<number | null>(125000);
  return (
    <Preview label="INR — lakh / crore grouping" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: 240 }}>
        <TkxCurrencyInput value={v} onChange={setV} currency="INR" />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Raw value: <strong>{v ?? '(empty)'}</strong>
      </p>
    </Preview>
  );
}

export function CurrencyInputUSD() {
  const [v, setV] = useState<number | null>(3247.89);
  return (
    <Preview label="USD — comma thousands">
      <div style={{ width: 240 }}>
        <TkxCurrencyInput value={v} onChange={setV} currency="USD" />
      </div>
    </Preview>
  );
}
