import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxBreadcrumb } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const BREADCRUMB_PROPS = [
  { name: 'items', type: 'BreadcrumbItem[]', default: '—', description: 'Array of breadcrumb items. Each item has label (string), optional href (string), and optional icon (ReactNode).' },
  { name: 'separator', type: 'ReactNode', default: 'Chevron icon', description: 'Custom separator element rendered between breadcrumb items.' },
  { name: 'maxItems', type: 'number', default: 'undefined', description: 'Maximum number of visible items. Middle items collapse into an ellipsis when exceeded.' },
  { name: 'onNavigate', type: '(item: BreadcrumbItem, index: number) => void', default: 'undefined', description: 'Callback fired when a breadcrumb item is clicked. Receives the item and its index.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of base styles.' },
];

const BREADCRUMB_ITEM_PROPS = [
  { name: 'label', type: 'string', default: '—', description: 'Display text for the breadcrumb item.' },
  { name: 'href', type: 'string', default: 'undefined', description: 'Optional URL. When provided, the item renders as a link.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Optional icon rendered before the label text.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconHome({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function IconFolder({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFile({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function BreadcrumbPage({ theme }: { theme: ThemeTokens }) {
  const [lastClicked, setLastClicked] = useState<string | null>(null);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const basicItems = [
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Headphones' },
  ];

  const iconItems = [
    { label: 'Home', href: '/', icon: <IconHome color={theme.textMuted} /> },
    { label: 'Documents', href: '/docs', icon: <IconFolder color={theme.textMuted} /> },
    { label: 'Projects', href: '/docs/projects', icon: <IconFolder color={theme.textMuted} /> },
    { label: 'report.pdf', icon: <IconFile color={theme.textMuted} /> },
  ];

  const longItems = [
    { label: 'Home', href: '/' },
    { label: 'Category', href: '/category' },
    { label: 'Subcategory', href: '/category/sub' },
    { label: 'Section', href: '/category/sub/section' },
    { label: 'Subsection', href: '/category/sub/section/subsection' },
    { label: 'Current Page' },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxBreadcrumb
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A navigation breadcrumb trail showing the user's current location within a hierarchy.
        Supports custom separators, icons on items, collapsible middle items via maxItems,
        and keyboard-accessible navigation.
      </p>

      {/* ── 1. Basic Breadcrumb ── */}
      <DemoSection
        title="Basic Breadcrumb"
        description="A simple breadcrumb trail with text-only items. The last item is rendered as the current page (non-clickable). Clicking an item fires the onNavigate callback."
        theme={theme}
        code={`<TkxBreadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Headphones' },
  ]}
  onNavigate={(item, index) => console.log(item.label, index)}
/>`}
      >
        <TkxBreadcrumb
          items={basicItems}
          onNavigate={(item) => setLastClicked(item.label)}
        />
        {lastClicked && (
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '12px' }}>
            Last clicked: <strong style={{ color: theme.primary }}>{lastClicked}</strong>
          </p>
        )}
      </DemoSection>

      {/* ── 2. With Icons ── */}
      <DemoSection
        title="With Icons"
        description="Each BreadcrumbItem can include an optional icon ReactNode rendered before the label text. Icons help users quickly identify the type of each breadcrumb level."
        theme={theme}
        code={`<TkxBreadcrumb
  items={[
    { label: 'Home', href: '/', icon: <IconHome /> },
    { label: 'Documents', href: '/docs', icon: <IconFolder /> },
    { label: 'Projects', href: '/docs/projects', icon: <IconFolder /> },
    { label: 'report.pdf', icon: <IconFile /> },
  ]}
/>`}
      >
        <TkxBreadcrumb items={iconItems} />
      </DemoSection>

      {/* ── 3. Collapsed (maxItems) ── */}
      <DemoSection
        title="Collapsed with maxItems"
        description="When the breadcrumb trail is long, set maxItems to limit visible items. Middle items collapse into an expandable ellipsis button. The first and last items always remain visible."
        theme={theme}
        code={`<TkxBreadcrumb
  items={longItems}  // 6 items
  maxItems={3}
/>

<TkxBreadcrumb
  items={longItems}
  maxItems={4}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px' }}>maxItems=3</p>
            <TkxBreadcrumb items={longItems} maxItems={3} />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px' }}>maxItems=4</p>
            <TkxBreadcrumb items={longItems} maxItems={4} />
          </div>
        </div>
      </DemoSection>

      {/* ── 4. Custom Separator ── */}
      <DemoSection
        title="Custom Separator"
        description="Override the default chevron separator with any ReactNode. Common alternatives include slash, arrow, or dot characters."
        theme={theme}
        code={`<TkxBreadcrumb
  items={basicItems}
  separator={<span style={{ color: theme.textMuted, margin: '0 4px' }}>/</span>}
/>

<TkxBreadcrumb
  items={basicItems}
  separator={<span style={{ color: theme.textMuted, margin: '0 6px' }}>\u2192</span>}
/>

<TkxBreadcrumb
  items={basicItems}
  separator={<span style={{ color: theme.textMuted, margin: '0 6px' }}>\u00B7</span>}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px' }}>Slash separator</p>
            <TkxBreadcrumb
              items={basicItems}
              separator={<span style={{ color: theme.textMuted, margin: '0 4px' }}>/</span>}
            />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px' }}>Arrow separator</p>
            <TkxBreadcrumb
              items={basicItems}
              separator={<span style={{ color: theme.textMuted, margin: '0 6px' }}>{'\u2192'}</span>}
            />
          </div>
          <div>
            <p style={{ fontSize: '12px', color: theme.textMuted, marginBottom: '8px' }}>Dot separator</p>
            <TkxBreadcrumb
              items={basicItems}
              separator={<span style={{ color: theme.textMuted, margin: '0 6px' }}>{'\u00B7'}</span>}
            />
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        TkxBreadcrumbProps
      </h3>
      <div style={{ marginBottom: '32px' }}>
        <PropTable props={BREADCRUMB_PROPS} />
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        BreadcrumbItem
      </h3>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={BREADCRUMB_ITEM_PROPS} />
      </div>
    </div>
  );
}
