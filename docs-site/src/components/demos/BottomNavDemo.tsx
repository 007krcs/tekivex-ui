import { useState } from 'react';
import { TkxBottomNav } from 'tekivex-ui';
import { Preview } from '../Preview';

// Minimal inline icon — keeps the demo zero-dep on an icon set.
function Dot() {
  return (
    <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', background: 'currentColor' }} />
  );
}

export function BottomNavBasic() {
  const [active, setActive] = useState('home');
  return (
    <Preview label="Basic — controlled active tab" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <TkxBottomNav
          activeId={active}
          onChange={setActive}
          items={[
            { id: 'home',     label: 'Home',     icon: <Dot /> },
            { id: 'search',   label: 'Search',   icon: <Dot /> },
            { id: 'inbox',    label: 'Inbox',    icon: <Dot />, badge: 3 },
            { id: 'profile',  label: 'Profile',  icon: <Dot /> },
          ]}
        />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Active tab: <strong>{active}</strong>
      </p>
    </Preview>
  );
}

export function BottomNavIconOnly() {
  const [active, setActive] = useState('search');
  return (
    <Preview label="Icon-only (no labels)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <TkxBottomNav
          activeId={active}
          onChange={setActive}
          showLabels={false}
          items={[
            { id: 'home',    label: 'Home',    icon: <Dot /> },
            { id: 'search',  label: 'Search',  icon: <Dot /> },
            { id: 'inbox',   label: 'Inbox',   icon: <Dot />, badge: 12 },
            { id: 'profile', label: 'Profile', icon: <Dot /> },
          ]}
        />
      </div>
    </Preview>
  );
}
