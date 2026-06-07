import { TkxTable } from 'tekivex-ui';
import { Preview } from '../Preview';

interface Row { id: string; name: string; role: string; tenure: string; }

const ROWS: Row[] = [
  { id: '1', name: 'Priya Kumar',  role: 'Engineering Lead', tenure: '3y 2mo' },
  { id: '2', name: 'Marcus Lee',   role: 'Product Designer', tenure: '1y 8mo' },
  { id: '3', name: 'Sara Chen',    role: 'Security',         tenure: '4y 5mo' },
  { id: '4', name: 'Diego Vega',   role: 'Frontend',         tenure: '2y 1mo' },
];

export function TableBasic() {
  return (
    <Preview label="Basic — sortable">
      <div style={{ width: '100%', maxWidth: 560 }}>
        <TkxTable<Row>
          sortable
          data={ROWS}
          columns={[
            { key: 'name',   header: 'Name' },
            { key: 'role',   header: 'Role' },
            { key: 'tenure', header: 'Tenure' },
          ]}
        />
      </div>
    </Preview>
  );
}
