import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxNumberInput } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';

export function NumberInputPage({ theme }: { theme: ThemeTokens }) {
  const [value1, setValue1] = useState(0);
  const [value2, setValue2] = useState(50);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', color: theme.text }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Number Input</h1>
      <p style={{ color: theme.textMuted, marginBottom: 32 }}>
        Numeric input with increment/decrement controls, min/max constraints, step, and prefix/suffix support.
      </p>

      <DemoSection
        title="Basic"
        description="A controlled number input with min/max constraints."
        theme={theme}
        code={`import { TkxNumberInput } from 'tekivex-ui';
import { useState } from 'react';

const [value, setValue] = useState(0);

<TkxNumberInput
  value={value}
  onChange={setValue}
  label="Count"
  min={0}
  max={100}
/>`}
      >
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
      </DemoSection>

      <DemoSection
        title="With Prefix / Suffix"
        description="Display currency symbols, percentage signs, or other affixes."
        theme={theme}
        code={`<TkxNumberInput
  value={value}
  onChange={setValue}
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
/>`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
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
      </DemoSection>

      <DemoSection
        title="Sizes"
        description="Available size presets: small, medium, and large."
        theme={theme}
        code={`<TkxNumberInput defaultValue={10} size="sm" label="Small" />
<TkxNumberInput defaultValue={10} size="md" label="Medium" />
<TkxNumberInput defaultValue={10} size="lg" label="Large" />`}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, flexWrap: 'wrap' }}>
          <TkxNumberInput defaultValue={10} size="sm" label="Small" />
          <TkxNumberInput defaultValue={10} size="md" label="Medium" />
          <TkxNumberInput defaultValue={10} size="lg" label="Large" />
        </div>
      </DemoSection>

      <DemoSection
        title="Disabled"
        description="A disabled number input that cannot be interacted with."
        theme={theme}
        code={`<TkxNumberInput defaultValue={42} disabled label="Disabled" />`}
      >
        <TkxNumberInput defaultValue={42} disabled label="Disabled" />
      </DemoSection>

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
            ['value', 'number', '\u2014', 'Controlled value'],
            ['defaultValue', 'number', '0', 'Initial value (uncontrolled)'],
            ['onChange', '(v: number) => void', '\u2014', 'Change handler'],
            ['min', 'number', '\u2014', 'Minimum value'],
            ['max', 'number', '\u2014', 'Maximum value'],
            ['step', 'number', '1', 'Increment/decrement step'],
            ['prefix', 'string', '\u2014', 'Text shown before value'],
            ['suffix', 'string', '\u2014', 'Text shown after value'],
            ['size', '"sm" | "md" | "lg"', '"md"', 'Input size'],
            ['disabled', 'boolean', 'false', 'Disable the input'],
            ['label', 'string', '\u2014', 'Input label'],
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
