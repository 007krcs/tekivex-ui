// ─────────────────────────────────────────────────────────────────────────────
// Flow chart — pipeline editor
//
// Worked example of TkxFlowChart driving a small CI pipeline. Five stages,
// four edges, each node colored by its stage type. Demonstrates:
//
//   - Controlled state (parent owns nodes + edges)
//   - Adding a new node via a button
//   - Custom render via the renderNode prop (icon + status pill)
//   - Selection callback that updates a side panel with the node's details
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react';
import {
  TkxFlowChart,
  type FlowChartData,
  type FlowNode,
} from 'tekivex-ui';

interface PipelineNodeData {
  kind: 'source' | 'build' | 'test' | 'deploy';
  status: 'idle' | 'running' | 'passed' | 'failed';
}

const STAGE_COLOR: Record<PipelineNodeData['kind'], string> = {
  source: '#7b8eff',
  build:  '#00f5d4',
  test:   '#c4a8ff',
  deploy: '#ffbe0b',
};

const STAGE_ICON: Record<PipelineNodeData['kind'], string> = {
  source: '🌱',
  build:  '🔨',
  test:   '🧪',
  deploy: '🚀',
};

const INITIAL: FlowChartData = {
  nodes: [
    { id: 'src',    label: 'Pull from main', x: 40,   y: 60,  color: STAGE_COLOR.source, data: { kind: 'source', status: 'passed' }  satisfies PipelineNodeData },
    { id: 'lint',   label: 'Lint',           x: 260,  y: 20,  color: STAGE_COLOR.build,  data: { kind: 'build',  status: 'passed' }  satisfies PipelineNodeData },
    { id: 'build',  label: 'Build',          x: 260,  y: 100, color: STAGE_COLOR.build,  data: { kind: 'build',  status: 'running' } satisfies PipelineNodeData },
    { id: 'test',   label: 'Run tests',      x: 480,  y: 60,  color: STAGE_COLOR.test,   data: { kind: 'test',   status: 'idle' }    satisfies PipelineNodeData },
    { id: 'deploy', label: 'Deploy → prod',  x: 700,  y: 60,  color: STAGE_COLOR.deploy, data: { kind: 'deploy', status: 'idle' }    satisfies PipelineNodeData },
  ],
  edges: [
    { id: 'e1', from: 'src',   to: 'lint' },
    { id: 'e2', from: 'src',   to: 'build' },
    { id: 'e3', from: 'lint',  to: 'test' },
    { id: 'e4', from: 'build', to: 'test' },
    { id: 'e5', from: 'test',  to: 'deploy' },
  ],
};

export function PipelineEditor() {
  const [data, setData] = useState<FlowChartData>(INITIAL);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.nodes.find((n) => n.id === selectedId) ?? null;

  function addNode() {
    const id = `step-${Date.now()}`;
    setData((d) => ({
      ...d,
      nodes: [
        ...d.nodes,
        {
          id,
          label: 'New step',
          x: 60 + Math.random() * 200,
          y: 200 + Math.random() * 80,
          color: STAGE_COLOR.test,
          data: { kind: 'test', status: 'idle' } satisfies PipelineNodeData,
        },
      ],
    }));
    setSelectedId(id);
  }

  return (
    <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'minmax(0, 3fr) minmax(0, 1fr)' }}>
      <div>
        <div
          style={{
            padding: '8px 12px',
            marginBottom: 10,
            borderRadius: 8,
            background: 'rgba(0,245,212,0.08)',
            border: '1px dashed rgba(0,245,212,0.4)',
            color: '#00f5d4',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <span aria-hidden="true">💡</span>
          <span>
            <strong>Connect nodes:</strong> drag from the glowing{' '}
            <span
              style={{
                display: 'inline-block',
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#00f5d4',
                boxShadow: '0 0 8px #00f5d4',
                verticalAlign: 'middle',
                lineHeight: 1,
                fontSize: 9,
                fontWeight: 900,
                color: '#0a0a0f',
                textAlign: 'center',
              }}
            >+</span>
            {' '}port on a node's <em>right edge</em> to another node.
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button
            type="button"
            onClick={addNode}
            style={btn}
          >
            + Add step
          </button>
          <span style={{ alignSelf: 'center', color: '#888', fontSize: 12 }}>
            Tab/Shift+Tab to move selection · ←↑↓→ nudge · Delete to remove
          </span>
        </div>
        <TkxFlowChart
          data={data}
          onChange={setData}
          selectedId={selectedId}
          onSelect={setSelectedId}
          height={420}
          renderNode={(n, isSelected) => {
            const d = n.data as PipelineNodeData;
            return (
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span aria-hidden="true">{STAGE_ICON[d.kind]}</span>
                <span style={{ flex: 1 }}>{n.label}</span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 999,
                    background: statusBg(d.status),
                    color: statusFg(d.status),
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    opacity: isSelected ? 1 : 0.85,
                  }}
                >
                  {d.status}
                </span>
              </span>
            );
          }}
        />
      </div>

      <div
        style={{
          padding: 16,
          borderRadius: 12,
          background: 'rgba(18, 20, 38, 0.6)',
          border: '1px solid rgba(255,255,255,0.08)',
          backdropFilter: 'blur(8px)',
          alignSelf: 'start',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#888' }}>
          Inspector
        </div>
        {selected ? (
          <div style={{ marginTop: 12, fontSize: 13 }}>
            <div style={{ color: '#dcdce8', fontWeight: 700, fontSize: 16 }}>{selected.label}</div>
            <div style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>
              {(selected.data as PipelineNodeData).kind} ·{' '}
              {(selected.data as PipelineNodeData).status}
            </div>
            <div style={{ color: '#666', fontSize: 11, fontFamily: 'monospace', marginTop: 12 }}>
              ({Math.round(selected.x)}, {Math.round(selected.y)})
            </div>
          </div>
        ) : (
          <p style={{ color: '#888', fontSize: 13, marginTop: 12 }}>
            Click a node to inspect it.
          </p>
        )}
      </div>
    </div>
  );
}

function statusBg(s: PipelineNodeData['status']): string {
  return {
    idle:    'rgba(255,255,255,0.08)',
    running: 'rgba(255,190,11,0.16)',
    passed:  'rgba(0,245,212,0.18)',
    failed:  'rgba(255,0,110,0.16)',
  }[s];
}
function statusFg(s: PipelineNodeData['status']): string {
  return { idle: '#888', running: '#ffbe0b', passed: '#00f5d4', failed: '#ff006e' }[s];
}

const btn: React.CSSProperties = {
  padding: '8px 14px',
  minHeight: 36,
  borderRadius: 8,
  border: '1px solid rgba(0,245,212,0.4)',
  background: 'rgba(0,245,212,0.1)',
  color: '#00f5d4',
  fontWeight: 700,
  fontSize: 13,
  cursor: 'pointer',
};
