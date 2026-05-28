// ─────────────────────────────────────────────────────────────────────────────
// FlowChartDemo — landing section
// Wraps examples/flow-chart/PipelineEditor.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { PipelineEditor } from '../../../examples/flow-chart/PipelineEditor';

const SNIPPET = `import { TkxFlowChart, type FlowChartData } from 'tekivex-ui';

const [data, setData] = useState<FlowChartData>({
  nodes: [
    { id: 'a', label: 'Pull from main', x: 40,  y: 60 },
    { id: 'b', label: 'Run tests',      x: 240, y: 60 },
    { id: 'c', label: 'Deploy',         x: 440, y: 60 },
  ],
  edges: [
    { id: 'e1', from: 'a', to: 'b' },
    { id: 'e2', from: 'b', to: 'c' },
  ],
});

<TkxFlowChart
  data={data}
  onChange={setData}
  height={420}
  renderNode={(n, isSelected) => /* custom node UI */}
/>`;

export function FlowChartDemo() {
  return (
    <section
      id="flow-chart"
      style={{
        position: 'relative',
        padding: 'clamp(64px, 9vw, 120px) 24px',
        maxWidth: 1280,
        margin: '0 auto',
        zIndex: 1,
      }}
    >
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <div
          style={{
            display: 'inline-block',
            padding: '4px 14px',
            borderRadius: 999,
            background: '#eef2ff',          // indigo-50
            border: '1px solid #c7d2fe',    // indigo-200
            color: '#4338ca',               // indigo-700
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            marginBottom: 18,
          }}
        >
          Worked example
        </div>
        <h2
          style={{
            margin: '0 0 14px',
            fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
            letterSpacing: '-0.03em',
            lineHeight: 1.05,
            fontWeight: 800,
            color: '#0a0a0f',
          }}
        >
          <span className="tk-gradient-text">Flow chart</span> editor
        </h2>
        <p
          style={{
            margin: '0 auto',
            maxWidth: 680,
            color: '#1f2937',
            fontSize: 'clamp(15px, 1.3vw, 17px)',
            lineHeight: 1.65,
          }}
        >
          Drag nodes, pinch-zoom, keyboard-navigate, route between ports —
          all from a single controlled <code style={code}>data</code> prop.
          Custom renderers let each node carry its own UI (status pills,
          icons, inline charts, anything).
        </p>
      </header>

      <PipelineEditor />

      <details style={{ marginTop: 24 }}>
        <summary
          style={{
            cursor: 'pointer',
            padding: '12px 16px',
            borderRadius: 10,
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            color: '#4338ca',
            fontWeight: 600,
            fontSize: 13,
            listStyle: 'none',
          }}
        >
          📜 See the implementation
        </summary>
        <pre
          style={{
            marginTop: 12,
            padding: 20,
            background: '#fafbfc',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            color: '#1f2937',
            fontSize: 13,
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
            lineHeight: 1.55,
            overflow: 'auto',
          }}
        >
          <code>{SNIPPET}</code>
        </pre>
      </details>
    </section>
  );
}

const code: React.CSSProperties = {
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: '0.85em',
  padding: '1px 6px',
  borderRadius: 4,
  background: '#eef2ff',
  color: '#4338ca',
};
