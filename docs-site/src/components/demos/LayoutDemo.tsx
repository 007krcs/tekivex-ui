import { TkxLayout, TkxHeader, TkxSider, TkxContent, TkxFooter } from 'tekivex-ui';
import { Preview } from '../Preview';

export function LayoutShell() {
  return (
    <Preview label="App shell — header + sider + content + footer" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ width: '100%', maxWidth: 640, border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
        <TkxLayout style={{ minHeight: 280 }}>
          <TkxHeader style={{ padding: '12px 16px', background: '#1f2937', color: '#fff', fontWeight: 600, fontSize: 13 }}>
            Header
          </TkxHeader>
          <TkxLayout hasSider>
            <TkxSider style={{ width: 140, padding: 16, background: '#f1f5f9', fontSize: 12, color: '#1f2937' }}>
              Sider<br /><br />
              <span style={{ opacity: 0.7 }}>Nav item 1</span><br />
              <span style={{ opacity: 0.7 }}>Nav item 2</span><br />
              <span style={{ opacity: 0.7 }}>Nav item 3</span>
            </TkxSider>
            <TkxContent style={{ padding: 16, fontSize: 12, background: '#fff', color: '#1f2937' }}>
              Content area — scrolls independently. Drops sider below
              content on small screens.
            </TkxContent>
          </TkxLayout>
          <TkxFooter style={{ padding: '8px 16px', background: '#f8fafc', textAlign: 'center', fontSize: 11, color: '#475569' }}>
            © 2026 Footer
          </TkxFooter>
        </TkxLayout>
      </div>
    </Preview>
  );
}
