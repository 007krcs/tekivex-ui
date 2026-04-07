import { useState, useEffect } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import { TkxLiveMetrics } from '@tekivex/ui';
import type { MetricItem } from '@tekivex/ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';

// ── Prop definitions ──────────────────────────────────────────────────────────

const LIVE_METRICS_PROPS = [
  { name: 'metrics', type: 'MetricItem[]', default: '—', description: 'Array of metric items to display. Each item has id, label, value, and optional unit, trend, sparkline, status.' },
  { name: 'columns', type: 'number', default: '3', description: 'Number of columns in the metrics grid.' },
  { name: 'animate', type: 'boolean', default: 'true', description: 'Enables shimmer animation when a value changes.' },
  { name: 'refreshInterval', type: 'number', default: 'undefined', description: 'If provided, fires a CSS pulse on all cards at this interval (ms). For visual heartbeat only — data updates are handled externally.' },
  { name: 'onMetricClick', type: '(metric: MetricItem) => void', default: 'undefined', description: 'Callback invoked when a metric card is clicked.' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function noise(base: number, range: number) {
  return +(base + (Math.random() - 0.5) * 2 * range).toFixed(2);
}

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(min, val));
}

function pushSparkline(arr: number[], value: number, maxLen = 20): number[] {
  return [...arr, value].slice(-maxLen);
}

// ── Initial server metrics ────────────────────────────────────────────────────

function makeServerMetrics(
  cpu: number,
  mem: number,
  rps: number,
  err: number,
  p99: number,
  conns: number,
  sparklines: Record<string, number[]>,
): MetricItem[] {
  return [
    {
      id: 'cpu',
      label: 'CPU Usage',
      value: cpu,
      unit: '%',
      trend: cpu > 60 ? 'up' : 'flat',
      trendValue: `${cpu.toFixed(1)}%`,
      sparkline: sparklines['cpu'] ?? [],
      status: cpu > 80 ? 'critical' : cpu > 60 ? 'warning' : 'normal',
    },
    {
      id: 'mem',
      label: 'Memory Usage',
      value: mem,
      unit: '%',
      trend: mem > 70 ? 'up' : 'flat',
      trendValue: `${mem.toFixed(1)}%`,
      sparkline: sparklines['mem'] ?? [],
      status: mem > 85 ? 'critical' : mem > 70 ? 'warning' : 'normal',
    },
    {
      id: 'rps',
      label: 'Requests/sec',
      value: rps,
      unit: 'req/s',
      trend: rps > 1000 ? 'up' : 'down',
      trendValue: `${rps.toFixed(0)}`,
      sparkline: sparklines['rps'] ?? [],
      status: 'normal',
    },
    {
      id: 'err',
      label: 'Error Rate',
      value: err,
      unit: '%',
      trend: err > 2 ? 'up' : 'down',
      trendValue: `${err.toFixed(2)}%`,
      sparkline: sparklines['err'] ?? [],
      status: err > 5 ? 'critical' : err > 2 ? 'warning' : 'normal',
    },
    {
      id: 'p99',
      label: 'P99 Latency',
      value: p99,
      unit: 'ms',
      trend: p99 > 200 ? 'up' : 'down',
      trendValue: `${p99.toFixed(0)}ms`,
      sparkline: sparklines['p99'] ?? [],
      status: p99 > 500 ? 'critical' : p99 > 200 ? 'warning' : 'normal',
    },
    {
      id: 'conns',
      label: 'Active Connections',
      value: conns,
      unit: '',
      trend: 'flat',
      trendValue: String(conns),
      sparkline: sparklines['conns'] ?? [],
      status: 'normal',
    },
  ];
}

// ── Initial KPI metrics ───────────────────────────────────────────────────────

function makeKpiMetrics(
  revenue: number,
  orders: number,
  conversion: number,
  aov: number,
  sparklines: Record<string, number[]>,
): MetricItem[] {
  return [
    {
      id: 'revenue',
      label: 'Revenue Today',
      value: revenue,
      unit: '$',
      trend: 'up',
      trendValue: `+${(revenue * 0.05).toFixed(0)}`,
      sparkline: sparklines['revenue'] ?? [],
      status: 'normal',
    },
    {
      id: 'orders',
      label: 'Orders',
      value: orders,
      unit: '',
      trend: 'up',
      trendValue: `+${Math.floor(orders * 0.03)}`,
      sparkline: sparklines['orders'] ?? [],
      status: 'normal',
    },
    {
      id: 'conversion',
      label: 'Conversion Rate',
      value: conversion,
      unit: '%',
      trend: conversion > 3 ? 'up' : 'down',
      trendValue: `${conversion.toFixed(2)}%`,
      sparkline: sparklines['conversion'] ?? [],
      status: conversion < 2 ? 'warning' : 'normal',
    },
    {
      id: 'aov',
      label: 'Avg Order Value',
      value: aov,
      unit: '$',
      trend: 'flat',
      trendValue: `$${aov.toFixed(2)}`,
      sparkline: sparklines['aov'] ?? [],
      status: 'normal',
    },
  ];
}

// ── Initial sparkline seeds ───────────────────────────────────────────────────

function initSparklines(keys: string[], lengths: number): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  for (const k of keys) {
    out[k] = Array.from({ length: lengths }, () => Math.random() * 80 + 10);
  }
  return out;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function LiveMetricsPage({ theme }: { theme: ThemeTokens }) {
  // Server dashboard state
  const [serverSparklines, setServerSparklines] = useState(() =>
    initSparklines(['cpu', 'mem', 'rps', 'err', 'p99', 'conns'], 20),
  );
  const [cpu, setCpu] = useState(45);
  const [mem, setMem] = useState(62);
  const [rps, setRps] = useState(820);
  const [err, setErr] = useState(1.2);
  const [p99, setP99] = useState(145);
  const [conns, setConns] = useState(380);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu((v) => { const n = clamp(noise(v, 8), 5, 98); setServerSparklines((s) => ({ ...s, cpu: pushSparkline(s['cpu'], n) })); return n; });
      setMem((v) => { const n = clamp(noise(v, 5), 20, 95); setServerSparklines((s) => ({ ...s, mem: pushSparkline(s['mem'], n) })); return n; });
      setRps((v) => { const n = clamp(noise(v, 120), 100, 3000); setServerSparklines((s) => ({ ...s, rps: pushSparkline(s['rps'], n) })); return n; });
      setErr((v) => { const n = clamp(noise(v, 1), 0, 15); setServerSparklines((s) => ({ ...s, err: pushSparkline(s['err'], n) })); return n; });
      setP99((v) => { const n = clamp(noise(v, 40), 10, 800); setServerSparklines((s) => ({ ...s, p99: pushSparkline(s['p99'], n) })); return n; });
      setConns((v) => { const n = Math.round(clamp(noise(v, 50), 10, 1000)); setServerSparklines((s) => ({ ...s, conns: pushSparkline(s['conns'], n) })); return n; });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const serverMetrics = makeServerMetrics(cpu, mem, rps, err, p99, conns, serverSparklines);

  // KPI state
  const [kpiSparklines, setKpiSparklines] = useState(() =>
    initSparklines(['revenue', 'orders', 'conversion', 'aov'], 20),
  );
  const [revenue, setRevenue] = useState(14_320);
  const [orders, setOrders] = useState(184);
  const [conversion, setConversion] = useState(3.4);
  const [aov, setAov] = useState(77.8);

  useEffect(() => {
    const interval = setInterval(() => {
      setRevenue((v) => { const n = clamp(v + Math.random() * 200, 0, 100_000); setKpiSparklines((s) => ({ ...s, revenue: pushSparkline(s['revenue'], n) })); return +n.toFixed(2); });
      setOrders((v) => { const n = Math.round(clamp(v + Math.round(Math.random() * 5), 0, 10_000)); setKpiSparklines((s) => ({ ...s, orders: pushSparkline(s['orders'], n) })); return n; });
      setConversion((v) => { const n = clamp(noise(v, 0.5), 0.5, 10); setKpiSparklines((s) => ({ ...s, conversion: pushSparkline(s['conversion'], n) })); return +n.toFixed(2); });
      setAov((v) => { const n = clamp(noise(v, 5), 10, 300); setKpiSparklines((s) => ({ ...s, aov: pushSparkline(s['aov'], n) })); return +n.toFixed(2); });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const kpiMetrics = makeKpiMetrics(revenue, orders, conversion, aov, kpiSparklines);

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
        TkxLiveMetrics
      </h1>
      <p style={{ fontSize: '15px', color: theme.textMuted, lineHeight: '1.75', maxWidth: '640px', margin: '0 0 48px' }}>
        A live metrics dashboard card grid with sparklines, trend arrows, and status-based color coding.
        Values animate on change with a shimmer effect. Ideal for server dashboards and business KPI panels.
      </p>

      {/* ── 1. Server Dashboard ── */}
      <DemoSection
        title="Server Dashboard — 6 Metrics at 1.5s"
        description="CPU, memory, requests/sec, error rate, P99 latency, and active connections update every 1.5 seconds. CPU>80% triggers critical status (red), CPU>60% triggers warning (yellow). Each card shows a 20-point sparkline."
        theme={theme}
        code={`const [cpu, setCpu] = useState(45);
// ... other metric states

useEffect(() => {
  const interval = setInterval(() => {
    setCpu(prev => clamp(prev + (Math.random() - 0.5) * 16, 5, 98));
    // update other metrics...
  }, 1500);
  return () => clearInterval(interval);
}, []);

const metrics: MetricItem[] = [
  {
    id: 'cpu',
    label: 'CPU Usage',
    value: cpu,
    unit: '%',
    trend: cpu > 60 ? 'up' : 'flat',
    sparkline: cpuHistory,
    status: cpu > 80 ? 'critical' : cpu > 60 ? 'warning' : 'normal',
  },
  // ... other metrics
];

<TkxLiveMetrics metrics={metrics} columns={3} animate={true} />`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.success }}>● LIVE</span>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>Updating every 1.5s</span>
          </div>
          <TkxLiveMetrics metrics={serverMetrics} columns={3} animate={true} />
        </div>
      </DemoSection>

      {/* ── 2. Business KPIs ── */}
      <DemoSection
        title="Business KPIs — 4 Metrics at 3s"
        description="Revenue, orders, conversion rate, and average order value update every 3 seconds. Revenue increments monotonically to simulate a running daily total."
        theme={theme}
        code={`const metrics: MetricItem[] = [
  {
    id: 'revenue',
    label: 'Revenue Today',
    value: 14320,
    unit: '$',
    trend: 'up',
    trendValue: '+720',
    sparkline: revenueHistory,
    status: 'normal',
  },
  // ... other KPIs
];

<TkxLiveMetrics metrics={metrics} columns={4} animate={true} />`}
      >
        <div style={{ width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: theme.primary }}>● LIVE</span>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>Updating every 3s</span>
          </div>
          <TkxLiveMetrics metrics={kpiMetrics} columns={4} animate={true} />
        </div>
      </DemoSection>

      <hr style={dividerStyle} />

      {/* ── Props Table ── */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: theme.text, margin: '0 0 20px', letterSpacing: '-0.02em' }}>
        Props Reference
      </h2>
      <PropTable props={LIVE_METRICS_PROPS} />
    </div>
  );
}
