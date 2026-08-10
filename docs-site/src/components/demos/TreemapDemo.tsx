import { TkxTreemap } from 'tekivex-ui';
import { Preview } from '../Preview';

export function TreemapBasic() {
  return (
    <Preview>
      <TkxTreemap
        data={[
          { label: 'Engineering', value: 45 },
          { label: 'Sales', value: 30 },
          { label: 'Marketing', value: 25 },
          { label: 'Support', value: 15 },
          { label: 'Ops', value: 10 },
        ]}
        width={460}
        height={280}
        showValues
        ariaLabel="Headcount by department treemap"
      />
    </Preview>
  );
}

export function TreemapNested() {
  return (
    <Preview label="nested children">
      <TkxTreemap
        data={[
          {
            label: 'Engineering',
            value: 45,
            children: [
              { label: 'Frontend', value: 20 },
              { label: 'Backend', value: 18 },
              { label: 'QA', value: 7 },
            ],
          },
          {
            label: 'Sales',
            value: 30,
            children: [
              { label: 'AE', value: 19 },
              { label: 'SDR', value: 11 },
            ],
          },
          { label: 'Marketing', value: 25 },
        ]}
        width={460}
        height={280}
        ariaLabel="Headcount treemap with nested teams"
      />
    </Preview>
  );
}
