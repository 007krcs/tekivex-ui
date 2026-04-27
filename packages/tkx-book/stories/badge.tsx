import { TkxBadge } from 'tekivex-ui';
import type { Story } from '../src/types';

export const badge: Story = {
  name: 'TkxBadge',
  controls: {
    variant: { type: 'select', options: ['primary', 'secondary', 'success', 'warning', 'danger', 'info'], default: 'success' },
    size: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    label: { type: 'text', default: 'active' },
    outlined: { type: 'boolean', default: false },
  },
  render: (p) => (
    <TkxBadge variant={p.variant} size={p.size} outlined={p.outlined}>
      {p.label}
    </TkxBadge>
  ),
};
