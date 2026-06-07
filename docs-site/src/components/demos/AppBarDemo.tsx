import { TkxAppBar, TkxButton, TkxAvatar } from 'tekivex-ui';
import { Preview } from '../Preview';

export function AppBarBasic() {
  return (
    <Preview label="Basic — title + right-side actions" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxAppBar
        title="Dashboard"
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <TkxButton size="sm" variant="outline">Settings</TkxButton>
            <TkxAvatar name="Priya K" />
          </div>
        }
      />
    </Preview>
  );
}

export function AppBarTitleOnly() {
  return (
    <Preview label="Title-only" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <TkxAppBar title="Settings → Profile" />
    </Preview>
  );
}
