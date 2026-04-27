import { TkxProgress } from 'tekivex-ui';
import type { Story } from '../src/types';

export const progress: Story = {
  name: 'TkxProgress',
  controls: {
    value: { type: 'number', default: 50, min: 0, max: 100 },
    variant: { type: 'select', options: ['linear', 'circular'], default: 'linear' },
    colorScheme: { type: 'select', options: ['primary', 'success', 'warning', 'danger', 'info'], default: 'primary' },
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    label: { type: 'text', default: 'Uploading' },
    showValue: { type: 'boolean', default: true },
    indeterminate: { type: 'boolean', default: false },
  },
  render: (p) => (
    <div style={{ minWidth: 320 }}>
      <TkxProgress
        value={p.value}
        variant={p.variant}
        colorScheme={p.colorScheme}
        size={p.size}
        label={p.label}
        showValue={p.showValue}
        indeterminate={p.indeterminate}
      />
    </div>
  ),
};
