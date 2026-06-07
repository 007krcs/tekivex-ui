import { useState } from 'react';
import { TkxCascader } from 'tekivex-ui';
import { Preview } from '../Preview';

const REGIONS = [
  {
    value: 'india',
    label: 'India',
    children: [
      {
        value: 'mh',
        label: 'Maharashtra',
        children: [
          { value: 'pune', label: 'Pune' },
          { value: 'mumbai', label: 'Mumbai' },
          { value: 'nagpur', label: 'Nagpur' },
        ],
      },
      {
        value: 'ka',
        label: 'Karnataka',
        children: [
          { value: 'blr', label: 'Bangalore' },
          { value: 'mysore', label: 'Mysore' },
        ],
      },
    ],
  },
  {
    value: 'us',
    label: 'United States',
    children: [
      {
        value: 'ca',
        label: 'California',
        children: [
          { value: 'sf', label: 'San Francisco' },
          { value: 'la', label: 'Los Angeles' },
        ],
      },
      {
        value: 'ny',
        label: 'New York',
        children: [
          { value: 'nyc', label: 'New York City' },
          { value: 'buf', label: 'Buffalo' },
        ],
      },
    ],
  },
];

export function CascaderBasic() {
  const [value, setValue] = useState<string[]>([]);
  return (
    <Preview label="Hierarchical select — Country / State / City" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxCascader
        options={REGIONS}
        value={value}
        onChange={setValue}
        placeholder="Pick a region…"
      />
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Selected path: <strong>{value.join(' → ') || '(none)'}</strong>
      </p>
    </Preview>
  );
}
