import { TkxStatistic } from 'tekivex-ui';
import { Preview } from '../Preview';

export function StatisticBasic() {
  return (
    <Preview label="KPI tile">
      <TkxStatistic title="Active users" value={12_847} groupSeparator="," />
    </Preview>
  );
}

export function StatisticWithTrend() {
  return (
    <Preview label="With trend indicator">
      <div style={{ display: 'flex', gap: 32 }}>
        <TkxStatistic title="MRR" value="$48,210" trend="up" trendValue="+12% MoM" />
        <TkxStatistic title="Churn" value="2.3" suffix="%" trend="down" trendValue="-0.4 pts" />
      </div>
    </Preview>
  );
}

export function StatisticWithPrefix() {
  return (
    <Preview label="With prefix + precision">
      <TkxStatistic title="Average ticket size" value={3247.89} prefix="$" precision={2} groupSeparator="," />
    </Preview>
  );
}

export function StatisticLoading() {
  return (
    <Preview label="Loading state">
      <TkxStatistic title="Loading…" value="—" loading />
    </Preview>
  );
}
