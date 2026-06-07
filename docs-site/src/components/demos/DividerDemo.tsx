import { TkxDivider } from 'tekivex-ui';
import { Preview } from '../Preview';

export function DividerHorizontal() {
  return (
    <Preview label="Horizontal — section break" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ padding: 8, fontSize: 13 }}>Above the divider</div>
      <TkxDivider />
      <div style={{ padding: 8, fontSize: 13 }}>Below the divider</div>
    </Preview>
  );
}

export function DividerWithLabel() {
  return (
    <Preview label="With centered label" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ padding: 8, fontSize: 13 }}>Recent</div>
      <TkxDivider label="Older" />
      <div style={{ padding: 8, fontSize: 13 }}>Older items</div>
    </Preview>
  );
}

export function DividerVertical() {
  return (
    <Preview label="Vertical — inline separator">
      <div style={{ display: 'flex', alignItems: 'center', height: 40, gap: 12, fontSize: 13 }}>
        <span>Docs</span>
        <TkxDivider orientation="vertical" />
        <span>Recipes</span>
        <TkxDivider orientation="vertical" />
        <span>Blueprints</span>
      </div>
    </Preview>
  );
}
