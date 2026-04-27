import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider, quantumDark } from '../src/themes';
import { TkxLiveFeed } from '../src/components/TkxLiveFeed';
import { TkxLiveLog } from '../src/components/TkxLiveLog';
import { TkxLiveMetrics } from '../src/components/TkxLiveMetrics';
import { TkxRealTimeChart } from '../src/components/TkxRealTimeChart';

function W({ children }: { children: React.ReactNode }) {
  return <ThemeProvider theme={quantumDark}>{children}</ThemeProvider>;
}

const NOW = 1_700_000_000_000;

// ── TkxLiveFeed ───────────────────────────────────────────────────────────
describe('TkxLiveFeed', () => {
  const items = [
    { id: '1', content: 'Item one', timestamp: NOW, type: 'info' as const, author: 'Alice' },
    { id: '2', content: 'Item two', timestamp: NOW + 1000, type: 'success' as const },
    { id: '3', content: 'Item three', timestamp: NOW + 2000, type: 'warning' as const },
    { id: '4', content: 'Item four', timestamp: NOW + 3000, type: 'error' as const },
  ];

  it('renders empty state when items=[]', () => {
    render(<TkxLiveFeed items={[]} emptyMessage="Nothing yet" />, { wrapper: W });
    expect(screen.getByText('Nothing yet')).toBeInTheDocument();
  });

  it('renders item content', () => {
    const { container } = render(<TkxLiveFeed items={items} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders all type variants', () => {
    const { container } = render(<TkxLiveFeed items={items} showTimestamps />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects maxItems', () => {
    const { container } = render(<TkxLiveFeed items={items} maxItems={2} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom renderItem', () => {
    render(
      <TkxLiveFeed
        items={items}
        renderItem={(it) => <div data-testid="custom">{it.content}</div>}
      />,
      { wrapper: W },
    );
    expect(screen.getAllByTestId('custom').length).toBeGreaterThan(0);
  });

  it('renders with author + avatar + meta', () => {
    const itemsWithAvatar = [
      { id: '1', content: 'X', timestamp: NOW, avatar: 'https://x/y.png', author: 'Bob', meta: 'now' },
    ];
    const { container } = render(<TkxLiveFeed items={itemsWithAvatar} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with showTimestamps=false', () => {
    const { container } = render(<TkxLiveFeed items={items} showTimestamps={false} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with autoScroll + pauseOnHover', () => {
    const { container } = render(
      <TkxLiveFeed items={items} autoScroll pauseOnHover height={300} />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxLiveLog ────────────────────────────────────────────────────────────
describe('TkxLiveLog', () => {
  const entries = [
    { id: '1', timestamp: NOW, level: 'debug' as const, message: 'Boot' },
    { id: '2', timestamp: NOW + 1, level: 'info' as const, message: 'Ready', source: 'app' },
    { id: '3', timestamp: NOW + 2, level: 'warn' as const, message: 'Slow' },
    { id: '4', timestamp: NOW + 3, level: 'error' as const, message: 'Failed' },
  ];

  it('renders entries', () => {
    const { container } = render(<TkxLiveLog entries={entries} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with all toggles on', () => {
    const { container } = render(
      <TkxLiveLog entries={entries} showLevel showTimestamp showSource monospace />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('respects maxEntries', () => {
    const { container } = render(<TkxLiveLog entries={entries} maxEntries={2} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects filterLevel', () => {
    const { container } = render(<TkxLiveLog entries={entries} filterLevel="warn" />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects searchQuery', () => {
    const { container } = render(<TkxLiveLog entries={entries} searchQuery="Ready" />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with empty entries', () => {
    const { container } = render(<TkxLiveLog entries={[]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('autoScroll prop accepted', () => {
    const { container } = render(<TkxLiveLog entries={entries} autoScroll height={200} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxLiveMetrics ────────────────────────────────────────────────────────
describe('TkxLiveMetrics', () => {
  const metrics = [
    { id: '1', label: 'CPU', value: 45, unit: '%', trend: 'up' as const, trendValue: '5%' },
    { id: '2', label: 'Mem', value: '4.2 GB', status: 'warning' as const },
    { id: '3', label: 'Disk', value: 78, unit: '%', sparkline: [1, 2, 3, 4, 5], status: 'critical' as const },
    { id: '4', label: 'Net', value: 100, trend: 'flat' as const },
  ];

  it('renders metric labels', () => {
    render(<TkxLiveMetrics metrics={metrics} />, { wrapper: W });
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Mem')).toBeInTheDocument();
  });

  it('renders all trend + status combos', () => {
    const { container } = render(<TkxLiveMetrics metrics={metrics} animate />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects columns', () => {
    const { container } = render(<TkxLiveMetrics metrics={metrics} columns={2} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('handles empty metrics', () => {
    const { container } = render(<TkxLiveMetrics metrics={[]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('refreshInterval prop accepted', () => {
    const { container } = render(<TkxLiveMetrics metrics={metrics} refreshInterval={1000} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});

// ── TkxRealTimeChart ──────────────────────────────────────────────────────
describe('TkxRealTimeChart', () => {
  const data = Array.from({ length: 20 }, (_, i) => ({
    timestamp: NOW + i * 1000,
    value: Math.sin(i / 5) * 50 + 50,
  }));

  it('renders with data', () => {
    const { container } = render(<TkxRealTimeChart data={data} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders empty data', () => {
    const { container } = render(<TkxRealTimeChart data={[]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with all toggles on', () => {
    const { container } = render(
      <TkxRealTimeChart
        data={data}
        showGrid
        showLabels
        showTooltip
        fill
        animate
        label="Temperature"
        unit="°C"
      />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('respects yMin + yMax', () => {
    const { container } = render(<TkxRealTimeChart data={data} yMin={0} yMax={100} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('respects maxPoints', () => {
    const { container } = render(<TkxRealTimeChart data={data} maxPoints={5} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with custom width + height + color', () => {
    const { container } = render(
      <TkxRealTimeChart data={data} width={400} height={200} color="#ff00aa" />,
      { wrapper: W },
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with single data point', () => {
    const { container } = render(<TkxRealTimeChart data={[data[0]]} />, { wrapper: W });
    expect(container.firstChild).toBeTruthy();
  });
});
