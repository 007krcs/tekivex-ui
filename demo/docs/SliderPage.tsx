import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import {
  TkxSlider,
} from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import { WCAGBadge, WCAGBadgeGroup } from '../layout/WCAGBadge';

// ── Prop definitions ──────────────────────────────────────────────────────────

const SLIDER_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Visible label for the slider, associated via htmlFor/id.' },
  { name: 'value', type: 'number | [number, number]', default: 'undefined', description: 'Controlled value. Pass a tuple [min, max] when isRange is true.' },
  { name: 'onChange', type: '(value: number | [number, number]) => void', default: 'undefined', description: 'Callback fired on every change event during drag.' },
  { name: 'onChangeEnd', type: '(value: number | [number, number]) => void', default: 'undefined', description: 'Callback fired only when the user releases the thumb (pointer up).' },
  { name: 'min', type: 'number', default: '0', description: 'Minimum value of the slider range.' },
  { name: 'max', type: 'number', default: '100', description: 'Maximum value of the slider range.' },
  { name: 'step', type: 'number', default: '1', description: 'Increment between selectable values.' },
  { name: 'isRange', type: 'boolean', default: 'false', description: 'Renders two thumbs for selecting a range. value must be a [number, number] tuple.' },
  { name: 'marks', type: 'boolean | { value: number; label?: string }[]', default: 'false', description: 'Show tick marks below the track. Pass true for auto marks at each step, or an array for custom marks.' },
  { name: 'showValue', type: 'boolean', default: 'false', description: 'Shows the current value(s) in a tooltip above the active thumb.' },
  { name: 'colorScheme', type: "'primary' | 'secondary' | 'danger' | 'warning' | 'success'", default: "'primary'", description: 'Theme color applied to the filled track and thumb.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls track height and thumb size.' },
  { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents all interaction. Sets aria-disabled on all thumb elements.' },
  { name: 'hint', type: 'string', default: 'undefined', description: 'Helper text rendered below the slider.' },
  { name: 'className', type: 'string', default: 'undefined', description: 'Extra class names on the root wrapper.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function SliderPage({ theme }: { theme: ThemeTokens }) {
  const [basic, setBasic] = useState(40);
  const [range, setRange] = useState<[number, number]>([20, 70]);
  const [custom, setCustom] = useState(50);
  const [marks, setMarks] = useState(3);
  const [volume, setVolume] = useState(60);
  const [brightness, setBrightness] = useState(75);
  const [budget, setBudget] = useState<[number, number]>([200, 800]);

  const dividerStyle = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  const noteBoxStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.surfaceAlt,
    padding: '20px 24px',
    marginBottom: '24px',
  };

  const noteHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 12px',
  };

  const noteItemStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.7',
    margin: '0 0 6px',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* WCAG badge row */}
      <div style={{ marginBottom: '24px' }}>
        <WCAGBadgeGroup
          label="WCAG 2.1 Compliance"
          badges={[
            { criterion: '1.3.1 Info & Relationships', level: 'AA', status: 'PASS' },
            { criterion: '2.1.1 Keyboard', level: 'AA', status: 'PASS' },
            { criterion: '2.5.5 Target Size', level: 'AAA', status: 'PASS' },
            { criterion: '4.1.2 Name/Role/Value', level: 'AA', status: 'PASS' },
          ]}
        />
      </div>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxSlider
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 8px' }}>
        A theme-aware range slider using native{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>{'<input type="range">'}</code>{' '}
        under the hood for maximum screen reader compatibility. Supports single and dual-thumb range mode, custom
        step/min/max, labeled tick marks, and five color schemes.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '640px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>WAI-ARIA:</strong> Each thumb exposes{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>role="slider"</code>{' '}
        with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-valuemin</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-valuemax</code>,{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-valuenow</code>, and{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px' }}>aria-valuetext</code>.
      </p>

      {/* ── 1. Basic ── */}
      <DemoSection
        title="Basic Slider"
        description="A simple single-thumb slider from 0 to 100. Arrow keys move the value by step (default 1). Home/End jump to min/max."
        theme={theme}
        code={`const [value, setValue] = useState(40);

<TkxSlider
  label="Volume"
  value={value}
  onChange={setValue}
  showValue
/>`}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <TkxSlider
            label="Volume"
            value={basic}
            onChange={(v) => setBasic(v as number)}
            showValue
          />
        </div>
      </DemoSection>

      {/* ── 2. Range Slider ── */}
      <DemoSection
        title="Range Slider"
        description="Set isRange to render two thumbs. The value is a [min, max] tuple. Both thumbs are individually keyboard-navigable and screen reader announced."
        theme={theme}
        code={`const [range, setRange] = useState<[number, number]>([20, 70]);

<TkxSlider
  label="Price Range"
  isRange
  value={range}
  onChange={(v) => setRange(v as [number, number])}
  min={0}
  max={100}
  showValue
/>`}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <TkxSlider
            label="Price Range"
            isRange
            value={range}
            onChange={(v) => setRange(v as [number, number])}
            showValue
          />
          <p style={{ margin: '8px 0 0', fontSize: '12px', color: theme.textMuted }}>
            Range: <strong style={{ color: theme.text }}>{range[0]} – {range[1]}</strong>
          </p>
        </div>
      </DemoSection>

      {/* ── 3. Custom Min/Max/Step ── */}
      <DemoSection
        title="Custom Min / Max / Step"
        description="Override min, max, and step to match your data domain. Here: temperature from 16°C to 32°C in 0.5° increments."
        theme={theme}
        code={`<TkxSlider
  label="Temperature (°C)"
  value={temp}
  onChange={setTemp}
  min={16}
  max={32}
  step={0.5}
  showValue
  hint="Room temperature range: 16°C – 32°C"
/>`}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <TkxSlider
            label="Temperature (°C)"
            value={custom}
            onChange={(v) => setCustom(v as number)}
            min={16}
            max={32}
            step={0.5}
            showValue
            hint="Room temperature range: 16°C – 32°C"
          />
        </div>
      </DemoSection>

      {/* ── 4. With Marks ── */}
      <DemoSection
        title="With Marks"
        description="Pass marks with custom labeled tick points below the track. Great for sliders with meaningful discrete stops like t-shirt sizes or quality ratings."
        theme={theme}
        code={`<TkxSlider
  label="Quality"
  value={value}
  onChange={setValue}
  min={1}
  max={5}
  step={1}
  marks={[
    { value: 1, label: 'Poor' },
    { value: 2, label: 'Fair' },
    { value: 3, label: 'Good' },
    { value: 4, label: 'Great' },
    { value: 5, label: 'Excellent' },
  ]}
/>`}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <TkxSlider
            label="Quality Rating"
            value={marks}
            onChange={(v) => setMarks(v as number)}
            min={1}
            max={5}
            step={1}
            marks={[
              { value: 1, label: 'Poor' },
              { value: 2, label: 'Fair' },
              { value: 3, label: 'Good' },
              { value: 4, label: 'Great' },
              { value: 5, label: 'Excellent' },
            ]}
          />
        </div>
      </DemoSection>

      {/* ── 5. Color Schemes ── */}
      <DemoSection
        title="Color Schemes"
        description="Five semantic color schemes style the filled track and thumb. Use contextual colors to reinforce meaning — e.g., danger for a delete confirmation threshold."
        theme={theme}
        code={`<TkxSlider label="Primary"   colorScheme="primary"   value={60} onChange={…} />
<TkxSlider label="Success"   colorScheme="success"   value={75} onChange={…} />
<TkxSlider label="Warning"   colorScheme="warning"   value={45} onChange={…} />
<TkxSlider label="Danger"    colorScheme="danger"    value={30} onChange={…} />`}
      >
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TkxSlider label="Volume (Primary)" colorScheme="primary" value={volume} onChange={(v) => setVolume(v as number)} showValue />
          <TkxSlider label="Brightness (Success)" colorScheme="success" value={brightness} onChange={(v) => setBrightness(v as number)} showValue />
          <TkxSlider label="Budget Range (Warning)" colorScheme="warning" isRange value={budget} onChange={(v) => setBudget(v as [number, number])} min={0} max={1000} showValue />
        </div>
      </DemoSection>

      {/* ── 6. Sizes ── */}
      <DemoSection
        title="Sizes"
        description="Three sizes control the track height and thumb diameter. Larger sizes improve click/touch accuracy on touch screens."
        theme={theme}
        code={`<TkxSlider label="Small"  size="sm" value={50} onChange={…} />
<TkxSlider label="Medium" size="md" value={50} onChange={…} />
<TkxSlider label="Large"  size="lg" value={50} onChange={…} />`}
      >
        <div style={{ width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TkxSlider label="Small" size="sm" value={50} onChange={() => {}} />
          <TkxSlider label="Medium" size="md" value={50} onChange={() => {}} />
          <TkxSlider label="Large" size="lg" value={50} onChange={() => {}} />
        </div>
      </DemoSection>

      {/* ── 7. Disabled ── */}
      <DemoSection
        title="Disabled State"
        description="Disabled sliders prevent interaction, dim the track and thumb, and set aria-disabled='true' on each thumb element."
        theme={theme}
        code={`<TkxSlider label="Locked setting" value={65} onChange={() => {}} disabled hint="This setting is managed by your administrator." />`}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <TkxSlider
            label="Locked Setting"
            value={65}
            onChange={() => {}}
            disabled
            hint="This setting is managed by your administrator."
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* Props Table */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={SLIDER_PROPS} />
      </div>

      <hr style={dividerStyle} />

      {/* Accessibility Notes */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Accessibility Notes
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
        <WCAGBadge criterion="1.3.1 Info & Relationships" level="AA" status="PASS" />
        <WCAGBadge criterion="2.1.1 Keyboard Accessible" level="AA" status="PASS" />
        <WCAGBadge criterion="2.5.5 Target Size" level="AAA" status="PASS" />
        <WCAGBadge criterion="4.1.2 Name, Role, Value" level="AA" status="PASS" />
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>Keyboard Navigation</p>
        <p style={noteItemStyle}><strong>Arrow Left / Arrow Down</strong> — decrement by step. <strong>Arrow Right / Arrow Up</strong> — increment by step. <strong>Page Down / Page Up</strong> — decrement/increment by 10× step. <strong>Home</strong> — jump to min. <strong>End</strong> — jump to max.</p>
      </div>
      <div style={noteBoxStyle}>
        <p style={noteHeadStyle}>aria-valuetext</p>
        <p style={noteItemStyle}>For sliders with non-obvious numeric values (e.g., temperatures, percentages), provide an <code>aria-valuetext</code> formatter via the <code>formatAriaValue</code> prop: <code>{'(v) => `${v}°C`'}</code>. Screen readers prefer the text over the raw number.</p>
      </div>
    </div>
  );
}
