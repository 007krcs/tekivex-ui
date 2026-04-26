import { useState } from 'react';
import type { ThemeTokens } from 'tekivex-ui';
import { TkxThemeBuilder } from '../../src/quantum';
import type { ThemeColorState } from '../../src/quantum';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const THEME_BUILDER_PROPS = [
  { name: 'onThemeChange', type: '(theme: ThemeColorState) => void', description: 'Callback fired whenever the quantum annealer produces a new optimized palette. Receives the full ThemeColorState with all color tokens.' },
  { name: 'initialHue', type: 'number', default: '210', description: 'Starting hue angle (0–360) for the base palette. The annealer explores nearby hues during optimization but starts from this seed.' },
  { name: 'initialMode', type: "'light' | 'dark'", default: "'light'", description: 'Starting color mode. Sets the background, surface, and text token polarities before annealing begins.' },
];

// ── Formatted JSON code box ───────────────────────────────────────────────────

function ThemeCodeBox({
  theme,
  exportedTheme,
}: {
  theme: ThemeTokens;
  exportedTheme: ThemeColorState | null;
}) {
  if (!exportedTheme) {
    return (
      <div
        style={{
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          backgroundColor: theme.surfaceAlt,
          padding: '16px 20px',
          fontSize: '13px',
          color: theme.textMuted,
          fontStyle: 'italic',
        }}
      >
        Interact with the theme builder above to see the exported ThemeColorState here.
      </div>
    );
  }

  return (
    <div
      style={{
        borderRadius: '8px',
        border: `1px solid ${theme.border}`,
        backgroundColor: '#0d1117',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '8px 16px',
          backgroundColor: '#161b22',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Exported ThemeColorState
        </span>
      </div>
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
      >
        {JSON.stringify(exportedTheme, null, 2)}
      </pre>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ThemeBuilderPage({ theme }: { theme: ThemeTokens }) {
  const [fullTheme, setFullTheme] = useState<ThemeColorState | null>(null);
  const [darkTheme, setDarkTheme] = useState<ThemeColorState | null>(null);
  const [warmTheme, setWarmTheme] = useState<ThemeColorState | null>(null);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const calloutStyle = {
    borderRadius: '10px',
    border: `1px solid ${theme.warning}30`,
    backgroundColor: `${theme.warning}08`,
    padding: '20px 24px',
    marginBottom: '40px',
  };

  const calloutHeadStyle = {
    fontSize: '13px',
    fontWeight: 700 as const,
    color: theme.warning,
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
        TkxThemeBuilder
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '660px', margin: '0 0 8px' }}>
        A visual, quantum-powered theme builder. Adjust hue, saturation, and mode interactively
        while the quantum annealer continuously optimizes the palette for WCAG AAA contrast,
        perceptual harmony, and global accessibility compliance.
      </p>
      <p style={{ fontSize: '13px', color: theme.textMuted, lineHeight: '1.6', maxWidth: '660px', margin: '0 0 48px' }}>
        <strong style={{ color: theme.text }}>Output:</strong> Every palette change fires{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          onThemeChange
        </code>{' '}
        with a complete{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          ThemeColorState
        </code>{' '}
        you can pass directly to{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          createTheme()
        </code>.
      </p>

      {/* Quantum annealing callout */}
      <div style={calloutStyle}>
        <p style={calloutHeadStyle}>
          🌡️ Quantum Annealing: WCAG-optimal palettes via simulated tunneling
        </p>
        <p style={calloutBodyStyle}>
          Colors are optimized by simulating quantum tunneling through energy barriers. Classical
          gradient descent gets stuck in local optima — for example, two individually-valid colors
          that together violate WCAG AAA contrast. The quantum annealer escapes these traps by
          tunneling through the energy landscape, finding globally optimal palettes that satisfy
          all pairwise contrast constraints simultaneously. Energy graphs show the annealing
          curve in real time as temperature decreases and the system settles into its ground state.
        </p>
      </div>

      {/* ── 1. Full Theme Builder ── */}
      <DemoSection
        title="Full Theme Builder"
        description="The complete builder with hue slider, mode toggle, saturation controls, and real-time energy graph. Every change triggers the quantum annealer and fires onThemeChange with the optimized palette."
        theme={theme}
        code={`const [exportedTheme, setExportedTheme] = useState<ThemeColorState | null>(null);

<TkxThemeBuilder
  onThemeChange={(t) => setExportedTheme(t)}
/>

{/* Use the exported theme with createTheme: */}
{exportedTheme && (
  <pre>{JSON.stringify(exportedTheme, null, 2)}</pre>
)}`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TkxThemeBuilder onThemeChange={(t) => setFullTheme(t)} />
          <ThemeCodeBox theme={theme} exportedTheme={fullTheme} />
        </div>
      </DemoSection>

      {/* ── 2. Dark Mode ── */}
      <DemoSection
        title="Dark Mode — initialMode & initialHue"
        description='initialMode="dark" starts the builder with dark-polarity background/surface/text tokens. initialHue=220 seeds the palette at a cool blue-indigo hue before annealing.'
        theme={theme}
        code={`<TkxThemeBuilder
  initialMode="dark"
  initialHue={220}
  onThemeChange={(t) => setDarkTheme(t)}
/>`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TkxThemeBuilder
            initialMode="dark"
            initialHue={220}
            onThemeChange={(t) => setDarkTheme(t)}
          />
          <ThemeCodeBox theme={theme} exportedTheme={darkTheme} />
        </div>
      </DemoSection>

      {/* ── 3. Warm Palette ── */}
      <DemoSection
        title="Warm Palette — Hue 30"
        description="initialHue=30 seeds the optimizer at amber/orange. The annealer explores adjacent warm hues to find the globally optimal warm palette satisfying all contrast constraints."
        theme={theme}
        code={`<TkxThemeBuilder
  initialHue={30}
  initialMode="light"
  onThemeChange={(t) => setWarmTheme(t)}
/>`}
      >
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <TkxThemeBuilder
            initialHue={30}
            initialMode="light"
            onThemeChange={(t) => setWarmTheme(t)}
          />
          <ThemeCodeBox theme={theme} exportedTheme={warmTheme} />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 8px', letterSpacing: '-0.02em' }}>
        TkxThemeBuilderProps
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 20px', lineHeight: '1.6' }}>
        All props accepted by{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          TkxThemeBuilder
        </code>.
        The component is self-contained — no ThemeProvider is required.
      </p>
      <div style={{ marginBottom: '48px' }}>
        <PropTable props={THEME_BUILDER_PROPS} />
      </div>

      {/* ThemeColorState explanation */}
      <hr style={dividerStyle} />
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.02em' }}>
        ThemeColorState
      </h2>
      <p style={{ fontSize: '13.5px', color: theme.textMuted, margin: '0 0 16px', lineHeight: '1.6' }}>
        The object emitted by{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          onThemeChange
        </code>. Pass it directly to{' '}
        <code style={{ fontSize: '12px', backgroundColor: `${theme.primary}14`, color: theme.primary, padding: '1px 5px', borderRadius: '4px', border: `1px solid ${theme.primary}20` }}>
          createTheme()
        </code>{' '}
        to apply the palette to your entire app via ThemeProvider.
      </p>
      <div
        style={{
          borderRadius: '8px',
          border: `1px solid ${theme.border}`,
          backgroundColor: '#0d1117',
          overflow: 'hidden',
          marginBottom: '48px',
        }}
      >
        <div style={{ padding: '8px 16px', backgroundColor: '#161b22', borderBottom: `1px solid ${theme.border}` }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#8b949e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            ThemeColorState — type definition
          </span>
        </div>
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
        >{`interface ThemeColorState {
  primary:    string; // e.g. '#00f5d4'
  secondary:  string;
  background: string;
  surface:    string;
  text:       string;
  // ... additional tokens emitted by the annealer
}`}
        </pre>
      </div>

    </div>
  );
}
