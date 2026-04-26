import { useState } from 'react';
import { TkxSelect } from 'tekivex-ui';
import { Preview } from '../Preview';

const COUNTRIES = [
  { value: 'us', label: 'United States', group: 'Americas' },
  { value: 'br', label: 'Brazil', group: 'Americas' },
  { value: 'mx', label: 'Mexico', group: 'Americas' },
  { value: 'in', label: 'India', group: 'Asia' },
  { value: 'jp', label: 'Japan', group: 'Asia' },
  { value: 'kr', label: 'South Korea', group: 'Asia' },
  { value: 'sg', label: 'Singapore', group: 'Asia' },
  { value: 'gb', label: 'United Kingdom', group: 'Europe' },
  { value: 'de', label: 'Germany', group: 'Europe' },
  { value: 'fr', label: 'France', group: 'Europe' },
];

export function SelectBasic() {
  const [value, setValue] = useState<string | string[]>('');
  return (
    <Preview label="Single select with grouping" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 280 }}>
        <TkxSelect
          label="Country"
          options={COUNTRIES}
          value={value}
          onChange={setValue}
        />
      </div>
    </Preview>
  );
}

export function SelectSearchable() {
  const [value, setValue] = useState<string | string[]>('');
  return (
    <Preview label="Searchable" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 280 }}>
        <TkxSelect
          label="Country (search)"
          options={COUNTRIES}
          searchable
          value={value}
          onChange={setValue}
        />
      </div>
    </Preview>
  );
}

export function SelectMultiple() {
  const [values, setValues] = useState<string | string[]>([]);
  return (
    <Preview label="Multi-select with clearable" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 320 }}>
        <TkxSelect
          label="Travel destinations"
          options={COUNTRIES}
          multiple
          clearable
          searchable
          value={values}
          onChange={setValues}
        />
      </div>
    </Preview>
  );
}
