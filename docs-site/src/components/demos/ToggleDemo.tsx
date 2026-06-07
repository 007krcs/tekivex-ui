import { useState } from 'react';
import { TkxToggle } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ToggleBasic() {
  const [on, setOn] = useState(true);
  return (
    <Preview label="Basic — controlled">
      <TkxToggle checked={on} onChange={setOn} label={on ? 'Notifications on' : 'Notifications off'} />
    </Preview>
  );
}

export function ToggleSizes() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(true);
  const [c, setC] = useState(true);
  return (
    <Preview label="Sizes" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <TkxToggle checked={a} onChange={setA} label="Small"  size="sm" />
      <TkxToggle checked={b} onChange={setB} label="Medium" size="md" />
      <TkxToggle checked={c} onChange={setC} label="Large"  size="lg" />
    </Preview>
  );
}

export function ToggleDisabled() {
  return (
    <Preview label="Disabled states" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <TkxToggle checked={true}  onChange={() => {}} label="Disabled (on)"  disabled />
      <TkxToggle checked={false} onChange={() => {}} label="Disabled (off)" disabled />
    </Preview>
  );
}
