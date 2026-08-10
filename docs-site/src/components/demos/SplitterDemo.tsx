import { useState } from 'react';
import { TkxSplitter, TkxSplitterPane } from 'tekivex-ui';
import { Preview } from '../Preview';

// The splitter fills its parent, so every demo wraps it in a fixed-height box.

const paneStyle = {
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 13,
  opacity: 0.8,
  boxSizing: 'border-box',
  padding: 12,
  textAlign: 'center',
} as const;

export function SplitterBasic() {
  return (
    <Preview label="Drag the gutter (or focus it and use arrow keys)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ height: 220, minWidth: 360, border: '1px solid var(--sl-color-gray-5, #ccc)', borderRadius: 8, overflow: 'hidden' }}>
        <TkxSplitter direction="horizontal">
          <TkxSplitterPane defaultSize={30} minSize={15}>
            <div style={paneStyle}>sidebar (30%, min 15%)</div>
          </TkxSplitterPane>
          <TkxSplitterPane minSize={30}>
            <div style={paneStyle}>editor</div>
          </TkxSplitterPane>
        </TkxSplitter>
      </div>
    </Preview>
  );
}

export function SplitterVertical() {
  const [sizes, setSizes] = useState<number[]>([70, 30]);
  return (
    <Preview label="direction='vertical' (controlled)" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ height: 260, minWidth: 360, border: '1px solid var(--sl-color-gray-5, #ccc)', borderRadius: 8, overflow: 'hidden' }}>
        <TkxSplitter direction="vertical" sizes={sizes} onResize={setSizes}>
          <TkxSplitterPane minSize={20}>
            <div style={paneStyle}>canvas — {sizes[0]?.toFixed(0)}%</div>
          </TkxSplitterPane>
          <TkxSplitterPane minSize={15}>
            <div style={paneStyle}>console — {sizes[1]?.toFixed(0)}%</div>
          </TkxSplitterPane>
        </TkxSplitter>
      </div>
    </Preview>
  );
}
