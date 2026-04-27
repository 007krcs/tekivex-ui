import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxOrgChart, type OrgNode } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const ORGCHART_PROPS = [
  { name: 'data', type: 'OrgNode', required: true, description: 'Root node of the tree.' },
  { name: 'direction', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'Layout direction of the chart.' },
  { name: 'interactive', type: 'boolean', default: 'true', description: 'Enable pan/zoom interactions.' },
  { name: 'initialZoom', type: 'number', default: '1', description: 'Initial zoom level (0.25 – 4).' },
  { name: 'nodeWidth', type: 'number', default: '200', description: 'Width of each node card in px.' },
  { name: 'nodeHeight', type: 'number', default: '84', description: 'Height of each node card in px.' },
  { name: 'siblingGap', type: 'number', default: '28', description: 'Horizontal gap between sibling nodes.' },
  { name: 'levelGap', type: 'number', default: '64', description: 'Vertical gap between levels.' },
  { name: 'collapsedByDefault', type: 'boolean', default: 'false', description: 'Start with all subtrees collapsed except the root.' },
  { name: 'onNodeClick', type: '(node: OrgNode) => void', default: 'undefined', description: 'Click handler for nodes.' },
  { name: 'renderNode', type: '(node, isActive) => ReactNode', default: 'undefined', description: 'Custom node renderer.' },
  { name: 'height', type: 'number | string', default: '560', description: 'Container height.' },
  { name: 'ariaLabel', type: 'string', default: "'Organizational chart'", description: 'Accessible label for the chart region.' },
];

const ORGNODE_PROPS = [
  { name: 'id', type: 'string', required: true, description: 'Unique node id.' },
  { name: 'label', type: 'string', required: true, description: 'Primary label (name / role / department).' },
  { name: 'subLabel', type: 'string', default: 'undefined', description: 'Secondary label (title / role detail).' },
  { name: 'badge', type: 'string', default: 'undefined', description: 'Short badge text ("Manager", "FT", "R&D").' },
  { name: 'avatar', type: 'string', default: 'undefined', description: 'Avatar URL. javascript:/data: URLs are blocked by SecurityCore.' },
  { name: 'accent', type: 'string', default: 'undefined', description: 'Color accent for the node card.' },
  { name: 'children', type: 'OrgNode[]', default: 'undefined', description: 'Child nodes.' },
  { name: 'meta', type: 'Record<string, unknown>', default: 'undefined', description: 'Arbitrary metadata passed to onNodeClick.' },
];

// ── Sample data ───────────────────────────────────────────────────────────────

const COMPANY: OrgNode = {
  id: 'ceo',
  label: 'Ada Lovelace',
  subLabel: 'Chief Executive Officer',
  badge: 'CEO',
  children: [
    {
      id: 'cto',
      label: 'Linus Torvalds',
      subLabel: 'Chief Technology Officer',
      badge: 'CTO',
      children: [
        { id: 'eng-lead', label: 'Grace Hopper', subLabel: 'VP Engineering', badge: 'VP' },
        { id: 'sec-lead', label: 'Bruce Schneier', subLabel: 'VP Security', badge: 'VP' },
        { id: 'data-lead', label: 'Hilary Mason', subLabel: 'VP Data', badge: 'VP' },
      ],
    },
    {
      id: 'cpo',
      label: 'Julie Zhuo',
      subLabel: 'Chief Product Officer',
      badge: 'CPO',
      children: [
        { id: 'pm-lead', label: 'Marty Cagan', subLabel: 'Head of Product' },
        { id: 'design-lead', label: 'Don Norman', subLabel: 'Head of Design' },
      ],
    },
    {
      id: 'cfo',
      label: 'Ruth Porat',
      subLabel: 'Chief Financial Officer',
      badge: 'CFO',
    },
  ],
};

const SMALL_TEAM: OrgNode = {
  id: 'lead',
  label: 'Team Lead',
  subLabel: 'Engineering',
  children: [
    { id: 'a', label: 'Engineer A', subLabel: 'Frontend' },
    { id: 'b', label: 'Engineer B', subLabel: 'Backend' },
    { id: 'c', label: 'Engineer C', subLabel: 'QA' },
  ],
};

// ── Page ──────────────────────────────────────────────────────────────────────

export function OrgChartPage({ theme }: { theme: ThemeTokens }) {
  const [lastClicked, setLastClicked] = useState<string>('—');

  const pageStyle = {
    padding: '32px clamp(16px, 4vw, 48px) 64px',
    maxWidth: 1200,
    margin: '0 auto',
    color: theme.text,
  };
  const headingStyle = {
    fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
    fontWeight: 800,
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  };
  const leadStyle = {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 1.7,
    margin: '0 0 24px',
    maxWidth: 760,
  };
  const pillStyle = {
    display: 'inline-block',
    padding: '4px 12px',
    borderRadius: 999,
    background: `${theme.success}18`,
    border: `1px solid ${theme.success}44`,
    color: theme.success,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: '0.05em',
  };

  return (
    <div style={pageStyle}>
      <div style={pillStyle}>SHIPPED IN v2.6 · STABLE IN v3.0</div>
      <h1 style={headingStyle}>TkxOrgChart</h1>
      <p style={leadStyle}>
        A production-grade organizational chart component using the Reingold–Tilford tree-layout
        algorithm. Pan, zoom, collapse subtrees, click nodes, and render fully custom cards.
        Fully accessible — renders as nested <code>role="tree"</code> / <code>role="treeitem"</code>
        with <code>aria-level</code> and keyboard navigation. All labels, sub-labels and avatar
        URLs are sanitised by SecurityCore.
      </p>

      {/* Basic vertical */}
      <DemoSection
        theme={theme}
        title="Basic org chart"
        description="A vertical tree with three levels. Drag to pan, scroll/pinch to zoom, click the ⊖ on a node to collapse its subtree."
        code={`import { TkxOrgChart, type OrgNode } from 'tekivex-ui';

const data: OrgNode = {
  id: 'ceo',
  label: 'Ada Lovelace',
  subLabel: 'Chief Executive Officer',
  badge: 'CEO',
  children: [
    { id: 'cto', label: 'Linus Torvalds', subLabel: 'CTO', badge: 'CTO', children: [...] },
    { id: 'cpo', label: 'Julie Zhuo',     subLabel: 'CPO', badge: 'CPO', children: [...] },
    { id: 'cfo', label: 'Ruth Porat',     subLabel: 'CFO', badge: 'CFO' },
  ],
};

<TkxOrgChart data={data} height={520} />`}
      >
        <TkxOrgChart
          data={COMPANY}
          height={520}
          onNodeClick={(n) => setLastClicked(n.label)}
          ariaLabel="Example company org chart"
        />
        <p style={{ marginTop: 12, fontSize: 13, color: theme.textMuted }}>
          Last clicked node: <strong style={{ color: theme.primary }}>{lastClicked}</strong>
        </p>
      </DemoSection>

      {/* Horizontal direction */}
      <DemoSection
        theme={theme}
        title="Horizontal layout"
        description="Rotate the tree 90° — useful for wide org structures with fewer levels."
        code={`<TkxOrgChart data={data} direction="horizontal" height={360} />`}
      >
        <TkxOrgChart
          data={SMALL_TEAM}
          direction="horizontal"
          height={360}
          ariaLabel="Horizontal small-team chart"
        />
      </DemoSection>

      {/* Collapsed by default */}
      <DemoSection
        theme={theme}
        title="Collapsed by default"
        description="Initial state shows only the root — useful for very large trees. Click ⊕ on a node to expand."
        code={`<TkxOrgChart data={data} collapsedByDefault height={360} />`}
      >
        <TkxOrgChart
          data={COMPANY}
          collapsedByDefault
          height={360}
          ariaLabel="Collapsed by default chart"
        />
      </DemoSection>

      {/* Custom renderer */}
      <DemoSection
        theme={theme}
        title="Custom node renderer"
        description="Take full control over what each card looks like. The render function receives the node and an isActive flag."
        code={`<TkxOrgChart
  data={data}
  nodeWidth={220}
  nodeHeight={96}
  renderNode={(node, isActive) => (
    <div style={{
      width: 220, height: 96, padding: 12,
      borderRadius: 12,
      background: isActive ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : '#1a1a2e',
      color: '#fff', border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{ fontWeight: 700 }}>{node.label}</div>
      <div style={{ opacity: 0.7, fontSize: 12 }}>{node.subLabel}</div>
    </div>
  )}
/>`}
      >
        <TkxOrgChart
          data={COMPANY}
          nodeWidth={220}
          nodeHeight={96}
          height={520}
          renderNode={(node, isActive) => (
            <div
              style={{
                width: 220,
                height: 96,
                padding: 12,
                borderRadius: 12,
                background: isActive
                  ? `linear-gradient(135deg, ${theme.primary}, #06b6d4)`
                  : theme.surface,
                color: isActive ? '#fff' : theme.text,
                border: `1px solid ${isActive ? theme.primary : theme.border}`,
                boxShadow: isActive ? `0 8px 24px -8px ${theme.primary}88` : 'none',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div style={{ fontWeight: 700, fontSize: 14 }}>{node.label}</div>
              <div style={{ opacity: 0.75, fontSize: 12, marginTop: 2 }}>{node.subLabel}</div>
              {node.badge && (
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    opacity: 0.7,
                  }}
                >
                  {node.badge}
                </div>
              )}
            </div>
          )}
        />
      </DemoSection>

      <PropTable title="TkxOrgChart props" props={ORGCHART_PROPS} />
      <PropTable title="OrgNode shape" props={ORGNODE_PROPS} />
    </div>
  );
}
