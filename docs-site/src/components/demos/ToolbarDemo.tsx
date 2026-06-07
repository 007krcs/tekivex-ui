import { useState } from 'react';
import { TkxToolbar } from 'tekivex-ui';
import { Preview } from '../Preview';

export function ToolbarBasic() {
  const [active, setActive] = useState('bold');
  const items = [
    { id: 'bold',      label: 'Bold',      active: active === 'bold',      onClick: () => setActive('bold') },
    { id: 'italic',    label: 'Italic',    active: active === 'italic',    onClick: () => setActive('italic') },
    { id: 'underline', label: 'Underline', active: active === 'underline', onClick: () => setActive('underline') },
    { id: 'strike',    label: 'Strike',    active: active === 'strike',    onClick: () => setActive('strike') },
  ];
  return (
    <Preview label="Basic — click to set active item">
      <TkxToolbar items={items} />
    </Preview>
  );
}

export function ToolbarVariants() {
  const items = [
    { id: 'save', label: 'Save' },
    { id: 'open', label: 'Open' },
    { id: 'export', label: 'Export', disabled: true },
  ];
  return (
    <Preview label="Variants — default / outlined / filled" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 12 }}>
      <TkxToolbar items={items} variant="default" />
      <TkxToolbar items={items} variant="outlined" />
      <TkxToolbar items={items} variant="filled" />
    </Preview>
  );
}
