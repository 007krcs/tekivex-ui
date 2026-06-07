import { useState } from 'react';
import { TkxColorPicker } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ColorPickerBasic() {
  const [color, setColor] = useState('#0d9488');
  return (
    <Preview label="Basic — controlled" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxColorPicker value={color} onChange={setColor} />
      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 24, height: 24, background: color, borderRadius: 4, border: '1px solid #e5e7eb' }} />
        <code style={{ fontSize: 12, color: '#475569' }}>{color}</code>
      </div>
    </Preview>
  );
}

export function ColorPickerWithPresets() {
  const [color, setColor] = useState('#4f46e5');
  return (
    <Preview label="With presets">
      <TkxColorPicker
        value={color}
        onChange={setColor}
        presets={['#0a0a0f', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0d9488', '#0369a1', '#4f46e5', '#7c3aed', '#db2777']}
      />
    </Preview>
  );
}
