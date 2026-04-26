import { useState } from 'react';
import { TkxInput } from 'tekivex-ui';
import { Preview } from '../Preview';

export function InputBasic() {
  return (
    <Preview label="With label">
      <div style={{ minWidth: 280 }}>
        <TkxInput label="Full name" placeholder="Jane Doe" />
      </div>
    </Preview>
  );
}

export function InputWithHint() {
  return (
    <Preview label="With hint">
      <div style={{ minWidth: 320 }}>
        <TkxInput
          label="Username"
          hint="3–20 characters, lowercase only"
          placeholder="jane_doe"
          pattern="[a-z0-9]{3,20}"
        />
      </div>
    </Preview>
  );
}

export function InputError() {
  return (
    <Preview label="Error state">
      <div style={{ minWidth: 320 }}>
        <TkxInput
          label="Email"
          defaultValue="not-an-email"
          isInvalid
          error="Enter a valid email address"
        />
      </div>
    </Preview>
  );
}

export function InputUnicodeSafety() {
  const [value, setValue] = useState('');
  return (
    <Preview label="Unicode-safe (zero-width characters stripped)">
      <div style={{ minWidth: 320 }}>
        <TkxInput
          label="Try pasting U+200B or RTL override"
          value={value}
          onChange={(e) => setValue((e.target as HTMLInputElement).value)}
          hint="Zero-width and bidi-override characters are stripped automatically."
        />
        <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Stored value length: <strong>{value.length}</strong>
        </div>
      </div>
    </Preview>
  );
}
