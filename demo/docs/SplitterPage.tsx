import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxSplitter,
  TkxSplitterPane,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const SPLITTER_PROPS = [
  { name: 'direction', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: "'horizontal' = panes side-by-side; 'vertical' = stacked." },
  { name: 'sizes', type: 'number[]', default: 'undefined', description: 'Controlled sizes (percentages, one per pane). Omit for uncontrolled mode.' },
  { name: 'onResize', type: '(sizes: number[]) => void', default: 'undefined', description: 'Fired continuously while a gutter is dragged (and on keyboard resize).' },
  { name: 'onResizeEnd', type: '(sizes: number[]) => void', default: 'undefined', description: 'Fired when a drag ends (pointer release) or after a keyboard resize.' },
  { name: 'gutterSize', type: 'number', default: '6', description: 'Gutter thickness in px.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disable all resizing (drag + keyboard).' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names merged on the flex container.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on the flex container.' },
];

const PANE_PROPS = [
  { name: 'defaultSize', type: 'number', default: 'undefined', description: 'Initial size as a percentage. Unspecified panes share the remainder equally.' },
  { name: 'minSize', type: 'number', default: '10', description: 'Minimum size in percent — dragging clamps here.' },
  { name: 'maxSize', type: 'number', default: 'undefined', description: 'Maximum size in percent.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the pane element.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles merged on the pane element.' },
  { name: 'children', type: 'ReactNode', default: 'undefined', description: 'Pane content. Panes scroll internally (overflow: auto).' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function SplitterPage({ theme }: { theme: ThemeTokens }) {
  const [controlledSizes, setControlledSizes] = useState<number[]>([30, 70]);

  const containerStyle = {
    width: '100%',
    height: '320px',
    border: `1px solid ${theme.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
    backgroundColor: theme.bg,
  };

  const paneContentStyle = {
    padding: '16px',
    fontSize: '13px',
    color: theme.textMuted,
    lineHeight: 1.6,
  };

  const paneTitleStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 8px',
  };

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '2.4.7 Focus Visible', level: 'AA', status: 'PASS' },
            { criterion: '2.5.7 Dragging Movements', level: 'AA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxSplitter
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        Resizable split panes. Compose TkxSplitterPane children inside a TkxSplitter — each
        adjacent pair of panes gets a drag gutter that resizes only its two neighbours.
        Uncontrolled via per-pane defaultSize, or fully controlled via the sizes prop.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Follows the window-splitter pattern — every gutter is a focusable{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="separator"</code>{' '}
        whose{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-valuenow</code>{' '}
        reflects the preceding pane's percentage; arrow keys move the divider, Home/End snap to
        min/max, and double-click resets. <strong style={{ color: theme.text }}>Important:</strong> the splitter fills
        its parent (<code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>height: 100%</code>),
        so the parent container must have a resolved height.
      </p>

      {/* ── 1. Horizontal ── */}
      <DemoSection
        title="Horizontal Two-Pane"
        description="Drag the gutter, or Tab to it and use Arrow Left/Right (Home/End snap, double-click resets). The splitter fills its parent, so this demo wraps it in a fixed 320px-high bordered container."
        theme={theme}
        code={`{/* Parent must have a height — the splitter fills it */}
<div style={{ height: 320, border: '1px solid …', borderRadius: 10 }}>
  <TkxSplitter direction="horizontal">
    <TkxSplitterPane defaultSize={30} minSize={15}>
      <FileTree />
    </TkxSplitterPane>
    <TkxSplitterPane minSize={30}>
      <Editor />
    </TkxSplitterPane>
  </TkxSplitter>
</div>`}
      >
        <div style={containerStyle}>
          <TkxSplitter direction="horizontal">
            <TkxSplitterPane defaultSize={30} minSize={15}>
              <div style={paneContentStyle}>
                <p style={paneTitleStyle}>Explorer</p>
                <p style={{ margin: 0 }}>src/</p>
                <p style={{ margin: '4px 0 0 12px' }}>components/</p>
                <p style={{ margin: '4px 0 0 24px' }}>TkxSplitter.tsx</p>
                <p style={{ margin: '4px 0 0 24px' }}>TkxCode.tsx</p>
                <p style={{ margin: '4px 0 0 12px' }}>themes/</p>
                <p style={{ margin: '4px 0 0 12px' }}>index.ts</p>
              </div>
            </TkxSplitterPane>
            <TkxSplitterPane minSize={30}>
              <div style={paneContentStyle}>
                <p style={paneTitleStyle}>Editor</p>
                <p style={{ margin: 0 }}>
                  This pane has minSize 30%, the explorer 15%. Drag the gutter between them —
                  the pair's combined width is preserved, classic splitter behaviour. Both panes
                  scroll internally when their content overflows.
                </p>
              </div>
            </TkxSplitterPane>
          </TkxSplitter>
        </div>
      </DemoSection>

      {/* ── 2. Vertical ── */}
      <DemoSection
        title="Vertical (Stacked) Panes"
        description="direction='vertical' stacks the panes and the gutter resizes with Arrow Up/Down. A classic editor-above-terminal layout."
        theme={theme}
        code={`<div style={{ height: 320 }}>
  <TkxSplitter direction="vertical" gutterSize={8}>
    <TkxSplitterPane defaultSize={65} minSize={30}>
      <Editor />
    </TkxSplitterPane>
    <TkxSplitterPane minSize={15}>
      <Terminal />
    </TkxSplitterPane>
  </TkxSplitter>
</div>`}
      >
        <div style={containerStyle}>
          <TkxSplitter direction="vertical" gutterSize={8}>
            <TkxSplitterPane defaultSize={65} minSize={30}>
              <div style={paneContentStyle}>
                <p style={paneTitleStyle}>Editor</p>
                <p style={{ margin: 0 }}>
                  The top pane starts at 65%. Drag the horizontal gutter below, or focus it and
                  press Arrow Up / Arrow Down.
                </p>
              </div>
            </TkxSplitterPane>
            <TkxSplitterPane minSize={15}>
              <div style={{ ...paneContentStyle, fontFamily: 'monospace', fontSize: '12px' }}>
                <p style={paneTitleStyle}>Terminal</p>
                <p style={{ margin: 0 }}>$ npm run dev</p>
                <p style={{ margin: '4px 0 0', color: theme.success }}>✓ ready in 312 ms</p>
              </div>
            </TkxSplitterPane>
          </TkxSplitter>
        </div>
      </DemoSection>

      {/* ── 3. Controlled ── */}
      <DemoSection
        title="Controlled Sizes"
        description="Pass sizes (percentages) plus onResize to own the state. The live readout below updates continuously while dragging; the buttons snap to preset layouts."
        theme={theme}
        code={`const [sizes, setSizes] = useState<number[]>([30, 70]);

<TkxSplitter
  direction="horizontal"
  sizes={sizes}
  onResize={setSizes}
>
  <TkxSplitterPane minSize={15}>Sidebar</TkxSplitterPane>
  <TkxSplitterPane minSize={30}>Content</TkxSplitterPane>
</TkxSplitter>

<button onClick={() => setSizes([30, 70])}>30 / 70</button>
<button onClick={() => setSizes([50, 50])}>50 / 50</button>`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {[[30, 70], [50, 50], [70, 30]].map(([a, b]) => (
              <button
                key={`${a}-${b}`}
                type="button"
                onClick={() => setControlledSizes([a, b])}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: 'inherit',
                  color: Math.round(controlledSizes[0]) === a ? theme.primary : theme.textMuted,
                  backgroundColor: Math.round(controlledSizes[0]) === a ? `${theme.primary}12` : 'transparent',
                  border: `1px solid ${Math.round(controlledSizes[0]) === a ? theme.primary : theme.border}`,
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                {a} / {b}
              </button>
            ))}
            <span style={{ fontSize: '12px', color: theme.textMuted, fontVariantNumeric: 'tabular-nums' }}>
              sizes = [{controlledSizes.map((s) => s.toFixed(1)).join(', ')}]
            </span>
          </div>
          <div style={{ ...containerStyle, height: '220px' }}>
            <TkxSplitter
              direction="horizontal"
              sizes={controlledSizes}
              onResize={setControlledSizes}
            >
              <TkxSplitterPane minSize={15}>
                <div style={paneContentStyle}>
                  <p style={paneTitleStyle}>Sidebar</p>
                  <p style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {controlledSizes[0]?.toFixed(1)}%
                  </p>
                </div>
              </TkxSplitterPane>
              <TkxSplitterPane minSize={30}>
                <div style={paneContentStyle}>
                  <p style={paneTitleStyle}>Content</p>
                  <p style={{ margin: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {controlledSizes[1]?.toFixed(1)}%
                  </p>
                </div>
              </TkxSplitterPane>
            </TkxSplitter>
          </div>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Tables */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable title="TkxSplitter" props={SPLITTER_PROPS} />
        <PropTable title="TkxSplitterPane" props={PANE_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="2.4.7 Focus Visible" level="AA" status="PASS" />
        <WCAGBadge criterion="2.5.7 Dragging Movements" level="AA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={{ borderRadius: '10px', border: `1px solid ${theme.border}`, backgroundColor: theme.surfaceAlt, padding: '20px 24px', marginBottom: '24px' }}>
        <p style={{ fontSize: '13px', fontWeight: 700, color: theme.text, margin: '0 0 12px' }}>Window-Splitter Pattern</p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: '0 0 6px' }}>
          Each gutter is a focusable <code>role="separator"</code> with <code>aria-valuenow/min/max</code> reflecting the preceding pane's percentage and an <code>aria-orientation</code> matching the visual bar. Arrow keys move the divider in 2% steps; <strong>Home/End</strong> snap to the min/max; double-click resets both neighbours to their initial sizes.
        </p>
        <p style={{ fontSize: '13.5px', color: theme.textMuted, lineHeight: '1.7', margin: 0 }}>
          Keyboard resizing satisfies WCAG 2.5.7 (Dragging Movements) — no pointer drag is ever required. Pointer handling uses Pointer Events with capture, so mouse and touch both work.
        </p>
      </div>
    </div>
  );
}
