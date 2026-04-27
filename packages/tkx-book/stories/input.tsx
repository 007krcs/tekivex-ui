import { TkxInput } from 'tekivex-ui';
import type { Story } from '../src/types';

export const input: Story = {
  name: 'TkxInput',
  description: 'Text input with label, hint, error state, and Unicode-safe sanitisation.',
  controls: {
    label: { type: 'text', default: 'Email' },
    placeholder: { type: 'text', default: 'jane@example.com' },
    hint: { type: 'text', default: '' },
    error: { type: 'text', default: '' },
    isInvalid: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
    required: { type: 'boolean', default: false },
  },
  render: (p) => (
    <div style={{ minWidth: 320 }}>
      <TkxInput
        label={p.label}
        placeholder={p.placeholder}
        hint={p.hint || undefined}
        error={p.error || undefined}
        isInvalid={p.isInvalid}
        disabled={p.disabled}
        required={p.required}
      />
    </div>
  ),
};
