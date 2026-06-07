import { useState } from 'react';
import { TkxDataGrid } from 'tekivex-ui';
import { Preview } from '../Preview';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

const SAMPLE_USERS: User[] = [
  { id: '1', name: 'Priya Kumar',  email: 'priya@example.com',  role: 'Admin',   status: 'Active'  },
  { id: '2', name: 'Marcus Lee',   email: 'marcus@example.com', role: 'Editor',  status: 'Active'  },
  { id: '3', name: 'Sara Chen',    email: 'sara@example.com',   role: 'Viewer',  status: 'Pending' },
  { id: '4', name: 'Diego Vega',   email: 'diego@example.com',  role: 'Editor',  status: 'Active'  },
  { id: '5', name: 'Aisha Patel',  email: 'aisha@example.com',  role: 'Admin',   status: 'Invited' },
];

export function DataGridBasic() {
  return (
    <Preview label="Basic — sortable columns + bordered">
      <div style={{ width: '100%', maxWidth: 720 }}>
        <TkxDataGrid<User>
          data={SAMPLE_USERS}
          rowKey="id"
          sortable
          bordered
          columns={[
            { key: 'name', label: 'Name', sortable: true },
            { key: 'email', label: 'Email', sortable: true },
            { key: 'role', label: 'Role', sortable: true },
            { key: 'status', label: 'Status' },
          ]}
        />
      </div>
    </Preview>
  );
}

export function DataGridSelection() {
  const [selected, setSelected] = useState<string[]>(['2']);
  return (
    <Preview label="Row selection — controlled" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <TkxDataGrid<User>
          data={SAMPLE_USERS}
          rowKey="id"
          selectable
          selectedRows={selected}
          onSelectionChange={setSelected}
          bordered
          columns={[
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Role' },
          ]}
        />
      </div>
      <p style={{ marginTop: 8, fontSize: 12, color: '#475569' }}>
        Selected IDs: <strong>{JSON.stringify(selected)}</strong>
      </p>
    </Preview>
  );
}
