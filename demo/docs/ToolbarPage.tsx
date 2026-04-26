import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxToolbar } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TOOLBAR_PROPS = [
  { name: 'items', type: 'ToolbarItem[]', default: '—', description: 'Array of toolbar items including buttons, toggles, and separators.' },
  { name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'Layout direction of the toolbar items.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls button padding, font size, icon size, and gap between items.' },
  { name: 'variant', type: "'default' | 'outlined' | 'filled'", default: "'default'", description: 'Visual style variant of the toolbar container and buttons.' },
  { name: 'ariaLabel', type: 'string', default: "'Toolbar'", description: 'Accessible label for the toolbar landmark region.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of base styles.' },
];

const TOOLBAR_ITEM_PROPS = [
  { name: 'id', type: 'string', default: '—', description: 'Unique identifier for the toolbar item.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Optional icon rendered inside the button.' },
  { name: 'label', type: 'string', default: '—', description: 'Display text and accessible label for the item.' },
  { name: 'onClick', type: '() => void', default: 'undefined', description: 'Callback fired when the item is clicked.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, the button is visually dimmed and non-interactive.' },
  { name: 'active', type: 'boolean', default: 'false', description: 'When true, the button renders in its active/pressed state. Used for toggles.' },
  { name: 'type', type: "'button' | 'separator' | 'toggle'", default: "'button'", description: 'Item type. Separator renders a visual divider. Toggle maintains active state.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconBold({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
      <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
    </svg>
  );
}

function IconItalic({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="19" y1="4" x2="10" y2="4" />
      <line x1="14" y1="20" x2="5" y2="20" />
      <line x1="15" y1="4" x2="9" y2="20" />
    </svg>
  );
}

function IconUnderline({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
      <line x1="4" y1="21" x2="20" y2="21" />
    </svg>
  );
}

function IconAlignLeft({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </svg>
  );
}

function IconAlignCenter({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="10" x2="6" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="18" y1="18" x2="6" y2="18" />
    </svg>
  );
}

function IconAlignRight({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="21" y1="10" x2="7" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="21" y1="18" x2="7" y2="18" />
    </svg>
  );
}

function IconCopy({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconScissors({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function IconClipboard({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export function ToolbarPage({ theme }: { theme: ThemeTokens }) {
  const [boldActive, setBoldActive] = useState(false);
  const [italicActive, setItalicActive] = useState(false);
  const [underlineActive, setUnderlineActive] = useState(true);
  const [alignment, setAlignment] = useState<'left' | 'center' | 'right'>('left');

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const horizontalItems = [
    { id: 'cut', label: 'Cut', icon: <IconScissors color="currentColor" />, onClick: () => {} },
    { id: 'copy', label: 'Copy', icon: <IconCopy color="currentColor" />, onClick: () => {} },
    { id: 'paste', label: 'Paste', icon: <IconClipboard color="currentColor" />, onClick: () => {} },
  ];

  const verticalItems = [
    { id: 'cut-v', label: 'Cut', icon: <IconScissors color="currentColor" />, onClick: () => {} },
    { id: 'copy-v', label: 'Copy', icon: <IconCopy color="currentColor" />, onClick: () => {} },
    { id: 'paste-v', label: 'Paste', icon: <IconClipboard color="currentColor" />, onClick: () => {} },
  ];

  const separatorItems = [
    { id: 'cut-s', label: 'Cut', icon: <IconScissors color="currentColor" />, onClick: () => {} },
    { id: 'copy-s', label: 'Copy', icon: <IconCopy color="currentColor" />, onClick: () => {} },
    { id: 'paste-s', label: 'Paste', icon: <IconClipboard color="currentColor" />, onClick: () => {} },
    { id: 'sep1', label: '', type: 'separator' as const },
    { id: 'align-left', label: 'Align Left', icon: <IconAlignLeft color="currentColor" />, onClick: () => {} },
    { id: 'align-center', label: 'Align Center', icon: <IconAlignCenter color="currentColor" />, onClick: () => {} },
    { id: 'align-right', label: 'Align Right', icon: <IconAlignRight color="currentColor" />, onClick: () => {} },
  ];

  const toggleItems = [
    { id: 'bold', label: 'Bold', icon: <IconBold color="currentColor" />, type: 'toggle' as const, active: boldActive, onClick: () => setBoldActive(!boldActive) },
    { id: 'italic', label: 'Italic', icon: <IconItalic color="currentColor" />, type: 'toggle' as const, active: italicActive, onClick: () => setItalicActive(!italicActive) },
    { id: 'underline', label: 'Underline', icon: <IconUnderline color="currentColor" />, type: 'toggle' as const, active: underlineActive, onClick: () => setUnderlineActive(!underlineActive) },
    { id: 'sep-t', label: '', type: 'separator' as const },
    { id: 'align-l', label: 'Align Left', icon: <IconAlignLeft color="currentColor" />, type: 'toggle' as const, active: alignment === 'left', onClick: () => setAlignment('left') },
    { id: 'align-c', label: 'Align Center', icon: <IconAlignCenter color="currentColor" />, type: 'toggle' as const, active: alignment === 'center', onClick: () => setAlignment('center') },
    { id: 'align-r', label: 'Align Right', icon: <IconAlignRight color="currentColor" />, type: 'toggle' as const, active: alignment === 'right', onClick: () => setAlignment('right') },
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxToolbar
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A grouping of action buttons typically placed above content areas. Supports horizontal
        and vertical orientations, three sizes, three visual variants, separator items, and
        toggle buttons with active state.
      </p>

      {/* ── 1. Horizontal Toolbar ── */}
      <DemoSection
        title="Horizontal Toolbar"
        description="The default orientation is horizontal, laying out items in a row. Each item renders as a button with an optional icon and label."
        theme={theme}
        code={`<TkxToolbar
  items={[
    { id: 'cut', label: 'Cut', icon: <IconScissors />, onClick: () => {} },
    { id: 'copy', label: 'Copy', icon: <IconCopy />, onClick: () => {} },
    { id: 'paste', label: 'Paste', icon: <IconClipboard />, onClick: () => {} },
  ]}
/>`}
      >
        <TkxToolbar items={horizontalItems} />
      </DemoSection>

      {/* ── 2. Vertical Toolbar ── */}
      <DemoSection
        title="Vertical Toolbar"
        description="Set orientation to 'vertical' to stack toolbar items in a column. Useful for side panels or narrow layouts."
        theme={theme}
        code={`<TkxToolbar
  orientation="vertical"
  items={[
    { id: 'cut', label: 'Cut', icon: <IconScissors />, onClick: () => {} },
    { id: 'copy', label: 'Copy', icon: <IconCopy />, onClick: () => {} },
    { id: 'paste', label: 'Paste', icon: <IconClipboard />, onClick: () => {} },
  ]}
/>`}
      >
        <TkxToolbar orientation="vertical" items={verticalItems} />
      </DemoSection>

      {/* ── 3. With Separators ── */}
      <DemoSection
        title="With Separators"
        description="Add items with type 'separator' to visually group related actions. Separators render as thin lines between groups."
        theme={theme}
        code={`<TkxToolbar
  items={[
    { id: 'cut', label: 'Cut', icon: <IconScissors />, onClick: () => {} },
    { id: 'copy', label: 'Copy', icon: <IconCopy />, onClick: () => {} },
    { id: 'paste', label: 'Paste', icon: <IconClipboard />, onClick: () => {} },
    { id: 'sep1', label: '', type: 'separator' },
    { id: 'align-left', label: 'Align Left', icon: <IconAlignLeft />, onClick: () => {} },
    { id: 'align-center', label: 'Align Center', icon: <IconAlignCenter />, onClick: () => {} },
    { id: 'align-right', label: 'Align Right', icon: <IconAlignRight />, onClick: () => {} },
  ]}
/>`}
      >
        <TkxToolbar items={separatorItems} />
      </DemoSection>

      {/* ── 4. Toggle Buttons ── */}
      <DemoSection
        title="Toggle Buttons"
        description="Items with type 'toggle' maintain an active state, shown with a highlighted background. Use the active prop to control each toggle's pressed state."
        theme={theme}
        code={`const [bold, setBold] = useState(false);
const [italic, setItalic] = useState(false);

<TkxToolbar
  items={[
    { id: 'bold', label: 'Bold', icon: <IconBold />, type: 'toggle',
      active: bold, onClick: () => setBold(!bold) },
    { id: 'italic', label: 'Italic', icon: <IconItalic />, type: 'toggle',
      active: italic, onClick: () => setItalic(!italic) },
  ]}
/>`}
      >
        <div>
          <TkxToolbar items={toggleItems} />
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '12px' }}>
            Active: <strong style={{ color: theme.primary }}>
              {[
                boldActive && 'Bold',
                italicActive && 'Italic',
                underlineActive && 'Underline',
                `Align ${alignment}`,
              ].filter(Boolean).join(', ')}
            </strong>
          </p>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        TkxToolbarProps
      </h3>
      <div style={{ marginBottom: '32px' }}>
        <PropTable props={TOOLBAR_PROPS} />
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        ToolbarItem
      </h3>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={TOOLBAR_ITEM_PROPS} />
      </div>
    </div>
  );
}
