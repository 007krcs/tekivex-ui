import { useState } from 'react';
import { TkxButton, TkxCommandPalette } from 'tekivex-ui';
import { Preview } from '../Preview';

// The palette is a modal overlay, so the demo opens it from a button using
// the controlled `open` prop. `hotkey={null}` keeps the demo from stealing
// the docs site's own Ctrl/Cmd-K search shortcut.

const COMMANDS = [
  { id: 'new-file', title: 'New file', section: 'File', icon: '📄', shortcut: ['Cmd', 'N'], onSelect: () => {} },
  { id: 'open-file', title: 'Open file…', section: 'File', icon: '📂', shortcut: ['Cmd', 'O'], onSelect: () => {} },
  { id: 'save-all', title: 'Save all', subtitle: 'Write every unsaved buffer', section: 'File', icon: '💾', onSelect: () => {} },
  { id: 'toggle-theme', title: 'Toggle theme', subtitle: 'Switch light / dark', section: 'View', icon: '🌗', onSelect: () => {} },
  { id: 'zoom-in', title: 'Zoom in', section: 'View', icon: '🔍', shortcut: ['Cmd', '+'], onSelect: () => {} },
  { id: 'open-settings', title: 'Open settings', section: 'App', icon: '⚙️', shortcut: ['Cmd', ','], onSelect: () => {} },
  { id: 'search-docs', title: 'Search docs', subtitle: 'Find anything in the docs', section: 'Help', icon: '❓', onSelect: () => {} },
];

export function CommandPaletteBasic() {
  const [open, setOpen] = useState(false);
  return (
    <Preview label="Click to open — type to fuzzy-search, ↑/↓ + Enter, Esc closes">
      <TkxButton onClick={() => setOpen(true)}>Open command palette</TkxButton>
      <TkxCommandPalette
        commands={COMMANDS}
        open={open}
        onOpenChange={setOpen}
        hotkey={null}
        placeholder="Type a command…"
      />
    </Preview>
  );
}
