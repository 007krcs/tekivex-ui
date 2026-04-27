import { useState } from 'react';
import { TkxPhoneInput, type PhoneChangePayload } from 'tekivex-ui';
import type { Story } from '../src/types';

function PhoneStory(p: any) {
  const [last, setLast] = useState<PhoneChangePayload | null>(null);
  return (
    <div style={{ minWidth: 320 }}>
      <TkxPhoneInput
        label={p.label}
        defaultCountry={p.defaultCountry}
        required={p.required}
        disabled={p.disabled}
        onChange={setLast}
      />
      {last && (
        <pre style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
          {JSON.stringify({ e164: last.e164, valid: last.valid, country: last.country.iso2 }, null, 2)}
        </pre>
      )}
    </div>
  );
}

export const phoneInput: Story = {
  name: 'TkxPhoneInput',
  description: 'International phone input with E.164 normalisation.',
  controls: {
    label: { type: 'text', default: 'Mobile' },
    defaultCountry: { type: 'select', options: ['in', 'us', 'gb', 'au', 'jp', 'sg', 'ae'], default: 'in' },
    required: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },
  render: (p) => <PhoneStory {...p} />,
};
