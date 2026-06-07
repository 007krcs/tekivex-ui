import { useState } from 'react';
import { TkxNumberInput } from 'tekivex-ui';
import { Preview } from '../Preview';

export function NumberInputBasic() {
  const [v, setV] = useState<number | null>(7);
  return (
    <Preview label="Basic — controlled" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: 200 }}>
        <TkxNumberInput value={v ?? 0} onChange={setV} label="Quantity" />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Value: <strong>{v ?? '(null)'}</strong>
      </p>
    </Preview>
  );
}

export function NumberInputMinMax() {
  const [v, setV] = useState<number | null>(50);
  return (
    <Preview label="With min / max / step">
      <div style={{ width: 220 }}>
        <TkxNumberInput value={v ?? 0} onChange={setV} label="Volume" min={0} max={100} step={5} />
      </div>
    </Preview>
  );
}

export function NumberInputDecimal() {
  const [v, setV] = useState<number | null>(3.5);
  return (
    <Preview label="Decimal step">
      <div style={{ width: 220 }}>
        <TkxNumberInput value={v ?? 0} onChange={setV} label="Rating" min={0} max={5} step={0.5} />
      </div>
    </Preview>
  );
}
