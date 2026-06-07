import { useState } from 'react';
import { TkxSnackbar, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function SnackbarBasic() {
  const [open, setOpen] = useState(false);
  return (
    <Preview label="Click to show snackbar (auto-dismiss)">
      <TkxButton variant="primary" onClick={() => setOpen(true)}>
        Save document
      </TkxButton>
      <TkxSnackbar
        message="Document saved"
        isOpen={open}
        onClose={() => setOpen(false)}
        variant="success"
        action={{ label: 'Undo', onClick: () => { setOpen(false); } }}
      />
    </Preview>
  );
}

export function SnackbarVariants() {
  const [show, setShow] = useState<string | null>(null);
  return (
    <Preview label="Variants">
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <TkxButton size="sm" variant="primary" onClick={() => setShow('success')}>Success</TkxButton>
        <TkxButton size="sm" onClick={() => setShow('info')}>Info</TkxButton>
        <TkxButton size="sm" onClick={() => setShow('warning')}>Warning</TkxButton>
        <TkxButton size="sm" onClick={() => setShow('error')}>Error</TkxButton>
      </div>
      <TkxSnackbar
        message={show ? `This is a ${show} snackbar` : ''}
        isOpen={show !== null}
        onClose={() => setShow(null)}
        variant={(show as 'success' | 'info' | 'warning' | 'error') ?? 'default'}
      />
    </Preview>
  );
}
