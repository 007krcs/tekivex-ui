import type { ThemeTokens } from '@tekivex/ui';
import { TkxPlayground } from '@tekivex/ui';
import * as TekivexComponents from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const PLAYGROUND_PROPS = [
  { name: 'defaultCode', type: 'string', description: 'Initial JSX code shown in the editor when the playground first mounts. If omitted, the first example from the examples array is used (or the first built-in example).' },
  { name: 'examples', type: 'PlaygroundExample[]', description: 'Array of preset examples shown in the example picker. Each object has a label string and a code string. Prepended before built-in examples in the dropdown.' },
  { name: 'height', type: 'number', default: '480', description: 'Total height of the playground panel in pixels, split between the code editor and the live preview pane.' },
  { name: 'imports', type: 'Record<string, unknown>', description: 'Object whose keys become available as variables inside evaluated JSX. Pass the entire @tekivex/ui namespace to make all components available without explicit imports.' },
];

const EXAMPLE_PROPS = [
  { name: 'label', type: 'string', required: true, description: 'Display name shown in the example picker dropdown.' },
  { name: 'code', type: 'string', required: true, description: 'The JSX code string that loads into the editor when this example is selected.' },
];

// ── Built-in examples for demo 1 ─────────────────────────────────────────────

const DEMO_EXAMPLES = [
  {
    label: 'Hello Button',
    code: `<TkxButton variant="solid" colorScheme="primary" size="md">
  Hello Quantum!
</TkxButton>`,
  },
  {
    label: 'Card with Badge',
    code: `<TkxCard style={{ maxWidth: 320, padding: '20px 24px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
    <TkxTypography variant="h5" style={{ margin: 0 }}>Quantum Report</TkxTypography>
    <TkxBadge variant="success" pulse>● Live</TkxBadge>
  </div>
  <TkxTypography variant="body2" style={{ opacity: 0.7 }}>
    Real-time quantum annealing results from the optimization engine.
  </TkxTypography>
</TkxCard>`,
  },
  {
    label: 'Form',
    code: `<TkxQuantumForm
  fields={[{ name: 'email' }, { name: 'password' }]}
  onSubmit={(v) => alert(JSON.stringify(v))}
  submitLabel="Sign In"
  showConfidence={true}
/>`,
  },
  {
    label: 'Data Display',
    code: `<div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8 }}>
  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
    <TkxStatistic title="Qubits" value={127} suffix=" qbits" />
    <TkxStatistic title="Fidelity" value={99.4} suffix="%" precision={1} />
    <TkxStatistic title="Gate Depth" value={42} />
  </div>
  <TkxProgress value={72} showLabel colorScheme="primary" />
  <TkxProgress value={91} showLabel colorScheme="success" />
</div>`,
  },
  {
    label: 'Alert Stack',
    code: `<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
  <TkxAlert type="info"    message="Quantum engine initialized." />
  <TkxAlert type="success" message="Palette optimized — WCAG AAA passed on all pairs." />
  <TkxAlert type="warning" message="Annealing temperature above threshold." />
  <TkxAlert type="error"   message="Decoherence detected in qubit array." />
</div>`,
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function PlaygroundPage({ theme }: { theme: ThemeTokens }) {
  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const calloutStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.info}30`,
    backgroundColor: `${theme.info}08`,
    padding: '20px 24px',
    marginBottom: '40px',
  };

  const calloutHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.info,
    margin: '0 0 10px',
  };

  const calloutBodyStyle = {
    fontSize: '13.5px',
    color: theme.textMuted,
    lineHeight: '1.75',
    margin: 0,
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>

      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxPlayground
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '660px', margin: '0 0 8px' }}>
        An in-browser live component playground. Type JSX in the left pane and see it render
        instantly in the right pane — no build step, no server round-trip. Powered by{' '}
        <code style={{ fontSize: '13px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          new Function()
        </code>{' '}
        evaluation, an error boundary, and quantum component suggestions via AmplitudeAmplifier.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '660px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Pass any imports:</strong> Provide the{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          imports
        </code>{' '}
        prop with{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          {'* as TekivexComponents'}
        </code>{' '}
        and every component from{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          @tekivex/ui
        </code>{' '}
        becomes available in the sandbox by name.
      </p>

      {/* Quantum suggestions callout */}
      <div style={calloutStyle}>
        <p style={calloutHeadStyle}>
          🔍 Amplitude Amplification: O(√N) component suggestions
        </p>
        <p style={calloutBodyStyle}>
          Component suggestions use Grover's algorithm — candidate components are treated as a
          search space. The oracle marks matching components as target states and amplitude
          amplification iteratively boosts their probability amplitude. After O(√N) iterations
          (instead of the classical O(N) linear scan), the highest-probability component rises to
          the top of the suggestion list. As you type, the quantum search re-runs in real time,
          ranking components by semantic distance from your partial input.
        </p>
      </div>

      {/* ── 1. Full Playground ── */}
      <DemoSection
        title="Full Playground — All Tekivex Components"
        description="The complete playground with all @tekivex/ui components available in the sandbox. Select from 5 built-in examples or write your own JSX. Render-time metrics appear in the status bar."
        theme={theme}
        code={`import * as TekivexComponents from '@tekivex/ui';

<TkxPlayground
  imports={TekivexComponents}
  examples={[
    {
      label: 'Hello Button',
      code: '<TkxButton variant="solid" colorScheme="primary">Hello Quantum!</TkxButton>',
    },
    {
      label: 'Card with Badge',
      code: \`<TkxCard style={{ maxWidth: 320, padding: '20px 24px' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
    <TkxTypography variant="h5" style={{ margin: 0 }}>Quantum Report</TkxTypography>
    <TkxBadge variant="success" pulse>● Live</TkxBadge>
  </div>
  <TkxTypography variant="body2" style={{ opacity: 0.7 }}>
    Real-time quantum annealing results from the optimization engine.
  </TkxTypography>
</TkxCard>\`,
    },
    {
      label: 'Form',
      code: \`<TkxQuantumForm
  fields={[{ name: 'email' }, { name: 'password' }]}
  onSubmit={(v) => alert(JSON.stringify(v))}
  submitLabel="Sign In"
  showConfidence={true}
/>\`,
    },
    {
      label: 'Data Display',
      code: \`<div style={{ display: 'flex', flexDirection: 'column', gap: 20, padding: 8 }}>
  <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
    <TkxStatistic title="Qubits" value={127} suffix=" qbits" />
    <TkxStatistic title="Fidelity" value={99.4} suffix="%" precision={1} />
    <TkxStatistic title="Gate Depth" value={42} />
  </div>
  <TkxProgress value={72} showLabel colorScheme="primary" />
  <TkxProgress value={91} showLabel colorScheme="success" />
</div>\`,
    },
    {
      label: 'Alert Stack',
      code: \`<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
  <TkxAlert type="info"    message="Quantum engine initialized." />
  <TkxAlert type="success" message="Palette optimized — WCAG AAA passed on all pairs." />
  <TkxAlert type="warning" message="Annealing temperature above threshold." />
  <TkxAlert type="error"   message="Decoherence detected in qubit array." />
</div>\`,
    },
  ]}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxPlayground
            imports={TekivexComponents as Record<string, unknown>}
            examples={DEMO_EXAMPLES}
          />
        </div>
      </DemoSection>

      {/* ── 2. Small Embedded Playground ── */}
      <DemoSection
        title="Small Embedded Playground — height=300"
        description="A compact playground suitable for embedding in documentation inline. height=300 gives a tighter split. Useful for single-component demos."
        theme={theme}
        code={`<TkxPlayground
  height={300}
  imports={TekivexComponents}
  defaultCode={\`<TkxButton
  variant="solid"
  colorScheme="primary"
  size="lg"
>
  Hello Quantum!
</TkxButton>\`}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxPlayground
            height={300}
            imports={TekivexComponents as Record<string, unknown>}
            defaultCode={`<TkxButton
  variant="solid"
  colorScheme="primary"
  size="lg"
>
  Hello Quantum!
</TkxButton>`}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Tables ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxPlaygroundProps
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 20px', lineHeight: '1.6' }}>
        All props accepted by{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          TkxPlayground
        </code>.
      </p>
      <div style={{ marginBottom: '40px' }}>
        <PropTable props={PLAYGROUND_PROPS} />
      </div>

      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        PlaygroundExample
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 20px', lineHeight: '1.6' }}>
        Shape of each object in the{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          examples
        </code>{' '}
        array.
      </p>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={EXAMPLE_PROPS} />
      </div>

      {/* Usage note */}
      <hr style={dividerStyle} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
        Sandbox Scope
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 12px', lineHeight: '1.6' }}>
        When you pass{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          imports={`{TekivexComponents}`}
        </code>{' '}
        all exported members of{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          @tekivex/ui
        </code>{' '}
        become top-level variables inside the playground sandbox.
        You can use any component directly by name without an import statement:
      </p>
      <div
        style={{
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          backgroundColor: '#0d1117',
          overflow: 'hidden',
          marginBottom: '32px',
        }}
      >
        <pre
          style={{
            margin: 0,
            padding: '16px 20px',
            fontSize: '12px',
            fontFamily: '"JetBrains Mono", "Fira Code", "SF Mono", monospace',
            color: '#e6edf3',
            lineHeight: '1.7',
            overflowX: 'auto',
            whiteSpace: 'pre',
          }}
        >{`// Available in sandbox scope automatically:
<TkxButton />          // buttons
<TkxBadge />           // badges
<TkxCard />            // cards
<TkxAlert />           // alerts
<TkxTypography />      // typography
<TkxStatistic />       // statistics
<TkxProgress />        // progress bars
<TkxQuantumForm />     // quantum form
<TkxThemeBuilder />    // theme builder
// ...and every other export from @tekivex/ui`}
        </pre>
      </div>

    </div>
  );
}
