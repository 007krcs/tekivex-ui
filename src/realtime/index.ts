// ── tekivex-ui/realtime ─────────────────────────────────────────────────────
// Real-time visualization components: live activity feeds, metrics
// dashboards, streaming charts, and virtualized log viewers.
//
// Split out as a separate entry point so apps that don't need real-time UI
// don't pay for the ~50 KB of streaming/animation code in their bundle.
//
// Import from 'tekivex-ui/realtime'.
// ─────────────────────────────────────────────────────────────────────────────

export { TkxLiveFeed } from '../components/TkxLiveFeed';
export type { TkxLiveFeedProps, FeedItem } from '../components/TkxLiveFeed';

export { TkxLiveMetrics } from '../components/TkxLiveMetrics';
export type { TkxLiveMetricsProps, MetricItem } from '../components/TkxLiveMetrics';

export { TkxRealTimeChart } from '../components/TkxRealTimeChart';
export type { TkxRealTimeChartProps, ChartDataPoint } from '../components/TkxRealTimeChart';

export { TkxLiveLog } from '../components/TkxLiveLog';
export type { TkxLiveLogProps, LogEntry, LogLevel } from '../components/TkxLiveLog';
