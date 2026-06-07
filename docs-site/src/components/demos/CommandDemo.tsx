import { useState } from 'react';
import { TkxCommand, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

const COMMANDS = [
  { id: 'new',     label: 'New file',         description: 'Create a new untitled file', shortcut: '⌘N' },
  { id: 'open',    label: 'Open…',            description: 'Open a file from disk',      shortcut: '⌘O' },
  { id: 'save',    label: 'Save',             description: 'Save the active document',   shortcut: '⌘S' },
  { id: 'search',  label: 'Search in files',  description: 'Project-wide text search',   shortcut: '⌘⇧F' },
  { id: 'theme',   label: 'Toggle theme',     description: 'Switch between dark / light' },
  { id: 'settings',label: 'Open settings',    description: 'Configure editor preferences', shortcut: '⌘,' },
];

export function CommandBasic() {
  const [open, setOpen] = useState(false);
  return (
    <Preview label="Command palette — press ⌘K equivalent (click button)" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxButton variant="outline" onClick={() => setOpen(true)}>
        Open command palette (⌘K)
      </TkxButton>
      <TkxCommand
        items={COMMANDS}
        isOpen={open}
        onClose={() => setOpen(false)}
        placeholder="Type a command…"
      />
    </Preview>
  );
}
