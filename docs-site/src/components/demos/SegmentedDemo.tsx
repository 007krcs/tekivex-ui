import { useState } from 'react';
import { TkxSegmented } from 'tekivex-ui';
import { Preview } from '../Preview';

export function SegmentedBasic() {
  const [v, setV] = useState('week');
  return (
    <Preview label="Basic — three-option toggle" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxSegmented
        value={v}
        onChange={setV}
        options={[
          { value: 'day', label: 'Day' },
          { value: 'week', label: 'Week' },
          { value: 'month', label: 'Month' },
          { value: 'year', label: 'Year' },
        ]}
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Showing: <strong>{v}</strong>
      </p>
    </Preview>
  );
}

export function SegmentedSizes() {
  return (
    <Preview label="Sizes" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 12 }}>
      <TkxSegmented defaultValue="b" size="sm" options={[{value:'a',label:'A'},{value:'b',label:'B'},{value:'c',label:'C'}]} />
      <TkxSegmented defaultValue="b" size="md" options={[{value:'a',label:'A'},{value:'b',label:'B'},{value:'c',label:'C'}]} />
      <TkxSegmented defaultValue="b" size="lg" options={[{value:'a',label:'A'},{value:'b',label:'B'},{value:'c',label:'C'}]} />
    </Preview>
  );
}

export function SegmentedBlock() {
  return (
    <Preview label="Block — full-width" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 480 }}>
        <TkxSegmented
          block
          defaultValue="grid"
          options={[
            { value: 'grid', label: 'Grid' },
            { value: 'list', label: 'List' },
          ]}
        />
      </div>
    </Preview>
  );
}
