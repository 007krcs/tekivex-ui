import type { CSSProperties } from 'react';
import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxNumberInput } from '@tekivex/ui';

export function NumberInputPage({ theme }: { theme: ThemeTokens }) {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(50);

  const wrap: CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '40px 32px',
    color: theme.text,
  };

  const demoBox: CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 24,
    padding: 32,
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    flexWrap: 'wrap',
    marginBottom: 32,
  };

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Number Input</h1>
      <p style={{ color: theme.textMuted, marginBottom: 32 }}>
        Numeric input with increment/decrement controls, min/max constraints, step, and prefix/suffix support.
      </p>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Basic</h2>
      <div style={demoBox}>
        <div>
          <TkxNumberInput
            value={value1}
            onChange={setValue1}
            label="Count"
            min={0}
            max={100}
          />
          <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Value: {value1}</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>With Prefix / Suffix</h2>
      <div style={demoBox}>
        <TkxNumberInput
          value={value2}
          onChange={setValue2}
          label="Percentage"
          min={0}
          max={100}
          suffix="%"
        />
        <TkxNumberInput
          defaultValue={9.99}
          label="Price"
          min={0}
          step={0.01}
          prefix="$"
        />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Sizes</h2>
      <div style={demoBox}>
        <TkxNumberInput defaultValue={10} size="sm" label="Small" />
        <TkxNumberInput defaultValue={10} size="md" label="Medium" />
        <TkxNumberInput defaultValue={10} size="lg" label="Large" />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Disabled</h2>
      <div style={demoBox}>
        <TkxNumberInput defaultValue={42} disabled label="Disabled" />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Props</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: `1px solid ${theme.border}` }}>
            {['Prop', 'Type', 'Default', 'Description'].map((h) => (
              <th key={h} style={{ textAlign: 'left', padding: '8px 12px', color: theme.textMuted, fontWeight: 600 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[
            ['value', 'number', '—', 'Controlled value'],
            ['defaultValue', 'number', '0', 'Initial value (uncontrolled)'],
            ['onChange', '(v: number) => void', '—', 'Change handler'],
            ['min', 'number', '—', 'Minimum value'],
            ['max', 'number', '—', 'Maximum value'],
            ['step', 'number', '1', 'Increment/decrement step'],
            ['prefix', 'string', '—', 'Text shown before value'],
            ['suffix', 'string', '—', 'Text shown after value'],
            ['size', '"sm" | "md" | "lg"', '"md"', 'Input size'],
            ['disabled', 'boolean', 'false', 'Disable the input'],
            ['label', 'string', '—', 'Input label'],
          ].map(([prop, type, def, desc]) => (
            <tr key={prop} style={{ borderBottom: `1px solid ${theme.border}` }}>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.primary }}>{prop}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.info }}>{type}</td>
              <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: theme.textMuted }}>{def}</td>
              <td style={{ padding: '8px 12px', color: theme.text }}>{desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
