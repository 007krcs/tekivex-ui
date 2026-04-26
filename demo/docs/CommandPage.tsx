import { useState, useEffect } from 'react';
import { TkxCommand, useTkxCommand, type ThemeTokens, type CommandItem } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';

const COMMANDS: CommandItem[] = [
  // File group
  {
    id: 'new-document',
    label: 'New Document',
    description: 'Create a new empty document',
    shortcut: '\u2318N',
    group: 'File',
    keywords: ['create', 'blank', 'new'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'open-file',
    label: 'Open File\u2026',
    description: 'Browse and open a file from disk',
    shortcut: '\u2318O',
    group: 'File',
    keywords: ['browse', 'load', 'open'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4a1 1 0 011-1h3.5l1.5 2H13a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'save',
    label: 'Save',
    description: 'Save the current file',
    shortcut: '\u2318S',
    group: 'File',
    keywords: ['write', 'persist'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 2h8l2 2v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="5" y="9" width="6" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="5" y="2" width="5" height="3" rx="0.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    id: 'save-as',
    label: 'Save As\u2026',
    description: 'Save a copy to a new location',
    shortcut: '\u21E7\u2318S',
    group: 'File',
    keywords: ['export', 'copy', 'rename'],
  },
  // Edit group
  {
    id: 'find-replace',
    label: 'Find & Replace',
    description: 'Search and replace text in the document',
    shortcut: '\u2318H',
    group: 'Edit',
    keywords: ['search', 'change', 'substitute'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'select-all',
    label: 'Select All',
    description: 'Select all content in the current view',
    shortcut: '\u2318A',
    group: 'Edit',
    keywords: ['highlight', 'all'],
  },
  {
    id: 'undo',
    label: 'Undo',
    description: 'Undo the last action',
    shortcut: '\u2318Z',
    group: 'Edit',
    keywords: ['revert', 'back'],
  },
  // View group
  {
    id: 'toggle-theme',
    label: 'Toggle Theme',
    description: 'Switch between light and dark mode',
    shortcut: '\u2318\u21E7L',
    group: 'View',
    keywords: ['dark', 'light', 'mode', 'color scheme'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1.5v1M8 13.5v1M1.5 8h1M13.5 8h1M3.4 3.4l.7.7M11.9 11.9l.7.7M3.4 12.6l.7-.7M11.9 4.1l.7-.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'command-palette',
    label: 'Command Palette',
    description: 'Open the command palette',
    shortcut: '\u2318K',
    group: 'View',
    keywords: ['commands', 'actions', 'quick open'],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Open application preferences',
    shortcut: '\u2318,',
    group: 'View',
    keywords: ['preferences', 'config', 'options'],
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 1v2M8 13v2M1 8h2M13 8h2M2.93 2.93l1.41 1.41M11.66 11.66l1.41 1.41M2.93 13.07l1.41-1.41M11.66 4.34l1.41-1.41" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

export function CommandPage({ theme }: { theme: ThemeTokens }) {
  const cmd = useTkxCommand();
  const [lastAction, setLastAction] = useState<string | null>(null);

  // Global Cmd+K / Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        cmd.toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [cmd]);

  const kbdStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '3px',
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: '5px',
    padding: '3px 8px',
    fontSize: '12px',
    fontFamily: 'monospace',
    color: theme.text,
    boxShadow: `0 1px 0 ${theme.border}`,
  };

  const btnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    background: theme.primary,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const tableWrapStyle = {
    overflowX: 'auto' as const,
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '14px',
  };

  const thStyle = {
    background: theme.surfaceAlt,
    color: theme.textMuted,
    fontWeight: 600,
    padding: '10px 16px',
    textAlign: 'left' as const,
    borderBottom: `1px solid ${theme.border}`,
    fontSize: '12px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.06em',
  };

  const tdStyle = {
    padding: '10px 16px',
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
    verticalAlign: 'top' as const,
  };

  const codeStyle = {
    background: theme.surfaceAlt,
    border: `1px solid ${theme.border}`,
    borderRadius: '4px',
    padding: '1px 6px',
    fontFamily: 'monospace',
    fontSize: '12px',
    color: theme.primary,
  };

  const props = [
    { name: 'items', type: 'CommandItem[]', default: '\u2014', description: 'Array of command items to display and search through.' },
    { name: 'isOpen', type: 'boolean', default: 'false', description: 'Controls whether the palette overlay is visible.' },
    { name: 'onClose', type: '() => void', default: '\u2014', description: 'Called when the palette should be dismissed (Escape, backdrop click).' },
    { name: 'placeholder', type: 'string', default: "'Type a command\u2026'", description: 'Placeholder text shown in the search input.' },
    { name: 'emptyMessage', type: 'string', default: '\u2014', description: 'Message shown when no commands match the current query.' },
    { name: 'maxItems', type: 'number', default: '8', description: 'Maximum number of results to render at once.' },
    { name: 'onItemSelect', type: '(item: CommandItem) => void', default: '\u2014', description: 'Called when a command item is selected (in addition to item.onSelect).' },
    { name: 'style', type: 'CSSProperties', default: '\u2014', description: 'Inline style override for the palette panel.' },
  ];

  const hookProps = [
    { name: 'isOpen', type: 'boolean', description: 'Current open state of the palette.' },
    { name: 'open()', type: '() => void', description: 'Opens the palette.' },
    { name: 'close()', type: '() => void', description: 'Closes the palette.' },
    { name: 'toggle()', type: '() => void', description: 'Toggles open/closed.' },
  ];

  return (
    <div style={{ background: theme.bg, minHeight: '100vh', padding: '48px 32px', color: theme.text }}>
      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: theme.text, margin: '0 0 10px' }}>
          TkxCommand
        </h1>
        <p style={{ fontSize: '16px', color: theme.textMuted, margin: 0, maxWidth: '600px' }}>
          A fuzzy-search command palette with keyboard navigation, group headers, shortcut display,
          and a focus trap. Press <span style={kbdStyle}>{'\u2318'}K</span> or <span style={kbdStyle}>Ctrl K</span> to open.
        </p>
      </div>

      {/* Live demo */}
      <DemoSection
        title="Live Demo"
        description="Click the button or press Cmd+K / Ctrl+K to open the command palette. Try searching for commands."
        theme={theme}
        code={`import { TkxCommand, useTkxCommand } from 'tekivex-ui';
import type { CommandItem } from 'tekivex-ui';

const commands: CommandItem[] = [
  { id: 'save', label: 'Save', shortcut: '\u2318S', group: 'File' },
  { id: 'find', label: 'Find & Replace', shortcut: '\u2318H', group: 'Edit' },
];

function App() {
  const cmd = useTkxCommand();

  return (
    <>
      <button onClick={cmd.open}>Open Command Palette</button>
      <TkxCommand
        isOpen={cmd.isOpen}
        onClose={cmd.close}
        items={commands}
        placeholder="Search commands\u2026"
        onItemSelect={(item) => {
          console.log(item.label);
          cmd.close();
        }}
      />
    </>
  );
}`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <button style={btnStyle} onClick={cmd.open}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="6.5" cy="6.5" r="4" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 10l3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              Open Command Palette
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={kbdStyle}>{'\u2318'}</span>
              <span style={{ color: theme.textMuted, fontSize: '13px' }}>+</span>
              <span style={kbdStyle}>K</span>
              <span style={{ color: theme.textMuted, fontSize: '13px', marginLeft: '4px' }}>
                also works globally
              </span>
            </div>

            {lastAction && (
              <div
                style={{
                  background: theme.surfaceAlt,
                  border: `1px solid ${theme.border}`,
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '13px',
                  color: theme.success,
                }}
              >
                Ran: <strong>{lastAction}</strong>
              </div>
            )}
          </div>
        </div>
      </DemoSection>

      {/* Keyboard shortcuts reference */}
      <DemoSection
        title="Keyboard Shortcuts (inside palette)"
        description="Navigation keys available when the command palette is open."
        theme={theme}
        code={`// Keyboard navigation is built-in:
// Arrow Up/Down — Navigate items
// Enter — Select focused item
// Escape — Close palette
// Tab / Shift+Tab — Move focus forward / back`}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px 24px',
          }}
        >
          {[
            { keys: ['\u2191', '\u2193'], action: 'Navigate items' },
            { keys: ['\u21B5'], action: 'Select focused item' },
            { keys: ['Esc'], action: 'Close palette' },
            { keys: ['Tab', '\u21E7Tab'], action: 'Move focus forward / back' },
          ].map(({ keys, action }) => (
            <div key={action} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                {keys.map((k) => (
                  <span key={k} style={kbdStyle}>{k}</span>
                ))}
              </div>
              <span style={{ fontSize: '13px', color: theme.textMuted }}>{action}</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* The actual command palette (rendered via portal) */}
      <TkxCommand
        isOpen={cmd.isOpen}
        onClose={cmd.close}
        items={COMMANDS}
        placeholder="Search commands\u2026"
        emptyMessage="No matching commands found."
        onItemSelect={(item) => {
          setLastAction(item.label);
          cmd.close();
        }}
      />

      {/* Props table -- TkxCommand */}
      <div style={{ marginTop: '56px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, marginBottom: '16px' }}>
          TkxCommand props
        </h2>
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Prop</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Default</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {props.map((p, i) => (
                <tr
                  key={p.name}
                  style={{ background: i % 2 === 0 ? 'transparent' : theme.surfaceAlt }}
                >
                  <td style={tdStyle}>
                    <code style={codeStyle}>{p.name}</code>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: theme.secondary }}>
                    {p.type}
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: theme.textMuted }}>
                    {p.default}
                  </td>
                  <td style={{ ...tdStyle, color: theme.textMuted }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* useTkxCommand hook */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
          useTkxCommand hook
        </h2>
        <p style={{ fontSize: '14px', color: theme.textMuted, marginBottom: '16px' }}>
          Convenience hook that manages the <code style={codeStyle}>isOpen</code> state for you.
        </p>
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Returned value</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {hookProps.map((p, i) => (
                <tr
                  key={p.name}
                  style={{ background: i % 2 === 0 ? 'transparent' : theme.surfaceAlt }}
                >
                  <td style={tdStyle}>
                    <code style={codeStyle}>{p.name}</code>
                  </td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: theme.secondary }}>
                    {p.type}
                  </td>
                  <td style={{ ...tdStyle, color: theme.textMuted }}>{p.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CommandItem shape */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: theme.text, marginBottom: '8px' }}>
          CommandItem shape
        </h2>
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Field</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Description</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'id', type: 'string', desc: 'Unique identifier for the item.' },
                { name: 'label', type: 'string', desc: 'Primary display text, also searched.' },
                { name: 'description', type: 'string?', desc: 'Secondary line shown below the label.' },
                { name: 'icon', type: 'ReactNode?', desc: 'Leading icon element.' },
                { name: 'shortcut', type: 'string?', desc: 'Keyboard shortcut string shown on the right.' },
                { name: 'group', type: 'string?', desc: 'Group heading; items with the same group are grouped together.' },
                { name: 'keywords', type: 'string[]?', desc: 'Extra terms to match during search.' },
                { name: 'disabled', type: 'boolean?', desc: 'Renders the item as non-interactive.' },
                { name: 'onSelect', type: '() => void?', desc: 'Called when the item is activated.' },
              ].map((p, i) => (
                <tr
                  key={p.name}
                  style={{ background: i % 2 === 0 ? 'transparent' : theme.surfaceAlt }}
                >
                  <td style={tdStyle}><code style={codeStyle}>{p.name}</code></td>
                  <td style={{ ...tdStyle, fontFamily: 'monospace', fontSize: '12px', color: theme.secondary }}>
                    {p.type}
                  </td>
                  <td style={{ ...tdStyle, color: theme.textMuted }}>{p.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
