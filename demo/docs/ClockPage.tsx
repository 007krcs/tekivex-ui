import type { ThemeTokens } from '@tekivex/ui';
import { TkxClock } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';

export function ClockPage({ theme }: { theme: ThemeTokens }) {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px', color: theme.text }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Clock</h1>
      <p style={{ color: theme.textMuted, marginBottom: 32 }}>
        Live ticking clock with analog, digital, and combined modes. Classic, minimal, and modern styles.
      </p>

      <DemoSection
        title="Analog Clocks"
        description="Three visual styles for the analog clock face: classic, minimal, and modern."
        theme={theme}
        code={`import { TkxClock } from '@tekivex/ui';

<TkxClock variant="analog" analogStyle="classic" size="md" />
<TkxClock variant="analog" analogStyle="minimal" size="md" />
<TkxClock variant="analog" analogStyle="modern" size="md" />`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <TkxClock variant="analog" analogStyle="classic" size="md" />
            <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Classic</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <TkxClock variant="analog" analogStyle="minimal" size="md" />
            <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Minimal</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <TkxClock variant="analog" analogStyle="modern" size="md" />
            <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Modern</p>
          </div>
        </div>
      </DemoSection>

      <DemoSection
        title="Digital Clock"
        description="Digital display with 12-hour and 24-hour formats."
        theme={theme}
        code={`<TkxClock variant="digital" format="12h" />
<TkxClock variant="digital" format="24h" showSeconds />`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
          <TkxClock variant="digital" format="12h" />
          <TkxClock variant="digital" format="24h" showSeconds />
        </div>
      </DemoSection>

      <DemoSection
        title="Combined"
        description="Shows both analog and digital displays together."
        theme={theme}
        code={`<TkxClock variant="both" analogStyle="modern" size="lg" showSeconds />`}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <TkxClock variant="both" analogStyle="modern" size="lg" showSeconds />
        </div>
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
            ['variant', '"analog" | "digital" | "both"', '"analog"', 'Clock display mode'],
            ['analogStyle', '"classic" | "minimal" | "modern"', '"classic"', 'Visual style for analog clock'],
            ['format', '"12h" | "24h"', '"12h"', 'Time format for digital display'],
            ['size', '"sm" | "md" | "lg" | "xl"', '"md"', 'Clock size preset (120/180/240/320 px)'],
            ['showSeconds', 'boolean', 'false', 'Show seconds hand / digital seconds'],
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
