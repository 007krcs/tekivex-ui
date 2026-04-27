import { useState } from 'react';
import { TkxAddressInput, type AddressValue } from 'tekivex-ui';
import type { Story } from '../src/types';

function AddressStory(p: any) {
  const [value, setValue] = useState<Partial<AddressValue>>({});
  return (
    <div style={{ minWidth: 360 }}>
      <TkxAddressInput
        label={p.label}
        value={value}
        onChange={setValue}
        showAddressLines={p.showAddressLines}
      />
      <pre style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

export const addressInput: Story = {
  name: 'TkxAddressInput',
  description: 'Indian PIN → city/state lookup via India Post API.',
  controls: {
    label: { type: 'text', default: 'Address' },
    showAddressLines: { type: 'boolean', default: true },
  },
  render: (p) => <AddressStory {...p} />,
};
