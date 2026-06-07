import { TkxSpeedDial } from 'tekivex-ui';
import { Preview } from '../Preview';

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function Dot() { return <span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: 'currentColor' }} />; }

export function SpeedDialBasic() {
  return (
    <Preview label="Speed dial — click + to open quick actions" style={{ minHeight: 200, alignItems: 'flex-end', justifyContent: 'flex-end' }}>
      <div style={{ position: 'relative', width: '100%', height: 160 }}>
        <TkxSpeedDial
          icon={<PlusIcon />}
          position="bottom-right"
          direction="up"
          actions={[
            { id: 'note',  label: 'New note',  icon: <Dot />, onClick: () => {} },
            { id: 'event', label: 'New event', icon: <Dot />, onClick: () => {} },
            { id: 'doc',   label: 'New doc',   icon: <Dot />, onClick: () => {} },
          ]}
        />
      </div>
    </Preview>
  );
}
