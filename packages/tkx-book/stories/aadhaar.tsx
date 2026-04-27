import { useState } from 'react';
import { TkxAadhaarInput, type AadhaarChangePayload } from 'tekivex-ui';
import type { Story } from '../src/types';

function AadhaarStory(p: any) {
  const [last, setLast] = useState<AadhaarChangePayload | null>(null);
  return (
    <div style={{ minWidth: 320 }}>
      <TkxAadhaarInput
        label={p.label}
        mask={p.mask}
        required={p.required}
        disabled={p.disabled}
        onChange={setLast}
      />
      {last && (
        <pre style={{ marginTop: 12, fontSize: 12, opacity: 0.7 }}>
          {JSON.stringify(
            { digits: last.digits, valid: last.valid, display: last.display },
            null,
            2,
          )}
        </pre>
      )}
      <p style={{ marginTop: 8, fontSize: 12, opacity: 0.6 }}>
        Try <code>234123412346</code> for a valid Verhoeff sample.
      </p>
    </div>
  );
}

export const aadhaarInput: Story = {
  name: 'TkxAadhaarInput',
  description: 'Aadhaar with Verhoeff checksum + masking.',
  controls: {
    label: { type: 'text', default: 'Aadhaar number' },
    mask: { type: 'boolean', default: true },
    required: { type: 'boolean', default: true },
    disabled: { type: 'boolean', default: false },
  },
  render: (p) => <AadhaarStory {...p} />,
};
