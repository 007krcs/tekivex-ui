import { useState } from 'react';
import { TkxAadhaarInput } from 'tekivex-ui';
import { Preview } from '../Preview';

export function AadhaarInputBasic() {
  const [valid, setValid] = useState<boolean | null>(null);
  return (
    <Preview label="Verhoeff-checksummed Aadhaar input — try 123456789012 (invalid) vs 234567890123" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: 320 }}>
        <TkxAadhaarInput
          label="Aadhaar number"
          onChange={(payload) => setValid(payload.isValid)}
        />
      </div>
      {valid !== null && (
        <p style={{ marginTop: 8, fontSize: 12, color: valid ? '#0f766e' : '#dc2626', fontWeight: 600 }}>
          {valid ? '✓ Checksum valid' : '✗ Checksum invalid'}
        </p>
      )}
    </Preview>
  );
}
