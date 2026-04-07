import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxTreeView } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const TREE_VIEW_PROPS = [
  { name: 'data', type: 'TreeNode[]', default: '—', description: 'Array of root tree nodes. Each node can contain nested children arrays for hierarchical data.' },
  { name: 'selected', type: 'string[]', default: 'undefined', description: 'Array of selected node IDs (controlled). Use with onSelect for controlled selection.' },
  { name: 'onSelect', type: '(ids: string[]) => void', default: 'undefined', description: 'Callback fired when selection changes. Receives the full array of selected IDs.' },
  { name: 'expanded', type: 'string[]', default: 'undefined', description: 'Array of expanded node IDs (controlled). Use with onExpand for controlled expansion.' },
  { name: 'onExpand', type: '(ids: string[]) => void', default: 'undefined', description: 'Callback fired when expanded nodes change. Receives the full array of expanded IDs.' },
  { name: 'multiSelect', type: 'boolean', default: 'false', description: 'Enables multi-selection mode. Multiple nodes can be selected simultaneously.' },
  { name: 'showCheckboxes', type: 'boolean', default: 'false', description: 'Renders a checkbox before each node label. Typically paired with multiSelect.' },
  { name: 'showLines', type: 'boolean', default: 'false', description: 'Renders vertical and horizontal connector lines between parent and child nodes.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged with built-in tkx() classes.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on top of base styles.' },
];

const TREE_NODE_PROPS = [
  { name: 'id', type: 'string', default: '—', description: 'Unique identifier for the node.' },
  { name: 'label', type: 'string', default: '—', description: 'Display text for the node.' },
  { name: 'icon', type: 'ReactNode', default: 'undefined', description: 'Optional icon rendered before the label.' },
  { name: 'children', type: 'TreeNode[]', default: 'undefined', description: 'Nested child nodes. Presence of children makes the node expandable.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'When true, the node cannot be selected or expanded.' },
];

// ── Inline icons ──────────────────────────────────────────────────────────────

function IconFolder({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconFile({ color = 'currentColor' }: { color?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

// ── Sample data ──────────────────────────────────────────────────────────────

const BASIC_TREE = [
  {
    id: 'src',
    label: 'src',
    children: [
      {
        id: 'components',
        label: 'components',
        children: [
          { id: 'button', label: 'Button.tsx' },
          { id: 'input', label: 'Input.tsx' },
          { id: 'modal', label: 'Modal.tsx' },
        ],
      },
      {
        id: 'hooks',
        label: 'hooks',
        children: [
          { id: 'usestate', label: 'useState.ts' },
          { id: 'useeffect', label: 'useEffect.ts' },
        ],
      },
      { id: 'index', label: 'index.ts' },
    ],
  },
  {
    id: 'public',
    label: 'public',
    children: [
      { id: 'favicon', label: 'favicon.ico' },
      { id: 'indexhtml', label: 'index.html' },
    ],
  },
  { id: 'package', label: 'package.json' },
  { id: 'readme', label: 'README.md' },
];

const ICON_TREE = [
  {
    id: 'docs',
    label: 'Documents',
    icon: <IconFolder color="currentColor" />,
    children: [
      {
        id: 'work',
        label: 'Work',
        icon: <IconFolder color="currentColor" />,
        children: [
          { id: 'report', label: 'report.pdf', icon: <IconFile color="currentColor" /> },
          { id: 'slides', label: 'slides.pptx', icon: <IconFile color="currentColor" /> },
        ],
      },
      {
        id: 'personal',
        label: 'Personal',
        icon: <IconFolder color="currentColor" />,
        children: [
          { id: 'notes', label: 'notes.txt', icon: <IconFile color="currentColor" /> },
          { id: 'todo', label: 'todo.md', icon: <IconFile color="currentColor" />, disabled: true },
        ],
      },
    ],
  },
  {
    id: 'photos',
    label: 'Photos',
    icon: <IconFolder color="currentColor" />,
    children: [
      { id: 'vacation', label: 'vacation.jpg', icon: <IconFile color="currentColor" /> },
      { id: 'profile', label: 'profile.png', icon: <IconFile color="currentColor" /> },
    ],
  },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function TreeViewPage({ theme }: { theme: ThemeTokens }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>(['src', 'components']);
  const [checkSelected, setCheckSelected] = useState<string[]>([]);
  const [lineExpanded, setLineExpanded] = useState<string[]>(['docs', 'work', 'personal']);
  const [multiSelected, setMultiSelected] = useState<string[]>([]);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxTreeView
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A hierarchical tree component for displaying nested data structures. Supports
        expand/collapse, single and multi-selection, checkboxes, connector lines, and
        keyboard navigation.
      </p>

      {/* ── 1. Basic Tree ── */}
      <DemoSection
        title="Basic Tree"
        description="A file-system style tree with expandable folders. Click a node to select it, click the expand arrow to toggle children visibility."
        theme={theme}
        code={`const [selected, setSelected] = useState<string[]>([]);
const [expanded, setExpanded] = useState<string[]>(['src']);

<TkxTreeView
  data={[
    { id: 'src', label: 'src', children: [
      { id: 'components', label: 'components', children: [
        { id: 'button', label: 'Button.tsx' },
        { id: 'input', label: 'Input.tsx' },
      ]},
      { id: 'index', label: 'index.ts' },
    ]},
    { id: 'package', label: 'package.json' },
  ]}
  selected={selected}
  onSelect={setSelected}
  expanded={expanded}
  onExpand={setExpanded}
/>`}
      >
        <div style={{ maxWidth: '400px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', backgroundColor: theme.surface }}>
          <TkxTreeView
            data={BASIC_TREE}
            selected={selected}
            onSelect={setSelected}
            expanded={expanded}
            onExpand={setExpanded}
          />
        </div>
        {selected.length > 0 && (
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '12px' }}>
            Selected: <strong style={{ color: theme.primary }}>{selected.join(', ')}</strong>
          </p>
        )}
      </DemoSection>

      {/* ── 2. With Checkboxes ── */}
      <DemoSection
        title="With Checkboxes"
        description="Enable showCheckboxes to render a checkbox before each node label. Pair with multiSelect to allow selecting multiple items."
        theme={theme}
        code={`<TkxTreeView
  data={treeData}
  showCheckboxes
  multiSelect
  selected={selected}
  onSelect={setSelected}
/>`}
      >
        <div style={{ maxWidth: '400px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', backgroundColor: theme.surface }}>
          <TkxTreeView
            data={BASIC_TREE}
            showCheckboxes
            multiSelect
            selected={checkSelected}
            onSelect={setCheckSelected}
            expanded={['src', 'components', 'hooks']}
          />
        </div>
        {checkSelected.length > 0 && (
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '12px' }}>
            Checked: <strong style={{ color: theme.primary }}>{checkSelected.join(', ')}</strong>
          </p>
        )}
      </DemoSection>

      {/* ── 3. With Lines ── */}
      <DemoSection
        title="With Connector Lines"
        description="Enable showLines to render vertical and horizontal connector lines between parent and child nodes, making the hierarchy visually clearer."
        theme={theme}
        code={`<TkxTreeView
  data={treeData}
  showLines
  expanded={expanded}
  onExpand={setExpanded}
/>`}
      >
        <div style={{ maxWidth: '400px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', backgroundColor: theme.surface }}>
          <TkxTreeView
            data={ICON_TREE}
            showLines
            expanded={lineExpanded}
            onExpand={setLineExpanded}
          />
        </div>
      </DemoSection>

      {/* ── 4. Multi-Select ── */}
      <DemoSection
        title="Multi-Select"
        description="With multiSelect enabled (without checkboxes), clicking nodes adds or removes them from the selection. Hold Ctrl/Cmd for additive selection."
        theme={theme}
        code={`<TkxTreeView
  data={treeData}
  multiSelect
  selected={selected}
  onSelect={setSelected}
/>`}
      >
        <div style={{ maxWidth: '400px', border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '12px', backgroundColor: theme.surface }}>
          <TkxTreeView
            data={ICON_TREE}
            multiSelect
            selected={multiSelected}
            onSelect={setMultiSelected}
            expanded={['docs', 'work', 'personal', 'photos']}
          />
        </div>
        {multiSelected.length > 0 && (
          <p style={{ fontSize: '13px', color: theme.textMuted, marginTop: '12px' }}>
            Selected ({multiSelected.length}): <strong style={{ color: theme.primary }}>{multiSelected.join(', ')}</strong>
          </p>
        )}
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        TkxTreeViewProps
      </h3>
      <div style={{ marginBottom: '32px' }}>
        <PropTable props={TREE_VIEW_PROPS} />
      </div>

      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: theme.text, margin: '0 0 12px' }}>
        TreeNode
      </h3>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={TREE_NODE_PROPS} />
      </div>
    </div>
  );
}
