import { TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter, TkxButton } from 'tekivex-ui';
import type { Story } from '../src/types';

export const card: Story = {
  name: 'TkxCard',
  description: 'Card container with optional Header / Body / Footer slots.',
  controls: {
    variant: { type: 'select', options: ['default', 'outlined', 'elevated', 'glass'], default: 'default' },
    padding: { type: 'select', options: ['sm', 'md', 'lg'], default: 'md' },
    title: { type: 'text', default: 'Account settings' },
    subtitle: { type: 'text', default: 'Update your profile' },
    showFooter: { type: 'boolean', default: true },
  },
  render: (p) => (
    <TkxCard variant={p.variant} padding={p.padding}>
      <TkxCardHeader title={p.title} subtitle={p.subtitle} />
      <TkxCardBody>
        Body content. Edit the controls below to change variant or padding.
      </TkxCardBody>
      {p.showFooter && (
        <TkxCardFooter>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <TkxButton variant="ghost">Cancel</TkxButton>
            <TkxButton variant="primary">Save</TkxButton>
          </div>
        </TkxCardFooter>
      )}
    </TkxCard>
  ),
};
