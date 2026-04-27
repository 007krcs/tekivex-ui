import { useState } from 'react';
import { TkxTabs, TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel } from 'tekivex-ui';
import { Preview } from '../Preview';

// v3 API: TkxTabs uses numeric `defaultIndex` / `activeIndex` (not string
// `id`) and requires the structure:
//   <TkxTabs>
//     <TkxTabList>
//       <TkxTab index={0}>...</TkxTab>
//       <TkxTab index={1}>...</TkxTab>
//     </TkxTabList>
//     <TkxTabPanels>
//       <TkxTabPanel index={0}>...</TkxTabPanel>
//       <TkxTabPanel index={1}>...</TkxTabPanel>
//     </TkxTabPanels>
//   </TkxTabs>

export function TabsBasic() {
  return (
    <Preview style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ minWidth: 360 }}>
        <TkxTabs defaultIndex={0} tabCount={3}>
          <TkxTabList>
            <TkxTab index={0}>Overview</TkxTab>
            <TkxTab index={1}>Activity</TkxTab>
            <TkxTab index={2}>Settings</TkxTab>
          </TkxTabList>
          <TkxTabPanels>
            <TkxTabPanel index={0}>
              <p style={{ margin: 0 }}>The overview panel — first to render.</p>
            </TkxTabPanel>
            <TkxTabPanel index={1}>
              <p style={{ margin: 0 }}>Activity feed lazy-renders on first activation.</p>
            </TkxTabPanel>
            <TkxTabPanel index={2}>
              <p style={{ margin: 0 }}>Settings form panel.</p>
            </TkxTabPanel>
          </TkxTabPanels>
        </TkxTabs>
      </div>
    </Preview>
  );
}

export function TabsControlled() {
  const [active, setActive] = useState(0);
  const labels = ['Tab A', 'Tab B', 'Tab C'];
  return (
    <Preview
      label={`Controlled — active: ${labels[active]}`}
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ minWidth: 360 }}>
        <TkxTabs activeIndex={active} onChange={setActive} tabCount={3}>
          <TkxTabList>
            {labels.map((label, i) => (
              <TkxTab key={i} index={i}>{label}</TkxTab>
            ))}
          </TkxTabList>
          <TkxTabPanels>
            <TkxTabPanel index={0}>Panel A</TkxTabPanel>
            <TkxTabPanel index={1}>Panel B</TkxTabPanel>
            <TkxTabPanel index={2}>Panel C</TkxTabPanel>
          </TkxTabPanels>
        </TkxTabs>
      </div>
    </Preview>
  );
}
