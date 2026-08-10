import { useState } from 'react';
import { TkxComboBox } from 'tekivex-ui';
import { Preview } from '../Preview';

const TAGS = [
  { value: 'bug', label: 'Bug' },
  { value: 'docs', label: 'Docs' },
  { value: 'perf', label: 'Performance' },
  { value: 'a11y', label: 'Accessibility' },
  { value: 'design', label: 'Design' },
  { value: 'infra', label: 'Infrastructure' },
];

export function ComboBoxBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 300, maxWidth: 420 }}>
        <TkxComboBox
          label="Tags"
          placeholder="Add tags…"
          hint="Type to filter, Enter to toggle, Backspace removes the last chip"
          options={TAGS}
          defaultValue={['bug', 'docs']}
        />
      </div>
    </Preview>
  );
}

export function ComboBoxMaxSelected() {
  const [values, setValues] = useState<string[]>(['a11y']);
  return (
    <Preview label="maxSelected={2} (controlled)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 300, maxWidth: 420 }}>
        <TkxComboBox
          label="Assignees"
          placeholder="Pick up to two…"
          options={TAGS}
          value={values}
          onChange={(next) => setValues(next)}
          maxSelected={2}
          hint={`Selected: ${values.length ? values.join(', ') : 'none'}`}
        />
      </div>
    </Preview>
  );
}
