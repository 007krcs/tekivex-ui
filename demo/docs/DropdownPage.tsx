import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxDropdown } from '@tekivex/ui';
import type { DropdownItem, DropdownGroup } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconFile() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
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

function IconSave() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
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

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconPaste() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function IconTag() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
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

function IconLogOut() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

// ── Prop definitions ──────────────────────────────────────────────────────────

const DROPDOWN_PROPS = [
  { name: 'trigger', type: 'ReactNode', required: true, description: 'The element the user clicks to open the dropdown.' },
  { name: 'items', type: 'DropdownItem[]', default: 'undefined', description: 'Flat list of items. Ignored when groups is provided.' },
  { name: 'groups', type: 'DropdownGroup[]', default: 'undefined', description: 'Grouped list of items. Takes priority over items.' },
  { name: 'placement', type: "'bottom-start' | 'bottom-end' | 'top-start' | 'top-end' | 'right' | 'left'", default: "'bottom-start'", description: 'Where the menu appears relative to the trigger. Auto-flips when near viewport edge.' },
  { name: 'onSelect', type: '(key: string, item: DropdownItem) => void', default: 'undefined', description: 'Callback fired when an item is selected.' },
  { name: 'selectedKeys', type: 'string[]', default: '[]', description: 'Controlled selected item keys. Highlighted with checkmark.' },
  { name: 'multiSelect', type: 'boolean', default: 'false', description: 'Allow multiple items to be selected. Shows checkboxes and keeps menu open.' },
  { name: 'searchable', type: 'boolean', default: 'false', description: 'Show a search input inside the menu to filter items.' },
  { name: 'searchPlaceholder', type: 'string', default: "'Search…'", description: 'Placeholder text for the search input.' },
  { name: 'closeOnSelect', type: 'boolean', default: 'true (false when multiSelect)', description: 'Whether to close the menu after selecting an item.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents the dropdown from opening.' },
  { name: 'maxHeight', type: 'number', default: '320', description: 'Maximum height of the menu panel in pixels.' },
  { name: 'minWidth', type: 'number', default: '200', description: 'Minimum width of the menu panel in pixels.' },
  { name: 'open', type: 'boolean', default: 'undefined', description: 'Controlled open state.' },
  { name: 'onOpenChange', type: '(open: boolean) => void', default: 'undefined', description: 'Callback fired when the open state changes.' },
  { name: 'portal', type: 'boolean', default: 'true', description: 'Render the menu in document.body via portal to avoid z-index/overflow issues.' },
  { name: 'offset', type: 'number', default: '6', description: 'Gap in pixels between the trigger and the menu.' },
  { name: 'renderItem', type: '(item: DropdownItem, selected: boolean) => ReactNode', default: 'undefined', description: 'Custom render function for each item.' },
];

const ITEM_PROPS = [
  { name: 'key', type: 'string', required: true, description: 'Unique identifier for the item.' },
  { name: 'label', type: 'string', required: true, description: 'Display text.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Icon shown to the left of the label.' },
  { name: 'description', type: 'string', default: 'undefined', description: 'Subtitle text shown below the label.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents selection and grays out the item.' },
  { name: 'danger', type: 'boolean', default: 'false', description: 'Renders the item in danger (red) color.' },
  { name: 'shortcut', type: 'string', default: 'undefined', description: 'Keyboard shortcut label shown on the right, e.g. "⌘K".' },
  { name: 'divider', type: 'boolean', default: 'false', description: 'Renders a divider line before this item.' },
  { name: 'children', type: 'DropdownItem[]', default: 'undefined', description: 'Nested submenu items (max 2 levels).' },
  { name: 'badge', type: 'string | number', default: 'undefined', description: 'Badge shown on the right side of the item.' },
];

// ── Demo data ─────────────────────────────────────────────────────────────────

const BASIC_ITEMS: DropdownItem[] = [
  { key: 'new', label: 'New File', icon: <IconFile />, shortcut: '⌘N' },
  { key: 'open', label: 'Open File', icon: <IconFolder />, shortcut: '⌘O' },
  { key: 'save', label: 'Save', icon: <IconSave />, shortcut: '⌘S' },
  { key: 'share', label: 'Share', icon: <IconShare /> },
  { key: 'delete', label: 'Delete', icon: <IconTrash />, danger: true, divider: true },
];

const GROUPED_DATA: DropdownGroup[] = [
  {
    label: 'File',
    items: [
      { key: 'new', label: 'New', icon: <IconFile />, shortcut: '⌘N' },
      { key: 'open', label: 'Open', icon: <IconFolder />, shortcut: '⌘O' },
      { key: 'save', label: 'Save', icon: <IconSave />, shortcut: '⌘S' },
    ],
  },
  {
    label: 'Edit',
    items: [
      { key: 'copy', label: 'Copy', icon: <IconCopy />, shortcut: '⌘C' },
      { key: 'paste', label: 'Paste', icon: <IconPaste />, shortcut: '⌘V' },
    ],
  },
  {
    label: 'View',
    items: [
      { key: 'preview', label: 'Preview', icon: <IconEye /> },
      { key: 'fullscreen', label: 'Full Screen', shortcut: '⌘⇧F' },
    ],
  },
];

const NESTED_ITEMS: DropdownItem[] = [
  { key: 'copy', label: 'Copy Link', icon: <IconCopy /> },
  {
    key: 'share', label: 'Share', icon: <IconShare />,
    children: [
      { key: 'share-email', label: 'Email', icon: <IconMail />, description: 'Send via email' },
      { key: 'share-slack', label: 'Slack', description: 'Post to channel' },
      { key: 'share-teams', label: 'Teams', description: 'Share in Teams' },
    ],
  },
  { key: 'delete', label: 'Delete', icon: <IconTrash />, danger: true, divider: true },
];

const LABEL_ITEMS: DropdownItem[] = [
  { key: 'bug', label: 'Bug', badge: 3, icon: <IconTag /> },
  { key: 'feature', label: 'Feature Request', icon: <IconTag /> },
  { key: 'enhancement', label: 'Enhancement', icon: <IconTag /> },
  { key: 'docs', label: 'Documentation', icon: <IconTag /> },
  { key: 'design', label: 'Design', icon: <IconTag /> },
  { key: 'security', label: 'Security', icon: <IconTag /> },
];

const COUNTRY_ITEMS: DropdownItem[] = [
  { key: 'us', label: 'United States', description: 'North America' },
  { key: 'uk', label: 'United Kingdom', description: 'Europe' },
  { key: 'ca', label: 'Canada', description: 'North America' },
  { key: 'au', label: 'Australia', description: 'Oceania' },
  { key: 'de', label: 'Germany', description: 'Europe' },
  { key: 'fr', label: 'France', description: 'Europe' },
  { key: 'jp', label: 'Japan', description: 'Asia' },
  { key: 'in', label: 'India', description: 'Asia' },
  { key: 'br', label: 'Brazil', description: 'South America' },
  { key: 'mx', label: 'Mexico', description: 'North America' },
  { key: 'es', label: 'Spain', description: 'Europe' },
  { key: 'it', label: 'Italy', description: 'Europe' },
  { key: 'kr', label: 'South Korea', description: 'Asia' },
  { key: 'sg', label: 'Singapore', description: 'Asia' },
  { key: 'nl', label: 'Netherlands', description: 'Europe' },
];

const DANGER_ITEMS: DropdownItem[] = [
  { key: 'export', label: 'Export Data', icon: <IconSave /> },
  { key: 'revoke', label: 'Revoke Access', icon: <IconLogOut />, danger: true, divider: true, description: 'Remove all active sessions' },
  { key: 'delete-data', label: 'Delete All Data', icon: <IconTrash />, danger: true, description: 'This cannot be undone' },
  { key: 'delete-account', label: 'Delete Account', icon: <IconTrash />, danger: true },
];

// ── Trigger button ────────────────────────────────────────────────────────────

function TriggerBtn({ label, theme }: { label: string; theme?: ThemeTokens }) {
  return (
    <button
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.15)',
        background: 'rgba(255,255,255,0.07)',
        color: 'inherit',
        fontSize: 14,
        cursor: 'pointer',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
      }}
    >
      {label}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DropdownPage() {
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [lastAction, setLastAction] = useState<string>('');

  return (
    <div style={{ padding: '32px 0', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>TkxDropdown</h1>
      <p style={{ fontSize: 16, opacity: 0.7, marginBottom: 40 }}>
        Advanced dropdown menu with nested submenus, search, grouping, multi-select, and full keyboard navigation.
      </p>

      {/* 1. Basic Dropdown */}
      <DemoSection
        title="Basic Dropdown"
        description="Simple flat item list with icons and keyboard shortcuts."
        code={`<TkxDropdown
  trigger={<button>Actions</button>}
  items={[
    { key: 'new', label: 'New File', icon: <IconFile />, shortcut: '⌘N' },
    { key: 'open', label: 'Open File', icon: <IconFolder />, shortcut: '⌘O' },
    { key: 'delete', label: 'Delete', icon: <IconTrash />, danger: true },
  ]}
  onSelect={(key) => console.log(key)}
/>`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <TkxDropdown
            trigger={<TriggerBtn label="Actions" />}
            items={BASIC_ITEMS}
            onSelect={(key) => setLastAction(`Selected: ${key}`)}
          />
          {lastAction && (
            <span style={{ fontSize: 13, opacity: 0.7 }}>{lastAction}</span>
          )}
        </div>
      </DemoSection>

      {/* 2. Grouped Dropdown */}
      <DemoSection
        title="Grouped Dropdown"
        description="Items organized into labeled groups — File, Edit, and View."
        code={`<TkxDropdown
  trigger={<button>Menu</button>}
  groups={[
    { label: 'File', items: [...] },
    { label: 'Edit', items: [...] },
    { label: 'View', items: [...] },
  ]}
/>`}
      >
        <TkxDropdown
          trigger={<TriggerBtn label="Menu" />}
          groups={GROUPED_DATA}
          onSelect={(key) => setLastAction(`Selected: ${key}`)}
        />
      </DemoSection>

      {/* 3. Nested Submenus */}
      <DemoSection
        title="Nested Submenus"
        description="Items with children show a chevron. Hover or press ArrowRight to open the submenu. Max 2 levels deep."
        code={`<TkxDropdown
  trigger={<button>Share</button>}
  items={[
    { key: 'copy', label: 'Copy Link' },
    {
      key: 'share', label: 'Share',
      children: [
        { key: 'email', label: 'Email' },
        { key: 'slack', label: 'Slack' },
        { key: 'teams', label: 'Teams' },
      ]
    },
  ]}
/>`}
      >
        <TkxDropdown
          trigger={<TriggerBtn label="Share" />}
          items={NESTED_ITEMS}
          onSelect={(key) => setLastAction(`Selected: ${key}`)}
        />
      </DemoSection>

      {/* 4. Multi-Select */}
      <DemoSection
        title="Multi-Select"
        description="Select multiple items. Checkmarks indicate selection. Menu stays open. Shows selected count."
        code={`const [selected, setSelected] = useState<string[]>([]);
<TkxDropdown
  trigger={<button>Labels ({selected.length})</button>}
  items={LABEL_ITEMS}
  multiSelect
  selectedKeys={selected}
  onSelect={(key) => setSelected(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  )}
/>`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <TkxDropdown
            trigger={
              <TriggerBtn
                label={selectedLabels.length > 0 ? `Labels (${selectedLabels.length} selected)` : 'Labels'}
              />
            }
            items={LABEL_ITEMS}
            multiSelect
            selectedKeys={selectedLabels}
            onSelect={(key) => {
              setSelectedLabels((prev) =>
                prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
              );
            }}
          />
          {selectedLabels.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {selectedLabels.map((k) => {
                const item = LABEL_ITEMS.find((i) => i.key === k);
                return (
                  <span
                    key={k}
                    style={{
                      fontSize: 12,
                      padding: '2px 10px',
                      borderRadius: 12,
                      background: 'rgba(0,245,212,0.15)',
                      border: '1px solid rgba(0,245,212,0.3)',
                    }}
                  >
                    {item?.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </DemoSection>

      {/* 5. Searchable */}
      <DemoSection
        title="Searchable"
        description="A search input filters items in real time. Matching text is highlighted. Shows 'No results' when nothing matches."
        code={`<TkxDropdown
  trigger={<button>Country</button>}
  items={COUNTRY_ITEMS}
  searchable
  searchPlaceholder="Search countries…"
  onSelect={(key) => setSelectedCountry(key)}
/>`}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <TkxDropdown
            trigger={
              <TriggerBtn
                label={selectedCountry ? COUNTRY_ITEMS.find((i) => i.key === selectedCountry)?.label ?? 'Country' : 'Country'}
              />
            }
            items={COUNTRY_ITEMS}
            searchable
            searchPlaceholder="Search countries…"
            selectedKeys={selectedCountry ? [selectedCountry] : []}
            onSelect={(key) => setSelectedCountry(key)}
          />
          {selectedCountry && (
            <span style={{ fontSize: 13, opacity: 0.7 }}>
              Selected: {COUNTRY_ITEMS.find((i) => i.key === selectedCountry)?.label}
            </span>
          )}
        </div>
      </DemoSection>

      {/* 6. Danger Zone */}
      <DemoSection
        title="Danger Zone"
        description="Destructive account actions styled with danger:true render in red to signal irreversibility."
        code={`<TkxDropdown
  trigger={<button>Account</button>}
  items={[
    { key: 'export', label: 'Export Data' },
    { key: 'revoke', label: 'Revoke Access', danger: true, divider: true },
    { key: 'delete', label: 'Delete Account', danger: true },
  ]}
/>`}
      >
        <TkxDropdown
          trigger={<TriggerBtn label="Account" />}
          items={DANGER_ITEMS}
          onSelect={(key) => setLastAction(`Action: ${key}`)}
        />
      </DemoSection>

      {/* Props table */}
      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 56, marginBottom: 16 }}>TkxDropdownProps</h2>
      <PropTable props={DROPDOWN_PROPS} />

      <h2 style={{ fontSize: 22, fontWeight: 600, marginTop: 40, marginBottom: 16 }}>DropdownItem</h2>
      <PropTable props={ITEM_PROPS} />
    </div>
  );
}
