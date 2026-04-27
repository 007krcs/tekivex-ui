import { TkxAlert } from 'tekivex-ui';
import type { Story } from '../src/types';

export const alert: Story = {
  name: 'TkxAlert',
  controls: {
    variant: { type: 'select', options: ['info', 'success', 'warning', 'danger'], default: 'info' },
    title: { type: 'text', default: 'Update available' },
    body: { type: 'text', default: 'Restart to apply.' },
  },
  render: (p) => (
    <TkxAlert variant={p.variant} title={p.title}>
      {p.body}
    </TkxAlert>
  ),
};
