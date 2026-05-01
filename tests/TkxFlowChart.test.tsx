import { describe, it, expect, vi } from 'vitest';
import { useState } from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import {
  TkxFlowChart,
  nodeAnchors,
  edgePath,
  type FlowChartData,
  type FlowNode,
} from '../src/components/TkxFlowChart';

// ── Pure-function tests ─────────────────────────────────────────────────────

describe('nodeAnchors', () => {
  it('returns right-of and left-of anchors', () => {
    const n: FlowNode = { id: 'a', label: 'A', x: 10, y: 20, width: 100, height: 40 };
    expect(nodeAnchors(n)).toEqual({ out: [110, 40], in: [10, 40] });
  });
  it('uses defaults when width / height are missing', () => {
    const n: FlowNode = { id: 'a', label: 'A', x: 0, y: 0 };
    // Default 160 × 60 → out=[160,30], in=[0,30]
    expect(nodeAnchors(n)).toEqual({ out: [160, 30], in: [0, 30] });
  });
});

describe('edgePath', () => {
  it('produces an SVG cubic-Bezier between two nodes', () => {
    const a: FlowNode = { id: 'a', label: 'A', x: 0,   y: 0,  width: 100, height: 40 };
    const b: FlowNode = { id: 'b', label: 'B', x: 200, y: 0,  width: 100, height: 40 };
    const d = edgePath(a, b);
    // Should start at (100,20) → cubic to (200,20)
    expect(d).toMatch(/^M 100 20 C/);
    expect(d).toContain('200 20');
    expect(d.startsWith('M ')).toBe(true);
  });

  it('handles vertical separation (curves bend horizontally)', () => {
    const a: FlowNode = { id: 'a', label: 'A', x: 0,   y: 0,   width: 100, height: 40 };
    const b: FlowNode = { id: 'b', label: 'B', x: 200, y: 100, width: 100, height: 40 };
    const d = edgePath(a, b);
    expect(d).toContain('M 100 20');
    expect(d).toContain('200 120');
  });

  it('handles overlapping x with a minimum control-point pull', () => {
    // a.out = [100, 20], b.in = [0, 100]
    // dx = max(40, |0 - 100| / 2) = max(40, 50) = 50
    // c1 = [100 + 50, 20] = [150, 20]
    // c2 = [0 - 50, 100]  = [-50, 100]
    const a: FlowNode = { id: 'a', label: 'A', x: 0, y: 0, width: 100, height: 40 };
    const b: FlowNode = { id: 'b', label: 'B', x: 0, y: 80, width: 100, height: 40 };
    const d = edgePath(a, b);
    expect(d).toContain('150 20');
    expect(d).toContain('-50 100');
  });

  it('respects the 40-pixel minimum control-point pull when nodes are very close', () => {
    // a.out = [100, 20], b.in = [110, 20]
    // dx = max(40, 10/2 = 5) = 40
    const a: FlowNode = { id: 'a', label: 'A', x: 0,   y: 0, width: 100, height: 40 };
    const b: FlowNode = { id: 'b', label: 'B', x: 110, y: 0, width: 100, height: 40 };
    const d = edgePath(a, b);
    expect(d).toContain('140 20');  // c1 = 100 + 40
    expect(d).toContain('70 20');   // c2 = 110 - 40
  });
});

// ── Component tests ─────────────────────────────────────────────────────────

const SAMPLE: FlowChartData = {
  nodes: [
    { id: 'n1', label: 'Start',  x: 40,  y: 40,  color: '#00f5d4' },
    { id: 'n2', label: 'Middle', x: 240, y: 40 },
    { id: 'n3', label: 'End',    x: 440, y: 40,  color: '#ff006e' },
  ],
  edges: [
    { id: 'e1', from: 'n1', to: 'n2' },
    { id: 'e2', from: 'n2', to: 'n3', label: '→' },
  ],
};

function Harness({ initial = SAMPLE }: { initial?: FlowChartData } = {}) {
  const [data, setData] = useState(initial);
  return <TkxFlowChart data={data} onChange={setData} />;
}

describe('TkxFlowChart rendering', () => {
  it('renders one node DOM element per data.nodes entry', () => {
    render(<Harness />);
    expect(screen.getByTestId('flow-node-n1')).toBeInTheDocument();
    expect(screen.getByTestId('flow-node-n2')).toBeInTheDocument();
    expect(screen.getByTestId('flow-node-n3')).toBeInTheDocument();
  });

  it('renders one SVG group per edge', () => {
    render(<Harness />);
    expect(screen.getByTestId('flow-edge-e1')).toBeInTheDocument();
    expect(screen.getByTestId('flow-edge-e2')).toBeInTheDocument();
  });

  it('shows the zoom controls + readout', () => {
    render(<Harness />);
    expect(screen.getByTestId('flow-zoom-in')).toBeInTheDocument();
    expect(screen.getByTestId('flow-zoom-out')).toBeInTheDocument();
    expect(screen.getByTestId('flow-fit')).toBeInTheDocument();
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('100%');
  });

  it('hides the zoom controls when showControls=false', () => {
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} showControls={false} />;
    }
    render(<H />);
    expect(screen.queryByTestId('flow-zoom-in')).not.toBeInTheDocument();
  });

  it('renders empty state without crashing', () => {
    render(<Harness initial={{ nodes: [], edges: [] }} />);
    expect(screen.getByTestId('tkx-flowchart')).toBeInTheDocument();
  });

  it('uses custom renderNode when provided', () => {
    function H() {
      const [data, setData] = useState(SAMPLE);
      return (
        <TkxFlowChart
          data={data}
          onChange={setData}
          renderNode={(n) => <span data-testid={`custom-${n.id}`}>★ {n.label}</span>}
        />
      );
    }
    render(<H />);
    expect(screen.getByTestId('custom-n1').textContent).toContain('Start');
  });
});

describe('TkxFlowChart selection', () => {
  it('selects a node on pointerdown and reflects aria-pressed', () => {
    render(<Harness />);
    const n2 = screen.getByTestId('flow-node-n2');
    fireEvent.pointerDown(n2, { pointerId: 1, clientX: 0, clientY: 0 });
    expect(n2).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('flow-node-n1')).toHaveAttribute('aria-pressed', 'false');
  });

  it('respects controlled selectedId', () => {
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} selectedId="n3" />;
    }
    render(<H />);
    expect(screen.getByTestId('flow-node-n3')).toHaveAttribute('aria-pressed', 'true');
  });

  it('fires onSelect with the clicked node id', () => {
    const onSelect = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} onSelect={onSelect} />;
    }
    render(<H />);
    fireEvent.pointerDown(screen.getByTestId('flow-node-n1'), { pointerId: 1 });
    expect(onSelect).toHaveBeenCalledWith('n1');
  });
});

describe('TkxFlowChart node drag', () => {
  it('updates the node position as the pointer moves', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return (
        <TkxFlowChart
          data={data}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    const n1 = screen.getByTestId('flow-node-n1');
    fireEvent.pointerDown(n1, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(n1, { pointerId: 1, clientX: 150, clientY: 130 });
    // dx = 50, dy = 30 (at scale=1) → node moved from (40,40) to (90,70)
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const moved = last.nodes.find((n: FlowNode) => n.id === 'n1');
    expect(moved.x).toBe(90);
    expect(moved.y).toBe(70);
  });

  it('does not drag when draggable=false', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return (
        <TkxFlowChart
          data={data}
          draggable={false}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    const n1 = screen.getByTestId('flow-node-n1');
    fireEvent.pointerDown(n1, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(n1, { pointerId: 1, clientX: 150, clientY: 130 });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TkxFlowChart keyboard', () => {
  it('arrow-right nudges the selected node by 1 px', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return (
        <TkxFlowChart
          data={data}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    fireEvent.pointerDown(screen.getByTestId('flow-node-n2'), { pointerId: 1 });
    fireEvent.keyDown(screen.getByTestId('tkx-flowchart'), { key: 'ArrowRight' });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const moved = last.nodes.find((n: FlowNode) => n.id === 'n2');
    expect(moved.x).toBe(241);
  });

  it('shift+arrow nudges by 10 px', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return (
        <TkxFlowChart
          data={data}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    fireEvent.pointerDown(screen.getByTestId('flow-node-n2'), { pointerId: 1 });
    fireEvent.keyDown(screen.getByTestId('tkx-flowchart'), { key: 'ArrowDown', shiftKey: true });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    const moved = last.nodes.find((n: FlowNode) => n.id === 'n2');
    expect(moved.y).toBe(50);
  });

  it('Delete removes the selected node + connected edges', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return (
        <TkxFlowChart
          data={data}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    fireEvent.pointerDown(screen.getByTestId('flow-node-n2'), { pointerId: 1 });
    fireEvent.keyDown(screen.getByTestId('tkx-flowchart'), { key: 'Delete' });
    const last = onChange.mock.calls[onChange.mock.calls.length - 1][0];
    expect(last.nodes.find((n: FlowNode) => n.id === 'n2')).toBeUndefined();
    // Both edges touched n2 → both gone
    expect(last.edges).toHaveLength(0);
  });

  it('Tab advances selection through nodes', () => {
    const onSelect = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} onSelect={onSelect} />;
    }
    render(<H />);
    const root = screen.getByTestId('tkx-flowchart');
    fireEvent.keyDown(root, { key: 'Tab' });
    expect(onSelect).toHaveBeenLastCalledWith('n1');
    fireEvent.pointerDown(screen.getByTestId('flow-node-n1'), { pointerId: 1 });
    fireEvent.keyDown(root, { key: 'Tab' });
    expect(onSelect).toHaveBeenLastCalledWith('n2');
  });

  it('Shift+Tab cycles backwards', () => {
    const onSelect = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} onSelect={onSelect} />;
    }
    render(<H />);
    fireEvent.pointerDown(screen.getByTestId('flow-node-n1'), { pointerId: 1 });
    fireEvent.keyDown(screen.getByTestId('tkx-flowchart'), { key: 'Tab', shiftKey: true });
    expect(onSelect).toHaveBeenLastCalledWith('n3');
  });
});

describe('TkxFlowChart canvas pan', () => {
  it('starts a pan when clicking empty canvas + deselects', () => {
    const onSelect = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} onSelect={onSelect} />;
    }
    render(<H />);
    fireEvent.pointerDown(screen.getByTestId('flow-node-n1'), { pointerId: 1 });
    onSelect.mockClear();
    const root = screen.getByTestId('tkx-flowchart');
    fireEvent.pointerDown(root, { pointerId: 2, clientX: 0, clientY: 0 });
    expect(onSelect).toHaveBeenCalledWith(null);
  });
});

describe('TkxFlowChart zoom controls', () => {
  it('reads back zoom percentage in the toolbar', () => {
    render(<Harness />);
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('100%');
  });

  it('zoom-in changes the readout', () => {
    render(<Harness />);
    fireEvent.click(screen.getByTestId('flow-zoom-in'));
    // 1.25x → 125%
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('125%');
  });

  it('zoom-out changes the readout', () => {
    render(<Harness />);
    fireEvent.click(screen.getByTestId('flow-zoom-out'));
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('80%');
  });

  it('clamps zoom to maxZoom', () => {
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} maxZoom={1.5} />;
    }
    render(<H />);
    fireEvent.click(screen.getByTestId('flow-zoom-in'));
    fireEvent.click(screen.getByTestId('flow-zoom-in'));
    fireEvent.click(screen.getByTestId('flow-zoom-in'));
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('150%');
  });

  it('clamps zoom to minZoom', () => {
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} minZoom={0.5} />;
    }
    render(<H />);
    // 0.8x per click — clamped at 0.5. Click many times to ensure we hit the floor.
    for (let i = 0; i < 8; i++) fireEvent.click(screen.getByTestId('flow-zoom-out'));
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('50%');
  });

  it('fit-to-view resets to a sensible scale (does not crash on empty)', () => {
    function H() {
      const [data, setData] = useState<FlowChartData>({ nodes: [], edges: [] });
      return <TkxFlowChart data={data} onChange={setData} />;
    }
    render(<H />);
    fireEvent.click(screen.getByTestId('flow-fit'));
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('100%');
  });
});

describe('TkxFlowChart wheel zoom', () => {
  it('wheel-up zooms in', () => {
    render(<Harness />);
    const root = screen.getByTestId('tkx-flowchart');
    fireEvent.wheel(root, { deltaY: -200, clientX: 100, clientY: 100 });
    const readout = screen.getByTestId('flow-zoom-readout').textContent;
    expect(parseInt(readout!, 10)).toBeGreaterThan(100);
  });

  it('wheel-down zooms out', () => {
    render(<Harness />);
    const root = screen.getByTestId('tkx-flowchart');
    fireEvent.wheel(root, { deltaY: 200, clientX: 100, clientY: 100 });
    const readout = screen.getByTestId('flow-zoom-readout').textContent;
    expect(parseInt(readout!, 10)).toBeLessThan(100);
  });

  it('does not zoom when zoomable=false', () => {
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={setData} zoomable={false} />;
    }
    render(<H />);
    fireEvent.wheel(screen.getByTestId('tkx-flowchart'), { deltaY: -200, clientX: 0, clientY: 0 });
    expect(screen.getByTestId('flow-zoom-readout').textContent).toBe('100%');
  });
});

describe('TkxFlowChart pinch zoom (multi-touch)', () => {
  it('two simultaneous pointers initiate pinch zoom', () => {
    render(<Harness />);
    const root = screen.getByTestId('tkx-flowchart');
    // First pointer
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 100, clientY: 100 });
    // Second pointer 50px away → starts pinch
    fireEvent.pointerDown(root, { pointerId: 2, clientX: 150, clientY: 100 });
    // Move them apart → zoom in
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 50,  clientY: 100 });
    fireEvent.pointerMove(root, { pointerId: 2, clientX: 200, clientY: 100 });
    // distance went from 50 → 150 (3x) so scale should grow significantly
    const readout = parseInt(screen.getByTestId('flow-zoom-readout').textContent!, 10);
    expect(readout).toBeGreaterThan(100);
    // Release
    fireEvent.pointerUp(root, { pointerId: 1 });
    fireEvent.pointerUp(root, { pointerId: 2 });
  });
});

describe('TkxFlowChart pan motion', () => {
  it('drags the canvas when the user pans the empty space', () => {
    render(<Harness />);
    const root = screen.getByTestId('tkx-flowchart');
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 100, clientY: 100 });
    fireEvent.pointerMove(root, { pointerId: 1, clientX: 200, clientY: 150 });
    // Pan moves the visual transform; we can't easily assert the inline
    // transform string in jsdom but we can check no crash + nodes still
    // present.
    expect(screen.getByTestId('flow-node-n1')).toBeInTheDocument();
    fireEvent.pointerUp(root, { pointerId: 1 });
  });

  it('does not pan when pannable=false', () => {
    const onSelect = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} pannable={false} onChange={setData} onSelect={onSelect} />;
    }
    render(<H />);
    const root = screen.getByTestId('tkx-flowchart');
    fireEvent.pointerDown(root, { pointerId: 1, clientX: 100, clientY: 100 });
    // No pan — no error, and node remains in place.
    expect(screen.getByTestId('flow-node-n1')).toBeInTheDocument();
  });
});

describe('TkxFlowChart fit-to-view with nodes', () => {
  it('does not crash when fitting a populated graph', () => {
    render(<Harness />);
    fireEvent.click(screen.getByTestId('flow-fit'));
    // jsdom getBoundingClientRect returns zero, so the math may give NaN —
    // but the component must still render without throwing.
    expect(screen.getByTestId('flow-zoom-readout')).toBeInTheDocument();
  });
});

describe('TkxFlowChart edge labels', () => {
  it('renders the edge label as SVG text', () => {
    const { container } = render(<Harness />);
    // e2 has label '→'
    expect(container.querySelector('text')).toBeTruthy();
  });
});

describe('TkxFlowChart edge creation by port drag', () => {
  it('renders an output-port button for every node', () => {
    render(<Harness />);
    expect(screen.getByTestId('flow-port-n1')).toBeInTheDocument();
    expect(screen.getByTestId('flow-port-n2')).toBeInTheDocument();
    expect(screen.getByTestId('flow-port-n3')).toBeInTheDocument();
  });

  it('shows the draft edge while the user drags from a port', () => {
    render(<Harness />);
    const port = screen.getByTestId('flow-port-n1');
    fireEvent.pointerDown(port, { pointerId: 1, clientX: 200, clientY: 70 });
    fireEvent.pointerMove(port, { pointerId: 1, clientX: 300, clientY: 80 });
    expect(screen.getByTestId('flow-edge-draft')).toBeInTheDocument();
  });

  it('hides the draft edge after the drag ends', () => {
    render(<Harness />);
    const port = screen.getByTestId('flow-port-n1');
    fireEvent.pointerDown(port, { pointerId: 1, clientX: 200, clientY: 70 });
    fireEvent.pointerMove(port, { pointerId: 1, clientX: 300, clientY: 80 });
    fireEvent.pointerUp(port, { pointerId: 1, clientX: 300, clientY: 80 });
    expect(screen.queryByTestId('flow-edge-draft')).not.toBeInTheDocument();
  });

  it('creates a new edge when releasing over a different node', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState({
        nodes: [
          { id: 'a', label: 'A', x: 40,  y: 40 },
          { id: 'b', label: 'B', x: 240, y: 40 },
        ],
        edges: [],
      } as FlowChartData);
      return (
        <TkxFlowChart
          data={data}
          onChange={(next) => {
            onChange(next);
            setData(next);
          }}
        />
      );
    }
    render(<H />);
    const portA = screen.getByTestId('flow-port-a');
    const nodeB = screen.getByTestId('flow-node-b');
    // Start drag from A's port
    fireEvent.pointerDown(portA, { pointerId: 1, clientX: 0, clientY: 0 });
    // Place B at a known DOM position via getBoundingClientRect mocking — but
    // jsdom returns zero rects, so document.elementFromPoint won't reliably
    // find the target. Stub it for this test.
    const orig = document.elementFromPoint;
    document.elementFromPoint = () => nodeB;
    try {
      fireEvent.pointerUp(portA, { pointerId: 1, clientX: 250, clientY: 60 });
    } finally {
      document.elementFromPoint = orig;
    }
    const last = onChange.mock.calls[onChange.mock.calls.length - 1]?.[0];
    expect(last?.edges).toHaveLength(1);
    expect(last?.edges[0]).toMatchObject({ from: 'a', to: 'b' });
  });

  it('does not create an edge when releasing over the source node itself', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState({
        nodes: [{ id: 'a', label: 'A', x: 40, y: 40 }],
        edges: [],
      } as FlowChartData);
      return <TkxFlowChart data={data} onChange={(next) => { onChange(next); setData(next); }} />;
    }
    render(<H />);
    const portA = screen.getByTestId('flow-port-a');
    const nodeA = screen.getByTestId('flow-node-a');
    fireEvent.pointerDown(portA, { pointerId: 1, clientX: 0, clientY: 0 });
    const orig = document.elementFromPoint;
    document.elementFromPoint = () => nodeA;
    try {
      fireEvent.pointerUp(portA, { pointerId: 1, clientX: 50, clientY: 50 });
    } finally {
      document.elementFromPoint = orig;
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it('does not duplicate an existing edge in the same direction', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState({
        nodes: [
          { id: 'a', label: 'A', x: 40,  y: 40 },
          { id: 'b', label: 'B', x: 240, y: 40 },
        ],
        edges: [{ id: 'e1', from: 'a', to: 'b' }],
      } as FlowChartData);
      return <TkxFlowChart data={data} onChange={(next) => { onChange(next); setData(next); }} />;
    }
    render(<H />);
    const portA = screen.getByTestId('flow-port-a');
    const nodeB = screen.getByTestId('flow-node-b');
    fireEvent.pointerDown(portA, { pointerId: 1, clientX: 0, clientY: 0 });
    const orig = document.elementFromPoint;
    document.elementFromPoint = () => nodeB;
    try {
      fireEvent.pointerUp(portA, { pointerId: 1, clientX: 250, clientY: 60 });
    } finally {
      document.elementFromPoint = orig;
    }
    expect(onChange).not.toHaveBeenCalled();
  });

  it('cancels the draft when released over empty canvas', () => {
    const onChange = vi.fn();
    function H() {
      const [data, setData] = useState(SAMPLE);
      return <TkxFlowChart data={data} onChange={(next) => { onChange(next); setData(next); }} />;
    }
    render(<H />);
    const portN1 = screen.getByTestId('flow-port-n1');
    fireEvent.pointerDown(portN1, { pointerId: 1, clientX: 0, clientY: 0 });
    const orig = document.elementFromPoint;
    document.elementFromPoint = () => null;
    try {
      fireEvent.pointerUp(portN1, { pointerId: 1, clientX: 600, clientY: 400 });
    } finally {
      document.elementFromPoint = orig;
    }
    // No edge added — onChange not called.
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByTestId('flow-edge-draft')).not.toBeInTheDocument();
  });
});

describe('TkxFlowChart accessibility', () => {
  it('exposes a role + aria-label on the root', () => {
    render(<Harness />);
    const root = screen.getByTestId('tkx-flowchart');
    expect(root).toHaveAttribute('role', 'application');
    expect(root).toHaveAttribute('aria-label', 'Flow chart editor');
  });

  it('zoom buttons have hit-target ≥ 44 × 44', () => {
    render(<Harness />);
    const btn = screen.getByTestId('flow-zoom-in');
    const style = window.getComputedStyle(btn);
    expect(parseFloat(style.minWidth || style.width)).toBeGreaterThanOrEqual(44);
    expect(parseFloat(style.minHeight || style.height)).toBeGreaterThanOrEqual(44);
  });

  it('control toolbar has role="toolbar"', () => {
    render(<Harness />);
    const toolbar = screen.getAllByRole('toolbar', { name: /flow chart/i });
    expect(toolbar.length).toBeGreaterThan(0);
  });
});
