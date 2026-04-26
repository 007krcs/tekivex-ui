import { useState } from 'react';
import { TkxTabs, TkxTab, TkxTabPanel } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TabsBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxTabs defaultActive="overview">
          <TkxTab id="overview">Overview</TkxTab>
          <TkxTab id="activity">Activity</TkxTab>
          <TkxTab id="settings">Settings</TkxTab>

          <TkxTabPanel id="overview">
            <p style={{ margin: 0 }}>The overview panel — first to render.</p>
          </TkxTabPanel>
          <TkxTabPanel id="activity">
            <p style={{ margin: 0 }}>Activity feed lazy-renders on first activation.</p>
          </TkxTabPanel>
          <TkxTabPanel id="settings">
            <p style={{ margin: 0 }}>Settings form panel.</p>
          </TkxTabPanel>
        </TkxTabs>
      </div>
    </Preview>
  );
}

export function TabsControlled() {
  const [active, setActive] = useState('a');
  return (
    <Preview label={`Controlled — active: ${active}`} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxTabs active={active} onChange={setActive}>
          <TkxTab id="a">Tab A</TkxTab>
          <TkxTab id="b">Tab B</TkxTab>
          <TkxTab id="c">Tab C</TkxTab>
          <TkxTabPanel id="a">Panel A</TkxTabPanel>
          <TkxTabPanel id="b">Panel B</TkxTabPanel>
          <TkxTabPanel id="c">Panel C</TkxTabPanel>
        </TkxTabs>
      </div>
    </Preview>
  );
}
