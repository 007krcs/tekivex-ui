import { TkxFunnelChart } from 'tekivex-ui';
import { Preview } from '../Preview';

const SIGNUP_FUNNEL = [
  { label: 'Visited', value: 1000 },
  { label: 'Signed up', value: 420 },
  { label: 'Activated', value: 180 },
  { label: 'Paid', value: 64 },
];

export function FunnelBasic() {
  return (
    <Preview>
      <TkxFunnelChart
        data={SIGNUP_FUNNEL}
        width={380}
        height={260}
        ariaLabel="Signup conversion funnel from 1000 visits to 64 paid"
      />
    </Preview>
  );
}

export function FunnelHorizontal() {
  return (
    <Preview label='orientation="horizontal"'>
      <TkxFunnelChart
        data={[
          { label: 'Leads', value: 860 },
          { label: 'Qualified', value: 540 },
          { label: 'Demo', value: 260 },
          { label: 'Closed', value: 95 },
        ]}
        orientation="horizontal"
        width={440}
        height={240}
        formatValue={(v) => v.toLocaleString('en-US')}
        ariaLabel="Sales pipeline funnel, horizontal orientation"
      />
    </Preview>
  );
}
