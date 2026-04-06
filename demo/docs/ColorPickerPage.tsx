import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxColorPicker } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const COLOR_PICKER_PROPS = [
  { name: 'value', type: 'string', default: 'undefined', description: 'Controlled color value. Should match the format prop (hex, rgb, or hsl string).' },
  { name: 'defaultValue', type: 'string', default: 'undefined', description: 'Initial color for uncontrolled usage. Ignored when value is provided.' },
  { name: 'onChange', type: '(value: string, format: ColorFormat) => void', default: 'undefined', description: 'Callback fired whenever the selected color changes. Receives the formatted string and its format identifier.' },
  { name: 'format', type: "'hex' | 'rgb' | 'hsl'", default: "'hex'", description: 'Output format for the color value passed to onChange and displayed in the input.' },
  { name: 'showAlpha', type: 'boolean', default: 'false', description: 'Renders an alpha/opacity slider below the hue slider, enabling RGBA output.' },
  { name: 'presets', type: 'string[]', default: 'undefined', description: 'Array of color strings shown as clickable swatches below the gradient canvas.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Disables all interaction and applies reduced-opacity styling.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls the trigger swatch and overall picker dimensions.' },
  { name: 'placeholder', type: 'string', default: 'undefined', description: 'Placeholder text shown in the hex/value input when no color is selected.' },
  { name: 'label', type: 'string', default: 'undefined', description: 'Accessible label rendered above the trigger swatch.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root wrapper element.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names applied to the root wrapper element.' },
];

// ── Preset palettes ───────────────────────────────────────────────────────────

const BRAND_PRESETS = [
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
];

const NEUTRAL_PRESETS = [
  '#ffffff', '#f8fafc', '#e2e8f0', '#94a3b8',
  '#64748b', '#334155', '#1e293b', '#0f172a',
];

const MATERIAL_PRESETS = [
  '#f44336', '#e91e63', '#9c27b0', '#3f51b5',
  '#2196f3', '#00bcd4', '#4caf50', '#ff9800',
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function ColorPickerPage({ theme }: { theme: ThemeTokens }) {
  const [basicColor, setBasicColor] = useState('#6366f1');
  const [alphaColor, setAlphaColor] = useState('#0ea5e9');
  const [presetsColor, setPresetsColor] = useState('#22c55e');
  const [rgbColor, setRgbColor] = useState('#f43f5e');
  const [rgbOutput, setRgbOutput] = useState('');
  const [controlledColor, setControlledColor] = useState('#8b5cf6');

  const codeInline = (s: string): React.CSSProperties => ({
    fontSize: '12px',
    backgroundColor: `${theme.primary}14`,
    color: theme.primary,
    padding: '1px 5px',
    borderRadius: '4px',
  });

  const swatchStyle = (color: string): React.CSSProperties => ({
    width: 28,
    height: 28,
    borderRadius: '6px',
    backgroundColor: color,
    border: `2px solid ${theme.border}`,
    flexShrink: 0,
  });

  const colorChipStyle = (color: string): React.CSSProperties => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 12px',
    borderRadius: '8px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surface,
    fontSize: '13px',
    fontWeight: 600,
    color: theme.text,
    fontFamily: 'monospace',
  });

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxColorPicker
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A popover color picker with a gradient canvas, hue slider, optional alpha channel,
        and preset swatches. Outputs colors in{' '}
        <code style={codeInline('')}>hex</code>,{' '}
        <code style={codeInline('')}>rgb</code>, or{' '}
        <code style={codeInline('')}>hsl</code> format.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> The trigger swatch has{' '}
        <code style={codeInline('')}>role="button"</code> and{' '}
        <code style={codeInline('')}>aria-haspopup</code>. The popover is trapped with{' '}
        <code style={codeInline('')}>aria-modal="true"</code> and dismissed via Escape. All sliders
        expose <code style={codeInline('')}>role="slider"</code> with value announcements.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Color Picker"
        description="Click the swatch to open the color canvas. Drag the gradient area to pick hue and saturation, and use the slider to adjust lightness. The hex value updates in real time."
        theme={theme}
        code={`const [color, setColor] = useState('#6366f1');

<TkxColorPicker
  label="Brand color"
  value={color}
  onChange={(value) => setColor(value)}
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TkxColorPicker
            label="Brand color"
            value={basicColor}
            onChange={(value) => setBasicColor(value)}
          />
          <span style={colorChipStyle(basicColor)}>
            <span style={swatchStyle(basicColor)} />
            {basicColor}
          </span>
        </div>
      </DemoSection>

      {/* ── 2. Alpha channel ── */}
      <DemoSection
        title="With Alpha Channel"
        description="Set showAlpha to true to reveal an additional opacity slider. The output value includes the alpha component (e.g. #0ea5e9cc for 80% opacity)."
        theme={theme}
        code={`<TkxColorPicker
  label="Fill color"
  value={color}
  onChange={(value) => setColor(value)}
  showAlpha
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TkxColorPicker
            label="Fill color"
            value={alphaColor}
            onChange={(value) => setAlphaColor(value)}
            showAlpha
          />
          <span style={colorChipStyle(alphaColor)}>
            <span style={swatchStyle(alphaColor)} />
            {alphaColor}
          </span>
        </div>
      </DemoSection>

      {/* ── 3. Custom presets ── */}
      <DemoSection
        title="Custom Preset Swatches"
        description="Pass an array of color strings to the presets prop to display clickable swatches. Clicking a swatch immediately applies that color and closes the picker."
        theme={theme}
        code={`const BRAND_PRESETS = [
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899',
  '#f43f5e', '#f97316', '#eab308', '#22c55e',
];

<TkxColorPicker
  label="Theme color"
  value={color}
  onChange={(value) => setColor(value)}
  presets={BRAND_PRESETS}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ margin: '0 0 6px', fontSize: '12px', fontWeight: 700, color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Brand palette
              </p>
              <TkxColorPicker
                label="Theme color"
                value={presetsColor}
                onChange={(value) => setPresetsColor(value)}
                presets={BRAND_PRESETS}
              />
            </div>
            <span style={colorChipStyle(presetsColor)}>
              <span style={swatchStyle(presetsColor)} />
              {presetsColor}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', color: theme.textMuted, marginRight: '4px' }}>Presets:</span>
            {BRAND_PRESETS.map(c => (
              <span key={c} style={{ ...swatchStyle(c), width: 20, height: 20, borderRadius: '4px', cursor: 'default' }} title={c} />
            ))}
          </div>
        </div>
      </DemoSection>

      {/* ── 4. RGB format output ── */}
      <DemoSection
        title="RGB Format Output"
        description={`Set format="rgb" to receive the value as an rgb(r, g, b) string. The onChange callback also receives the format identifier so you can switch dynamically.`}
        theme={theme}
        code={`<TkxColorPicker
  label="Highlight color"
  value={color}
  onChange={(value, format) => {
    setColor(value);
    setOutput(\`\${format}: \${value}\`);
  }}
  format="rgb"
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <TkxColorPicker
            label="Highlight color"
            value={rgbColor}
            onChange={(value, format) => {
              setRgbColor(value);
              setRgbOutput(`${format}: ${value}`);
            }}
            format="rgb"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={colorChipStyle(rgbColor)}>
              <span style={swatchStyle(rgbColor)} />
              {rgbColor}
            </span>
            {rgbOutput && (
              <span style={{ fontSize: '12px', color: theme.textMuted, fontFamily: 'monospace' }}>
                {rgbOutput}
              </span>
            )}
          </div>
        </div>
      </DemoSection>

      {/* ── 5. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes control the trigger swatch diameter and overall picker width: sm, md (default), and lg."
        theme={theme}
        code={`<TkxColorPicker label="Small"  defaultValue="#6366f1" size="sm" />
<TkxColorPicker label="Medium" defaultValue="#6366f1" size="md" />
<TkxColorPicker label="Large"  defaultValue="#6366f1" size="lg" />`}
      >
        <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          {(['sm', 'md', 'lg'] as const).map(sz => (
            <div key={sz} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
              <TkxColorPicker
                label={`Size ${sz}`}
                defaultValue="#6366f1"
                size={sz}
                presets={NEUTRAL_PRESETS}
              />
              <span style={{ fontSize: '12px', color: theme.textMuted }}>size="{sz}"</span>
            </div>
          ))}
        </div>
      </DemoSection>

      {/* ── 6. Controlled example ── */}
      <DemoSection
        title="Controlled Color + Live Preview"
        description="When value and onChange are both provided, the picker is fully controlled. This example shows the selected color applied as a live background preview."
        theme={theme}
        code={`const [color, setColor] = useState('#8b5cf6');

<TkxColorPicker
  label="Accent color"
  value={color}
  onChange={(value) => setColor(value)}
  presets={MATERIAL_PRESETS}
/>

<div style={{ backgroundColor: color, borderRadius: '12px', padding: '24px' }}>
  <p style={{ color: '#fff', margin: 0 }}>Live preview</p>
</div>`}
      >
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TkxColorPicker
            label="Accent color"
            value={controlledColor}
            onChange={(value) => setControlledColor(value)}
            presets={MATERIAL_PRESETS}
          />
          <div
            style={{
              flex: 1,
              minWidth: 200,
              borderRadius: '12px',
              padding: '28px 24px',
              backgroundColor: controlledColor,
              transition: 'background-color 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ color: '#fff', fontWeight: 700, fontSize: '14px', textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
              Live preview
            </span>
            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontFamily: 'monospace' }}>
              {controlledColor}
            </span>
          </div>
        </div>
      </DemoSection>

      {/* ── 7. Disabled ── */}
      <DemoSection
        title="Disabled State"
        description="Set disabled to prevent all interaction. The trigger swatch and input are visually dimmed and pointer events are blocked."
        theme={theme}
        code={`<TkxColorPicker
  label="Locked color"
  value="#6366f1"
  disabled
/>`}
      >
        <TkxColorPicker
          label="Locked color"
          value="#6366f1"
          disabled
        />
      </DemoSection>

      {/* ── Props table ── */}
      <div style={{ marginTop: '64px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
          TkxColorPickerProps
        </h2>
        <p style={{ fontSize: '14px', color: theme.textMuted, margin: '0 0 24px', lineHeight: '1.6' }}>
          All props accepted by the <code style={codeInline('')}>TkxColorPicker</code> component.
        </p>
        <PropTable props={COLOR_PICKER_PROPS} theme={theme} />
      </div>

    </div>
  );
}
