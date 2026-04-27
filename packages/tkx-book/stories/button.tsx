import { TkxButton } from 'tekivex-ui';
import type { Story } from '../src/types';

export const button: Story = {
  name: 'TkxButton',
  description: 'Primary action button — variants, sizes, color schemes, loading state.',
  controls: {
    variant: { type: 'select', options: ['primary', 'secondary', 'outline', 'ghost', 'link'], default: 'primary' },
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    colorScheme: { type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'], default: 'primary' },
    label: { type: 'text', default: 'Click me' },
    loading: { type: 'boolean', default: false },
    disabled: { type: 'boolean', default: false },
  },
  render: (p) => (
    <TkxButton
      variant={p.variant}
      size={p.size}
      colorScheme={p.colorScheme}
      loading={p.loading}
      disabled={p.disabled}
    >
      {p.label}
    </TkxButton>
  ),
};
