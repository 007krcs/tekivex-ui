import { useState } from 'react';
import { TkxAlert } from 'tekivex-ui';
import { Preview } from '../Preview';

export function AlertVariants() {
  return (
    <Preview style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch' }}>
      <TkxAlert variant="info">Information message — does not interrupt screen readers.</TkxAlert>
      <TkxAlert variant="success">Operation completed successfully.</TkxAlert>
      <TkxAlert variant="warning">Disk space low — clean up old files.</TkxAlert>
      <TkxAlert variant="danger">Connection lost — retrying. (announces assertively)</TkxAlert>
    </Preview>
  );
}

export function AlertWithTitle() {
  return (
    <Preview label="With title" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxAlert variant="success" title="Deploy succeeded">
        Your changes are live at <code>my-app.example.com</code>.
      </TkxAlert>
    </Preview>
  );
}

export function AlertDismissible() {
  const [open, setOpen] = useState(true);
  return (
    <Preview label="Dismissible" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      {open ? (
        <TkxAlert
          variant="warning"
          title="Beta feature"
          onClose={() => setOpen(false)}
        >
          This feature may change without notice.
        </TkxAlert>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          style={{
            padding: '8px 14px',
            borderRadius: 6,
            border: '1px solid currentColor',
            background: 'transparent',
            color: 'inherit',
            cursor: 'pointer',
          }}
        >
          Re-open alert
        </button>
      )}
    </Preview>
  );
}
