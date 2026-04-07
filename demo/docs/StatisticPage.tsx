import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxStatistic, TkxCountdown, TkxButton } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const STATISTIC_PROPS = [
  { name: 'title', type: 'string', required: true, description: 'Label displayed above the statistic value.' },
  { name: 'value', type: 'number | string', required: true, description: 'The statistic value to display.' },
  { name: 'prefix', type: 'ReactNode', default: 'undefined', description: 'Content rendered before the value (e.g. currency symbol).' },
  { name: 'suffix', type: 'ReactNode', default: 'undefined', description: 'Content rendered after the value (e.g. unit or percent sign).' },
  { name: 'precision', type: 'number', default: 'undefined', description: 'Number of decimal places to display.' },
  { name: 'groupSeparator', type: 'string', default: "','", description: 'Character used as a thousands separator.' },
  { name: 'valueStyle', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the value element.' },
  { name: 'loading', type: 'boolean', default: 'false', description: 'Shows a skeleton placeholder instead of the value.' },
  { name: 'trend', type: "'up' | 'down'", default: 'undefined', description: 'Shows an arrow indicator for trend direction.' },
  { name: 'trendValue', type: 'string', default: 'undefined', description: 'Text displayed next to the trend arrow (e.g. "12.5%").' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root container.' },
];

const COUNTDOWN_PROPS = [
  { name: 'title', type: 'string', required: true, description: 'Label displayed above the countdown.' },
  { name: 'value', type: 'number', required: true, description: 'Target timestamp in milliseconds (Date.now()-based).' },
  { name: 'format', type: 'string', default: "'HH:mm:ss'", description: 'Format string. Supports DD, HH, mm, ss tokens.' },
  { name: 'onFinish', type: '() => void', default: 'undefined', description: 'Callback fired when the countdown reaches zero.' },
  { name: 'prefix', type: 'ReactNode', default: 'undefined', description: 'Content rendered before the countdown value.' },
  { name: 'suffix', type: 'ReactNode', default: 'undefined', description: 'Content rendered after the countdown value.' },
  { name: 'style', type: 'CSSProperties', default: 'undefined', description: 'Inline styles applied to the root container.' },
];

// ── Page ─────────────────────────────────────────────────────────────────────

export function StatisticPage({ theme }: { theme: ThemeTokens }) {
  const [loading, setLoading] = useState(false);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  const sectionTitle = {
    fontSize: '20px',
    fontWeight: 700 as const,
    color: theme.text,
    margin: '0 0 8px',
  };

  const sectionDesc = {
    fontSize: '14px',
    color: theme.textMuted,
    margin: '0 0 24px',
    lineHeight: 1.6,
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
  };

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: theme.text, margin: '0 0 8px' }}>
          Statistic
        </h1>
        <p style={{ fontSize: '15px', color: theme.textMuted, margin: 0, lineHeight: 1.6 }}>
          Display numeric values with labels, formatting, trends, and countdown timers.
        </p>
      </div>

      {/* ── Basic ── */}
      <h2 style={sectionTitle}>Basic Statistic</h2>
      <p style={sectionDesc}>Simple numeric display with a title label.</p>

      <DemoSection
        title="Basic Usage"
        description="Pass a title and value to display a formatted statistic."
        theme={theme}
        code={`<TkxStatistic title="Active Users" value={112893} />
<TkxStatistic title="Revenue" value={98432.5} precision={2} />`}
      >
        <div style={gridStyle}>
          <TkxStatistic title="Active Users" value={112893} />
          <TkxStatistic title="Revenue" value={98432.5} precision={2} />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Prefix / Suffix ── */}
      <h2 style={sectionTitle}>Prefix and Suffix</h2>
      <p style={sectionDesc}>Add context with prefix and suffix elements.</p>

      <DemoSection
        title="With Prefix & Suffix"
        description="Prefix and suffix can be strings or React nodes."
        theme={theme}
        code={`<TkxStatistic title="Account Balance" value={25600} prefix="$" precision={2} />
<TkxStatistic title="Growth Rate" value={93.2} suffix="%" precision={1} />`}
      >
        <div style={gridStyle}>
          <TkxStatistic title="Account Balance" value={25600} prefix="$" precision={2} />
          <TkxStatistic title="Growth Rate" value={93.2} suffix="%" precision={1} />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Trend ── */}
      <h2 style={sectionTitle}>Trend Indicator</h2>
      <p style={sectionDesc}>Show directional trends with arrows and percentage values.</p>

      <DemoSection
        title="Up and Down Trends"
        description="Use trend and trendValue to indicate change direction."
        theme={theme}
        code={`<TkxStatistic
  title="Monthly Sales"
  value={8846}
  trend="up"
  trendValue="12.5%"
/>
<TkxStatistic
  title="Bounce Rate"
  value={23.1}
  suffix="%"
  precision={1}
  trend="down"
  trendValue="3.2%"
/>`}
      >
        <div style={gridStyle}>
          <TkxStatistic title="Monthly Sales" value={8846} trend="up" trendValue="12.5%" />
          <TkxStatistic
            title="Bounce Rate"
            value={23.1}
            suffix="%"
            precision={1}
            trend="down"
            trendValue="3.2%"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Loading ── */}
      <h2 style={sectionTitle}>Loading State</h2>
      <p style={sectionDesc}>Show a skeleton placeholder while data is being fetched.</p>

      <DemoSection
        title="Loading Skeleton"
        description="Toggle the loading prop to show or hide the skeleton."
        theme={theme}
        code={`<TkxStatistic title="Total Orders" value={4521} loading={loading} />
<TkxButton onClick={() => setLoading(!loading)}>
  Toggle Loading
</TkxButton>`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={gridStyle}>
            <TkxStatistic title="Total Orders" value={4521} loading={loading} />
            <TkxStatistic title="Conversion" value={3.8} suffix="%" precision={1} loading={loading} />
          </div>
          <TkxButton onClick={() => setLoading(!loading)}>Toggle Loading</TkxButton>
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Countdown ── */}
      <h2 style={sectionTitle}>Countdown</h2>
      <p style={sectionDesc}>TkxCountdown counts down to a target timestamp with configurable format.</p>

      <DemoSection
        title="Countdown Timer"
        description="Set value to a future timestamp (Date.now() + duration)."
        theme={theme}
        code={`<TkxCountdown
  title="Event Starts In"
  value={Date.now() + 1000 * 60 * 60 * 24}
  format="DD:HH:mm:ss"
/>
<TkxCountdown
  title="Sale Ends"
  value={Date.now() + 1000 * 60 * 30}
  format="mm:ss"
  onFinish={() => console.log('Finished!')}
/>`}
      >
        <div style={gridStyle}>
          <TkxCountdown
            title="Event Starts In"
            value={Date.now() + 1000 * 60 * 60 * 24}
            format="DD:HH:mm:ss"
          />
          <TkxCountdown
            title="Sale Ends"
            value={Date.now() + 1000 * 60 * 30}
            format="mm:ss"
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Tables ── */}
      <h2 style={sectionTitle}>TkxStatistic Props</h2>
      <PropTable props={STATISTIC_PROPS} />

      <div style={{ marginTop: '32px' }}>
        <h2 style={sectionTitle}>TkxCountdown Props</h2>
        <PropTable props={COUNTDOWN_PROPS} />
      </div>
    </div>
  );
}
