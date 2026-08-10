import { TkxPivotTable, type PivotRecord, type PivotValue } from 'tekivex-ui';
import { Preview } from '../Preview';

// Small inline dataset: 2 dimensions (region, quarter) + 1 measure (revenue).
const SALES: PivotRecord[] = [
  { region: 'East', quarter: 'Q1', revenue: 120 },
  { region: 'East', quarter: 'Q2', revenue: 150 },
  { region: 'East', quarter: 'Q3', revenue: 170 },
  { region: 'East', quarter: 'Q4', revenue: 210 },
  { region: 'West', quarter: 'Q1', revenue: 90 },
  { region: 'West', quarter: 'Q2', revenue: 130 },
  { region: 'West', quarter: 'Q3', revenue: 160 },
  { region: 'West', quarter: 'Q4', revenue: 180 },
  { region: 'North', quarter: 'Q1', revenue: 70 },
  { region: 'North', quarter: 'Q2', revenue: 85 },
  { region: 'North', quarter: 'Q3', revenue: 95 },
  { region: 'North', quarter: 'Q4', revenue: 110 },
];

const VALUES: PivotValue[] = [{ field: 'revenue', agg: 'sum', label: 'Revenue' }];

export function PivotTableBasic() {
  return (
    <Preview
      label="region × quarter, sum(revenue), grand totals"
      style={{ flexDirection: 'column', alignItems: 'stretch' }}
    >
      <div style={{ minWidth: 320, width: '100%', overflowX: 'auto' }}>
        <TkxPivotTable data={SALES} rows={['region']} cols={['quarter']} values={VALUES} />
      </div>
    </Preview>
  );
}
