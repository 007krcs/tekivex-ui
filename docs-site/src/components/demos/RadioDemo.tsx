import { useState } from 'react';
import { TkxRadio } from 'tekivex-ui';
import { Preview } from '../Preview';

export function RadioGroup() {
  const [speed, setSpeed] = useState('standard');
  return (
    <Preview label="Shipping speed — single choice from a group" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxRadio name="speed" value="eco" checked={speed === 'eco'} onChange={() => setSpeed('eco')} label="Eco — 5–7 days (free)" />
      <TkxRadio name="speed" value="standard" checked={speed === 'standard'} onChange={() => setSpeed('standard')} label="Standard — 2–3 days ($4.99)" />
      <TkxRadio name="speed" value="express" checked={speed === 'express'} onChange={() => setSpeed('express')} label="Express — next day ($14.99)" />
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Selected: <strong>{speed}</strong>
      </p>
    </Preview>
  );
}

export function RadioDisabled() {
  const [v, setV] = useState('b');
  return (
    <Preview label="With disabled option" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxRadio name="plan" value="a" checked={v === 'a'} onChange={() => setV('a')} label="Free" />
      <TkxRadio name="plan" value="b" checked={v === 'b'} onChange={() => setV('b')} label="Pro — $9/mo" />
      <TkxRadio name="plan" value="c" checked={v === 'c'} onChange={() => setV('c')} label="Enterprise — contact sales" disabled />
    </Preview>
  );
}

export function RadioColorSchemes() {
  const [v, setV] = useState('primary');
  return (
    <Preview label="Color schemes" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxRadio name="cs" value="primary" checked={v === 'primary'} onChange={() => setV('primary')} colorScheme="primary" label="primary" />
      <TkxRadio name="cs" value="success" checked={v === 'success'} onChange={() => setV('success')} colorScheme="success" label="success" />
      <TkxRadio name="cs" value="warning" checked={v === 'warning'} onChange={() => setV('warning')} colorScheme="warning" label="warning" />
      <TkxRadio name="cs" value="danger" checked={v === 'danger'} onChange={() => setV('danger')} colorScheme="danger" label="danger" />
    </Preview>
  );
}
