import type { ThemeTokens } from 'tekivex-ui';
import { DemoSection } from '../layout/DemoSection';
import { PropTable } from '../layout/PropTable';
import {
  TkxAreaChart,
  TkxBarChart,
  TkxLineChart,
  TkxPieChart,
  TkxDonutChart,
  TkxScatterChart,
  TkxRadarChart,
} from '../../src/charts';

interface Props { theme: ThemeTokens }

// ── Sample data ───────────────────────────────────────────────────────────────

const monthlyRevenue = [
  { month: 'Jan', revenue: 42000, cost: 28000, profit: 14000 },
  { month: 'Feb', revenue: 51000, cost: 31000, profit: 20000 },
  { month: 'Mar', revenue: 47000, cost: 29000, profit: 18000 },
  { month: 'Apr', revenue: 63000, cost: 34000, profit: 29000 },
  { month: 'May', revenue: 58000, cost: 32000, profit: 26000 },
  { month: 'Jun', revenue: 72000, cost: 38000, profit: 34000 },
  { month: 'Jul', revenue: 68000, cost: 36000, profit: 32000 },
  { month: 'Aug', revenue: 79000, cost: 41000, profit: 38000 },
];

const sessionData = [
  { day: 'Mon', mobile: 3200, desktop: 2100, tablet: 800 },
  { day: 'Tue', mobile: 4100, desktop: 2700, tablet: 950 },
  { day: 'Wed', mobile: 3800, desktop: 2400, tablet: 700 },
  { day: 'Thu', mobile: 5100, desktop: 3200, tablet: 1100 },
  { day: 'Fri', mobile: 4700, desktop: 2900, tablet: 900 },
  { day: 'Sat', mobile: 6200, desktop: 1800, tablet: 1300 },
  { day: 'Sun', mobile: 5400, desktop: 1500, tablet: 1100 },
];

const pieData = [
  { name: 'Direct', value: 4200 },
  { name: 'Organic Search', value: 3100 },
  { name: 'Social Media', value: 2400 },
  { name: 'Referral', value: 1800 },
  { name: 'Email', value: 900 },
];

const performanceData = [
  { metric: 'Speed', frontend: 85, backend: 72 },
  { metric: 'Security', frontend: 90, backend: 95 },
  { metric: 'Reliability', frontend: 78, backend: 88 },
  { metric: 'Scalability', frontend: 65, backend: 82 },
  { metric: 'UX Score', frontend: 92, backend: 60 },
  { metric: 'Coverage', frontend: 70, backend: 80 },
];

const scatterSeries = [
  {
    name: 'Product A',
    data: [
      { x: 20, y: 40, z: 200, label: 'Q1' },
      { x: 35, y: 62, z: 380, label: 'Q2' },
      { x: 42, y: 55, z: 290, label: 'Q3' },
      { x: 58, y: 78, z: 430, label: 'Q4' },
    ],
  },
  {
    name: 'Product B',
    data: [
      { x: 15, y: 28, z: 150, label: 'Q1' },
      { x: 27, y: 45, z: 240, label: 'Q2' },
      { x: 38, y: 60, z: 310, label: 'Q3' },
      { x: 52, y: 70, z: 390, label: 'Q4' },
    ],
  },
];

// ── Charts page ───────────────────────────────────────────────────────────────

export function ChartsPage({ theme }: Props) {
  const sectionStyle = {
    maxWidth: 900,
    margin: '0 auto',
    padding: '40px 32px',
  };

  const headingStyle = {
    fontSize: '2rem',
    fontWeight: 700,
    color: theme.text,
    marginBottom: '8px',
  };

  const subStyle = {
    fontSize: '1rem',
    color: theme.textMuted,
    marginBottom: '40px',
    lineHeight: '1.6',
  };

  const chipStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 600,
    backgroundColor: `${theme.primary}20`,
    color: theme.primary,
    border: `1px solid ${theme.primary}40`,
    marginRight: '8px',
    marginBottom: '24px',
  };

  return (
    <div style={sectionStyle}>
      <h1 style={headingStyle}>Charts</h1>
      <p style={subStyle}>
        Production-ready chart components built on Recharts. Zero additional setup — import from{' '}
        <code style={{ backgroundColor: theme.surfaceAlt, padding: '1px 6px', borderRadius: 4, fontSize: '0.9em' }}>
          tekivex-ui/charts
        </code>{' '}
        and render beautiful, accessible, theme-aware visualisations.
      </p>
      <div>
        {['Area', 'Bar', 'Line', 'Pie', 'Donut', 'Scatter', 'Radar'].map((t) => (
          <span key={t} style={chipStyle}>{t}</span>
        ))}
      </div>

      {/* ── Area Chart ── */}
      <DemoSection
        title="Area Chart"
        description="Smooth area chart with multiple series, stacking, and responsive layout."
        theme={theme}
        code={`import { TkxAreaChart } from 'tekivex-ui/charts';

<TkxAreaChart
  data={monthlyRevenue}
  xKey="month"
  series={[
    { key: 'revenue', label: 'Revenue' },
    { key: 'cost', label: 'Cost' },
    { key: 'profit', label: 'Profit' },
  ]}
  height={300}
  showLegend
  showGrid
  smooth
/>`}
      >
        <TkxAreaChart
          data={monthlyRevenue}
          xKey="month"
          series={[
            { key: 'revenue', label: 'Revenue' },
            { key: 'cost', label: 'Cost' },
            { key: 'profit', label: 'Profit' },
          ]}
          height={300}
          showLegend
          showGrid
          smooth
          ariaLabel="Monthly revenue, cost, and profit area chart"
        />
      </DemoSection>

      {/* ── Bar Chart ── */}
      <DemoSection
        title="Bar Chart"
        description="Grouped bar chart with multi-series data. Supports horizontal layout, stacking, and gradient fills."
        theme={theme}
        code={`import { TkxBarChart } from 'tekivex-ui/charts';

<TkxBarChart
  data={sessionData}
  xKey="day"
  series={[
    { key: 'mobile', label: 'Mobile' },
    { key: 'desktop', label: 'Desktop' },
    { key: 'tablet', label: 'Tablet' },
  ]}
  height={300}
  showLegend
  showGrid
/>`}
      >
        <TkxBarChart
          data={sessionData}
          xKey="day"
          series={[
            { key: 'mobile', label: 'Mobile' },
            { key: 'desktop', label: 'Desktop' },
            { key: 'tablet', label: 'Tablet' },
          ]}
          height={300}
          showLegend
          showGrid
          ariaLabel="Weekly sessions by device type bar chart"
        />
      </DemoSection>

      {/* ── Line Chart ── */}
      <DemoSection
        title="Line Chart"
        description="Multi-series line chart with reference lines, smooth curves, and customisable dots."
        theme={theme}
        code={`import { TkxLineChart } from 'tekivex-ui/charts';

<TkxLineChart
  data={monthlyRevenue}
  xKey="month"
  series={[
    { key: 'revenue', label: 'Revenue', strokeWidth: 2 },
    { key: 'profit', label: 'Profit', dashed: true },
  ]}
  height={300}
  showLegend
  showGrid
  smooth
/>`}
      >
        <TkxLineChart
          data={monthlyRevenue}
          xKey="month"
          series={[
            { key: 'revenue', label: 'Revenue', strokeWidth: 2 },
            { key: 'profit', label: 'Profit', dashed: true },
          ]}
          height={300}
          showLegend
          showGrid
          smooth
          ariaLabel="Monthly revenue and profit line chart"
        />
      </DemoSection>

      {/* ── Pie + Donut side by side ── */}
      <DemoSection
        title="Pie & Donut Charts"
        description="Slice-based charts for proportional data. Donut supports a center label overlay."
        theme={theme}
        code={`import { TkxPieChart, TkxDonutChart } from 'tekivex-ui/charts';

<TkxPieChart data={trafficData} showLegend showTooltip showLabels />
<TkxDonutChart data={trafficData} centerLabel="Total" centerSublabel="14,400" showLegend />`}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
          <TkxPieChart
            data={pieData}
            height={280}
            showLegend
            showTooltip
            showLabels
            ariaLabel="Traffic source pie chart"
          />
          <TkxDonutChart
            data={pieData}
            height={280}
            centerLabel="Traffic"
            centerSublabel="12.4K"
            showLegend
            showTooltip
            ariaLabel="Traffic source donut chart"
          />
        </div>
      </DemoSection>

      {/* ── Radar Chart ── */}
      <DemoSection
        title="Radar Chart"
        description="Spider / radar chart ideal for multi-dimensional comparisons."
        theme={theme}
        code={`import { TkxRadarChart } from 'tekivex-ui/charts';

<TkxRadarChart
  data={performanceData}
  angleKey="metric"
  series={[
    { key: 'frontend', label: 'Frontend', fillOpacity: 0.3 },
    { key: 'backend', label: 'Backend', fillOpacity: 0.3 },
  ]}
  showLegend
/>`}
      >
        <TkxRadarChart
          data={performanceData}
          angleKey="metric"
          series={[
            { key: 'frontend', label: 'Frontend', fillOpacity: 0.3 },
            { key: 'backend', label: 'Backend', fillOpacity: 0.3 },
          ]}
          height={320}
          showLegend
          showTooltip
          ariaLabel="Performance comparison radar chart"
        />
      </DemoSection>

      {/* ── Scatter Chart ── */}
      <DemoSection
        title="Scatter / Bubble Chart"
        description="X-Y scatter plot with optional Z-axis bubble sizing."
        theme={theme}
        code={`import { TkxScatterChart } from 'tekivex-ui/charts';

<TkxScatterChart
  series={scatterSeries}
  xLabel="Market Share (%)"
  yLabel="Growth Rate (%)"
  showLegend
  showGrid
/>`}
      >
        <TkxScatterChart
          series={scatterSeries}
          height={300}
          xLabel="Market Share (%)"
          yLabel="Growth Rate (%)"
          showLegend
          showGrid
          showTooltip
          ariaLabel="Product market share vs growth rate scatter chart"
        />
      </DemoSection>

      {/* ── Props ── */}
      <PropTable
        theme={theme}
        title="TkxAreaChart / TkxLineChart / TkxBarChart"
        rows={[
          { prop: 'data', type: 'object[]', required: true, description: 'Array of data points.' },
          { prop: 'series', type: 'ChartSeries[]', required: true, description: 'Series config — key, label, color.' },
          { prop: 'xKey', type: 'string', required: true, description: 'Key to use as the X-axis / category.' },
          { prop: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
          { prop: 'showGrid', type: 'boolean', default: 'false', description: 'Show background grid lines.' },
          { prop: 'showLegend', type: 'boolean', default: 'false', description: 'Show series legend.' },
          { prop: 'showTooltip', type: 'boolean', default: 'true', description: 'Show hover tooltip.' },
          { prop: 'smooth', type: 'boolean', default: 'false', description: 'Use smooth curves (area/line only).' },
          { prop: 'ariaLabel', type: 'string', default: '—', description: 'Accessible description for screen readers.' },
        ]}
      />

      <PropTable
        theme={theme}
        title="TkxPieChart / TkxDonutChart"
        rows={[
          { prop: 'data', type: 'TkxPieChartSlice[]', required: true, description: 'Array of { name, value, color? }.' },
          { prop: 'height', type: 'number', default: '300', description: 'Chart height in pixels.' },
          { prop: 'showLegend', type: 'boolean', default: 'false', description: 'Show legend.' },
          { prop: 'showLabels', type: 'boolean', default: 'false', description: 'Show slice labels (pie only).' },
          { prop: 'centerLabel', type: 'string', default: '—', description: 'Primary label inside hole (donut only).' },
          { prop: 'centerSublabel', type: 'string', default: '—', description: 'Secondary label inside hole (donut only).' },
        ]}
      />
    </div>
  );
}
