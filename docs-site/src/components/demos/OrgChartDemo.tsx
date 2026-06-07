import { TkxOrgChart } from 'tekivex-ui';
import { Preview } from '../Preview';

const TREE = {
  id: 'ceo',
  label: 'CEO',
  description: 'Priya Kumar',
  children: [
    {
      id: 'eng',
      label: 'Engineering',
      description: 'Marcus Lee',
      children: [
        { id: 'fe', label: 'Frontend' },
        { id: 'be', label: 'Backend' },
        { id: 'sec', label: 'Security' },
      ],
    },
    {
      id: 'design',
      label: 'Design',
      description: 'Sara Chen',
      children: [
        { id: 'ux', label: 'UX' },
        { id: 'brand', label: 'Brand' },
      ],
    },
    {
      id: 'sales',
      label: 'Sales',
      description: 'Diego Vega',
    },
  ],
};

export function OrgChartBasic() {
  return (
    <Preview label="Vertical org chart">
      <div style={{ width: '100%', overflowX: 'auto' }}>
        <TkxOrgChart data={TREE} />
      </div>
    </Preview>
  );
}
