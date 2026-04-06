import type { CSSProperties } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxClock } from '@tekivex/ui';

export function ClockPage({ theme }: { theme: ThemeTokens }) {
  const wrap: CSSProperties = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '40px 32px',
    color: theme.text,
  };

  const demoBox: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
    padding: 40,
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    background: theme.surface,
    flexWrap: 'wrap',
    marginBottom: 32,
  };

  return (
    <div style={wrap}>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>Clock</h1>
      <p style={{ color: theme.textMuted, marginBottom: 32 }}>
        Live ticking clock with analog, digital, and combined modes. Classic, minimal, and modern styles.
      </p>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Analog Clocks</h2>
      <div style={demoBox}>
        <div style={{ textAlign: 'center' }}>
          <TkxClock variant="analog" analogStyle="classic" size={160} />
          <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Classic</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <TkxClock variant="analog" analogStyle="minimal" size={160} />
          <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Minimal</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <TkxClock variant="analog" analogStyle="modern" size={160} />
          <p style={{ marginTop: 8, fontSize: 12, color: theme.textMuted }}>Modern</p>
        </div>
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Digital Clock</h2>
      <div style={demoBox}>
        <TkxClock variant="digital" format="12h" />
        <TkxClock variant="digital" format="24h" showSeconds />
      </div>

      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: 16 }}>Combined</h2>
      <div style={demoBox}>
        <TkxClock variant="both" analogStyle="modern" size={200} showSeconds />
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
            ['variant', '"analog" | "digital" | "both"', '"analog"', 'Clock display mode'],
            ['analogStyle', '"classic" | "minimal" | "modern"', '"classic"', 'Visual style for analog clock'],
            ['format', '"12h" | "24h"', '"12h"', 'Time format for digital display'],
            ['size', 'number', '200', 'Size in px for analog clock'],
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
