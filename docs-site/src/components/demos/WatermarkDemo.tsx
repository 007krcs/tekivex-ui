import { TkxWatermark } from 'tekivex-ui';
import { Preview } from '../Preview';

export function WatermarkBasic() {
  return (
    <Preview label="Single-line watermark over a content area">
      <TkxWatermark text="CONFIDENTIAL">
        <div style={{ padding: 24, width: '100%', maxWidth: 480, minHeight: 200, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Q3 financial report</h3>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
            This document contains projections, internal forecasts, and forward-looking
            statements not yet released publicly. The watermark sits behind the content
            without interfering with text selection.
          </p>
        </div>
      </TkxWatermark>
    </Preview>
  );
}

export function WatermarkMultiLine() {
  return (
    <Preview label="Multi-line + custom rotation">
      <TkxWatermark text={['TekiVex UI', 'Sample document', new Date().getFullYear().toString()]} rotate={-12}>
        <div style={{ padding: 24, width: '100%', maxWidth: 480, minHeight: 200, background: '#fafbfc', border: '1px solid #e5e7eb', borderRadius: 8 }}>
          <h3 style={{ margin: '0 0 8px', fontSize: 15 }}>Sample contract</h3>
          <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>
            Three-line watermark, rotated 12° counter-clockwise. Good for
            previews / drafts / sample documents.
          </p>
        </div>
      </TkxWatermark>
    </Preview>
  );
}
