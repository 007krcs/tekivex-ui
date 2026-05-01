// ─────────────────────────────────────────────────────────────────────────────
// Component preview registry
//
// Maps slug → small live preview that renders the component with realistic
// dummy data so visitors can see what it does before filing an access
// request. Each preview is intentionally small (≤80 LOC) and uses
// representative-but-fictional data so consumers immediately understand
// the prop shape they'd pass.
//
// Coverage: the ~25 headline components shipped this quarter. The older
// 100+ primitives (Button, Avatar, Alert, etc.) remain "request-only"
// because the playground at /playground/ already covers them.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type ReactNode } from 'react';
import {
  TkxFlowChart, type FlowChartData,
  TkxFormBuilder, type FormSchema,
  TkxMindMap, type MindMapNode,
  TkxGantt, type GanttTask,
  TkxSpreadsheet, type SpreadsheetData,
  TkxFormulaBar,
  TkxPivotTable,
  TkxCommandPalette, type CommandPaletteCommand,
  TkxKanban, type TkxKanbanColumn,
  TkxCalendarHeatmap,
  TkxHolographicPanel,
  TkxHolographicGauge,
  TkxHolographicProgress,
  TkxHolographicTerminal,
  TkxHolographicCard,
  TkxHolographicAvatar,
  TkxHolographicBadge,
  TkxHolographicButton,
  TkxButton,
  TkxBadge,
  TkxAlert,
  TkxCard,
  TkxAvatar,
  TkxInput,
  TkxToggle,
  TkxProgress,
} from 'tekivex-ui';
import { TkxDataExplorer } from 'tekivex-ui/charts';
import {
  TkxScene,
  TkxStarfield,
  TkxParticleField,
  TkxPlanet,
  TkxOrbitPath,
  TkxHotspot,
  TkxPortal3D,
  TkxAvatar3D,
  TkxOrbitControls,
} from 'tekivex-3d';

// ── Wrapper to give every preview a consistent frame ───────────────────────

function PreviewFrame({ children, height = 320 }: { children: ReactNode; height?: number }) {
  return (
    <div
      style={{
        height,
        padding: 16,
        borderRadius: 12,
        background: 'rgba(8,10,25,0.55)',
        border: '1px solid rgba(196,168,255,0.2)',
        overflow: 'auto',
      }}
    >
      {children}
    </div>
  );
}

function Scene3D({ children, height = 320 }: { children: ReactNode; height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 12,
        background:
          'radial-gradient(ellipse at center, rgba(123,142,255,0.15), transparent 60%), #060615',
        border: '1px solid rgba(123,142,255,0.25)',
        overflow: 'hidden',
      }}
    >
      <TkxScene fov={60} cameraPosition={[0, 0.5, 5]} background="transparent">
        {children}
      </TkxScene>
    </div>
  );
}

// ── Productivity ───────────────────────────────────────────────────────────

function FlowChartPreview() {
  const [data, setData] = useState<FlowChartData>({
    nodes: [
      { id: 'a', label: 'Source',   x: 20,  y: 60, color: '#7b8eff' },
      { id: 'b', label: 'Build',    x: 200, y: 30, color: '#00f5d4' },
      { id: 'c', label: 'Test',     x: 200, y: 100, color: '#c4a8ff' },
      { id: 'd', label: 'Deploy',   x: 380, y: 65, color: '#ffbe0b' },
    ],
    edges: [
      { id: 'e1', from: 'a', to: 'b' },
      { id: 'e2', from: 'a', to: 'c' },
      { id: 'e3', from: 'b', to: 'd' },
      { id: 'e4', from: 'c', to: 'd' },
    ],
  });
  return (
    <PreviewFrame height={300}>
      <TkxFlowChart data={data} onChange={setData} height={260} />
    </PreviewFrame>
  );
}

function FormBuilderPreview() {
  const [schema, setSchema] = useState<FormSchema>({
    title: 'Contact form',
    fields: [
      { id: 'f1', type: 'text',  name: 'name',    label: 'Full name',    required: true },
      { id: 'f2', type: 'email', name: 'email',   label: 'Email',        required: true },
      { id: 'f3', type: 'select',name: 'topic',   label: 'Topic',        options: [
        { label: 'Sales',   value: 'sales' },
        { label: 'Support', value: 'support' },
      ]},
    ],
  });
  return (
    <PreviewFrame height={420}>
      <TkxFormBuilder schema={schema} onChange={setSchema} />
    </PreviewFrame>
  );
}

function MindMapPreview() {
  const tree: MindMapNode = {
    id: 'q4', label: 'Q4 plan',
    children: [
      { id: 'eng', label: 'Engineering', children: [
        { id: 'eng-1', label: 'Migrate auth' },
        { id: 'eng-2', label: 'Replatform CMS' },
      ]},
      { id: 'mkt', label: 'Marketing', children: [
        { id: 'mkt-1', label: 'Launch campaign' },
        { id: 'mkt-2', label: 'Update site copy' },
      ]},
      { id: 'ops', label: 'Operations' },
    ],
  };
  return (
    <PreviewFrame height={320}>
      <TkxMindMap root={tree} />
    </PreviewFrame>
  );
}

function GanttPreview() {
  const tasks: GanttTask[] = [
    { id: 't1', label: 'Design',  start: '2026-05-01', end: '2026-05-05', progress: 1 },
    { id: 't2', label: 'Build',   start: '2026-05-06', end: '2026-05-12', progress: 0.5, dependencies: ['t1'] },
    { id: 't3', label: 'Verify',  start: '2026-05-13', end: '2026-05-15', dependencies: ['t2'] },
    { id: 't4', label: 'Deploy',  start: '2026-05-16', end: '2026-05-17', dependencies: ['t3'] },
  ];
  return (
    <PreviewFrame height={300}>
      <TkxGantt tasks={tasks} />
    </PreviewFrame>
  );
}

function SpreadsheetPreview() {
  const [data, setData] = useState<SpreadsheetData>({
    cells: {
      A1: 'Item', B1: 'Qty', C1: 'Price', D1: 'Total',
      A2: 'Pen', B2: '3', C2: '2', D2: '=B2*C2',
      A3: 'Pad', B3: '5', C3: '4', D3: '=B3*C3',
      A4: 'Tape', B4: '2', C4: '6', D4: '=B4*C4',
      A5: 'Total', D5: '=SUM(D2:D4)',
    },
  });
  return (
    <PreviewFrame height={260}>
      <TkxSpreadsheet cols={4} rows={6} data={data} onChange={setData} />
    </PreviewFrame>
  );
}

function FormulaBarPreview() {
  const [data, setData] = useState<SpreadsheetData>({
    cells: { A1: '5', A2: '7', A3: '=A1+A2' },
  });
  const [active, setActive] = useState({ col: 0, row: 2 });
  return (
    <PreviewFrame height={220}>
      <TkxFormulaBar data={data} active={active} onChange={setData} onActiveChange={setActive} />
      <div style={{ height: 12 }} />
      <TkxSpreadsheet cols={2} rows={4} data={data} onChange={setData} />
    </PreviewFrame>
  );
}

function PivotTablePreview() {
  const sales = [
    { region: 'East', product: 'A', qty: 10, revenue: 100 },
    { region: 'East', product: 'B', qty: 7,  revenue: 70 },
    { region: 'West', product: 'A', qty: 4,  revenue: 40 },
    { region: 'West', product: 'B', qty: 8,  revenue: 80 },
  ];
  return (
    <PreviewFrame height={260}>
      <TkxPivotTable
        data={sales}
        rows={['region']}
        cols={['product']}
        values={[
          { field: 'qty',     agg: 'sum' },
          { field: 'revenue', agg: 'avg' },
        ]}
      />
    </PreviewFrame>
  );
}

function DataExplorerPreview() {
  const dummy = [
    { month: 'Jan', revenue: 120, cost: 80 },
    { month: 'Feb', revenue: 135, cost: 85 },
    { month: 'Mar', revenue: 160, cost: 90 },
    { month: 'Apr', revenue: 180, cost: 95 },
    { month: 'May', revenue: 210, cost: 110 },
    { month: 'Jun', revenue: 245, cost: 120 },
  ];
  return (
    <PreviewFrame height={520}>
      <TkxDataExplorer initialData={dummy} chartHeight={220} previewRows={3} />
    </PreviewFrame>
  );
}

function CommandPalettePreview() {
  const [open, setOpen] = useState(false);
  const commands: CommandPaletteCommand[] = [
    { id: 'open-settings', title: 'Open settings',     icon: '⚙️', section: 'App',  shortcut: ['⌘', ','] },
    { id: 'search',        title: 'Search docs',       icon: '🔍', section: 'App'  },
    { id: 'export',        title: 'Export project',    icon: '📤', section: 'Data', subtitle: 'Download as JSON' },
    { id: 'invite',        title: 'Invite teammate',   icon: '➕', section: 'Team' },
    { id: 'theme',         title: 'Toggle theme',      icon: '🌗', section: 'App',  shortcut: ['⌘', 'T'] },
  ];
  return (
    <PreviewFrame height={140}>
      <p style={{ color: '#b8b8d4', margin: '0 0 12px', fontSize: 13 }}>
        Press <kbd style={kbdStyle}>⌘K</kbd> / <kbd style={kbdStyle}>Ctrl K</kbd> or click the
        button to open. Try typing "set" or "exp".
      </p>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          padding: '8px 14px', borderRadius: 8,
          border: '1px solid rgba(196,168,255,0.4)',
          background: 'rgba(196,168,255,0.1)',
          color: '#c4a8ff', fontWeight: 700, cursor: 'pointer', fontSize: 13,
        }}
      >
        Open palette
      </button>
      <TkxCommandPalette commands={commands} open={open} onOpenChange={setOpen} />
    </PreviewFrame>
  );
}

function KanbanPreview() {
  const [cols, setCols] = useState<TkxKanbanColumn[]>([
    { id: 'todo',  title: 'To do',     cards: [{ id: 'c1', title: 'Wire payments' }, { id: 'c2', title: 'Doc review' }] },
    { id: 'doing', title: 'In progress', wipLimit: 2, cards: [{ id: 'c3', title: 'Refactor parser' }] },
    { id: 'done',  title: 'Done',      cards: [{ id: 'c4', title: 'Ship 3.15' }] },
  ]);
  return (
    <PreviewFrame height={300}>
      <TkxKanban
        columns={cols}
        onReorder={(e) => {
          // Apply the reorder so the card actually moves in the preview
          const next = cols.map((c) => ({ ...c, cards: [...c.cards] }));
          const from = next.find((c) => c.id === e.fromColumnId)!;
          const card = from.cards.splice(e.fromIndex, 1)[0];
          const to = next.find((c) => c.id === e.toColumnId)!;
          to.cards.splice(e.toIndex, 0, card);
          setCols(next);
        }}
      />
    </PreviewFrame>
  );
}

function CalendarHeatmapPreview() {
  // Generate a year of dummy activity counts
  const today = new Date();
  const data = Array.from({ length: 365 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (364 - i));
    const day = d.getDay();
    const isWeekday = day !== 0 && day !== 6;
    return {
      date: d.toISOString().slice(0, 10),
      value: isWeekday && Math.random() > 0.4 ? Math.floor(Math.random() * 12) : 0,
    };
  });
  return (
    <PreviewFrame height={240}>
      <TkxCalendarHeatmap data={data} />
    </PreviewFrame>
  );
}

// ── Holographic ────────────────────────────────────────────────────────────

function HolographicPanelPreview() {
  return (
    <PreviewFrame height={320}>
      <TkxHolographicPanel
        accent="#00f5d4"
        header={
          <>
            <div style={{ fontWeight: 700, color: '#fff' }}>Reactor core</div>
            <TkxHolographicBadge tone="success" size="sm">stable</TkxHolographicBadge>
          </>
        }
        footer={<TkxHolographicButton>SCRAM</TkxHolographicButton>}
      >
        <TkxHolographicProgress label="Coolant pressure" value={0.78} />
        <div style={{ height: 12 }} />
        <TkxHolographicProgress label="Shield integrity" value={0.92} accent="#7b2ff7" />
      </TkxHolographicPanel>
    </PreviewFrame>
  );
}

function HolographicGaugePreview() {
  return (
    <PreviewFrame height={200}>
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxHolographicGauge value={87} caption="oxygen" />
        <TkxHolographicGauge value={62} caption="fuel" accent="#3a86ff" />
        <TkxHolographicGauge value={28} caption="thermal" accent="#ff006e" />
      </div>
    </PreviewFrame>
  );
}

function HolographicProgressPreview() {
  return (
    <PreviewFrame height={220}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TkxHolographicProgress label="Upload"  value={0.72} valueLabel="248 / 344 MB" />
        <TkxHolographicProgress label="Cache hit rate" value={0.95} accent="#7b8eff" />
        <TkxHolographicProgress label="Battery" value={0.31} accent="#ffbe0b" />
        <TkxHolographicProgress label="Critical" value={0.08} accent="#ff006e" />
      </div>
    </PreviewFrame>
  );
}

function HolographicTerminalPreview() {
  const lines = [
    'systemctl start tekivex.service',
    '✓ tekivex.service started — pid 4127',
    'curl -X POST /api/build',
    '✓ Build queued: job-7f2a',
    '✓ Build complete in 12.4s',
    'kubectl rollout status deploy/tekivex',
    '✓ Rollout complete',
  ];
  return (
    <PreviewFrame height={280}>
      <TkxHolographicTerminal lines={lines} typeSpeed={20} />
    </PreviewFrame>
  );
}

function HolographicCardPreview() {
  return (
    <PreviewFrame height={260}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
        <TkxHolographicCard
          title={<span>🪪 Member · Gold</span>}
          style={{ width: 240, padding: 20 }}
          maxTilt={12}
        >
          <div style={{ fontSize: 13, color: '#dcdce8' }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Aria Solis</div>
            <div style={{ color: '#aaa', fontSize: 12 }}>since 2023</div>
            <div style={{ marginTop: 12, fontFamily: 'monospace', color: '#00f5d4' }}>
              0429 · 6132 · 8014
            </div>
          </div>
        </TkxHolographicCard>
      </div>
    </PreviewFrame>
  );
}

function HolographicAvatarPreview() {
  return (
    <PreviewFrame height={180}>
      <div style={{ display: 'flex', gap: 16, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxHolographicAvatar src="https://i.pravatar.cc/200?img=47" alt="Aria" size={72} />
        <TkxHolographicAvatar src="https://i.pravatar.cc/200?img=33" alt="Kenji" size={72} />
        <TkxHolographicAvatar src="https://i.pravatar.cc/200?img=15" alt="Idris" size={72} />
      </div>
    </PreviewFrame>
  );
}

function HolographicBadgePreview() {
  return (
    <PreviewFrame height={140}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxHolographicBadge tone="success">● live</TkxHolographicBadge>
        <TkxHolographicBadge tone="info">v3.15</TkxHolographicBadge>
        <TkxHolographicBadge tone="warning">beta</TkxHolographicBadge>
        <TkxHolographicBadge tone="danger">deprecated</TkxHolographicBadge>
        <TkxHolographicBadge tone="neutral">draft</TkxHolographicBadge>
      </div>
    </PreviewFrame>
  );
}

function HolographicButtonPreview() {
  return (
    <PreviewFrame height={140}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxHolographicButton>🚀 Launch</TkxHolographicButton>
        <TkxHolographicButton>📡 Boost comms</TkxHolographicButton>
        <TkxHolographicButton>💤 Hibernate</TkxHolographicButton>
      </div>
    </PreviewFrame>
  );
}

// ── 3D / 360° ──────────────────────────────────────────────────────────────

function StarfieldPreview() {
  return (
    <Scene3D height={280}>
      <TkxStarfield count={2000} radius={80} spinSpeed={0.01} />
    </Scene3D>
  );
}

function PlanetPreview() {
  return (
    <Scene3D height={280}>
      <TkxStarfield count={1500} radius={60} />
      <TkxPlanet position={[-1.4, 0, 0]} radius={1}   tint="#7ec8e3" glow glowColor="#3a86ff" />
      <TkxPlanet position={[1.6,  0, 0]} radius={1.3} tint="#ffd29c" ring />
      <TkxOrbitControls preset="showcase" autoRotate enableZoom={false} />
    </Scene3D>
  );
}

function OrbitPathPreview() {
  return (
    <Scene3D height={280}>
      <TkxStarfield count={1000} radius={60} />
      <TkxPlanet position={[0, 0, 0]} radius={0.7} />
      <TkxOrbitPath radius={1.6} bodyColor="#3a86ff" speed={0.7} bodySize={0.13} />
      <TkxOrbitPath radius={2.6} bodyColor="#ff006e" speed={0.5} bodySize={0.1}  inclination={0.4} />
      <TkxOrbitPath radius={3.6} bodyColor="#ffbe0b" speed={0.3} bodySize={0.08} inclination={-0.3} />
      <TkxOrbitControls preset="showcase" autoRotate enableZoom={false} />
    </Scene3D>
  );
}

function Portal3DPreview() {
  return (
    <Scene3D height={280}>
      <TkxStarfield count={1500} radius={60} />
      <TkxParticleField count={500} volume={[10, 10, 10]} />
      <TkxPortal3D position={[-1.5, 0, -2]} accent="#7b8eff" label="Andromeda" />
      <TkxPortal3D position={[1.5,  0, -2]} accent="#ffbe0b" label="Cygnus" radius={1.2} />
      <TkxOrbitControls preset="showcase" autoRotate enableZoom={false} />
    </Scene3D>
  );
}

function Avatar3DPreview() {
  const [state, setState] = useState<'idle' | 'talk' | 'cheer'>('idle');
  return (
    <PreviewFrame height={360}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        {(['idle', 'talk', 'cheer'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setState(s)}
            style={{
              padding: '6px 12px', minHeight: 32, borderRadius: 6,
              border: `1px solid ${state === s ? 'rgba(0,245,212,0.6)' : 'rgba(255,255,255,0.12)'}`,
              background: state === s ? 'rgba(0,245,212,0.14)' : 'transparent',
              color: state === s ? '#00f5d4' : '#aaa',
              cursor: 'pointer', fontSize: 12, fontWeight: 700, fontFamily: 'inherit',
            }}
          >
            {s}
          </button>
        ))}
      </div>
      <div style={{ height: 280, borderRadius: 10, overflow: 'hidden', background: '#060615' }}>
        <TkxScene fov={55} cameraPosition={[0, 1.1, 3.5]} background="transparent">
          <TkxStarfield count={800} radius={50} />
          <TkxAvatar3D state={state} accent="#7b8eff" halo={state === 'cheer'} />
        </TkxScene>
      </div>
    </PreviewFrame>
  );
}

// ── Common primitives ──────────────────────────────────────────────────────

function ButtonPreview() {
  return (
    <PreviewFrame height={160}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxButton variant="primary">Save</TkxButton>
        <TkxButton variant="secondary">Cancel</TkxButton>
        <TkxButton variant="ghost">Skip</TkxButton>
        <TkxButton variant="danger">Delete</TkxButton>
      </div>
    </PreviewFrame>
  );
}

function BadgePreview() {
  return (
    <PreviewFrame height={140}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxBadge variant="solid">12</TkxBadge>
        <TkxBadge variant="outline">draft</TkxBadge>
        <TkxBadge variant="solid">v3.15</TkxBadge>
        <TkxBadge variant="outline">beta</TkxBadge>
      </div>
    </PreviewFrame>
  );
}

function AlertPreview() {
  return (
    <PreviewFrame height={280}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <TkxAlert variant="info"    title="New version available">A minor update is ready to install.</TkxAlert>
        <TkxAlert variant="success" title="Saved">Your changes have been committed.</TkxAlert>
        <TkxAlert variant="warning" title="Approaching quota">85% of your monthly API budget is used.</TkxAlert>
        <TkxAlert variant="error"   title="Upload failed">The file exceeded the 10 MB limit.</TkxAlert>
      </div>
    </PreviewFrame>
  );
}

function CardPreview() {
  return (
    <PreviewFrame height={220}>
      <TkxCard variant="elevated" style={{ maxWidth: 360, margin: '0 auto' }}>
        <div style={{ padding: 16 }}>
          <h4 style={{ margin: '0 0 6px', color: '#fff' }}>Q4 retrospective</h4>
          <p style={{ margin: '0 0 12px', color: '#b8b8d4', fontSize: 13 }}>
            Three releases shipped, eight components added, zero security incidents.
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <TkxButton variant="primary">Read</TkxButton>
            <TkxButton variant="ghost">Skip</TkxButton>
          </div>
        </div>
      </TkxCard>
    </PreviewFrame>
  );
}

function AvatarPreview() {
  return (
    <PreviewFrame height={180}>
      <div style={{ display: 'flex', gap: 14, justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <TkxAvatar src="https://i.pravatar.cc/200?img=47" alt="Aria"  size="lg" status="online" />
        <TkxAvatar src="https://i.pravatar.cc/200?img=33" alt="Kenji" size="lg" status="busy" />
        <TkxAvatar src="https://i.pravatar.cc/200?img=15" alt="Idris" size="lg" status="offline" />
        <TkxAvatar name="Pat O'Reilly" size="lg" />
      </div>
    </PreviewFrame>
  );
}

function InputPreview() {
  const [a, setA] = useState('Aria Solis');
  const [b, setB] = useState('');
  return (
    <PreviewFrame height={220}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 360, margin: '0 auto' }}>
        <TkxInput label="Full name" value={a} onChange={(e) => setA(e.target.value)} />
        <TkxInput label="Email" type="email" value={b} onChange={(e) => setB(e.target.value)} placeholder="you@example.com" />
        <TkxInput label="API key" disabled value="****-****-****-****" />
      </div>
    </PreviewFrame>
  );
}

function TogglePreview() {
  const [a, setA] = useState(true);
  const [b, setB] = useState(false);
  const [c, setC] = useState(true);
  return (
    <PreviewFrame height={180}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 320, margin: '0 auto' }}>
        <Row label="Email notifications">
          <TkxToggle checked={a} onChange={setA} />
        </Row>
        <Row label="Beta features">
          <TkxToggle checked={b} onChange={setB} />
        </Row>
        <Row label="Two-factor auth">
          <TkxToggle checked={c} onChange={setC} />
        </Row>
      </div>
    </PreviewFrame>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, color: '#dcdce8' }}>
      <span>{label}</span>
      {children}
    </div>
  );
}

function ProgressPreview() {
  return (
    <PreviewFrame height={200}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <TkxProgress value={32} label="Build artifacts" />
        <TkxProgress value={78} label="Test coverage"  variant="success" />
        <TkxProgress value={12} label="Storage used"   variant="warning" />
      </div>
    </PreviewFrame>
  );
}

function HotspotPreview() {
  return (
    <Scene3D height={280}>
      <TkxStarfield count={1500} radius={60} />
      <TkxPlanet position={[0, 0, 0]} radius={1.2} glow glowColor="#00f5d4" />
      <TkxHotspot position={[0, 1.6, 0]} label="Mission base" />
      <TkxHotspot position={[1.5, 0.5, 0]} label="Sensor array" color="#ff006e" />
      <TkxOrbitControls preset="showcase" autoRotate enableZoom={false} />
    </Scene3D>
  );
}

const kbdStyle: React.CSSProperties = {
  fontSize: 10,
  fontWeight: 700,
  padding: '1px 5px',
  borderRadius: 3,
  border: '1px solid rgba(255,255,255,0.18)',
  background: 'rgba(255,255,255,0.04)',
  color: '#dcdce8',
  fontFamily: 'ui-monospace, monospace',
};

// ── Registry ────────────────────────────────────────────────────────────────

export const PREVIEWS: Record<string, () => JSX.Element> = {
  'flow-chart':           FlowChartPreview,
  'form-builder':         FormBuilderPreview,
  'mind-map':             MindMapPreview,
  'gantt':                GanttPreview,
  'spreadsheet':          SpreadsheetPreview,
  'formula-bar':          FormulaBarPreview,
  'pivot-table':          PivotTablePreview,
  'data-explorer':        DataExplorerPreview,
  'command-palette':      CommandPalettePreview,
  'kanban':               KanbanPreview,
  'calendar-heatmap':     CalendarHeatmapPreview,

  'holographic-panel':    HolographicPanelPreview,
  'holographic-gauge':    HolographicGaugePreview,
  'holographic-progress': HolographicProgressPreview,
  'holographic-terminal': HolographicTerminalPreview,
  'holographic-card':     HolographicCardPreview,
  'holographic-avatar':   HolographicAvatarPreview,
  'holographic-badge':    HolographicBadgePreview,
  'holographic-button':   HolographicButtonPreview,

  'starfield':            StarfieldPreview,
  'planet':               PlanetPreview,
  'orbit-path':           OrbitPathPreview,
  'portal-3d':            Portal3DPreview,
  'avatar-3d':            Avatar3DPreview,
  'hotspot':              HotspotPreview,

  // Common primitives
  'button':               ButtonPreview,
  'badge':                BadgePreview,
  'alert':                AlertPreview,
  'card':                 CardPreview,
  'avatar':               AvatarPreview,
  'input':                InputPreview,
  'toggle':               TogglePreview,
  'progress':             ProgressPreview,
};

export function hasPreview(slug: string): boolean {
  return slug in PREVIEWS;
}
