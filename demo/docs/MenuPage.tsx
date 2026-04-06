import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxMenu, TkxButton, TkxBadge } from '@tekivex/ui';
import type { MenuItem } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Shared icons ──────────────────────────────────────────────────────────────

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IconDownload() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ── Context Menu demo ─────────────────────────────────────────────────────────

function ContextMenuDemo({ theme }: { theme: ThemeTokens }) {
  const [lastAction, setLastAction] = useState<string | null>(null);

  const contextItems: MenuItem[] = [
    { type: 'action', id: 'copy',      label: 'Copy',       icon: <IconCopy />,     shortcut: 'Ctrl+C', onClick: () => setLastAction('Copy') },
    { type: 'action', id: 'paste',     label: 'Paste',      shortcut: 'Ctrl+V',     onClick: () => setLastAction('Paste') },
    { type: 'action', id: 'selectall', label: 'Select All', shortcut: 'Ctrl+A',     onClick: () => setLastAction('Select All') },
    { type: 'separator', id: 'sep1' },
    { type: 'action', id: 'inspect',   label: 'Inspect',    shortcut: 'Ctrl+Shift+I', onClick: () => setLastAction('Inspect') },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <TkxMenu
        trigger={
          <div
            style={{
              padding: '32px 24px',
              border: `2px dashed ${theme.border}`,
              borderRadius: 10,
              textAlign: 'center',
              fontSize: 13,
              color: theme.textMuted,
              cursor: 'context-menu',
              userSelect: 'none',
              backgroundColor: theme.surfaceAlt,
            }}
          >
            Right-click anywhere in this area
          </div>
        }
        items={contextItems}
        placement="bottom-start"
      />
      {lastAction && (
        <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>
          Last action: <strong style={{ color: theme.text }}>{lastAction}</strong>
        </p>
      )}
    </div>
  );
}

// ── MenuPage ──────────────────────────────────────────────────────────────────

export function MenuPage({ theme }: { theme: ThemeTokens }) {
  const [lastBasic, setLastBasic] = useState<string | null>(null);
  const [wordWrap, setWordWrap] = useState(true);
  const [lineNums, setLineNums] = useState(false);
  const [view, setView] = useState('split');

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const codeStyle = {
    fontSize: '12px',
    backgroundColor: `${theme.primary}14`,
    color: theme.primary,
    padding: '1px 5px',
    borderRadius: '4px',
    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
  };

  // ── Items ──────────────────────────────────────────────────────────────────

  const basicItems: MenuItem[] = [
    { type: 'action', id: 'edit',   label: 'Edit',   icon: <IconEdit />,     shortcut: 'E', onClick: () => setLastBasic('Edit') },
    { type: 'action', id: 'copy',   label: 'Copy',   icon: <IconCopy />,     shortcut: 'Ctrl+C', onClick: () => setLastBasic('Copy') },
    { type: 'action', id: 'share',  label: 'Share',  icon: <IconShare />,    onClick: () => setLastBasic('Share') },
    { type: 'separator', id: 'sep1' },
    { type: 'action', id: 'download', label: 'Download', icon: <IconDownload />, onClick: () => setLastBasic('Download') },
    { type: 'action', id: 'delete', label: 'Delete', icon: <IconTrash />,    shortcut: 'Del', danger: true, onClick: () => setLastBasic('Delete') },
  ];

  const submenuItems: MenuItem[] = [
    { type: 'action', id: 'new-file',   label: 'New File',   icon: <IconEdit />,   onClick: () => setLastBasic('New File') },
    { type: 'action', id: 'new-folder', label: 'New Folder', icon: <IconFolder />, onClick: () => setLastBasic('New Folder') },
    { type: 'separator', id: 'sep-sm1' },
    {
      type: 'submenu',
      id: 'export',
      label: 'Export as…',
      icon: <IconDownload />,
      items: [
        { type: 'action', id: 'export-pdf',  label: 'PDF Document',  onClick: () => setLastBasic('Export PDF') },
        { type: 'action', id: 'export-csv',  label: 'CSV File',      onClick: () => setLastBasic('Export CSV') },
        { type: 'action', id: 'export-json', label: 'JSON',          onClick: () => setLastBasic('Export JSON') },
      ],
    },
    {
      type: 'submenu',
      id: 'share-sub',
      label: 'Share with…',
      icon: <IconShare />,
      items: [
        { type: 'action', id: 'share-team',   label: 'Team members', onClick: () => setLastBasic('Share Team') },
        { type: 'action', id: 'share-public', label: 'Public link',  onClick: () => setLastBasic('Share Public') },
      ],
    },
    { type: 'separator', id: 'sep-sm2' },
    { type: 'action', id: 'delete-sm', label: 'Move to Trash', icon: <IconTrash />, danger: true, onClick: () => setLastBasic('Move to Trash') },
  ];

  const checkRadioItems: MenuItem[] = [
    { type: 'check',  id: 'wordwrap', label: 'Word Wrap',    checked: wordWrap, onChange: (v) => setWordWrap(v) },
    { type: 'check',  id: 'linenums', label: 'Line Numbers', checked: lineNums, onChange: (v) => setLineNums(v) },
    { type: 'separator', id: 'sep-cr1', label: 'View' },
    {
      type: 'radio-group',
      id: 'view-mode',
      label: 'Editor layout',
      value: view,
      options: [
        { value: 'single', label: 'Single pane' },
        { value: 'split',  label: 'Split pane' },
        { value: 'grid',   label: 'Grid' },
      ],
      onChange: (v) => setView(v),
    },
  ];

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Hero ── */}
      <span style={{
        display: 'inline-block', padding: '3px 10px', borderRadius: 9999,
        fontSize: 11, fontWeight: 700, letterSpacing: '0.04em',
        backgroundColor: `${theme.primary}18`, color: theme.primary,
        border: `1px solid ${theme.primary}35`, marginBottom: 24,
      }}>
        Component Docs
      </span>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em' }}>
        TkxMenu
      </h1>
      <p style={{ fontSize: 15, color: theme.textMuted, lineHeight: 1.7, maxWidth: 620, margin: '0 0 20px' }}>
        A fully accessible, portal-rendered context menu and dropdown component. Supports action
        items with icons and keyboard shortcuts, check items, radio groups, separators with optional
        labels, and infinitely nestable submenus. Built to WAI-ARIA Menu Button pattern.
      </p>
      <WCAGBadgeGroup
        label="WCAG 2.1 Compliance"
        badges={[
          { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
          { criterion: '1.4.3 Contrast', level: 'AA', status: 'PASS' },
          { criterion: '4.1.2 Name, Role, Value', level: 'AA', status: 'PASS' },
          { criterion: '2.4.3 Focus Order', level: 'AA', status: 'PASS' },
        ]}
      />

      <hr style={dividerStyle} />

      {/* ── Basic Menu ── */}
      <DemoSection
        title="Basic Menu"
        description="Pass any ReactNode as the trigger and an array of MenuItem objects as items. The menu opens on click and closes on selection, outside click, or Escape."
        theme={theme}
        code={`import { TkxMenu, TkxButton } from '@tekivex/ui';

<TkxMenu
  trigger={<TkxButton colorScheme="primary" size="sm">Actions ▾</TkxButton>}
  items={[
    { id: 'edit',   label: 'Edit',   icon: <IconEdit />,  shortcut: 'E' },
    { id: 'copy',   label: 'Copy',   icon: <IconCopy />,  shortcut: 'Ctrl+C' },
    { id: 'share',  label: 'Share',  icon: <IconShare /> },
    { type: 'separator', id: 'sep1' },
    { id: 'delete', label: 'Delete', icon: <IconTrash />, danger: true },
  ]}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <TkxMenu
              trigger={
                <TkxButton colorScheme="primary" size="sm">
                  Actions ▾
                </TkxButton>
              }
              items={basicItems}
              placement="bottom-start"
            />
          </div>
          {lastBasic && (
            <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>
              Last action: <strong style={{ color: theme.text }}>{lastBasic}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── Submenus ── */}
      <DemoSection
        title="With Submenus"
        description="Nest a submenu by adding an item with type='submenu' and an items array. Submenus open on hover or arrow-right and can be nested to any depth."
        theme={theme}
        code={`<TkxMenu
  trigger={<TkxButton size="sm">File ▾</TkxButton>}
  items={[
    { id: 'new-file',   label: 'New File' },
    { id: 'new-folder', label: 'New Folder' },
    { type: 'separator', id: 'sep1' },
    {
      type: 'submenu',
      id: 'export',
      label: 'Export as…',
      items: [
        { id: 'pdf',  label: 'PDF Document' },
        { id: 'csv',  label: 'CSV File' },
        { id: 'json', label: 'JSON' },
      ],
    },
    { id: 'delete', label: 'Move to Trash', danger: true },
  ]}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <TkxMenu
              trigger={
                <TkxButton colorScheme="secondary" variant="outline" size="sm">
                  File ▾
                </TkxButton>
              }
              items={submenuItems}
              placement="bottom-start"
            />
          </div>
          {lastBasic && (
            <p style={{ fontSize: 13, color: theme.textMuted, margin: 0 }}>
              Last action: <strong style={{ color: theme.text }}>{lastBasic}</strong>
            </p>
          )}
        </div>
      </DemoSection>

      {/* ── Check & Radio ── */}
      <DemoSection
        title="Check Items & Radio Groups"
        description="Use type='check' for toggleable boolean items, and type='radio-group' for mutually exclusive option groups. Both maintain controlled state via onChange callbacks."
        theme={theme}
        code={`const [wordWrap, setWordWrap] = useState(true);
const [view, setView] = useState('split');

<TkxMenu
  trigger={<TkxButton size="sm">View ▾</TkxButton>}
  items={[
    { type: 'check', id: 'wordwrap', label: 'Word Wrap',    checked: wordWrap, onChange: setWordWrap },
    { type: 'check', id: 'linenums', label: 'Line Numbers', checked: lineNums, onChange: setLineNums },
    { type: 'separator', id: 'sep1', label: 'View' },
    {
      type: 'radio-group',
      id: 'layout',
      label: 'Editor layout',
      value: view,
      options: [
        { value: 'single', label: 'Single pane' },
        { value: 'split',  label: 'Split pane' },
        { value: 'grid',   label: 'Grid' },
      ],
      onChange: setView,
    },
  ]}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <TkxMenu
              trigger={
                <TkxButton colorScheme="secondary" variant="outline" size="sm">
                  View ▾
                </TkxButton>
              }
              items={checkRadioItems}
              placement="bottom-start"
            />
          </div>
          <div style={{ fontSize: 13, color: theme.textMuted, display: 'flex', gap: 16 }}>
            <span>Word wrap: <strong style={{ color: theme.text }}>{wordWrap ? 'on' : 'off'}</strong></span>
            <span>Line numbers: <strong style={{ color: theme.text }}>{lineNums ? 'on' : 'off'}</strong></span>
            <span>Layout: <strong style={{ color: theme.text }}>{view}</strong></span>
          </div>
        </div>
      </DemoSection>

      {/* ── Context Menu ── */}
      <DemoSection
        title="Context Menu (Right-Click)"
        description="Use the trigger prop with a right-click target area. The menu anchors to the trigger element using the placement prop."
        theme={theme}
        code={`<TkxMenu
  trigger={
    <div onContextMenu={/* handled by TkxMenu */}>
      Right-click anywhere in this area
    </div>
  }
  items={contextItems}
  placement="bottom-start"
/>`}
      >
        <ContextMenuDemo theme={theme} />
      </DemoSection>

      {/* ── Placements ── */}
      <DemoSection
        title="Placement Options"
        description="Control where the menu panel appears relative to its trigger using the placement prop. Six positions are supported; the component auto-flips when near viewport edges."
        theme={theme}
        code={`<TkxMenu placement="bottom-start" … />
<TkxMenu placement="bottom-end"  … />
<TkxMenu placement="top-start"   … />
<TkxMenu placement="right-start" … />
<TkxMenu placement="left-start"  … />`}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {(['bottom-start', 'bottom-end', 'top-start', 'top-end', 'right-start', 'left-start'] as const).map((p) => (
            <TkxMenu
              key={p}
              trigger={
                <TkxButton colorScheme="primary" variant="outline" size="sm">
                  {p}
                </TkxButton>
              }
              items={basicItems.slice(0, 4)}
              placement={p}
            />
          ))}
        </div>
      </DemoSection>

      {/* ── Disabled ── */}
      <DemoSection
        title="Disabled State"
        description="Set isDisabled on the TkxMenu to disable the trigger and prevent the panel from opening. Individual items can also be disabled via the disabled prop on a MenuActionItem."
        theme={theme}
        code={`<TkxMenu
  trigger={<TkxButton size="sm">Disabled menu</TkxButton>}
  items={items}
  isDisabled
/>

// Or disable individual items:
{ id: 'locked', label: 'Locked Action', disabled: true }`}
      >
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <TkxMenu
            trigger={
              <TkxButton colorScheme="primary" size="sm" disabled>
                Disabled menu
              </TkxButton>
            }
            items={basicItems}
            isDisabled
          />
          <TkxMenu
            trigger={
              <TkxButton colorScheme="secondary" variant="outline" size="sm">
                Some items disabled ▾
              </TkxButton>
            }
            items={[
              { type: 'action', id: 'a1', label: 'Enabled action', onClick: () => setLastBasic('Enabled') },
              { type: 'action', id: 'a2', label: 'Disabled action', disabled: true },
              { type: 'action', id: 'a3', label: 'Also enabled', onClick: () => setLastBasic('Also enabled') },
            ]}
            placement="bottom-start"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <section aria-labelledby="props-heading">
        <h2 id="props-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          TkxMenu Props
        </h2>
        <PropTable
          props={[
            { name: 'trigger',    type: 'ReactNode',        required: true,  description: 'The element that opens the menu on click. Any ReactNode is accepted.' },
            { name: 'items',      type: 'MenuItem[]',       required: true,  description: 'Array of menu items. Supports action, check, radio-group, separator, and submenu types.' },
            { name: 'placement',  type: 'MenuPlacement',    default: '"bottom-start"', description: 'Preferred position of the menu panel relative to the trigger. Auto-flips near viewport edges.' },
            { name: 'isDisabled', type: 'boolean',          default: 'false',  description: 'Prevents the trigger from opening the menu. The trigger element should also be disabled for ARIA compliance.' },
            { name: 'onOpen',     type: '() => void',       description: 'Callback fired when the menu panel opens.' },
            { name: 'onClose',    type: '() => void',       description: 'Callback fired when the menu panel closes.' },
            { name: 'className',  type: 'string',           description: 'Extra class names applied to the menu panel.' },
            { name: 'style',      type: 'CSSProperties',    description: 'Inline styles applied to the menu panel.' },
          ]}
        />
      </section>

      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          MenuItem Types
        </h2>
        <PropTable
          props={[
            { name: 'MenuActionItem',  type: '{ type?: "action"; id; label; icon?; shortcut?; description?; disabled?; danger?; onClick? }', description: 'A clickable action item. Set danger: true for destructive actions (renders in danger color).' },
            { name: 'MenuCheckItem',   type: '{ type: "check"; id; label; checked; icon?; disabled?; onChange? }',                           description: 'A toggleable boolean item with a checkmark indicator.' },
            { name: 'MenuRadioGroup',  type: '{ type: "radio-group"; id; label?; value; options[]; onChange? }',                             description: 'A group of mutually exclusive radio options. Each option has value, label, and optional icon.' },
            { name: 'MenuSeparator',   type: '{ type: "separator"; id; label? }',                                                            description: 'A horizontal rule between groups of items. Accepts an optional section label.' },
            { name: 'MenuSubMenu',     type: '{ type: "submenu"; id; label; icon?; disabled?; items: MenuItem[] }',                          description: 'An item that opens a nested submenu panel on hover or arrow-right keypress.' },
          ]}
        />
      </div>

      <hr style={dividerStyle} />

      {/* ── Accessibility Notes ── */}
      <section aria-labelledby="wcag-heading">
        <h2 id="wcag-heading" style={{ fontSize: '1.1rem', fontWeight: 700, color: theme.text, margin: '0 0 16px', letterSpacing: '-0.02em' }}>
          Accessibility Notes
        </h2>
        <div style={{
          fontSize: 13, color: theme.textMuted, lineHeight: 1.7,
          padding: '16px 18px', backgroundColor: `${theme.info}10`,
          border: `1px solid ${theme.info}30`, borderRadius: 10,
        }}>
          <p style={{ margin: '0 0 10px' }}>
            <code style={codeStyle}>TkxMenu</code> implements the WAI-ARIA{' '}
            <strong>Menu Button</strong> pattern with the following built-in behaviors:
          </p>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li style={{ marginBottom: 6 }}>
              <strong>Keyboard navigation</strong> — Arrow keys move focus between items.{' '}
              <kbd style={codeStyle}>Enter</kbd> / <kbd style={codeStyle}>Space</kbd> activates the focused item.{' '}
              <kbd style={codeStyle}>Escape</kbd> closes the menu and returns focus to the trigger.
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>Submenu navigation</strong> — <kbd style={codeStyle}>ArrowRight</kbd> opens a submenu and moves focus into it;{' '}
              <kbd style={codeStyle}>ArrowLeft</kbd> or <kbd style={codeStyle}>Escape</kbd> closes it and returns focus to the parent item.
            </li>
            <li style={{ marginBottom: 6 }}>
              <strong>ARIA roles</strong> — The panel carries <code style={codeStyle}>role="menu"</code>.
              Action items are <code style={codeStyle}>role="menuitem"</code>, check items are{' '}
              <code style={codeStyle}>role="menuitemcheckbox"</code>, and radio items are{' '}
              <code style={codeStyle}>role="menuitemradio"</code>.
            </li>
            <li>
              <strong>Portal rendering</strong> — The menu panel is rendered into{' '}
              <code style={codeStyle}>document.body</code> via a React portal, avoiding z-index stacking
              and overflow clipping issues in deeply nested layouts.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
