import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxDrawer,
  TkxButton,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const DRAWER_PROPS = [
  { name: 'isOpen', type: 'boolean', required: true, description: 'Controls whether the drawer is visible.' },
  { name: 'onClose', type: '() => void', required: true, description: 'Callback fired when the drawer requests to close (backdrop click, Escape key, close button).' },
  { name: 'title', type: 'string | ReactNode', default: 'undefined', description: 'Drawer header title. Rendered in an h2 associated via aria-labelledby.' },
  { name: 'placement', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'Which edge the drawer slides in from.' },
  { name: 'size', type: "'sm' | 'md' | 'lg' | 'xl' | 'full'", default: "'md'", description: 'Width (for left/right) or height (for top/bottom) of the drawer.' },
  { name: 'footer', type: 'ReactNode', default: 'undefined', description: 'Content rendered in a sticky footer area at the bottom of the drawer.' },
  { name: 'closeOnOverlayClick', type: 'boolean', default: 'true', description: 'Whether clicking the backdrop closes the drawer.' },
  { name: 'closeOnEsc', type: 'boolean', default: 'true', description: 'Whether pressing Escape closes the drawer.' },
  { name: 'showCloseButton', type: 'boolean', default: 'true', description: 'Whether the header renders a × close button.' },
  { name: 'children', type: 'ReactNode', required: true, description: 'The drawer body content.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the drawer panel element.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles on the drawer panel element.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function DrawerPage({ theme }: { theme: ThemeTokens }) {
  const [rightOpen, setRightOpen] = useState(false);
  const [leftOpen, setLeftOpen] = useState(false);
  const [topOpen, setTopOpen] = useState(false);
  const [bottomOpen, setBottomOpen] = useState(false);
  const [sizeDrawer, setSizeDrawer] = useState<'sm' | 'md' | 'lg' | 'xl' | 'full' | null>(null);
  const [footerOpen, setFooterOpen] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', email: '' });

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    fontWeight: 600 as const,
    color: theme.text,
    marginBottom: '6px',
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bg,
    color: theme.text,
    fontSize: '14px',
    boxSizing: 'border-box' as const,
    outline: 'none',
  };

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '2.1.2 No Keyboard Trap', level: 'AA', status: 'PASS' },
            { criterion: '2.4.3 Focus Order', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxDrawer
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A slide-in panel component with full focus management, backdrop, and four placement directions. Focus is
        trapped inside the drawer while open and restored to the trigger element on close — matching the
        WAI-ARIA dialog pattern.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> The drawer panel uses{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="dialog"</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-modal="true"</code>{' '}
        and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-labelledby</code>{' '}
        pointing to the title.
      </p>

      {/* ── 1. Right Drawer (default) ── */}
      <DemoSection
        title="Right Drawer (Default)"
        description="The default placement is right — the drawer slides in from the right edge. This is the most common pattern for settings panels, shopping carts, and detail views."
        theme={theme}
        code={`const [isOpen, setIsOpen] = useState(false);

<TkxButton onClick={() => setIsOpen(true)}>Open Right Drawer</TkxButton>

<TkxDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Settings"
  placement="right"
>
  <p>Drawer content goes here.</p>
</TkxDrawer>`}
      >
        <TkxButton onClick={() => setRightOpen(true)}>Open Right Drawer</TkxButton>

        <TkxDrawer
          isOpen={rightOpen}
          onClose={() => setRightOpen(false)}
          title="Account Settings"
          placement="right"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0' }}>
            <p style={{ margin: 0, fontSize: '14px', color: theme.textMuted }}>
              Manage your account preferences, notifications, and security settings here.
            </p>
            <div>
              <label style={labelStyle}>Display Name</label>
              <input style={inputStyle} defaultValue="Avery Chen" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} defaultValue="avery@tekivex.io" type="email" />
            </div>
            <div>
              <label style={labelStyle}>Language</label>
              <input style={inputStyle} defaultValue="English (US)" />
            </div>
          </div>
        </TkxDrawer>
      </DemoSection>

      {/* ── 2. Left Drawer ── */}
      <DemoSection
        title="Left Drawer"
        description="placement='left' slides the panel in from the left edge. Commonly used for navigation menus on mobile layouts."
        theme={theme}
        code={`<TkxDrawer isOpen={isOpen} onClose={close} title="Navigation" placement="left">
  <nav>…navigation items…</nav>
</TkxDrawer>`}
      >
        <TkxButton variant="outline" onClick={() => setLeftOpen(true)}>Open Left Drawer</TkxButton>

        <TkxDrawer
          isOpen={leftOpen}
          onClose={() => setLeftOpen(false)}
          title="Navigation"
          placement="left"
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {['Overview', 'Components', 'Theming', 'Templates', 'Accessibility', 'Changelog'].map((item) => (
              <button
                key={item}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'transparent',
                  color: theme.text,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                }}
              >
                {item}
              </button>
            ))}
          </nav>
        </TkxDrawer>
      </DemoSection>

      {/* ── 3. Top Drawer ── */}
      <DemoSection
        title="Top Drawer"
        description="placement='top' slides a panel down from the top. Useful for search overlays, command palettes, and notification centers."
        theme={theme}
        code={`<TkxDrawer isOpen={isOpen} onClose={close} title="Search" placement="top" size="sm">
  <input placeholder="Search components…" />
</TkxDrawer>`}
      >
        <TkxButton variant="ghost" onClick={() => setTopOpen(true)}>Open Top Drawer</TkxButton>

        <TkxDrawer
          isOpen={topOpen}
          onClose={() => setTopOpen(false)}
          title="Global Search"
          placement="top"
          size="sm"
        >
          <p style={{ margin: '0 0 12px', fontSize: '14px', color: theme.textMuted }}>
            Search across all components, props, and documentation.
          </p>
          <input
            style={{ ...inputStyle, marginBottom: 0 }}
            placeholder="Type to search…"
            autoFocus
          />
        </TkxDrawer>
      </DemoSection>

      {/* ── 4. Bottom Drawer ── */}
      <DemoSection
        title="Bottom Drawer"
        description="placement='bottom' slides up from the bottom edge. Popular on mobile for action sheets, share sheets, and contextual menus."
        theme={theme}
        code={`<TkxDrawer isOpen={isOpen} onClose={close} title="Share" placement="bottom" size="sm">
  …share options…
</TkxDrawer>`}
      >
        <TkxButton variant="outline" onClick={() => setBottomOpen(true)}>Open Bottom Drawer</TkxButton>

        <TkxDrawer
          isOpen={bottomOpen}
          onClose={() => setBottomOpen(false)}
          title="Share Component"
          placement="bottom"
          size="sm"
        >
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {['Copy Link', 'Share to Twitter', 'Share to GitHub', 'Export as PDF'].map((action) => (
              <TkxButton key={action} variant="outline" size="sm" onClick={() => setBottomOpen(false)}>
                {action}
              </TkxButton>
            ))}
          </div>
        </TkxDrawer>
      </DemoSection>

      {/* ── 5. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Five sizes control the width (left/right) or height (top/bottom) of the drawer. 'full' spans the entire viewport dimension."
        theme={theme}
        code={`<TkxDrawer size="sm"   … />  {/* 320px  */}
<TkxDrawer size="md"   … />  {/* 480px  */}
<TkxDrawer size="lg"   … />  {/* 640px  */}
<TkxDrawer size="xl"   … />  {/* 800px  */}
<TkxDrawer size="full" … />  {/* 100vw  */}`}
      >
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {(['sm', 'md', 'lg', 'xl', 'full'] as const).map((s) => (
            <TkxButton key={s} size="sm" variant="outline" onClick={() => setSizeDrawer(s)}>
              Size: {s}
            </TkxButton>
          ))}
        </div>

        {sizeDrawer && (
          <TkxDrawer
            isOpen
            onClose={() => setSizeDrawer(null)}
            title={`Drawer — size="${sizeDrawer}"`}
            placement="right"
            size={sizeDrawer}
          >
            <p style={{ color: theme.textMuted, fontSize: '14px' }}>
              This drawer has <code>size="{sizeDrawer}"</code>.
            </p>
          </TkxDrawer>
        )}
      </DemoSection>

      {/* ── 6. With Footer ── */}
      <DemoSection
        title="With Footer"
        description="The footer prop renders a sticky area at the bottom of the drawer — perfect for action buttons on forms. The footer stays visible even when the body content scrolls."
        theme={theme}
        code={`<TkxDrawer
  isOpen={isOpen}
  onClose={close}
  title="Edit Profile"
  footer={
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
      <TkxButton variant="ghost" onClick={close}>Cancel</TkxButton>
      <TkxButton onClick={save}>Save Changes</TkxButton>
    </div>
  }
>
  {/* form fields */}
</TkxDrawer>`}
      >
        <TkxButton onClick={() => setFooterOpen(true)}>Open Drawer with Footer</TkxButton>

        <TkxDrawer
          isOpen={footerOpen}
          onClose={() => setFooterOpen(false)}
          title="Edit Profile"
          footer={
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <TkxButton variant="ghost" onClick={() => setFooterOpen(false)}>Cancel</TkxButton>
              <TkxButton onClick={() => setFooterOpen(false)}>Save Changes</TkxButton>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '4px 0' }}>
            <div>
              <label style={labelStyle}>Full Name</label>
              <input
                style={inputStyle}
                value={formValues.name}
                onChange={(e) => setFormValues((v) => ({ ...v, name: e.target.value }))}
                placeholder="Avery Chen"
              />
            </div>
            <div>
              <label style={labelStyle}>Email Address</label>
              <input
                style={inputStyle}
                value={formValues.email}
                onChange={(e) => setFormValues((v) => ({ ...v, email: e.target.value }))}
                placeholder="avery@tekivex.io"
                type="email"
              />
            </div>
            <div>
              <label style={labelStyle}>Bio</label>
              <textarea
                style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
                placeholder="A short description about yourself…"
              />
            </div>
          </div>
        </TkxDrawer>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={DRAWER_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.2 No Keyboard Trap" level="AA" status="PASS" />
        <WCAGBadge criterion="2.4.3 Focus Order" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Focus Management</p>
        <p style={noteItemStyle}>When the drawer opens, focus moves to the first focusable element inside the panel (the close button or the first interactive child). When it closes, focus returns to the element that triggered it.</p>
        <p style={noteItemStyle}>Tab and Shift+Tab cycle focus within the drawer panel only — focus cannot escape to the page behind it (WCAG 2.1.2 No Keyboard Trap). Escape always closes and restores focus.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Backdrop &amp; aria-modal</p>
        <p style={noteItemStyle}><code>aria-modal="true"</code> tells modern screen readers to treat content outside the drawer as inert. For older assistive technologies, the backdrop also sets <code>aria-hidden="true"</code> on the rest of the page content programmatically.</p>
      </div>
    </div>
  );
}
