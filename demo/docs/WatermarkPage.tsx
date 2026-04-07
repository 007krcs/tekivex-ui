import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxWatermark, TkxInput, TkxSegmented } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const WATERMARK_PROPS = [
  { name: 'text', type: 'string | string[]', default: '—', description: 'Watermark text. Pass a string array for multi-line watermarks.', required: true },
  { name: 'children', type: 'ReactNode', default: '—', description: 'Content to display on top of the watermark pattern.', required: true },
  { name: 'rotate', type: 'number', default: '-22', description: 'Rotation angle of the watermark text in degrees.' },
  { name: 'gap', type: '[number, number]', default: '[100, 100]', description: 'Horizontal and vertical gap between repeated watermark tiles in pixels.' },
  { name: 'fontSize', type: 'number', default: '14', description: 'Font size of the watermark text in pixels.' },
  { name: 'color', type: 'string', default: "'rgba(0,0,0,0.12)'", description: 'Color of the watermark text — typically a semi-transparent value.' },
  { name: 'zIndex', type: 'number', default: '9', description: 'CSS z-index of the watermark layer. Ensure it is above content but below interactive elements.' },
];

const CONTENT_BLOCK = ({ theme }: { theme: ThemeTokens }) => (
  <div style={{ padding: '32px 24px' }}>
    <h3 style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 700, color: theme.text }}>Confidential Report Q4 2024</h3>
    <p style={{ margin: '0 0 16px', color: theme.textMuted, fontSize: 14, lineHeight: 1.7 }}>
      This document contains proprietary financial information. Unauthorized distribution is strictly prohibited.
      All figures are preliminary and subject to audit review.
    </p>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
      {[
        { label: 'Revenue', value: '$4.2M', delta: '+18%' },
        { label: 'Gross Margin', value: '62.4%', delta: '+3.1pp' },
        { label: 'NPS Score', value: '72', delta: '+8' },
      ].map(({ label, value, delta }) => (
        <div key={label} style={{ padding: '16px', borderRadius: 8, border: `1px solid ${theme.border}`, backgroundColor: theme.surface }}>
          <p style={{ margin: '0 0 4px', fontSize: 12, color: theme.textMuted }}>{label}</p>
          <p style={{ margin: '0 0 2px', fontSize: 22, fontWeight: 700, color: theme.text }}>{value}</p>
          <p style={{ margin: 0, fontSize: 12, color: theme.primary }}>{delta} vs Q3</p>
        </div>
      ))}
    </div>
  </div>
);

export function WatermarkPage({ theme }: { theme: ThemeTokens }) {
  const [customText, setCustomText] = useState('INTERNAL USE ONLY');
  const [rotate, setRotate] = useState('-22');

  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic ───────────────────────────────────────────────────────── */}
      <DemoSection
        title="Basic Watermark"
        description="Overlays a tiled, rotated text pattern on any content using a canvas-rendered transparent PNG. Does not interfere with user interaction."
        theme={theme}
        code={`<TkxWatermark text="CONFIDENTIAL">
  <div style={{ padding: 32, minHeight: 200 }}>
    Your protected content here
  </div>
</TkxWatermark>`}
      >
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <TkxWatermark text="CONFIDENTIAL">
            <CONTENT_BLOCK theme={theme} />
          </TkxWatermark>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Multi-line ──────────────────────────────────────────────────── */}
      <DemoSection
        title="Multi-line Watermark"
        description="Pass an array of strings to render a multi-line watermark — perfect for combining a company name with a classification label."
        theme={theme}
        code={`<TkxWatermark text={['Tekivex Inc.', 'DRAFT — NOT FOR DISTRIBUTION']}>
  <div>Your content</div>
</TkxWatermark>`}
      >
        <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
          <TkxWatermark text={['Tekivex Inc.', 'DRAFT — NOT FOR DISTRIBUTION']}>
            <CONTENT_BLOCK theme={theme} />
          </TkxWatermark>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Live Playground ─────────────────────────────────────────────── */}
      <DemoSection
        title="Live Playground"
        description="Customize the watermark text and rotation angle in real time."
        theme={theme}
        code={`<TkxWatermark text={customText} rotate={Number(rotate)}>
  <div>Your content</div>
</TkxWatermark>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <TkxInput
                label="Watermark text"
                value={customText}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomText(e.target.value)}
                placeholder="e.g. CONFIDENTIAL"
              />
            </div>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: 13, color: theme.textMuted }}>Rotation</p>
              <TkxSegmented
                options={[
                  { value: '-45', label: '-45°' },
                  { value: '-22', label: '-22°' },
                  { value: '0', label: '0°' },
                  { value: '22', label: '22°' },
                ]}
                value={rotate}
                onChange={setRotate}
              />
            </div>
          </div>
          <div style={{ border: `1px solid ${theme.border}`, borderRadius: 12, overflow: 'hidden' }}>
            <TkxWatermark text={customText || 'WATERMARK'} rotate={Number(rotate)}>
              <CONTENT_BLOCK theme={theme} />
            </TkxWatermark>
          </div>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Custom Color + Gap ──────────────────────────────────────────── */}
      <DemoSection
        title="Custom Color & Density"
        description="Adjust opacity, color, and gap between tiles. For print layouts, a darker color works better; for screen, keep it subtle."
        theme={theme}
        code={`// Subtle (default)
<TkxWatermark text="INTERNAL" color="rgba(0,0,0,0.08)" gap={[120, 120]}>
  ...
</TkxWatermark>

// Prominent (for print)
<TkxWatermark text="DRAFT" color="rgba(220,50,50,0.18)" gap={[80, 80]} fontSize={18}>
  ...
</TkxWatermark>`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: theme.text }}>Subtle</p>
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <TkxWatermark text="INTERNAL" color="rgba(0,0,0,0.08)" gap={[120, 120]}>
                <div style={{ padding: 28, minHeight: 140, fontSize: 13, color: theme.textMuted }}>
                  Content with a soft watermark overlay.
                </div>
              </TkxWatermark>
            </div>
          </div>
          <div>
            <p style={{ margin: '0 0 8px', fontSize: 13, fontWeight: 600, color: theme.text }}>Prominent</p>
            <div style={{ border: `1px solid ${theme.border}`, borderRadius: 10, overflow: 'hidden' }}>
              <TkxWatermark text="DRAFT" color="rgba(220,50,50,0.18)" gap={[80, 80]} fontSize={18}>
                <div style={{ padding: 28, minHeight: 140, fontSize: 13, color: theme.textMuted }}>
                  Content with a bolder, denser watermark.
                </div>
              </TkxWatermark>
            </div>
          </div>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Props ──────────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxWatermark Props</h3>
        <PropTable props={WATERMARK_PROPS} />
      </div>
    </div>
  );
}
