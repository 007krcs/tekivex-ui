import { useState } from 'react';
import { TkxModal, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ModalBasic() {
  const [open, setOpen] = useState(false);
  return (
    <Preview label="Basic — click to open">
      <TkxButton variant="primary" onClick={() => setOpen(true)}>
        Open modal
      </TkxButton>
      <TkxModal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Confirm action"
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <TkxButton variant="outline" onClick={() => setOpen(false)}>Cancel</TkxButton>
            <TkxButton variant="primary" onClick={() => setOpen(false)}>Confirm</TkxButton>
          </div>
        }
      >
        Are you sure you want to delete this item? This action cannot be undone.
      </TkxModal>
    </Preview>
  );
}

export function ModalSizes() {
  const [size, setSize] = useState<'sm' | 'md' | 'lg' | null>(null);
  return (
    <Preview label="Sizes">
      <TkxButton size="sm" onClick={() => setSize('sm')}>Small</TkxButton>
      <TkxButton size="sm" onClick={() => setSize('md')}>Medium</TkxButton>
      <TkxButton size="sm" onClick={() => setSize('lg')}>Large</TkxButton>
      {size && (
        <TkxModal
          isOpen={true}
          onClose={() => setSize(null)}
          title={`Size: ${size}`}
          size={size}
        >
          Modal width changes based on the `size` prop.
        </TkxModal>
      )}
    </Preview>
  );
}
