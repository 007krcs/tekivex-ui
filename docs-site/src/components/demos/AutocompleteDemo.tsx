import { useState } from 'react';
import { TkxAutocomplete } from 'tekivex-ui';
import { Preview } from '../Preview';

const CITIES = [
  { value: 'tokyo', label: 'Tokyo' },
  { value: 'osaka', label: 'Osaka' },
  { value: 'kyoto', label: 'Kyoto' },
  { value: 'mumbai', label: 'Mumbai' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'bangalore', label: 'Bangalore' },
  { value: 'new-york', label: 'New York' },
  { value: 'los-angeles', label: 'Los Angeles' },
  { value: 'london', label: 'London' },
  { value: 'paris', label: 'Paris' },
  { value: 'berlin', label: 'Berlin' },
  { value: 'sao-paulo', label: 'São Paulo' },
];

export function AutocompleteBasic() {
  const [value, setValue] = useState('');
  return (
    <Preview label="Type-ahead with filtering" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxAutocomplete
          label="City"
          options={CITIES}
          value={value}
          onChange={setValue}
        />
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Selected: <strong>{value || '(none)'}</strong>
        </p>
      </div>
    </Preview>
  );
}

export function AutocompleteFreeSolo() {
  const [value, setValue] = useState('');
  return (
    <Preview label="freeSolo (accept any input)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxAutocomplete
          label="Tag"
          options={[
            { value: 'react', label: 'react' },
            { value: 'tekivex-ui', label: 'tekivex-ui' },
            { value: 'a11y', label: 'a11y' },
            { value: 'i18n', label: 'i18n' },
          ]}
          freeSolo
          value={value}
          onChange={setValue}
          placeholder="Type any tag…"
        />
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
          Value: <strong>{value || '(none)'}</strong>
        </p>
      </div>
    </Preview>
  );
}
