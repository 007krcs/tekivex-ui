import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxLayout,
  TkxHeader,
  TkxSider,
  TkxContent,
  TkxFooter,
  TkxRow,
  TkxCol,
} from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Shared demo styles ───────────────────────────────────────────────────────

function demoBox(bg: string, label: string, height?: number) {
  return (
    <div
      style={{
        background: bg,
        color: '#fff',
        padding: '12px 16px',
        borderRadius: 6,
        fontSize: 13,
        fontWeight: 600,
        textAlign: 'center',
        height: height ?? 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {label}
    </div>
  );
}

// ── Props definitions ────────────────────────────────────────────────────────

const LAYOUT_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'Layout content (Header, Sider, Content, Footer).', required: true },
  { name: 'hasSider', type: 'boolean', default: 'false', description: 'When true, the layout flows horizontally (for layouts containing a Sider).' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles for the layout wrapper.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Additional class name.' },
];

const HEADER_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'Header content.', required: true },
  { name: 'height', type: 'number | string', default: '64', description: 'Header height in px or CSS string.' },
  { name: 'fixed', type: 'boolean', default: 'false', description: 'Stick to top of viewport.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles.' },
];

const SIDER_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'Sider content.', required: true },
  { name: 'width', type: 'number | string', default: '240', description: 'Expanded width.' },
  { name: 'collapsedWidth', type: 'number', default: '64', description: 'Width when collapsed.' },
  { name: 'collapsed', type: 'boolean', default: 'undefined', description: 'Controlled collapsed state.' },
  { name: 'onCollapse', type: '(collapsed: boolean) => void', default: 'undefined', description: 'Callback when collapsed state changes.' },
  { name: 'collapsible', type: 'boolean', default: 'false', description: 'Show built-in collapse trigger at the bottom.' },
  { name: 'breakpoint', type: "'sm' | 'md' | 'lg' | 'xl'", default: 'undefined', description: 'Auto-collapse when viewport is narrower than this breakpoint.' },
  { name: 'trigger', type: 'ReactNode | null', default: 'undefined', description: 'Custom trigger node. Pass null to hide the default trigger.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles.' },
];

const CONTENT_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'Main content.', required: true },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles.' },
];

const FOOTER_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'Footer content.', required: true },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles.' },
];

const ROW_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'TkxCol children.', required: true },
  { name: 'gutter', type: 'number | [number, number]', default: '0', description: 'Gutter in px. Single number or [horizontal, vertical].' },
  { name: 'justify', type: "'start' | 'center' | 'end' | 'space-between' | 'space-around' | 'space-evenly'", default: "'start'", description: 'Horizontal alignment of columns.' },
  { name: 'align', type: "'top' | 'middle' | 'bottom' | 'stretch'", default: "'top'", description: 'Vertical alignment of columns.' },
  { name: 'wrap', type: 'boolean', default: 'true', description: 'Allow column wrapping.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles.' },
];

const COL_PROPS = [
  { name: 'children', type: 'ReactNode', description: 'Column content.' },
  { name: 'span', type: 'number', default: 'undefined', description: 'Column span out of 24.' },
  { name: 'offset', type: 'number', default: '0', description: 'Left offset in columns.' },
  { name: 'push', type: 'number', default: '0', description: 'Push columns to the right via relative positioning.' },
  { name: 'pull', type: 'number', default: '0', description: 'Pull columns to the left via relative positioning.' },
  { name: 'order', type: 'number', default: 'undefined', description: 'Flex order override.' },
  { name: 'sm', type: 'number | { span: number; offset?: number }', default: 'undefined', description: 'Responsive config at >= 576px.' },
  { name: 'md', type: 'number | { span: number; offset?: number }', default: 'undefined', description: 'Responsive config at >= 768px.' },
  { name: 'lg', type: 'number | { span: number; offset?: number }', default: 'undefined', description: 'Responsive config at >= 992px.' },
  { name: 'xl', type: 'number | { span: number; offset?: number }', default: 'undefined', description: 'Responsive config at >= 1200px.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function LayoutPage({ theme }: { theme: ThemeTokens }) {
  const [collapsed, setCollapsed] = useState(false);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const layoutBorder = `1px solid ${theme.border}`;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic Layout ───────────────────────────────────────────────── */}

      <DemoSection
        title="Basic Layout"
        description="A standard application layout with Header, Sider, Content, and Footer."
        theme={theme}
        code={`<TkxLayout>
  <TkxHeader style={{ background: '#1a1a2e', color: '#fff' }}>
    Header
  </TkxHeader>
  <TkxLayout hasSider>
    <TkxSider style={{ background: '#16213e' }}>
      Sider
    </TkxSider>
    <TkxContent style={{ padding: 24, minHeight: 200 }}>
      Content
    </TkxContent>
  </TkxLayout>
  <TkxFooter style={{ textAlign: 'center' }}>
    Footer
  </TkxFooter>
</TkxLayout>`}
      >
        <div style={{ border: layoutBorder, borderRadius: 10, overflow: 'hidden' }}>
          <TkxLayout>
            <TkxHeader style={{ background: '#1a1a2e', color: '#fff', display: 'flex', alignItems: 'center', padding: '0 24px', fontSize: 14, fontWeight: 600 }}>
              Header
            </TkxHeader>
            <TkxLayout hasSider>
              <TkxSider width={180} style={{ background: '#16213e', color: '#a0a0c0', padding: '24px 16px', fontSize: 13 }}>
                <div>Nav Item 1</div>
                <div style={{ marginTop: 8 }}>Nav Item 2</div>
                <div style={{ marginTop: 8 }}>Nav Item 3</div>
              </TkxSider>
              <TkxContent style={{ padding: 24, minHeight: 180, fontSize: 14, color: theme.textMuted }}>
                Main content area. This is where the primary page content lives.
              </TkxContent>
            </TkxLayout>
            <TkxFooter style={{ textAlign: 'center', fontSize: 13, color: theme.textMuted, padding: '12px 24px', borderTop: layoutBorder }}>
              TekiVex UI Footer
            </TkxFooter>
          </TkxLayout>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Collapsible Sider ──────────────────────────────────────────── */}

      <DemoSection
        title="Collapsible Sider"
        description="Use collapsible to show a built-in trigger, or control collapsed state directly for custom behavior."
        theme={theme}
        code={`const [collapsed, setCollapsed] = useState(false);

<TkxLayout hasSider>
  <TkxSider
    collapsible
    collapsed={collapsed}
    onCollapse={setCollapsed}
    width={200}
    collapsedWidth={64}
    style={{ background: '#16213e', color: '#fff' }}
  >
    {collapsed ? 'IC' : 'Full Navigation'}
  </TkxSider>
  <TkxContent style={{ padding: 24 }}>
    Content
  </TkxContent>
</TkxLayout>`}
      >
        <div style={{ border: layoutBorder, borderRadius: 10, overflow: 'hidden' }}>
          <TkxLayout hasSider>
            <TkxSider
              collapsible
              collapsed={collapsed}
              onCollapse={setCollapsed}
              width={200}
              collapsedWidth={64}
              style={{ background: '#16213e', color: '#a0a0c0', padding: '24px 12px', fontSize: 13, minHeight: 200 }}
            >
              {collapsed ? (
                <div style={{ textAlign: 'center' }}>
                  <div>H</div>
                  <div style={{ marginTop: 8 }}>S</div>
                  <div style={{ marginTop: 8 }}>P</div>
                </div>
              ) : (
                <div>
                  <div style={{ fontWeight: 600, marginBottom: 12, color: '#fff' }}>Navigation</div>
                  <div>Home</div>
                  <div style={{ marginTop: 8 }}>Settings</div>
                  <div style={{ marginTop: 8 }}>Profile</div>
                </div>
              )}
            </TkxSider>
            <TkxContent style={{ padding: 24, fontSize: 14, color: theme.textMuted }}>
              <div>Sider is {collapsed ? 'collapsed' : 'expanded'}. Click the trigger at the bottom of the sider to toggle.</div>
            </TkxContent>
          </TkxLayout>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Two Column Grid ────────────────────────────────────────────── */}

      <DemoSection
        title="Two Column Grid"
        description="Use TkxRow and TkxCol to create a 24-column grid. Here, two equal columns each span 12."
        theme={theme}
        code={`<TkxRow gutter={16}>
  <TkxCol span={12}>
    <div>Column 1 (span=12)</div>
  </TkxCol>
  <TkxCol span={12}>
    <div>Column 2 (span=12)</div>
  </TkxCol>
</TkxRow>`}
      >
        <TkxRow gutter={16}>
          <TkxCol span={12}>
            {demoBox(theme.accent, 'span=12')}
          </TkxCol>
          <TkxCol span={12}>
            {demoBox('#e74c3c', 'span=12')}
          </TkxCol>
        </TkxRow>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Three Column Grid ──────────────────────────────────────────── */}

      <DemoSection
        title="Three Column Grid"
        description="Three columns of span 8 each, filling all 24 columns."
        theme={theme}
        code={`<TkxRow gutter={16}>
  <TkxCol span={8}><div>Col 1</div></TkxCol>
  <TkxCol span={8}><div>Col 2</div></TkxCol>
  <TkxCol span={8}><div>Col 3</div></TkxCol>
</TkxRow>`}
      >
        <TkxRow gutter={16}>
          <TkxCol span={8}>
            {demoBox(theme.accent, 'span=8')}
          </TkxCol>
          <TkxCol span={8}>
            {demoBox('#2ecc71', 'span=8')}
          </TkxCol>
          <TkxCol span={8}>
            {demoBox('#f39c12', 'span=8')}
          </TkxCol>
        </TkxRow>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Responsive Grid ────────────────────────────────────────────── */}

      <DemoSection
        title="Responsive Grid"
        description="Columns adapt to viewport size using sm, md, and lg breakpoint props. On small screens they stack, on large screens they split into thirds."
        theme={theme}
        code={`<TkxRow gutter={[16, 16]}>
  <TkxCol sm={24} md={12} lg={8}>
    <div>Responsive A</div>
  </TkxCol>
  <TkxCol sm={24} md={12} lg={8}>
    <div>Responsive B</div>
  </TkxCol>
  <TkxCol sm={24} md={24} lg={8}>
    <div>Responsive C</div>
  </TkxCol>
</TkxRow>`}
      >
        <TkxRow gutter={[16, 16]}>
          <TkxCol sm={24} md={12} lg={8}>
            {demoBox('#9b59b6', 'sm=24 md=12 lg=8')}
          </TkxCol>
          <TkxCol sm={24} md={12} lg={8}>
            {demoBox('#1abc9c', 'sm=24 md=12 lg=8')}
          </TkxCol>
          <TkxCol sm={24} md={24} lg={8}>
            {demoBox('#e67e22', 'sm=24 md=24 lg=8')}
          </TkxCol>
        </TkxRow>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Grid with Offset ───────────────────────────────────────────── */}

      <DemoSection
        title="Grid with Offset"
        description="Use the offset prop to push columns to the right."
        theme={theme}
        code={`<TkxRow gutter={16}>
  <TkxCol span={8}>
    <div>span=8</div>
  </TkxCol>
  <TkxCol span={8} offset={8}>
    <div>span=8, offset=8</div>
  </TkxCol>
</TkxRow>`}
      >
        <TkxRow gutter={16}>
          <TkxCol span={8}>
            {demoBox(theme.accent, 'span=8')}
          </TkxCol>
          <TkxCol span={8} offset={8}>
            {demoBox('#e74c3c', 'span=8, offset=8')}
          </TkxCol>
        </TkxRow>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props tables ───────────────────────────────────────────────── */}

      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxLayout Props
        </h3>
        <PropTable props={LAYOUT_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxHeader Props
        </h3>
        <PropTable props={HEADER_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxSider Props
        </h3>
        <PropTable props={SIDER_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxContent Props
        </h3>
        <PropTable props={CONTENT_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxFooter Props
        </h3>
        <PropTable props={FOOTER_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxRow Props
        </h3>
        <PropTable props={ROW_PROPS} />
      </div>

      <div style={{ marginTop: 40 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>
          TkxCol Props
        </h3>
        <PropTable props={COL_PROPS} />
      </div>
    </div>
  );
}
