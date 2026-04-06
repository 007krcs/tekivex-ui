import { useState } from 'react';
import type { ThemeTokens } from '@tekivex/ui';
import {
  TkxButton, TkxCard, TkxCardHeader, TkxCardBody, TkxCardFooter,
  TkxBadge, TkxInput, TkxProgress, TkxToggle, TkxAlert, TkxTabs,
  TkxTabList, TkxTab, TkxTabPanels, TkxTabPanel, TkxAvatar, TkxTable,
  TkxDivider, TkxSkeleton, TkxTooltip, tkx, cx
} from '@tekivex/ui';

interface Props { theme: ThemeTokens }

const revenueData = [62, 78, 55, 91, 84, 103, 97, 115];
const weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'];

const topProducts = [
  { name: 'Pro Analytics Suite', sales: 1204, revenue: '$48,160', growth: '+18.2%', up: true },
  { name: 'DataSync Cloud', sales: 987, revenue: '$34,545', growth: '+12.7%', up: true },
  { name: 'Insight Reports', sales: 743, revenue: '$22,290', growth: '+9.1%', up: true },
  { name: 'User Tracker Lite', sales: 612, revenue: '$12,240', growth: '-4.3%', up: false },
  { name: 'Export Manager', sales: 489, revenue: '$9,780', growth: '+2.8%', up: true },
  { name: 'Legacy Bridge', sales: 201, revenue: '$4,020', growth: '-11.5%', up: false },
];

const activityFeed = [
  { user: 'Sarah Chen', avatar: 'SC', action: 'Exported Q1 revenue report', time: '2 min ago', color: '#6366f1' },
  { user: 'Marcus Hill', avatar: 'MH', action: 'Created new user segment: Enterprise', time: '11 min ago', color: '#10b981' },
  { user: 'Priya Nair', avatar: 'PN', action: 'Updated pricing for DataSync Cloud', time: '34 min ago', color: '#f59e0b' },
  { user: 'Tom Reyes', avatar: 'TR', action: 'Ran fraud detection scan — 0 flags', time: '1 hr ago', color: '#3b82f6' },
  { user: 'Lena Fox', avatar: 'LF', action: 'Invited 3 new team members', time: '2 hr ago', color: '#ec4899' },
];

const usersTable = [
  { name: 'Sarah Chen', avatar: 'SC', role: 'Admin', status: 'Active', lastActive: '2 min ago', color: '#6366f1' },
  { name: 'Marcus Hill', avatar: 'MH', role: 'Analyst', status: 'Active', lastActive: '15 min ago', color: '#10b981' },
  { name: 'Priya Nair', avatar: 'PN', role: 'Manager', status: 'Active', lastActive: '1 hr ago', color: '#f59e0b' },
  { name: 'Tom Reyes', avatar: 'TR', role: 'Developer', status: 'Away', lastActive: '3 hr ago', color: '#3b82f6' },
  { name: 'Lena Fox', avatar: 'LF', role: 'Viewer', status: 'Inactive', lastActive: '2 days ago', color: '#ec4899' },
  { name: 'James Wu', avatar: 'JW', role: 'Analyst', status: 'Active', lastActive: '5 min ago', color: '#8b5cf6' },
];

const transactions = [
  { id: 'TXN-8821', amount: '$4,200.00', status: 'Completed', date: 'Apr 6, 2026', method: 'Credit Card' },
  { id: 'TXN-8820', amount: '$1,850.50', status: 'Completed', date: 'Apr 6, 2026', method: 'Bank Transfer' },
  { id: 'TXN-8819', amount: '$320.00', status: 'Pending', date: 'Apr 5, 2026', method: 'PayPal' },
  { id: 'TXN-8818', amount: '$9,750.00', status: 'Completed', date: 'Apr 5, 2026', method: 'Wire Transfer' },
  { id: 'TXN-8817', amount: '$640.25', status: 'Failed', date: 'Apr 4, 2026', method: 'Credit Card' },
  { id: 'TXN-8816', amount: '$2,100.00', status: 'Refunded', date: 'Apr 4, 2026', method: 'Credit Card' },
];

const reportToggles = [
  { label: 'Weekly Revenue Summary', desc: 'Sent every Monday at 9 AM' },
  { label: 'User Growth Report', desc: 'Sent on the 1st of each month' },
  { label: 'Conversion Funnel Analysis', desc: 'Sent every Friday' },
  { label: 'Churn Alert Digest', desc: 'Sent when churn exceeds threshold' },
  { label: 'System Performance Report', desc: 'Sent daily at midnight' },
];

function SparklineSVG({ values, color }: { values: number[]; color: string }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const w = 80, h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  });
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        opacity={0.85}
      />
      <circle
        cx={parseFloat(pts[pts.length - 1].split(',')[0])}
        cy={parseFloat(pts[pts.length - 1].split(',')[1])}
        r="3"
        fill={color}
      />
    </svg>
  );
}

export function DashboardTemplate({ theme }: Props) {
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [activeTab, setActiveTab] = useState(0);
  const [reportStates, setReportStates] = useState([true, true, false, true, false]);

  const s = {
    page: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '32px 24px 64px',
      fontFamily: 'inherit',
    } as React.CSSProperties,

    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap' as const,
      gap: '16px',
      marginBottom: '28px',
    } as React.CSSProperties,

    headerLeft: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '4px',
    } as React.CSSProperties,

    title: {
      fontSize: '1.625rem',
      fontWeight: 800,
      color: theme.text,
      margin: 0,
      letterSpacing: '-0.025em',
    } as React.CSSProperties,

    subtitle: {
      fontSize: '13px',
      color: theme.textMuted,
      margin: 0,
    } as React.CSSProperties,

    headerRight: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap' as const,
    } as React.CSSProperties,

    dateBtn: (active: boolean): React.CSSProperties => ({
      padding: '6px 14px',
      borderRadius: '6px',
      border: `1px solid ${active ? theme.primary : theme.border}`,
      background: active ? theme.primary + '15' : 'transparent',
      color: active ? theme.primary : theme.textMuted,
      fontSize: '13px',
      fontWeight: active ? 600 : 400,
      cursor: 'pointer',
    }),

    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '16px',
      marginBottom: '24px',
    } as React.CSSProperties,

    statMeta: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '6px',
    } as React.CSSProperties,

    statLabel: {
      fontSize: '12px',
      fontWeight: 600,
      color: theme.textMuted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
    } as React.CSSProperties,

    statValue: {
      fontSize: '2rem',
      fontWeight: 800,
      color: theme.text,
      letterSpacing: '-0.03em',
      lineHeight: 1.1,
      margin: '4px 0 8px',
    } as React.CSSProperties,

    statRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    } as React.CSSProperties,

    mainGrid: {
      display: 'grid',
      gridTemplateColumns: '3fr 2fr',
      gap: '20px',
      marginBottom: '24px',
    } as React.CSSProperties,

    sectionLabel: {
      fontSize: '14px',
      fontWeight: 700,
      color: theme.text,
      margin: 0,
    } as React.CSSProperties,

    sectionSub: {
      fontSize: '12px',
      color: theme.textMuted,
      margin: 0,
    } as React.CSSProperties,

    chartArea: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '10px',
      height: '160px',
      padding: '8px 0 0',
    } as React.CSSProperties,

    barWrap: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      flex: 1,
      gap: '6px',
    } as React.CSSProperties,

    barLabel: {
      fontSize: '11px',
      color: theme.textMuted,
    } as React.CSSProperties,

    axisLine: {
      height: '1px',
      background: theme.border,
      margin: '8px 0 4px',
    } as React.CSSProperties,

    activityItem: {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '10px 0',
    } as React.CSSProperties,

    activityText: {
      flex: 1,
      fontSize: '13px',
      color: theme.text,
    } as React.CSSProperties,

    activityTime: {
      fontSize: '11px',
      color: theme.textMuted,
      whiteSpace: 'nowrap' as const,
      marginTop: '2px',
    } as React.CSSProperties,

    userName: {
      fontSize: '13px',
      fontWeight: 600,
      color: theme.text,
    } as React.CSSProperties,

    tableCell: {
      fontSize: '13px',
      color: theme.text,
      padding: '10px 12px',
    } as React.CSSProperties,

    tableHeader: {
      fontSize: '11px',
      fontWeight: 700,
      color: theme.textMuted,
      textTransform: 'uppercase' as const,
      letterSpacing: '0.06em',
      padding: '8px 12px',
      borderBottom: `1px solid ${theme.border}`,
    } as React.CSSProperties,

    bottomGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px',
      marginBottom: '24px',
    } as React.CSSProperties,

    progressRow: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '6px',
    } as React.CSSProperties,

    progressLabel: {
      fontSize: '13px',
      color: theme.text,
      fontWeight: 500,
    } as React.CSSProperties,

    progressValue: {
      fontSize: '13px',
      fontWeight: 700,
      color: theme.text,
    } as React.CSSProperties,

    quickActionsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '10px',
    } as React.CSSProperties,

    alertsRow: {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: '10px',
      marginBottom: '24px',
    } as React.CSSProperties,
  };

  const maxBar = Math.max(...revenueData);

  const txStatusVariant = (s: string) => {
    if (s === 'Completed') return 'success';
    if (s === 'Pending') return 'warning';
    if (s === 'Failed') return 'danger';
    if (s === 'Refunded') return 'info';
    return 'default';
  };

  const userStatusVariant = (s: string) => {
    if (s === 'Active') return 'success';
    if (s === 'Away') return 'warning';
    return 'default';
  };

  return (
    <div style={s.page}>

      {/* ── Header ── */}
      <div style={s.header}>
        <div style={s.headerLeft}>
          <h1 style={s.title}>Analytics Dashboard</h1>
          <p style={s.subtitle}>Last updated: Just now</p>
        </div>
        <div style={s.headerRight}>
          <div style={{ display: 'flex', gap: '4px', background: theme.surface, border: `1px solid ${theme.border}`, borderRadius: '8px', padding: '3px' }}>
            {(['today', 'week', 'month'] as const).map(r => (
              <button key={r} style={s.dateBtn(dateRange === r)} onClick={() => setDateRange(r)}>
                {r === 'today' ? 'Today' : r === 'week' ? 'This Week' : 'This Month'}
              </button>
            ))}
          </div>
          <TkxTooltip content="Refresh data">
            <TkxButton variant="outline" size="sm">
              ↻ Refresh
            </TkxButton>
          </TkxTooltip>
          <TkxButton variant="primary" size="sm">
            ↓ Export
          </TkxButton>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div style={s.statsGrid}>

        <TkxCard>
          <TkxCardBody>
            <div style={s.statMeta}>
              <span style={s.statLabel}>Total Revenue</span>
              <SparklineSVG values={[42, 55, 48, 67, 72, 68, 80, 88]} color={theme.success ?? '#10b981'} />
            </div>
            <div style={s.statValue}>$124,580</div>
            <div style={s.statRow}>
              <span style={{ fontSize: '12px', color: theme.textMuted }}>vs last period</span>
              <TkxBadge variant="success">↑ 12.5%</TkxBadge>
            </div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.statMeta}>
              <span style={s.statLabel}>Active Users</span>
              <SparklineSVG values={[310, 290, 340, 380, 360, 400, 420, 410]} color={theme.info ?? '#3b82f6'} />
            </div>
            <div style={s.statValue}>8,429</div>
            <div style={s.statRow}>
              <span style={{ fontSize: '12px', color: theme.textMuted }}>vs last period</span>
              <TkxBadge variant="info">↑ 3.2%</TkxBadge>
            </div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.statMeta}>
              <span style={s.statLabel}>Orders</span>
              <SparklineSVG values={[220, 240, 215, 230, 195, 205, 188, 190]} color={theme.warning ?? '#f59e0b'} />
            </div>
            <div style={s.statValue}>1,847</div>
            <div style={s.statRow}>
              <span style={{ fontSize: '12px', color: theme.textMuted }}>vs last period</span>
              <TkxBadge variant="warning">↓ 2.1%</TkxBadge>
            </div>
          </TkxCardBody>
        </TkxCard>

        <TkxCard>
          <TkxCardBody>
            <div style={s.statMeta}>
              <span style={s.statLabel}>Conversion Rate</span>
              <SparklineSVG values={[2.8, 2.9, 3.0, 2.95, 3.1, 3.15, 3.2, 3.24]} color={theme.primary} />
            </div>
            <div style={s.statValue}>3.24%</div>
            <div style={s.statRow}>
              <span style={{ fontSize: '12px', color: theme.textMuted }}>vs last period</span>
              <TkxBadge variant="primary">↑ 0.8%</TkxBadge>
            </div>
          </TkxCardBody>
        </TkxCard>

      </div>

      {/* ── Main 2-Col ── */}
      <div style={s.mainGrid}>

        {/* Revenue Bar Chart */}
        <TkxCard>
          <TkxCardHeader>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={s.sectionLabel}>Revenue Overview</p>
                <p style={s.sectionSub}>Weekly breakdown — current period</p>
              </div>
              <TkxBadge variant="success">↑ $14,230 this week</TkxBadge>
            </div>
          </TkxCardHeader>
          <TkxCardBody>
            <div style={s.chartArea}>
              {revenueData.map((val, i) => {
                const heightPct = (val / maxBar) * 140;
                const isToday = i === revenueData.length - 1;
                return (
                  <TkxTooltip key={i} content={`${weekLabels[i]}: $${(val * 1000).toLocaleString()}`}>
                    <div style={s.barWrap}>
                      <div style={{
                        width: '100%',
                        height: `${heightPct}px`,
                        background: isToday
                          ? theme.primary
                          : theme.primary + '50',
                        borderRadius: '4px 4px 0 0',
                        transition: 'opacity 0.15s',
                        cursor: 'default',
                        minWidth: '24px',
                      }} />
                      <span style={s.barLabel}>{weekLabels[i]}</span>
                    </div>
                  </TkxTooltip>
                );
              })}
            </div>
            <div style={s.axisLine} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>$0</span>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>$60k</span>
              <span style={{ fontSize: '11px', color: theme.textMuted }}>$120k</span>
            </div>
          </TkxCardBody>
        </TkxCard>

        {/* Top Products */}
        <TkxCard>
          <TkxCardHeader>
            <p style={s.sectionLabel}>Top Products</p>
            <p style={s.sectionSub}>By revenue this period</p>
          </TkxCardHeader>
          <TkxCardBody style={{ padding: 0 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={s.tableHeader}>Product</th>
                  <th style={{ ...s.tableHeader, textAlign: 'right' }}>Sales</th>
                  <th style={{ ...s.tableHeader, textAlign: 'right' }}>Revenue</th>
                  <th style={{ ...s.tableHeader, textAlign: 'right' }}>Growth</th>
                </tr>
              </thead>
              <tbody>
                {topProducts.map((p, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                    <td style={{ ...s.tableCell, fontWeight: 500, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</td>
                    <td style={{ ...s.tableCell, textAlign: 'right', color: theme.textMuted }}>{p.sales}</td>
                    <td style={{ ...s.tableCell, textAlign: 'right', fontWeight: 600 }}>{p.revenue}</td>
                    <td style={{ ...s.tableCell, textAlign: 'right' }}>
                      <TkxBadge variant={p.up ? 'success' : 'danger'}>{p.growth}</TkxBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TkxCardBody>
        </TkxCard>

      </div>

      {/* ── Tabs Section ── */}
      <TkxCard style={{ marginBottom: '24px' }}>
        <TkxCardBody>
          <TkxTabs value={activeTab} onChange={setActiveTab}>
            <TkxTabList>
              <TkxTab>Overview</TkxTab>
              <TkxTab>Users</TkxTab>
              <TkxTab>Transactions</TkxTab>
              <TkxTab>Reports</TkxTab>
            </TkxTabList>
            <TkxTabPanels>

              {/* Overview — Activity Feed */}
              <TkxTabPanel>
                <div style={{ paddingTop: '8px' }}>
                  {activityFeed.map((item, i) => (
                    <div key={i}>
                      <div style={s.activityItem}>
                        <TkxAvatar size="sm" style={{ background: item.color, color: '#fff', flexShrink: 0 }}>
                          {item.avatar}
                        </TkxAvatar>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={s.userName}>{item.user}</span>
                            <span style={s.activityTime}>{item.time}</span>
                          </div>
                          <div style={{ fontSize: '13px', color: theme.textMuted, marginTop: '2px' }}>{item.action}</div>
                        </div>
                      </div>
                      {i < activityFeed.length - 1 && <TkxDivider />}
                    </div>
                  ))}
                </div>
              </TkxTabPanel>

              {/* Users Table */}
              <TkxTabPanel>
                <div style={{ paddingTop: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={s.tableHeader}>User</th>
                        <th style={s.tableHeader}>Role</th>
                        <th style={s.tableHeader}>Status</th>
                        <th style={s.tableHeader}>Last Active</th>
                      </tr>
                    </thead>
                    <tbody>
                      {usersTable.map((u, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={s.tableCell}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <TkxAvatar size="sm" style={{ background: u.color, color: '#fff', flexShrink: 0 }}>
                                {u.avatar}
                              </TkxAvatar>
                              <span style={{ fontWeight: 600 }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ ...s.tableCell, color: theme.textMuted }}>{u.role}</td>
                          <td style={s.tableCell}>
                            <TkxBadge variant={userStatusVariant(u.status) as any}>{u.status}</TkxBadge>
                          </td>
                          <td style={{ ...s.tableCell, color: theme.textMuted }}>{u.lastActive}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TkxTabPanel>

              {/* Transactions Table */}
              <TkxTabPanel>
                <div style={{ paddingTop: '8px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr>
                        <th style={s.tableHeader}>Transaction ID</th>
                        <th style={s.tableHeader}>Method</th>
                        <th style={{ ...s.tableHeader, textAlign: 'right' }}>Amount</th>
                        <th style={s.tableHeader}>Status</th>
                        <th style={s.tableHeader}>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx, i) => (
                        <tr key={i} style={{ borderBottom: `1px solid ${theme.border}` }}>
                          <td style={{ ...s.tableCell, fontFamily: 'monospace', fontSize: '12px', fontWeight: 600 }}>{tx.id}</td>
                          <td style={{ ...s.tableCell, color: theme.textMuted }}>{tx.method}</td>
                          <td style={{ ...s.tableCell, textAlign: 'right', fontWeight: 700 }}>{tx.amount}</td>
                          <td style={s.tableCell}>
                            <TkxBadge variant={txStatusVariant(tx.status) as any}>{tx.status}</TkxBadge>
                          </td>
                          <td style={{ ...s.tableCell, color: theme.textMuted }}>{tx.date}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TkxTabPanel>

              {/* Reports Toggles */}
              <TkxTabPanel>
                <div style={{ paddingTop: '12px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {reportToggles.map((r, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: theme.text }}>{r.label}</div>
                        <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>{r.desc}</div>
                      </div>
                      <TkxToggle
                        checked={reportStates[i]}
                        onChange={v => setReportStates(prev => prev.map((s, idx) => idx === i ? v : s))}
                      />
                    </div>
                  ))}
                </div>
              </TkxTabPanel>

            </TkxTabPanels>
          </TkxTabs>
        </TkxCardBody>
      </TkxCard>

      {/* ── Alerts ── */}
      <div style={s.alertsRow}>
        <TkxAlert variant="success" title="Monthly targets achieved">
          Revenue exceeded the $120k monthly target by 3.8%. Team bonuses will be processed on April 10th.
        </TkxAlert>
        <TkxAlert variant="info" title="System maintenance scheduled">
          Planned downtime on April 9, 2026 from 02:00–04:00 UTC. No user-facing impact is expected.
        </TkxAlert>
      </div>

      {/* ── Bottom Row ── */}
      <div style={s.bottomGrid}>

        {/* Server Performance */}
        <TkxCard>
          <TkxCardHeader>
            <p style={s.sectionLabel}>Server Performance</p>
            <p style={s.sectionSub}>Live resource utilization</p>
          </TkxCardHeader>
          <TkxCardBody>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              <div>
                <div style={s.progressRow}>
                  <span style={s.progressLabel}>CPU Usage</span>
                  <span style={{ ...s.progressValue, color: theme.warning ?? '#f59e0b' }}>72%</span>
                </div>
                <TkxProgress value={72} variant="warning" />
              </div>

              <div>
                <div style={s.progressRow}>
                  <span style={s.progressLabel}>Memory</span>
                  <span style={s.progressValue}>54%</span>
                </div>
                <TkxProgress value={54} variant="primary" />
              </div>

              <div>
                <div style={s.progressRow}>
                  <span style={s.progressLabel}>Storage</span>
                  <span style={{ ...s.progressValue, color: theme.success ?? '#10b981' }}>38%</span>
                </div>
                <TkxProgress value={38} variant="success" />
              </div>

            </div>
          </TkxCardBody>
          <TkxCardFooter>
            <span style={{ fontSize: '12px', color: theme.textMuted }}>All systems nominal — last check 30 s ago</span>
          </TkxCardFooter>
        </TkxCard>

        {/* Quick Actions */}
        <TkxCard>
          <TkxCardHeader>
            <p style={s.sectionLabel}>Quick Actions</p>
            <p style={s.sectionSub}>Frequent tasks</p>
          </TkxCardHeader>
          <TkxCardBody>
            <div style={s.quickActionsGrid}>
              <TkxButton variant="outline" size="sm" style={{ justifyContent: 'center' }}>
                + New Report
              </TkxButton>
              <TkxButton variant="outline" size="sm" style={{ justifyContent: 'center' }}>
                ↓ Export Data
              </TkxButton>
              <TkxButton variant="outline" size="sm" style={{ justifyContent: 'center' }}>
                + Add User
              </TkxButton>
              <TkxButton variant="outline" size="sm" style={{ justifyContent: 'center' }}>
                ⚙ Settings
              </TkxButton>
              <TkxButton variant="outline" size="sm" style={{ justifyContent: 'center' }}>
                ↑ Backup
              </TkxButton>
              <TkxButton variant="outline" size="sm" style={{ justifyContent: 'center' }}>
                ? Support
              </TkxButton>
            </div>
          </TkxCardBody>
          <TkxCardFooter>
            <TkxButton variant="primary" size="sm" style={{ width: '100%', justifyContent: 'center' }}>
              Open Full Admin Panel
            </TkxButton>
          </TkxCardFooter>
        </TkxCard>

      </div>

    </div>
  );
}
