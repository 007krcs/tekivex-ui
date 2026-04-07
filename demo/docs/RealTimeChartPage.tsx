import { useState, useEffect } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxRealTimeChart } from '../../src/realtime';
import type { ChartDataPoint } from '../../src/realtime';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const REALTIME_CHART_PROPS = [
  { name: 'data', type: 'ChartDataPoint[]', default: '—', description: 'Array of { timestamp, value, label? } points. Points are plotted left-to-right oldest-to-newest.' },
  { name: 'maxPoints', type: 'number', default: '60', description: 'Maximum number of data points to render. Older points are dropped when exceeded.' },
  { name: 'height', type: 'number', default: '200', description: 'Chart height in pixels.' },
  { name: 'width', type: 'number | string', default: "'100%'", description: 'Chart width. Accepts pixel numbers or CSS strings.' },
  { name: 'color', type: 'string', default: 'theme.primary', description: 'Line and fill color (hex, RGB, HSL, etc.).' },
  { name: 'fill', type: 'boolean', default: 'false', description: 'Fills the area below the line with a semi-transparent gradient.' },
  { name: 'showGrid', type: 'boolean', default: 'false', description: 'Renders horizontal grid lines at even Y intervals.' },
  { name: 'showLabels', type: 'boolean', default: 'false', description: 'Shows Y-axis value labels on the left side.' },
  { name: 'showTooltip', type: 'boolean', default: 'true', description: 'Enables hover tooltip showing the data point value and timestamp.' },
  { name: 'label', type: 'string', default: 'undefined', description: 'Title displayed above the chart.' },
  { name: 'unit', type: 'string', default: 'undefined', description: 'Unit string appended to Y-axis labels and tooltip values (e.g., "%", "ms", "MB/s").' },
  { name: 'animate', type: 'boolean', default: 'true', description: 'Enables line draw animation when new points are added.' },
  { name: 'yMin', type: 'number', default: 'undefined', description: 'Fixed minimum Y-axis value. When omitted the axis auto-scales.' },
  { name: 'yMax', type: 'number', default: 'undefined', description: 'Fixed maximum Y-axis value. When omitted the axis auto-scales.' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function noise(base: number, range: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, base + (Math.random() - 0.5) * 2 * range));
}

function makePoint(value: number): ChartDataPoint {
  return { timestamp: Date.now(), value: +value.toFixed(2) };
}

function initData(count: number, base: number, range: number, min: number, max: number): ChartDataPoint[] {
  const points: ChartDataPoint[] = [];
  let v = base;
  const now = Date.now();
  for (let i = count; i >= 0; i--) {
    v = noise(v, range, min, max);
    points.push({ timestamp: now - i * 500, value: +v.toFixed(2) });
  }
  return points;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function RealTimeChartPage({ theme }: { theme: ThemeTokens }) {
  // Demo 1: CPU monitor
  const [cpuData, setCpuData] = useState<ChartDataPoint[]>(() =>
    initData(30, 45, 10, 0, 100),
  );
  const [cpuVal, setCpuVal] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpuVal((v) => {
        const next = noise(v, 10, 0, 100);
        setCpuData((d) => [...d, makePoint(next)].slice(-60));
        return next;
      });
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Demo 2: Network in/out
  const [netInData, setNetInData] = useState<ChartDataPoint[]>(() =>
    initData(20, 30, 15, 0, 200),
  );
  const [netOutData, setNetOutData] = useState<ChartDataPoint[]>(() =>
    initData(20, 15, 8, 0, 200),
  );
  const [netInVal, setNetInVal] = useState(30);
  const [netOutVal, setNetOutVal] = useState(15);

  useEffect(() => {
    const interval = setInterval(() => {
      setNetInVal((v) => {
        const next = noise(v, 15, 0, 200);
        setNetInData((d) => [...d, makePoint(next)].slice(-40));
        return next;
      });
      setNetOutVal((v) => {
        const next = noise(v, 8, 0, 200);
        setNetOutData((d) => [...d, makePoint(next)].slice(-40));
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Demo 3: Memory usage (custom styling)
  const [memData, setMemData] = useState<ChartDataPoint[]>(() =>
    initData(30, 55, 5, 20, 90),
  );
  const [memVal, setMemVal] = useState(55);

  useEffect(() => {
    const interval = setInterval(() => {
      setMemVal((v) => {
        const next = noise(v, 5, 20, 90);
        setMemData((d) => [...d, makePoint(next)].slice(-60));
        return next;
      });
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const dividerStyle = {
    height: '1px',
    backgroundColor: theme.border,
    margin: '48px 0',
    border: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 32px 80px' }}>
      {/* Hero */}
      <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: theme.text, margin: '0 0 12px', letterSpacing: '-0.03em', lineHeight: 1.15 }}>
        TkxRealTimeChart
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A lightweight SVG line chart optimised for streaming data. Append new points and old ones scroll off the left edge.
        Supports fill, grid lines, Y-axis labels, hover tooltips, and fully custom colors.
      </p>

      {/* ── 1. Live CPU Monitor ── */}
      <DemoSection
        title="Live CPU Monitor — fill + grid"
        description="New data points are appended every 500ms simulating CPU usage (0–100%). fill=true draws a gradient area below the line. showGrid=true adds horizontal reference lines. yMin=0 and yMax=100 keep the axis stable."
        theme={theme}
        code={`const [data, setData] = useState<ChartDataPoint[]>(initialData);

useEffect(() => {
  const interval = setInterval(() => {
    setData(prev => [
      ...prev,
      { timestamp: Date.now(), value: nextCpuValue() },
    ].slice(-60));
  }, 500);
  return () => clearInterval(interval);
}, []);

<TkxRealTimeChart
  data={data}
  maxPoints={60}
  height={200}
  label="CPU Usage"
  unit="%"
  fill={true}
  showGrid={true}
  yMin={0}
  yMax={100}
/>`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.success }}>● LIVE</span>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>
              Current: {cpuVal.toFixed(1)}% — updating every 500ms
            </span>
          </div>
          <TkxRealTimeChart
            data={cpuData}
            maxPoints={60}
            height={200}
            label="CPU Usage"
            unit="%"
            fill={true}
            showGrid={true}
            yMin={0}
            yMax={100}
          />
        </div>
      </DemoSection>

      {/* ── 2. Network Throughput ── */}
      <DemoSection
        title="Network Throughput — Two Charts Side by Side"
        description="Inbound and outbound network throughput charts updating every 1 second. Rendered side by side to compare traffic direction at a glance. Different colors distinguish in vs out."
        theme={theme}
        code={`// Two independent state arrays
const [netInData, setNetInData] = useState(initialIn);
const [netOutData, setNetOutData] = useState(initialOut);

useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();
    setNetInData(prev => [...prev, { timestamp: now, value: nextIn() }].slice(-40));
    setNetOutData(prev => [...prev, { timestamp: now, value: nextOut() }].slice(-40));
  }, 1000);
  return () => clearInterval(interval);
}, []);

<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
  <TkxRealTimeChart
    data={netInData} maxPoints={40} height={160}
    label="Inbound" unit="MB/s" color="#10b981" fill showGrid
  />
  <TkxRealTimeChart
    data={netOutData} maxPoints={40} height={160}
    label="Outbound" unit="MB/s" color="#f59e0b" fill showGrid
  />
</div>`}
      >
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <TkxRealTimeChart
            data={netInData}
            maxPoints={40}
            height={160}
            label="Inbound"
            unit="MB/s"
            color="#10b981"
            fill={true}
            showGrid={true}
          />
          <TkxRealTimeChart
            data={netOutData}
            maxPoints={40}
            height={160}
            label="Outbound"
            unit="MB/s"
            color="#f59e0b"
            fill={true}
            showGrid={true}
          />
        </div>
      </DemoSection>

      {/* ── 3. Custom Styling ── */}
      <DemoSection
        title="Custom Styling — Purple, No Fill, showLabels"
        description="A purple (#7c3aed) line with no fill area, showLabels=true to display Y-axis tick values, and showGrid=true. Demonstrates how to style the chart for brand-specific UIs."
        theme={theme}
        code={`<TkxRealTimeChart
  data={memData}
  maxPoints={60}
  height={220}
  color="#7c3aed"
  fill={false}
  showGrid={true}
  showLabels={true}
  label="Memory Usage"
  unit="%"
  yMin={0}
  yMax={100}
/>`}
      >
        <div style={{ width: '100%' }}>
          <TkxRealTimeChart
            data={memData}
            maxPoints={60}
            height={220}
            color="#7c3aed"
            fill={false}
            showGrid={true}
            showLabels={true}
            label="Memory Usage"
            unit="%"
            yMin={0}
            yMax={100}
          />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <PropTable props={REALTIME_CHART_PROPS} />
    </div>
  );
}
