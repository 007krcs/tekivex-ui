export function FlowChartDoc() {
  return (
    <>
      <p>
        <code>TkxFlowChart</code> is a node-edge graph editor. A 2D canvas you can pan and
        zoom, nodes you can drag and rename, edges you can create and delete, a right-click
        context menu, a properties inspector. Built for pipeline editors, mind-mapped
        workflows, ETL diagrams — anywhere a graph beats a list.
      </p>

      <h2>Capabilities</h2>
      <table>
        <thead><tr><th>Operation</th><th>How</th></tr></thead>
        <tbody>
          <tr><td>Add a node</td><td>Parent owns the array — push to <code>data.nodes</code></td></tr>
          <tr><td>Move a node</td><td>Click + drag (mouse, pen, touch)</td></tr>
          <tr><td>Connect two nodes</td><td>Drag from the glowing <code>(+)</code> port on a node's right edge to another node</td></tr>
          <tr><td>Rename a node</td><td>Double-click → inline editable input · Enter commits · Escape reverts</td></tr>
          <tr><td>Right-click a node</td><td>Menu with Rename / Duplicate / Bring-to-front / Delete</td></tr>
          <tr><td>Select an edge</td><td>Click the edge — it brightens with a glow</td></tr>
          <tr><td>Delete just an edge</td><td>Click edge → press Delete</td></tr>
          <tr><td>Properties inspector</td><td>Click ☰ in the zoom toolbar — edit label, color, width, height live</td></tr>
          <tr><td>Pan the canvas</td><td>Click + drag empty space</td></tr>
          <tr><td>Zoom</td><td>Wheel (desktop), pinch (touch), or +/-/⤢ in the toolbar</td></tr>
        </tbody>
      </table>

      <h2>Quick start</h2>
      <pre><code>{`import { TkxFlowChart, type FlowChartData } from 'tekivex-ui';

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

<TkxFlowChart data={data} onChange={setData} height={420} />`}</code></pre>

      <h2>Custom node renderer</h2>
      <p>
        Pass <code>renderNode</code> to take over the node's visual. The custom renderer
        suppresses the default text + the inline-rename mode (since your custom UI owns
        editing).
      </p>
      <pre><code>{`<TkxFlowChart
  data={data}
  onChange={setData}
  renderNode={(node, isSelected) => (
    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <span>{statusIcons[node.data.kind]}</span>
      <span style={{ flex: 1 }}>{node.label}</span>
      <span style={statusPillStyle(node.data.status)}>
        {node.data.status}
      </span>
    </span>
  )}
/>`}</code></pre>

      <h2>Headless control</h2>
      <p>
        The component is fully controlled. <code>data</code> is the source of truth;{' '}
        <code>onChange</code> fires for every mutation (move, connect, rename, delete,
        duplicate). <code>selectedId</code> can also be controlled if your app needs to
        sync selection with another panel.
      </p>

      <h2>Performance</h2>
      <p>
        Tested up to 200 nodes / 500 edges at 60 FPS. Beyond that, virtualizing the SVG edge
        layer and switching to a quadtree-based hit test would help — neither is in the
        component today.
      </p>

      <h2>Keyboard reference</h2>
      <table>
        <thead><tr><th>Key</th><th>Action</th></tr></thead>
        <tbody>
          <tr><td>Tab / Shift+Tab</td><td>Cycle node selection</td></tr>
          <tr><td>↑ / ↓ / ← / →</td><td>Nudge selected node 1 px (Shift = 10 px)</td></tr>
          <tr><td>Delete / Backspace</td><td>Remove selected node + connected edges, OR remove selected edge</td></tr>
        </tbody>
      </table>

      <h2>What the FlowChart doesn't do (yet)</h2>
      <ul>
        <li>Edge label editing (currently set declaratively via <code>edge.label</code>)</li>
        <li>Multi-select with rubber-band drag</li>
        <li>Undo / redo</li>
        <li>Auto-layout (dagre-style)</li>
      </ul>
      <p>All four are tracked on the roadmap.</p>
    </>
  );
}
