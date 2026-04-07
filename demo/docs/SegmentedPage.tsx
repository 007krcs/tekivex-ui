import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxSegmented } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

const SEGMENTED_PROPS = [
  { name: 'options', type: 'SegmentedOption[]', default: '—', description: 'Array of options. Each option has value, label, optional icon, and optional disabled.', required: true },
  { name: 'value', type: 'string', default: 'undefined', description: 'Controlled selected value.' },
  { name: 'onChange', type: '(value: string) => void', default: 'undefined', description: 'Callback fired when selection changes.' },
  { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls height, font size, and horizontal padding of the control.' },
  { name: 'block', type: 'boolean', default: 'false', description: 'When true, stretches the control to fill its container width.' },
];

const IconGrid = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
  </svg>
);

const IconList = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
    <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
    <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
  </svg>
);

const IconKanban = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="5" height="18" /><rect x="10" y="3" width="5" height="12" />
    <rect x="17" y="3" width="5" height="15" />
  </svg>
);

export function SegmentedPage({ theme }: { theme: ThemeTokens }) {
  const [view, setView] = useState('grid');
  const [size, setSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [period, setPeriod] = useState('week');

  const divider = { height: '1px', backgroundColor: theme.border, margin: '48px 0', border: 'none' };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* ── Basic ───────────────────────────────────────────────────────── */}
      <DemoSection
        title="Basic Segmented Control"
        description="A pill-style toggle group. Only one option can be active at a time. Animated sliding indicator follows the selection."
        theme={theme}
        code={`<TkxSegmented
  options={[
    { value: 'day', label: 'Day' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
  ]}
  value={period}
  onChange={setPeriod}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TkxSegmented
            options={[
              { value: 'day', label: 'Day' },
              { value: 'week', label: 'Week' },
              { value: 'month', label: 'Month' },
              { value: 'year', label: 'Year' },
            ]}
            value={period}
            onChange={setPeriod}
          />
          <p style={{ margin: 0, fontSize: 13, color: theme.textMuted }}>
            Selected: <strong style={{ color: theme.text }}>{period}</strong>
          </p>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── With Icons ──────────────────────────────────────────────────── */}
      <DemoSection
        title="With Icons"
        description="Combine icons with labels for richer context. Icons are placed to the left of the label."
        theme={theme}
        code={`<TkxSegmented
  options={[
    { value: 'grid', label: 'Grid', icon: <IconGrid /> },
    { value: 'list', label: 'List', icon: <IconList /> },
    { value: 'kanban', label: 'Kanban', icon: <IconKanban /> },
  ]}
  value={view}
  onChange={setView}
/>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <TkxSegmented
            options={[
              { value: 'grid', label: 'Grid', icon: <IconGrid /> },
              { value: 'list', label: 'List', icon: <IconList /> },
              { value: 'kanban', label: 'Kanban', icon: <IconKanban /> },
            ]}
            value={view}
            onChange={setView}
          />
          <p style={{ margin: 0, fontSize: 13, color: theme.textMuted }}>
            Current view: <strong style={{ color: theme.text }}>{view}</strong>
          </p>
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Sizes ───────────────────────────────────────────────────────── */}
      <DemoSection
        title="Sizes"
        description="Three size variants: sm (28px), md (36px), lg (44px). Size affects height, font, and padding."
        theme={theme}
        code={`<TkxSegmented options={options} size="sm" />
<TkxSegmented options={options} size="md" />
<TkxSegmented options={options} size="lg" />`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {(['sm', 'md', 'lg'] as const).map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ fontSize: 12, color: theme.textMuted, width: 20 }}>{s}</span>
              <TkxSegmented
                size={s}
                options={[{ value: 'a', label: 'Alpha' }, { value: 'b', label: 'Beta' }, { value: 'c', label: 'Gamma' }]}
                value={size === s ? 'a' : 'b'}
                onChange={() => setSize(s)}
              />
            </div>
          ))}
        </div>
      </DemoSection>

      <hr style={divider} />

      {/* ── Block + Disabled ─────────────────────────────────────────────── */}
      <DemoSection
        title="Block & Disabled Options"
        description="block stretches the control to full width. Individual options can be disabled."
        theme={theme}
        code={`<TkxSegmented
  block
  options={[
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise', disabled: true },
  ]}
/>`}
      >
        <TkxSegmented
          block
          options={[
            { value: 'free', label: 'Free' },
            { value: 'pro', label: 'Pro' },
            { value: 'enterprise', label: 'Enterprise', disabled: true },
          ]}
        />
      </DemoSection>

      <hr style={divider} />

      {/* ── Props Table ─────────────────────────────────────────────────── */}
      <div style={{ marginTop: 48 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: theme.text, marginBottom: 16 }}>TkxSegmented Props</h3>
        <PropTable props={SEGMENTED_PROPS} />
      </div>
    </div>
  );
}
