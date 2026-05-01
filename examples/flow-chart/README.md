# Flow chart — Pipeline editor

Worked example of `TkxFlowChart` driving a small CI pipeline. Nodes
represent stages (source / build / test / deploy), edges represent the
order they run in. Selection updates an inspector panel on the right.

## What's covered

| Feature              | How                                                                |
| -------------------- | ------------------------------------------------------------------ |
| Custom node renderer | `renderNode={(n) => <span>…</span>}` — icon + label + status pill  |
| Controlled selection | `selectedId` + `onSelect` driving the inspector                    |
| Add a node           | `+ Add step` button mutates the parent `nodes` array               |
| Reschedule via drag  | Built-in. Pointer drag on any node, touch supported                |
| Reschedule via keys  | Tab/Shift+Tab to select, ←↑↓→ to nudge, Delete to remove           |
| Pan + zoom           | Built-in. Wheel / pinch / `+` `-` controls                         |

## Drop-in

```tsx
import { PipelineEditor } from './PipelineEditor';
export default function App() { return <PipelineEditor />; }
```

Pairs naturally with `TkxCommandPalette` (a "+ Add step" command) and
`TkxFormulaBar`-style inspectors (swap the right pane for a properties
form).

## Responsive notes

- Pinch-to-zoom on touch devices (two simultaneous pointers)
- 44×44 hit targets on the +/-/⤢ controls (WCAG 2.1 AAA)
- Two-column layout collapses to a stack at narrow widths via the
  surrounding grid
- `touch-action: none` on the canvas prevents the browser's default
  scroll/zoom from competing with the component's own pan/zoom
