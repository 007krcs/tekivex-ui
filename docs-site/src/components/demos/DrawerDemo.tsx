import { useState } from 'react';
import { TkxDrawer, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function DrawerBasic() {
  const [open, setOpen] = useState(false);
  return (
    <Preview label="Try it">
      <TkxButton onClick={() => setOpen(true)}>Open drawer (right)</TkxButton>
      <TkxDrawer
        isOpen={open}
        onClose={() => setOpen(false)}
        side="right"
        title="Filters"
      >
        <p>Drawer body content lives here.</p>
        <p style={{ opacity: 0.7, fontSize: 13 }}>
          Press Escape to close, or click outside.
        </p>
      </TkxDrawer>
    </Preview>
  );
}

export function DrawerSides() {
  const [side, setSide] = useState<'left' | 'right' | 'top' | 'bottom' | null>(null);
  return (
    <Preview label="Each side">
      <TkxButton size="sm" onClick={() => setSide('left')}>From left</TkxButton>
      <TkxButton size="sm" onClick={() => setSide('right')}>From right</TkxButton>
      <TkxButton size="sm" onClick={() => setSide('top')}>From top</TkxButton>
      <TkxButton size="sm" onClick={() => setSide('bottom')}>From bottom</TkxButton>
      {side && (
        <TkxDrawer
          isOpen
          onClose={() => setSide(null)}
          side={side}
          title={`Drawer — ${side}`}
        >
          <p>Side: <strong>{side}</strong></p>
        </TkxDrawer>
      )}
    </Preview>
  );
}
