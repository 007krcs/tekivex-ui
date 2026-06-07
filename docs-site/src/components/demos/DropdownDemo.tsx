import { useState } from 'react';
import { TkxDropdown, TkxButton } from 'tekivex-ui';
import { Preview } from '../Preview';

export function DropdownBasic() {
  const [selected, setSelected] = useState('');
  return (
    <Preview label="Basic — single select" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <TkxDropdown
        trigger={<TkxButton variant="outline">{selected || 'Pick a country ▾'}</TkxButton>}
        items={[
          { key: 'in', label: 'India' },
          { key: 'us', label: 'United States' },
          { key: 'uk', label: 'United Kingdom' },
          { key: 'jp', label: 'Japan' },
          { key: 'de', label: 'Germany' },
        ]}
        onSelect={(_key, item) => setSelected(item.label)}
      />
    </Preview>
  );
}

export function DropdownGroups() {
  return (
    <Preview label="Grouped items with separators">
      <TkxDropdown
        trigger={<TkxButton variant="outline">Insert ▾</TkxButton>}
        groups={[
          {
            label: 'Text',
            items: [
              { key: 'h1', label: 'Heading 1', shortcut: '⌘1' },
              { key: 'h2', label: 'Heading 2', shortcut: '⌘2' },
              { key: 'p', label: 'Paragraph', shortcut: '⌘P' },
            ],
          },
          {
            label: 'Media',
            items: [
              { key: 'img', label: 'Image' },
              { key: 'vid', label: 'Video' },
              { key: 'code', label: 'Code block' },
            ],
          },
        ]}
      />
    </Preview>
  );
}

export function DropdownSearchable() {
  return (
    <Preview label="Searchable — start typing">
      <TkxDropdown
        trigger={<TkxButton variant="outline">Search states ▾</TkxButton>}
        searchable
        searchPlaceholder="Type to filter…"
        items={[
          { key: 'mh', label: 'Maharashtra' },
          { key: 'ka', label: 'Karnataka' },
          { key: 'tn', label: 'Tamil Nadu' },
          { key: 'dl', label: 'Delhi' },
          { key: 'gj', label: 'Gujarat' },
          { key: 'kl', label: 'Kerala' },
          { key: 'wb', label: 'West Bengal' },
          { key: 'up', label: 'Uttar Pradesh' },
        ]}
      />
    </Preview>
  );
}
