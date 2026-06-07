import { useState } from 'react';
import { TkxMenu, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function MenuBasic() {
  const [lastAction, setLastAction] = useState('');
  return (
    <Preview label="Basic — click trigger, pick an item" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxMenu
        trigger={<TkxButton variant="outline">Actions ▾</TkxButton>}
        items={[
          { type: 'action', id: 'edit', label: 'Edit', shortcut: '⌘E', onSelect: () => setLastAction('Edit') },
          { type: 'action', id: 'duplicate', label: 'Duplicate', shortcut: '⌘D', onSelect: () => setLastAction('Duplicate') },
          { type: 'action', id: 'archive', label: 'Archive', onSelect: () => setLastAction('Archive') },
          { type: 'separator', id: 'sep1' },
          { type: 'action', id: 'delete', label: 'Delete', shortcut: '⌫', danger: true, onSelect: () => setLastAction('Delete') },
        ]}
      />
      {lastAction && (
        <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
          Last action: <strong>{lastAction}</strong>
        </p>
      )}
    </Preview>
  );
}

export function MenuWithSubmenu() {
  return (
    <Preview label="With separators, icons, and a sub-menu">
      <TkxMenu
        trigger={<TkxButton variant="outline">File ▾</TkxButton>}
        items={[
          { type: 'action', id: 'new', label: 'New file', shortcut: '⌘N' },
          { type: 'action', id: 'open', label: 'Open…', shortcut: '⌘O' },
          { type: 'separator', id: 's1' },
          {
            type: 'submenu', id: 'export', label: 'Export as',
            items: [
              { type: 'action', id: 'pdf', label: 'PDF' },
              { type: 'action', id: 'png', label: 'PNG' },
              { type: 'action', id: 'svg', label: 'SVG' },
            ],
          },
          { type: 'separator', id: 's2' },
          { type: 'action', id: 'quit', label: 'Quit', shortcut: '⌘Q', danger: true },
        ]}
      />
    </Preview>
  );
}
