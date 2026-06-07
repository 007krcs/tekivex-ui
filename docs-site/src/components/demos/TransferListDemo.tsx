import { useState } from 'react';
import { TkxTransferList } from 'tekivex-ui';
import { Preview } from '../Preview';

const INITIAL_SOURCE = [
  { value: '1', label: 'react' },
  { value: '2', label: 'typescript' },
  { value: '3', label: 'wcag' },
  { value: '4', label: 'vite' },
  { value: '5', label: 'astro' },
  { value: '6', label: 'security' },
];
const INITIAL_TARGET = [
  { value: '7', label: 'a11y' },
  { value: '8', label: 'open-source' },
];

export function TransferListBasic() {
  const [source, setSource] = useState(INITIAL_SOURCE);
  const [target, setTarget] = useState(INITIAL_TARGET);
  return (
    <Preview label="Basic — move items between two lists">
      <div style={{ width: '100%', maxWidth: 560 }}>
        <TkxTransferList
          sourceItems={source}
          targetItems={target}
          sourceTitle="Available tags"
          targetTitle="Selected tags"
          onTransfer={(s, t) => { setSource(s); setTarget(t); }}
        />
      </div>
    </Preview>
  );
}
