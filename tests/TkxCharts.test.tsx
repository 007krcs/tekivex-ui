import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxAreaChart } from '../src/charts/TkxAreaChart';
import { TkxBarChart } from '../src/charts/TkxBarChart';
import { TkxLineChart } from '../src/charts/TkxLineChart';
import { TkxPieChart } from '../src/charts/TkxPieChart';
import { TkxDonutChart } from '../src/charts/TkxDonutChart';
import { TkxScatterChart } from '../src/charts/TkxScatterChart';
import { TkxRadarChart } from '../src/charts/TkxRadarChart';

// Recharts v3 uses `new ResizeObserver()` (constructor) — a vi.fn() mock is
// not callable as a constructor under strict typings, so use a real class.
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock as unknown as typeof ResizeObserver;

function Wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const lineBarData = [
  { month: 'Jan', sales: 4000, returns: 400 },
  { month: 'Feb', sales: 3000, returns: 300 },
  { month: 'Mar', sales: 5000, returns: 500 },
];

const series = [
  { key: 'sales', label: 'Sales' },
  { key: 'returns', label: 'Returns' },
];

const sliceData = [
  { name: 'Alpha', value: 400 },
  { name: 'Beta', value: 300 },
  { name: 'Gamma', value: 200 },
];

const radarData = [
  { metric: 'Speed', a: 80, b: 60 },
  { metric: 'Power', a: 70, b: 90 },
  { metric: 'Range', a: 65, b: 75 },
];

const scatterSeries = [
  { name: 'Group A', data: [{ x: 10, y: 20 }, { x: 30, y: 40 }] },
  { name: 'Group B', data: [{ x: 15, y: 25 }, { x: 35, y: 45 }] },
];

// ── TkxAreaChart ──────────────────────────────────────────────────────────────

describe('TkxAreaChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxAreaChart data={lineBarData} series={series} xKey="month" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(
      <TkxAreaChart data={lineBarData} series={series} xKey="month" ariaLabel="Sales area chart" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Sales area chart' })).toBeInTheDocument();
  });

  it('accepts smooth and showGrid props', () => {
    const { container } = render(
      <TkxAreaChart data={lineBarData} series={series} xKey="month" smooth showGrid showLegend />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with custom height', () => {
    const { container } = render(
      <TkxAreaChart data={lineBarData} series={series} xKey="month" height={200} />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxBarChart ───────────────────────────────────────────────────────────────

describe('TkxBarChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxBarChart data={lineBarData} series={series} xKey="month" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(
      <TkxBarChart data={lineBarData} series={series} xKey="month" ariaLabel="Sales bar chart" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Sales bar chart' })).toBeInTheDocument();
  });

  it('accepts horizontal layout prop', () => {
    const { container } = render(
      <TkxBarChart data={lineBarData} series={series} xKey="month" layout="horizontal" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders stacked bars', () => {
    const stackedSeries = [
      { key: 'sales', label: 'Sales', stackId: 'a' },
      { key: 'returns', label: 'Returns', stackId: 'a' },
    ];
    const { container } = render(
      <TkxBarChart data={lineBarData} series={stackedSeries} xKey="month" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxLineChart ──────────────────────────────────────────────────────────────

describe('TkxLineChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxLineChart data={lineBarData} series={series} xKey="month" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(
      <TkxLineChart data={lineBarData} series={series} xKey="month" ariaLabel="Monthly line chart" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Monthly line chart' })).toBeInTheDocument();
  });

  it('accepts dashed series and reference lines', () => {
    const dashedSeries = [{ key: 'sales', label: 'Sales', dashed: true }];
    const refLines = [{ y: 4000, label: 'Target', dashed: true }];
    const { container } = render(
      <TkxLineChart data={lineBarData} series={dashedSeries} xKey="month" referenceLines={refLines} />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxPieChart ───────────────────────────────────────────────────────────────

describe('TkxPieChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxPieChart data={sliceData} />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(
      <TkxPieChart data={sliceData} ariaLabel="Distribution pie chart" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Distribution pie chart' })).toBeInTheDocument();
  });

  it('renders with legend and labels', () => {
    const { container } = render(
      <TkxPieChart data={sliceData} showLegend showLabels showTooltip />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxDonutChart ─────────────────────────────────────────────────────────────

describe('TkxDonutChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxDonutChart data={sliceData} />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(
      <TkxDonutChart data={sliceData} ariaLabel="Usage donut chart" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Usage donut chart' })).toBeInTheDocument();
  });

  it('renders center label and sublabel', () => {
    const { container } = render(
      <TkxDonutChart data={sliceData} centerLabel="Total" centerSublabel="900" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxScatterChart ───────────────────────────────────────────────────────────

describe('TkxScatterChart', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <TkxScatterChart series={scatterSeries} />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    render(
      <TkxScatterChart series={scatterSeries} ariaLabel="Scatter plot" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Scatter plot' })).toBeInTheDocument();
  });

  it('accepts axis labels', () => {
    const { container } = render(
      <TkxScatterChart series={scatterSeries} xLabel="X Axis" yLabel="Y Axis" showGrid showLegend />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

// ── TkxRadarChart ─────────────────────────────────────────────────────────────

describe('TkxRadarChart', () => {
  it('renders without crashing', () => {
    const radarSeries = [{ key: 'a', label: 'Team A' }];
    const { container } = render(
      <TkxRadarChart data={radarData} series={radarSeries} angleKey="metric" />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });

  it('renders with aria-label', () => {
    const radarSeries = [{ key: 'a', label: 'Team A' }, { key: 'b', label: 'Team B' }];
    render(
      <TkxRadarChart data={radarData} series={radarSeries} angleKey="metric" ariaLabel="Performance radar" />,
      { wrapper: Wrapper },
    );
    expect(screen.getByRole('img', { name: 'Performance radar' })).toBeInTheDocument();
  });

  it('renders multi-series with legend', () => {
    const radarSeries = [
      { key: 'a', label: 'Team A', fillOpacity: 0.3 },
      { key: 'b', label: 'Team B', fillOpacity: 0.3 },
    ];
    const { container } = render(
      <TkxRadarChart data={radarData} series={radarSeries} angleKey="metric" showLegend showTooltip />,
      { wrapper: Wrapper },
    );
    expect(container.firstElementChild).toBeInTheDocument();
  });
});
