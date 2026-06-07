import { useState } from 'react';
import { TkxTreeView } from 'tekivex-ui';
import { Preview } from '../Preview';

const DATA = [
  {
    id: 'src', label: 'src',
    children: [
      {
        id: 'components', label: 'components',
        children: [
          { id: 'tkxbutton', label: 'TkxButton.tsx' },
          { id: 'tkxcard', label: 'TkxCard.tsx' },
          { id: 'tkxinput', label: 'TkxInput.tsx' },
        ],
      },
      {
        id: 'engine', label: 'engine',
        children: [
          { id: 'wcag', label: 'wcag.ts' },
          { id: 'security', label: 'security.ts' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  { id: 'package', label: 'package.json' },
  { id: 'readme', label: 'README.md' },
];

export function TreeViewBasic() {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['src', 'components']);
  return (
    <Preview label="Basic — selectable + expandable" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <TkxTreeView
          data={DATA}
          selected={selected}
          onSelect={setSelected}
          expanded={expanded}
          onExpand={setExpanded}
        />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Selected: <strong>{selected.join(', ') || '(none)'}</strong>
      </p>
    </Preview>
  );
}
